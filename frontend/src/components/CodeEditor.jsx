import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";

export default function CodeEditor({ value, onChange, language, lineCount, onEditorMount }) {
  const displayLang = language === "auto" ? "AUTO" : language.toUpperCase();
  const filename     = language === "javascript" ? "main.js" : "main.py";
  const isWarn       = lineCount > 180;
  const isOver       = lineCount > 200;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 15,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        background: "rgba(255,255,255,0.015)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}
    >
      {/* Header bar */}
      <div style={{
        padding: "10px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(255,255,255,0.02)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="mono" style={{
            fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em",
            color: "#7c3aed",
            background: "rgba(124,58,237,0.12)",
            border: "1px solid rgba(124,58,237,0.22)",
            padding: "2px 9px", borderRadius: 5,
          }}>
            {displayLang}
          </span>
          <span className="mono" style={{ fontSize: 12, color: "#334155" }}>
            {filename}
          </span>
        </div>

        <motion.span
          animate={{ color: isOver ? "#ef4444" : isWarn ? "#f59e0b" : "#334155" }}
          transition={{ duration: 0.2 }}
          className="mono"
          style={{ fontSize: 11, fontWeight: 600 }}
        >
          {lineCount} / 200
        </motion.span>
      </div>

      {/* Monaco */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Editor
          height="100%"
          language={language === "auto" ? "python" : language}
          value={value}
          onChange={(v) => onChange(v ?? "")}
          theme="vs-dark"
          onMount={(editor, monaco) => {
            if (onEditorMount) onEditorMount(editor, monaco);
          }}
          options={{
            fontSize: 13.5,
            fontFamily: "'JetBrains Mono', monospace",
            fontLigatures: true,
            minimap: { enabled: true },   /* keep minimap — it shows error dots */
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            wordWrap: "on",
            padding: { top: 16, bottom: 16 },
            lineHeight: 22,
            renderLineHighlight: "line",
            overviewRulerBorder: false,
            lineDecorationsWidth: 6,
            lineNumbersMinChars: 3,
            glyphMargin: true,            /* required for gutter icons */
            scrollbar: {
              vertical: "auto",
              verticalScrollbarSize: 4,
              horizontalScrollbarSize: 4,
              horizontal: "hidden",
            },
          }}
        />
      </div>
    </motion.div>
  );
}
