import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CodeEditor from "../components/CodeEditor";
import ResultsPanel from "../components/ResultsPanel";
import { analyzeCode } from "../api/analyzeCode";
import ParticleCanvas from "../components/ParticleCanvas";

const PLACEHOLDER = `def calculate_average(numbers):
    total = 0
    for n in numbers:
        total += n
    return total / len(numbers)

result = calculate_average([])
print(result)
`;

const LANG_OPTIONS = [
  { value: "auto",       label: "⚡ Auto-detect" },
  { value: "python",     label: "🐍 Python" },
  { value: "javascript", label: "󰌞 JavaScript" },
];

// ─── Navbar ───────────────────────────────────────────────────────
function AppNavbar({ onBack }) {
  return (
    <nav style={{
      height: 54, flexShrink: 0,
      background: "rgba(8,8,16,0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(124,58,237,0.1)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px",
      zIndex: 10, position: "relative",
    }}>
      <button
        onClick={onBack}
        style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 900, color: "white",
          fontFamily: "'JetBrains Mono', monospace",
          boxShadow: "0 0 18px rgba(124,58,237,0.55)",
        }}>CM</div>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#f1f5f9" }}>CodeMind</span>
        <span style={{
          fontSize: 9, fontWeight: 700, color: "#7c3aed",
          background: "rgba(124,58,237,0.15)",
          border: "1px solid rgba(124,58,237,0.3)",
          padding: "1px 7px", borderRadius: 999,
        }}>AI</span>
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#10b981" }}>
          <span style={{
            width: 5, height: 5, borderRadius: "50%",
            background: "#10b981", boxShadow: "0 0 6px #10b981",
            display: "inline-block", animation: "dot-pulse 2s ease-in-out infinite",
          }} />
          GPT-4o-mini
        </span>
        <span style={{ fontSize: 11, color: "#334155", fontFamily: "'JetBrains Mono', monospace" }}>
          Python &amp; JS · 200 lines
        </span>
      </div>
    </nav>
  );
}

