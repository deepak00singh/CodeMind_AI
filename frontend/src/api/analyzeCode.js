// ═══════════════════════════════════════════════════════════════
//  CodeMind AI — Frontend Static Analyser
//  Runs when the backend API is unreachable.
//  Two-pass architecture:
//    Pass 1 → collect every defined name in the file
//    Pass 2 → check usage, style (PEP 8 / ESLint), and patterns
// ═══════════════════════════════════════════════════════════════

function detectLanguage(code) {
  return /\b(const|let|var|=>|function\s+\w+\s*\(|console\.|===|!==)\b/.test(code)
    ? "javascript" : "python";
}

const PY_KEYWORDS = new Set([
  "False","None","True","and","as","assert","async","await","break","class",
  "continue","def","del","elif","else","except","finally","for","from",
  "global","if","import","in","is","lambda","nonlocal","not","or","pass",
  "raise","return","try","while","with","yield",
]);
const JS_KEYWORDS = new Set([
  "break","case","catch","class","const","continue","debugger","default",
  "delete","do","else","export","extends","finally","for","function","if",
  "import","in","instanceof","let","new","of","return","static","super",
  "switch","this","throw","try","typeof","var","void","while","with","yield",
  "async","await","from","as","arguments","null","true","false","undefined",
]);
const PY_BUILTINS = new Set([
  "print","len","range","list","dict","set","tuple","str","int","float","bool",
  "type","isinstance","issubclass","input","open","sum","min","max","abs","round",
  "enumerate","zip","map","filter","sorted","reversed","any","all","next","iter",
  "id","hash","hex","bin","oct","ord","chr","repr","vars","dir","getattr",
  "setattr","hasattr","delattr","callable","staticmethod","classmethod","property",
  "object","super","format","eval","exec","compile","globals","locals","__import__",
  "True","False","None","self","cls","__name__","__main__","__file__","__doc__",
  "NotImplemented","Ellipsis","__build_class__","__loader__","__package__","__spec__",
  "Exception","BaseException","ValueError","TypeError","KeyError","IndexError",
  "AttributeError","StopIteration","NotImplementedError","RuntimeError","OSError",
  "IOError","FileNotFoundError","PermissionError","NameError","ZeroDivisionError",
  "SyntaxError","ImportError","ModuleNotFoundError","AssertionError","RecursionError",
  "OverflowError","MemoryError","GeneratorExit","SystemExit","KeyboardInterrupt",
  "ArithmeticError","LookupError","UnicodeError","UnicodeDecodeError","UnicodeEncodeError",
  "EOFError","ConnectionError","TimeoutError","BlockingIOError","BrokenPipeError",
  "FileExistsError","InterruptedError","IsADirectoryError","NotADirectoryError",
  "os","sys","re","math","json","time","datetime","random","pathlib","copy",
  "collections","itertools","functools","abc","typing","dataclasses","threading",
  "subprocess","io","hashlib","uuid","enum","logging","argparse","unittest",
  "numpy","np","pandas","pd","requests","flask","django","scipy","matplotlib","plt",
]);
const JS_BUILTINS = new Set([
  "console","log","warn","error","info","debug","table","dir","group","groupEnd",
  "alert","confirm","prompt","document","window","navigator","location","history",
  "Math","Date","RegExp","Array","Object","String","Number","Boolean","Symbol",
  "Map","Set","WeakMap","WeakSet","Promise","Proxy","Reflect","JSON","Intl",
  "Error","TypeError","RangeError","SyntaxError","ReferenceError","URIError",
  "EvalError","Function","ArrayBuffer","DataView","SharedArrayBuffer","Atomics",
  "Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array",
  "Int32Array","Uint32Array","Float32Array","Float64Array","BigInt64Array","BigUint64Array",
  "parseInt","parseFloat","isNaN","isFinite","decodeURI","decodeURIComponent",
  "encodeURI","encodeURIComponent","eval","NaN","Infinity","undefined","globalThis",
  "null","true","false","queueMicrotask","structuredClone","crypto","performance",
  "setTimeout","clearTimeout","setInterval","clearInterval","setImmediate","clearImmediate",
  "requestAnimationFrame","cancelAnimationFrame","fetch","Response","Request","Headers",
  "URL","URLSearchParams","FormData","Blob","File","FileReader","XMLHttpRequest",
  "WebSocket","Worker","MutationObserver","IntersectionObserver","ResizeObserver",
  "EventTarget","Event","CustomEvent","AbortController","AbortSignal",
  "ReadableStream","WritableStream","TextEncoder","TextDecoder",
  "localStorage","sessionStorage","indexedDB","caches",
  "require","module","exports","process","Buffer","__dirname","__filename","global",
  "React","ReactDOM","useState","useEffect","useRef","useMemo","useCallback",
  "useContext","createContext","useReducer","forwardRef","memo","Fragment",
]);

// ── Strip string literal content (so identifiers inside quotes aren't checked)
function stripStrings(s) {
  return s
    .replace(/"""[\s\S]*?"""/g, '""""""')
    .replace(/'''[\s\S]*?'''/g, "''''''")
    .replace(/`(?:[^`\\]|\\.)*`/g, "``")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''");
}

// ── Strip inline comment from a raw line
function stripComment(rawLine, isJS) {
  const noStr = stripStrings(rawLine);
  const marker = isJS ? "//" : "#";
  const idx = noStr.indexOf(marker);
  return idx >= 0 ? rawLine.slice(0, idx) : rawLine;
}

// ── Extract identifiers that are USED (referenced) on a line
//    Handles: expressions, conditions, return values, comprehensions
//    Excludes: definition targets, keywords, attribute names (after dots)
function getUsedIdentifiers(rawLine, isJS, keywords) {
  const line = stripStrings(rawLine).trim();

  // Pure definition/structural lines  — nothing is "used"
  if (!isJS) {
    if (/^(def|class|import|from|pass|break|continue|else\s*:?$|try\s*:$|finally\s*:$|#)/.test(line))
      return [];
  } else {
    if (/^(class\s|import\s|\/\/)/.test(line)) return [];
    if (/^(else\s*[\{$]|try\s*[\{$]|finally\s*[\{$])/.test(line)) return [];
  }

  let usagePart = line;

  if (!isJS) {
    // for VAR in EXPR: → check EXPR, not VAR
    const forM = line.match(/^for\s+(?:[\w,\s*]+)\s+in\s+(.+?)(?::\s*$|\s*$)/);
    if (forM) { usagePart = forM[1]; }
    // with EXPR as VAR:
    else if (/^with\s/.test(line)) {
      const wM = line.match(/^with\s+(.+?)\s+as\s+[\w()\[\],\s]+\s*:/);
      if (wM) usagePart = wM[1];
    }
    // except TYPE as VAR:
    else if (/^except\s/.test(line)) {
      const eM = line.match(/^except\s+(.+?)(?:\s+as\s+\w+)?\s*:/);
      if (eM) usagePart = eM[1];
      else return [];
    }
    // VAR = EXPR  or  VAR, VAR = EXPR  or  VAR[i] = EXPR
    else {
      const assignM = line.match(/^(?:[\w\s,[\].]+?)\s*=(?![=>])\s*(.+)$/);
      if (assignM) usagePart = assignM[1];
    }
    // Strip leading statement keywords
    usagePart = usagePart
      .replace(/^(return|yield|raise|del|assert|global|nonlocal|not|await)\s+/, "")
      .replace(/^(if|elif|while)\s+/, "")
      .replace(/\s*:\s*$/, "");

  } else {
    // const/let/var NAME = EXPR
    const varM = line.match(/\b(?:const|let|var)\s+(?:[\w{}\[\],\s]+?)\s*=(?![=>])\s*(.+)$/);
    if (varM) usagePart = varM[1];
    // function definition → nothing is "used" in the signature
    else if (/^(?:async\s+)?function\s/.test(line)) return [];
    // Strip leading keyword
    usagePart = usagePart
      .replace(/^(?:return|throw|typeof|void|delete|await|new)\s+/, "")
      .replace(/^(?:if|while|for)\s*\(/, "")
      .replace(/\)\s*[\{]?\s*$/, "");
  }

  // Remove attribute accesses (obj.attr → keep obj, discard attr)
  const noAttrs = usagePart.replace(/\.[a-zA-Z_]\w*/g, "");
  return (noAttrs.match(/\b([a-zA-Z_]\w*)\b/g) || []).filter(n => !keywords.has(n));
}

// ══════════════════════════════════════════════════════════════
function analyseLocally(code) {
  const lines    = code.split("\n");
  const isJS     = detectLanguage(code) === "javascript";
  const lang     = isJS ? "javascript" : "python";
  const keywords = isJS ? JS_KEYWORDS : PY_KEYWORDS;
  const builtins = isJS ? JS_BUILTINS : PY_BUILTINS;

  const bugs = [];
  const opts = [];
  const seenBugs = new Set();

  function addBug(bug) {
    const key = `${bug.line_number}|${bug.title}`;
    if (!seenBugs.has(key)) { seenBugs.add(key); bugs.push(bug); }
  }

  // ══════════════════════════════════════════════════════════════
  //  PASS 1 — Collect ALL defined names from ALL lines
  // ══════════════════════════════════════════════════════════════
  const defined = new Set([...builtins]);

  lines.forEach((rawLine) => {
    const line  = stripComment(rawLine, isJS).trim();
    const noStr = stripStrings(line);
    if (!line) return;

    if (!isJS) {
      let m;
      // def name(params):
      m = noStr.match(/^def\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)/);
      if (m) {
        defined.add(m[1]);
        m[2].split(",").forEach(p => {
          const n = p.trim().split(":")[0].split("=")[0].replace(/[*]/g,"").trim();
          if (n && /^[a-zA-Z_]/.test(n)) defined.add(n);
        });
        return;
      }
      // class name
      m = noStr.match(/^class\s+([a-zA-Z_]\w*)/);
      if (m) { defined.add(m[1]); return; }
      // import name  /  import name as alias
      m = noStr.match(/^import\s+([\w.]+)(?:\s+as\s+(\w+))?/);
      if (m) { defined.add(m[2] || m[1].split(".")[0]); return; }
      // from x import a, b
      m = noStr.match(/^from\s+[\w.]+\s+import\s+([\w,\s*]+)/);
      if (m) {
        m[1].split(",").forEach(part => {
          const alias = part.trim().split(/\s+as\s+/);
          const name  = alias.pop().trim();
          if (name && name !== "*") defined.add(name);
        });
        return;
      }
      // for x in ...
      m = noStr.match(/^for\s+([\w\s,*]+)\s+in/);
      if (m) m[1].split(",").forEach(n => { const c = n.trim().replace(/[*]/g,""); if (c) defined.add(c); });
      // with ... as x
      const withMs = noStr.match(/\bas\s+([a-zA-Z_]\w*)/g);
      if (withMs) withMs.forEach(w => defined.add(w.replace(/\bas\s+/,"")));
      // except TYPE as e
      m = noStr.match(/except\s+[\w.]+\s+as\s+([a-zA-Z_]\w*)/);
      if (m) defined.add(m[1]);
      // x = ... (simple assign, left side)
      m = noStr.match(/^([a-zA-Z_]\w*)\s*=(?![=>])/);
      if (m) defined.add(m[1]);
      // x, y = ... (tuple unpack)
      m = noStr.match(/^([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)+)\s*=(?![=>])/);
      if (m) m[1].split(",").forEach(n => defined.add(n.trim()));
      // lambda params:
      m = noStr.match(/\blambda\s+([^:]+):/);
      if (m) m[1].split(",").forEach(p => defined.add(p.trim().split("=")[0].trim()));

    } else {
      let m;
      // const/let/var name
      m = noStr.match(/\b(?:const|let|var)\s+([a-zA-Z_]\w*)/);
      if (m) defined.add(m[1]);
      // const {a, b} = ...
      m = noStr.match(/\b(?:const|let|var)\s+\{([^}]+)\}/);
      if (m) m[1].split(",").forEach(n => {
        const c = n.trim().split(":").pop().split("=")[0].trim();
        if (c) defined.add(c);
      });
      // const [a, b] = ...
      m = noStr.match(/\b(?:const|let|var)\s+\[([^\]]+)\]/);
      if (m) m[1].split(",").forEach(n => { const c = n.trim().replace(/\.\.\./g,""); if (c) defined.add(c); });
      // function name(params)
      m = noStr.match(/^(?:async\s+)?function\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)/);
      if (m) {
        defined.add(m[1]);
        m[2].split(",").forEach(p => {
          const n = p.trim().split("=")[0].replace(/\.\.\./g,"").replace(/[{}[\]]/g,"").trim();
          if (n && /^[a-zA-Z_]/.test(n)) defined.add(n);
        });
      }
      // import { a, b } from
      m = noStr.match(/^import\s+\{([^}]+)\}/);
      if (m) m[1].split(",").forEach(n => { const a = n.trim().split(/\s+as\s+/); defined.add(a.pop().trim()); });
      // import name from
      m = noStr.match(/^import\s+([a-zA-Z_]\w*)\s+from/);
      if (m) defined.add(m[1]);
      // import * as name
      m = noStr.match(/\*\s+as\s+([a-zA-Z_]\w*)/);
      if (m) defined.add(m[1]);
      // class name
      m = noStr.match(/^class\s+([a-zA-Z_]\w*)/);
      if (m) defined.add(m[1]);
    }
  });

  // ══════════════════════════════════════════════════════════════
  //  PASS 2 — Check each line
  // ══════════════════════════════════════════════════════════════
  lines.forEach((rawLine, idx) => {
    const lineNum = idx + 1;
    const line    = stripComment(rawLine, isJS).trim();
    const noStr   = stripStrings(line);
    if (!line || line.startsWith("#") || line.startsWith("//")) return;

    // ── UNIVERSAL: undefined name check ──────────────────────
    const usedIds = getUsedIdentifiers(line, isJS, keywords);
    usedIds.forEach(name => {
      if (!defined.has(name) && !keywords.has(name)) {
        const err = isJS ? "ReferenceError" : "NameError";
        addBug({
          line_number: lineNum,
          severity:    "critical",
          title:       `Undefined name '${name}'`,
          description: `'${name}' is used here but is never defined anywhere in this code. Python/JS will raise a \`${err}\` at runtime.`,
          fix:         isJS ? `const ${name} = /* your value */;` : `${name} = "value"  # define '${name}' before this line`,
        });
      }
    });

    if (!isJS) {
      // ────────────────────────────────────────────────────────
      //  PYTHON CHECKS
      // ────────────────────────────────────────────────────────

      // [PY-1] Python 2 print statement: print x  (not print(x))
      if (/^print\s+[^\s(]/.test(line)) {
        const arg = line.replace(/^print\s+/, "").trim();
        addBug({
          line_number: lineNum,
          severity:    "critical",
          title:       "Python 2 print statement (SyntaxError in Python 3)",
          description: `\`print ${arg}\` is Python 2 syntax. In Python 3 print is a function — add parentheses.`,
          fix:         `print(${arg})`,
        });
      }

      // [PY-2] Trailing semicolon — valid but not Pythonic (PEP 8 W703)
      if (/;\s*$/.test(line)) {
        addBug({
          line_number: lineNum,
          severity:    "info",
          title:       "Trailing semicolon (not Pythonic — PEP 8)",
          description: "Python statements don't need semicolons. Semicolons are only used to place multiple statements on one line.",
          fix:         line.replace(/;\s*$/, ""),
        });
      }

      // [PY-3] PEP 8 E225 — missing spaces around assignment: a=1  b=2
      //        Only at statement level (NOT inside parens: def f(x=1), f(x=1))
      if (!/^(def|if|elif|while|for|return|yield|assert|lambda|with|class)\b/.test(line)) {
        const eqM = line.match(/^([a-zA-Z_]\w*)(=)(?![=>])(.*)/);
        if (eqM) {
          const before = line[eqM[1].length - 0]; // char between name and =
          const lhs    = eqM[1];
          const rhs    = eqM[3].trim();
          const hasBefore = line[lhs.length] === " ";
          const hasAfter  = line[lhs.length + 1] === " ";
          if (!hasBefore || !hasAfter) {
            addBug({
              line_number: lineNum,
              severity:    "info",
              title:       "PEP 8 E225: missing whitespace around '='",
              description: `Write \`${lhs} = ${rhs}\` with spaces on both sides of \`=\`. PEP 8 requires whitespace around assignment operators.`,
              fix:         `${lhs} = ${rhs}`,
            });
          }
        }
      }

      // [PY-4] PEP 8 E225 — augmented operators without spaces: x+=1, x-=1
      const augM = noStr.match(/^([a-zA-Z_]\w*)(\+=|-=|\*=|\/=|%=|&=|\|=|\^=)(\S)/);
      if (augM) {
        const rhs = line.slice(line.indexOf(augM[2]) + augM[2].length).trim();
        addBug({
          line_number: lineNum,
          severity:    "info",
          title:       `PEP 8 E225: missing whitespace around '${augM[2]}'`,
          description: `Write \`${augM[1]} ${augM[2]} ${rhs}\` with spaces around the operator.`,
          fix:         `${augM[1]} ${augM[2]} ${rhs}`,
        });
      }

      // [PY-5] Division without zero guard
      if (/\/(?!\/)/.test(noStr) && !/\bif\b/.test(line)) {
        const dm = noStr.match(/\/(?!\/)\s*(len\s*\(\s*(\w+)\s*\)|(\w+))/);
        if (dm) {
          const divisor = dm[2] || dm[3];
          if (divisor && defined.has(divisor)) {
            addBug({
              line_number: lineNum,
              severity:    "warning",
              title:       "Possible ZeroDivisionError",
              description: `If \`${dm[1].trim()}\` is 0 or empty, this raises ZeroDivisionError.`,
              fix:         `if ${divisor}:\n    ${line}`,
            });
          }
        }
      }

      // [PY-6] Bare except
      if (/^except\s*:/.test(line)) {
        addBug({
          line_number: lineNum,
          severity:    "warning",
          title:       "Bare except catches all exceptions",
          description: "`except:` catches everything including KeyboardInterrupt and SystemExit. Specify the exception type.",
          fix:         "except Exception as e:",
        });
      }

      // [PY-7] Comparison to None with ==
      if (/==\s*None\b/.test(noStr) || /\bNone\s*==/.test(noStr)) {
        addBug({
          line_number: lineNum,
          severity:    "info",
          title:       "Use `is None` instead of `== None` (PEP 8 E711)",
          description: "PEP 8 recommends `x is None` for identity checks. `x == None` can be overridden by __eq__.",
          fix:         line.replace(/==\s*None\b/, "is None").replace(/\bNone\s*==/, "None is"),
        });
      }

      // [PY-8] Comparison to True/False
      if (/==\s*True\b|==\s*False\b/.test(noStr)) {
        addBug({
          line_number: lineNum,
          severity:    "info",
          title:       "PEP 8 E712: don't compare to True/False with ==",
          description: "Use `if x:` instead of `if x == True:`. Python evaluates truthiness directly.",
          fix:         line.replace(/==\s*True\b/,"").replace(/==\s*False\b/,"is False"),
        });
      }

      // [PY-9] Mutable default argument
      const mutM = noStr.match(/^def\s+\w+\s*\([^)]*=\s*(\[\]|\{\}|set\(\)|list\(\)|dict\(\))/);
      if (mutM) {
        addBug({
          line_number: lineNum,
          severity:    "warning",
          title:       "Mutable default argument (common Python gotcha)",
          description: `The default value \`${mutM[1]}\` is created ONCE and shared across all calls. This causes unexpected state accumulation.`,
          fix:         line.replace(/=\s*(\[\]|\{\}|set\(\)|list\(\)|dict\(\))/, "=None"),
        });
      }

      // [PY-10] Python 2 built-ins
      const py2 = { xrange:"range", raw_input:"input", unicode:"str", execfile:"exec(open(f).read())" };
      Object.entries(py2).forEach(([old, repl]) => {
        if (new RegExp(`\\b${old}\\s*\\(`).test(noStr)) {
          addBug({
            line_number: lineNum,
            severity:    "critical",
            title:       `Python 2 built-in \`${old}\` — removed in Python 3`,
            description: `\`${old}\` does not exist in Python 3 and raises NameError. Use \`${repl}\` instead.`,
            fix:         line.replace(new RegExp(`\\b${old}\\b`), repl),
          });
        }
      });

      // [PY-11] Manual sum loop → suggest sum()
      if (/^for\s+\w+\s+in\s+/.test(line)) {
        const next = (lines[idx + 1] || "").trim();
        if (/\w+\s*\+=\s*\w+/.test(next) && !/\+=\s*1$/.test(next)) {
          opts.push({ line_number: lineNum, title: "Replace loop accumulator with sum()",
            description: "Python's built-in sum() is faster and more idiomatic than a manual += loop.",
            example: "total = sum(collection)" });
        }
      }

    } else {
      // ────────────────────────────────────────────────────────
      //  JAVASCRIPT CHECKS
      // ────────────────────────────────────────────────────────

      // [JS-1] var → const/let
      if (/\bvar\s/.test(line)) {
        opts.push({ line_number: lineNum, title: "Replace `var` with `const` or `let`",
          description: "`var` is function-scoped and hoisted. Use `const` (default) or `let` when reassigning.",
          example: line.replace(/\bvar\b/, "const") });
      }

      // [JS-2] Loose equality ==
      if (/[^=!<>]==[^=]/.test(noStr)) {
        addBug({ line_number: lineNum, severity: "warning",
          title: "Loose equality == (use === instead)",
          description: "`==` does type coercion: `0 == false` → true, `'' == 0` → true. Use `===` for strict equality.",
          fix: noStr.replace(/([^=!<>])==([^=])/g, "$1===$2") });
      }

      // [JS-3] Loose inequality !=
      if (/[^!]!=[^=]/.test(noStr)) {
        addBug({ line_number: lineNum, severity: "warning",
          title: "Loose inequality != (use !== instead)",
          description: "`!=` does type coercion. Use `!==` for strict inequality.",
          fix: noStr.replace(/([^!])!=([^=])/g, "$1!==$2") });
      }

      // [JS-4] await without try/catch
      if (/\bawait\b/.test(noStr) && !/\btry\b/.test(code)) {
        addBug({ line_number: lineNum, severity: "warning",
          title: "Unhandled promise rejection",
          description: "`await` without try/catch will cause an unhandled promise rejection if the promise rejects.",
          fix: `try {\n  ${line}\n} catch (err) {\n  console.error(err);\n}` });
      }

      // [JS-5] console.log in production
      if (/\bconsole\.log\b/.test(line)) {
        opts.push({ line_number: lineNum, title: "Remove console.log before production",
          description: "Debug logs should be removed or replaced with a logging library before shipping.",
          example: "// logger.debug(...)" });
      }
    }
  });

  // ── Summary ────────────────────────────────────────────────
  const nonEmpty = lines.filter(l => { const t = l.trim(); return t && !t.startsWith("#") && !t.startsWith("//"); });
  const hasCrit  = bugs.some(b => b.severity === "critical");
  const quality  = hasCrit ? "poor" : bugs.length ? "fair" : "good";
  const summary  = nonEmpty.length === 0
    ? "Empty or comment-only code."
    : nonEmpty.length === 1
    ? `A single ${lang} statement: \`${nonEmpty[0].trim().slice(0, 80)}\``
    : hasCrit ? `A ${lang} snippet with ${nonEmpty.length} statement(s) — contains critical issue(s).`
    : `A ${lang} snippet with ${nonEmpty.length} statement(s).`;

  return {
    language:        lang,
    summary,
    overall_quality: quality,
    bugs,
    optimizations:   opts,
    explanation: {
      what_it_does:     summary,
      how_it_works:     nonEmpty.slice(0,6).map((l,i)=>`Line ${lines.indexOf(l)+1}: ${l.trim().slice(0,70)}`).join(" → ") || "No executable statements.",
      notable_patterns: "None identified",
    },
  };
}

// ══════════════════════════════════════════════════════════════
//  Public API
// ══════════════════════════════════════════════════════════════
export async function analyzeCode(code, language = "auto") {
  try {
    const res = await fetch("http://localhost:8000/api/analyze", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language }),
    });
    if (!res.ok) return analyseLocally(code);
    return await res.json();
  } catch {
    return analyseLocally(code);
  }
}
