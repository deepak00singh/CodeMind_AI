import { useState } from "react";
import { motion } from "framer-motion";

const severityMap = {
  critical: {
    label: "CRITICAL", color: "#ef4444",
    glow: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.22)",
    bg: "rgba(239,68,68,0.04)", icon: "🔴", flashClass: "cm-flash-bug",
  },
  warning: {
    label: "WARNING", color: "#f59e0b",
    glow: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.22)",
    bg: "rgba(245,158,11,0.04)", icon: "🟡", flashClass: "cm-flash-opt",
  },
  info: {
    label: "INFO", color: "#06b6d4",
    glow: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.22)",
    bg: "rgba(6,182,212,0.04)", icon: "🔵", flashClass: "cm-flash-opt",
  },
};

export default function BugCard({ bug, index, codeLine, onReveal }) {
  const cfg = severityMap[bug.severity] ?? severityMap.info;
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(bug.fix).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleReveal() {
    if (onReveal) onReveal(bug.line_number, bug.severity);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 14,
        padding: "16px 18px",
        boxShadow: `0 0 20px ${cfg.glow}`,
        marginBottom: 10,
        cursor: "default",
      }}
    >
      {/* Header row */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 10,
        gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 800, letterSpacing: "0.1em",
            color: cfg.color,
            background: cfg.glow,
            border: `1px solid ${cfg.border}`,
            padding: "3px 10px", borderRadius: 999,
          }}>
            {cfg.icon} {cfg.label}
          </span>
          <span className="mono" style={{
            fontSize: 11, color: "#475569",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "2px 9px", borderRadius: 6,
          }}>
            Line {bug.line_number}
          </span>
        </div>

        {/* View in Editor button */}
        {onReveal && (
          <motion.button
            onClick={handleReveal}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            title="Scroll editor to this line"
            style={{
              fontSize: 11, fontWeight: 600,
              color: cfg.color,
              background: cfg.glow,
              border: `1px solid ${cfg.border}`,
              borderRadius: 7, padding: "4px 10px",
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 5,
              whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 10 }}>↗</span> View in Editor
          </motion.button>
        )}
      </div>

      {/* Title */}
      <p style={{
        color: "#f1f5f9", fontSize: 14, fontWeight: 650,
        margin: "0 0 5px", letterSpacing: "-0.15px",
      }}>
        {bug.title}
      </p>

      {/* Inline code snippet */}
      {codeLine && codeLine.trim() && (
        <div style={{
          background: "rgba(0,0,0,0.4)",
          border: `1px solid ${cfg.border}`,
          borderRadius: 8, marginBottom: 10,
          overflow: "hidden",
        }}>
          <div style={{
            display: "flex", alignItems: "stretch",
          }}>
            <div style={{
              background: cfg.glow, borderRight: `1px solid ${cfg.border}`,
              padding: "8px 10px", display: "flex", alignItems: "center",
              flexShrink: 0,
            }}>
              <span className="mono" style={{
                fontSize: 11, color: cfg.color,
                fontWeight: 700, userSelect: "none",
              }}>
                {bug.line_number}
              </span>
            </div>
            <pre className="mono" style={{
              fontSize: 12, color: "#fca5a5",
              whiteSpace: "pre", margin: 0,
              padding: "8px 12px", lineHeight: 1.6,
              overflowX: "auto", flex: 1,
            }}>
              {codeLine}
            </pre>
          </div>
        </div>
      )}

      {/* Description */}
      <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.65, margin: "0 0 14px" }}>
        {bug.description}
      </p>

      {/* Fix code block */}
      <div style={{
        background: "rgba(0,0,0,0.35)",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}>
          <span className="mono" style={{
            fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: "#10b981",
          }}>
            ✓ SUGGESTED FIX
          </span>
          <motion.button
            onClick={handleCopy}
            whileTap={{ scale: 0.92 }}
            style={{
              fontSize: 11, fontWeight: 600,
              color: copied ? "#10b981" : "#475569",
              background: "none", border: "none", cursor: "pointer",
              padding: "2px 8px", borderRadius: 4,
              fontFamily: "inherit", transition: "color 0.15s",
            }}
          >
            {copied ? "✓ Copied" : "Copy"}
          </motion.button>
        </div>
        <pre className="mono" style={{
          fontSize: 12, color: "#10b981",
          whiteSpace: "pre-wrap", margin: 0,
          padding: "12px 14px", lineHeight: 1.65,
          overflowX: "auto",
        }}>
          {bug.fix}
        </pre>
      </div>
    </motion.div>
  );
}
