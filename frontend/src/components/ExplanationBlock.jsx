import { motion } from "framer-motion";

export default function ExplanationBlock({ explanation }) {
  const items = [
    { label: "What it does",      key: "what_it_does" },
    { label: "How it works",      key: "how_it_works" },
    { label: "Notable patterns",  key: "notable_patterns" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "13px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", gap: 8,
        background: "rgba(255,255,255,0.015)",
      }}>
        <span style={{ fontSize: 15 }}>📖</span>
        <span style={{ color: "#f1f5f9", fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.15px" }}>
          Code Explanation
        </span>
      </div>

      {/* Rows */}
      <div style={{ padding: 18 }}>
        {items.map(({ label, key }, i) => {
          const content = explanation[key];
          if (!content || content === "None identified") return null;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 + i * 0.08 }}
              style={{ marginBottom: i < items.length - 1 ? 18 : 0 }}
            >
              <p className="mono" style={{
                fontSize: 10, fontWeight: 800, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "#475569",
                margin: "0 0 6px",
              }}>
                {label}
              </p>
              <p style={{
                color: "#94a3b8", fontSize: 13.5,
                lineHeight: 1.72, margin: 0,
              }}>
                {content}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
