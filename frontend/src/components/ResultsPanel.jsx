import { motion } from "framer-motion";
import BugCard from "./BugCard";
import OptimizationCard from "./OptimizationCard";
import ExplanationBlock from "./ExplanationBlock";

const qualityConfig = {
  good: { label: "Good Quality", color: "#10b981", glow: "rgba(16,185,129,0.18)", icon: "✓" },
  fair: { label: "Fair Quality",  color: "#f59e0b", glow: "rgba(245,158,11,0.18)", icon: "△" },
  poor: { label: "Needs Work",    color: "#ef4444", glow: "rgba(239,68,68,0.18)",  icon: "✗" },
};

function SectionHeader({ label, count, color, bg, border }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{
        fontSize: 11, fontWeight: 800, letterSpacing: "0.12em",
        textTransform: "uppercase", color: "#475569",
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 10.5, fontWeight: 800,
        color, background: bg,
        border: `1px solid ${border}`,
        padding: "1px 9px", borderRadius: 999,
        lineHeight: "18px",
      }}>
        {count}
      </span>
    </div>
  );
}

function EmptyState() {
  const features = ["🐛 Bug Detection", "⚡ Optimizations", "📖 Explanation"];
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100%",
      gap: 22, padding: 52, textAlign: "center",
    }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.34, 1.2, 0.64, 1] }}
        style={{
          width: 72, height: 72, borderRadius: 20, flexShrink: 0,
          background: "linear-gradient(135deg, rgba(124,58,237,0.18), rgba(6,182,212,0.18))",
          border: "1px solid rgba(124,58,237,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 34, boxShadow: "0 0 50px rgba(124,58,237,0.15)",
        }}
      >
        🧠
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12 }}
      >
        <h2 style={{ color: "#f1f5f9", fontSize: 19, fontWeight: 700, margin: "0 0 9px", letterSpacing: "-0.3px" }}>
          Ready to analyze
        </h2>
        <p style={{ color: "#475569", fontSize: 14, maxWidth: 280, lineHeight: 1.65, margin: "0 auto" }}>
          Paste your code on the left and click{" "}
          <span style={{ color: "#a78bfa", fontWeight: 600 }}>Analyze Code</span>{" "}
          to get instant AI feedback.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.28 }}
        style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}
      >
        {features.map((f, i) => (
          <motion.div
            key={f}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.35 + i * 0.09 }}
            style={{
              padding: "6px 16px", borderRadius: 999, fontSize: 13,
              color: "#94a3b8",
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            {f}
          </motion.div>
        ))}
      </motion.div>

      {/* Hint about editor interactivity */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        style={{
          fontSize: 12, color: "#334155", margin: 0,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        Bugs will be highlighted directly in the editor ↖
      </motion.p>
    </div>
  );
}

// ── Main ResultsPanel ──────────────────────────────────────────────
export default function ResultsPanel({ result, code, onRevealLine }) {
  if (!result) return <EmptyState />;

  // Pre-split code so we can extract individual lines for snippets
  const codeLines = code ? code.split("\n") : [];
  const getLine   = (lineNum) => codeLines[lineNum - 1] ?? "";

  const qCfg     = qualityConfig[result.overall_quality] ?? qualityConfig.fair;
  const bugCount = result.bugs.length;
  const optCount = result.optimizations.length;

  return (
    <div style={{ padding: "24px 24px 40px" }}>
      {/* ── Summary header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{
          paddingBottom: 18,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          marginBottom: 26,
        }}
      >
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: 10,
        }}>
          <span className="mono" style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>
            {result.language} · {bugCount} bug{bugCount !== 1 ? "s" : ""} · {optCount} optimization{optCount !== 1 ? "s" : ""}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 800, letterSpacing: "0.06em",
            color: qCfg.color,
            background: qCfg.glow,
            border: `1px solid ${qCfg.color}35`,
            padding: "4px 13px", borderRadius: 999,
          }}>
            {qCfg.icon} {qCfg.label.toUpperCase()}
          </span>
        </div>
        <p style={{ color: "#94a3b8", fontSize: 14, margin: 0, lineHeight: 1.65 }}>
          {result.summary}
        </p>

        {/* Hint pill */}
        {(bugCount + optCount) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              marginTop: 12, padding: "5px 12px", borderRadius: 999,
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.2)",
              fontSize: 11, color: "#a78bfa", fontWeight: 500,
            }}
          >
            💡 Click &ldquo;View in Editor&rdquo; on any card to jump to that line
          </motion.div>
        )}
      </motion.div>

      {/* ── Bugs ── */}
      {bugCount > 0 && (
        <section style={{ marginBottom: 28 }}>
          <SectionHeader
            label="Bugs"
            count={bugCount}
            color="#ef4444"
            bg="rgba(239,68,68,0.12)"
            border="rgba(239,68,68,0.22)"
          />
          {result.bugs.map((bug, i) => (
            <BugCard
              key={i}
              bug={bug}
              index={i}
              codeLine={getLine(bug.line_number)}
              onReveal={onRevealLine}
            />
          ))}
        </section>
      )}

      {/* No bugs */}
      {bugCount === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "14px 18px", borderRadius: 12, marginBottom: 28,
            background: "rgba(16,185,129,0.05)",
            border: "1px solid rgba(16,185,129,0.18)",
          }}
        >
          <span style={{ fontSize: 18 }}>🎉</span>
          <span style={{ color: "#6ee7b7", fontSize: 13 }}>
            No bugs detected — your code looks clean!
          </span>
        </motion.div>
      )}

      {/* ── Optimizations ── */}
      {optCount > 0 && (
        <section style={{ marginBottom: 28 }}>
          <SectionHeader
            label="Optimizations"
            count={optCount}
            color="#f59e0b"
            bg="rgba(245,158,11,0.12)"
            border="rgba(245,158,11,0.22)"
          />
          {result.optimizations.map((opt, i) => (
            <OptimizationCard
              key={i}
              opt={opt}
              index={i}
              codeLine={getLine(opt.line_number)}
              onReveal={onRevealLine}
            />
          ))}
        </section>
      )}

      {/* ── Explanation ── */}
      <ExplanationBlock explanation={result.explanation} />
    </div>
  );
}