// ─── Liquid premium Analyze Button ───────────────────────────────
function AnalyzeButton({ loading, disabled, onClick }) {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (loading || disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const id   = Date.now();
    setRipples(prev => [...prev, {
      id,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700);
    onClick();
  };

  return (
    <motion.button
      id="analyze-button"
      onClick={handleClick}
      disabled={loading || disabled}
      whileHover={!loading && !disabled ? {
        scale: 1.015,
        boxShadow: "0 0 60px rgba(124,58,237,0.65), 0 6px 30px rgba(0,0,0,0.35)",
      } : {}}
      whileTap={!loading && !disabled ? { scale: 0.98 } : {}}
      style={{
        position: "relative", overflow: "hidden",
        width: "100%", padding: "14px 24px",
        borderRadius: 14, border: "none",
        background: (loading || disabled)
          ? "rgba(124,58,237,0.18)"
          : "linear-gradient(135deg, #7c3aed 0%, #6d28d9 55%, #4f46e5 100%)",
        color: (loading || disabled) ? "rgba(167,139,250,0.45)" : "white",
        fontSize: 15, fontWeight: 700,
        cursor: (loading || disabled) ? "not-allowed" : "pointer",
        boxShadow: (loading || disabled)
          ? "none"
          : "0 0 36px rgba(124,58,237,0.42), 0 4px 20px rgba(0,0,0,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        fontFamily: "inherit",
        transition: "background 0.25s, box-shadow 0.25s",
      }}
    >
      {/* Shimmer */}
      {!loading && !disabled && (
        <span style={{
          position: "absolute", top: 0, left: 0,
          width: "35%", height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
          animation: "shimmer-sweep 2.8s infinite",
        }} />
      )}

      {/* Ripples */}
      {ripples.map(r => (
        <span
          key={r.id}
          style={{
            position: "absolute",
            left: r.x - 20, top: r.y - 20,
            width: 40, height: 40,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            animation: "ripple 0.65s ease-out forwards",
            pointerEvents: "none",
          }}
        />
      ))}

      {loading ? (
        <>
          <span style={{
            width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
            border: "2.5px solid rgba(255,255,255,0.15)",
            borderTopColor: "#a78bfa",
          }} className="spin" />
          Analyzing your code…
        </>
      ) : disabled ? (
        "Code exceeds 200-line limit"
      ) : (
        <>
          <span>⚡</span>
          <span>Analyze Code</span>
          <span style={{ opacity: 0.55, fontSize: 12 }}>→</span>
        </>
      )}
    </motion.button>
  );
}

// ─── App Screen ───────────────────────────────────────────────────
export default function AppScreen({ onBack }) {
  const [code,     setCode]     = useState(PLACEHOLDER);
  const [language, setLanguage] = useState("auto");
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);

  const editorRef     = useRef(null);
  const monacoRef     = useRef(null);
  const decorationIds = useRef([]);
  const flashDecIds   = useRef([]);

  const lineCount  = code.split("\n").length;
  const isLineOver = lineCount > 200;

  function handleEditorMount(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;
    if (result) applyDecorations(editor, monaco, result);
  }

  function applyDecorations(editor, monaco, res) {
    if (!editor || !monaco || !res) return;
    const model = editor.getModel();
    if (!model) return;
    const lc = model.getLineCount();

    const newDecs = [
      ...res.bugs
        .filter(b => b.line_number <= lc)
        .map(b => ({
          range: new monaco.Range(b.line_number, 1, b.line_number, 1),
          options: {
            isWholeLine: true,
            className: "cm-bug-line",
            overviewRuler: { color: "#ef4444", position: monaco.editor.OverviewRulerLane.Left },
            minimap: { color: "#ef4444", position: 1 },
          },
        })),
      ...res.optimizations
        .filter(o => o.line_number && o.line_number <= lc)
        .map(o => ({
          range: new monaco.Range(o.line_number, 1, o.line_number, 1),
          options: {
            isWholeLine: true,
            className: "cm-opt-line",
            overviewRuler: { color: "#f59e0b", position: monaco.editor.OverviewRulerLane.Right },
            minimap: { color: "#f59e0b", position: 1 },
          },
        })),
    ];
    decorationIds.current = editor.deltaDecorations(decorationIds.current, newDecs);

    const markers = res.bugs
      .filter(b => b.line_number <= lc)
      .map(b => ({
        startLineNumber: b.line_number, endLineNumber: b.line_number,
        startColumn: 1, endColumn: model.getLineMaxColumn(b.line_number),
        message: `${b.title}\n${b.description}`,
        severity: b.severity === "critical" ? monaco.MarkerSeverity.Error
          : b.severity === "warning" ? monaco.MarkerSeverity.Warning
          : monaco.MarkerSeverity.Info,
      }));
    monaco.editor.setModelMarkers(model, "codemind", markers);
  }

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (result) {
      applyDecorations(editor, monaco, result);
    } else if (editor && monaco) {
      decorationIds.current = editor.deltaDecorations(decorationIds.current, []);
      const model = editor.getModel();
      if (model) monaco.editor.setModelMarkers(model, "codemind", []);
    }
    return () => {
      if (editor && monaco) {
        editor.deltaDecorations(decorationIds.current, []);
        const model = editor.getModel();
        if (model) monaco.editor.setModelMarkers(model, "codemind", []);
      }
    };
  }, [result]);

  function revealLine(lineNumber, severity = "critical") {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const n = Math.max(1, lineNumber);
    editor.revealLineInCenter(n);
    editor.setPosition({ lineNumber: n, column: 1 });
    editor.focus();

    if (flashDecIds.current.length) {
      editor.deltaDecorations(flashDecIds.current, []);
      flashDecIds.current = [];
    }
    const cls = severity === "critical" || severity === "warning" ? "cm-flash-bug" : "cm-flash-opt";
    flashDecIds.current = editor.deltaDecorations([], [{
      range: new monaco.Range(n, 1, n, 1),
      options: { isWholeLine: true, className: cls },
    }]);
    setTimeout(() => {
      if (flashDecIds.current.length && editorRef.current) {
        editorRef.current.deltaDecorations(flashDecIds.current, []);
        flashDecIds.current = [];
      }
    }, 1500);
  }

  async function handleAnalyze() {
    if (isLineOver || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await analyzeCode(code, language);
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      key="app-screen"
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      style={{
        display: "flex", flexDirection: "column",
        height: "100vh", overflow: "hidden",
        background: "#080810",
        backgroundImage: [
          "radial-gradient(ellipse 65% 50% at 15% 0%,  rgba(124,58,237,0.12) 0%, transparent 60%)",
          "radial-gradient(ellipse 50% 45% at 85% 100%, rgba(6,182,212,0.08) 0%, transparent 60%)",
        ].join(", "),
        position: "relative",
      }}
    >
      {/* Subtle particle background */}
      <ParticleCanvas opacity={0.35} count={35} />

      <AppNavbar onBack={onBack ?? (() => {})} />

      {/* Two-panel body */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden", position: "relative", zIndex: 1 }}>

        {/* ════ LEFT PANEL ════ */}
        <div style={{
          flex: 1, minWidth: 0,
          display: "flex", flexDirection: "column",
          padding: "18px 20px 16px",
          gap: 14,
        }}>
          {/* Language pills */}
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {LANG_OPTIONS.map((opt) => {
              const active = language === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  id={`lang-${opt.value}`}
                  onClick={() => setLanguage(opt.value)}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "6px 16px", borderRadius: 999,
                    fontSize: 12.5, fontWeight: 600,
                    border: active
                      ? "1px solid rgba(124,58,237,0.55)"
                      : "1px solid rgba(255,255,255,0.07)",
                    background: active ? "rgba(124,58,237,0.18)" : "transparent",
                    color: active ? "#a78bfa" : "#475569",
                    cursor: "pointer",
                    boxShadow: active ? "0 0 20px rgba(124,58,237,0.25)" : "none",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                >
                  {opt.label}
                </motion.button>
              );
            })}
          </div>

          {/* Monaco Editor wrapped in animated gradient frame */}
          <div className="editor-frame" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, minHeight: 0, background: "#0d0d1a", borderRadius: 13, position: "relative", display: "flex", flexDirection: "column" }}>
              <CodeEditor
                value={code}
                onChange={(val) => {
                  setCode(val);
                  if (result) setResult(null);
                }}
                language={language}
                lineCount={lineCount}
                onEditorMount={handleEditorMount}
              />
            </div>
          </div>

          {/* Analyze button */}
          <div style={{ flexShrink: 0 }}>
            <AnalyzeButton loading={loading} disabled={isLineOver} onClick={handleAnalyze} />
          </div>
        </div>

        {/* ════ Gradient Divider ════ */}
        <div style={{
          width: 1, flexShrink: 0,
          background: "linear-gradient(to bottom, transparent 0%, rgba(124,58,237,0.5) 30%, rgba(6,182,212,0.3) 70%, transparent 100%)",
          boxShadow: "0 0 12px rgba(124,58,237,0.2)",
        }} />

        {/* ════ RIGHT PANEL ════ */}
        <div className="panel-scroll" style={{ flex: 1, minWidth: 0, height: "100%", position: "relative" }}>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  height: "100%", gap: 22, padding: 40,
                }}
              >
                {/* Pulsing glow behind logo */}
                <div style={{ position: "relative" }}>
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      position: "absolute", inset: -24,
                      borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)",
                      filter: "blur(10px)",
                    }}
                  />
                  <motion.div
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(124,58,237,0.35)",
                        "0 0 70px rgba(124,58,237,0.7)",
                        "0 0 20px rgba(124,58,237,0.35)",
                      ],
                    }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    style={{
                      width: 66, height: 66, borderRadius: 18,
                      background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, fontWeight: 900, color: "white",
                      fontFamily: "'JetBrains Mono', monospace",
                      position: "relative",
                    }}
                  >
                    CM
                  </motion.div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 600, margin: "0 0 6px" }}>
                    AI is analyzing your code…
                  </p>
                  <p style={{ color: "#475569", fontSize: 13, margin: 0 }}>
                    Detecting bugs · Generating suggestions
                  </p>
                </div>

                <div style={{
                  width: 200, height: 3,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 999, overflow: "hidden",
                }}>
                  <motion.div
                    animate={{ x: ["-100%", "300%"] }}
                    transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      position: "relative", width: "50%", height: "100%",
                      background: "linear-gradient(90deg, transparent, #7c3aed, #06b6d4, transparent)",
                      borderRadius: 999,
                      boxShadow: "0 0 10px rgba(124,58,237,0.5)",
                    }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                style={{ height: "100%" }}
              >
                <ResultsPanel result={result} code={code} onRevealLine={revealLine} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        height: 32, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 22px",
        background: "rgba(8,8,16,0.95)",
        borderTop: "1px solid rgba(124,58,237,0.08)",
        fontSize: 10.5, color: "#1e293b",
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: "0.04em",
        zIndex: 2, position: "relative",
      }}>
        <span>CodeMind AI</span>
        <span>Powered by GPT-4o-mini</span>
      </div>
    </motion.div>
  );
}
