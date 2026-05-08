import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import ParticleCanvas from "../components/ParticleCanvas";

const TITLE = "CodeMind AI";

const STATUS_STEPS = [
  "booting neural interface...",
  "loading language models...",
  "calibrating code analyser...",
  "initializing editor...",
  "ready.",
];

export default function LoadingScreen({ onDone }) {
  const [displayText, setDisplayText] = useState("");
  const [statusIdx,   setStatusIdx]   = useState(0);
  const [exiting,     setExiting]     = useState(false);

  useEffect(() => {
    // Typewriter
    let i = 0;
    const typeInterval = setInterval(() => {
      i++;
      setDisplayText(TITLE.slice(0, i));
      if (i >= TITLE.length) clearInterval(typeInterval);
    }, 65);

    // Cycle status text
    const statusInterval = setInterval(() => {
      setStatusIdx((prev) => Math.min(prev + 1, STATUS_STEPS.length - 1));
    }, 480);

    // Exit
    const exitTimer = setTimeout(() => {
      setExiting(true);
      setTimeout(onDone, 650);
    }, 2900);

    return () => {
      clearInterval(typeInterval);
      clearInterval(statusInterval);
      clearTimeout(exitTimer);
    };
  }, [onDone]);

  return (
    <motion.div
      key="loading-screen"
      initial={{ opacity: 0, scale: 1.03 }}
      animate={{ opacity: exiting ? 0 : 1, scale: exiting ? 0.97 : 1 }}
      transition={{ duration: exiting ? 0.55 : 0.4, ease: "easeInOut" }}
      style={{
        position:       "fixed",
        inset:          0,
        zIndex:         9999,
        background:     "#080810",
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        gap:            0,
        overflow:       "hidden",
      }}
    >
      {/* ── Particle background ── */}
      <ParticleCanvas opacity={0.5} count={45} />

      {/* ── Deep radial glow backdrop ── */}
      <div style={{
        position:  "absolute",
        inset:     0,
        pointerEvents: "none",
        background: [
          "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(124,58,237,0.22) 0%, transparent 65%)",
          "radial-gradient(ellipse 30% 30% at 30% 70%, rgba(6,182,212,0.06) 0%, transparent 70%)",
        ].join(", "),
        zIndex: 1,
      }} />

      {/* ── Scan line ── */}
      <div style={{
        position:   "absolute",
        left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), rgba(6,182,212,0.2), transparent)",
        animation:  "scan 3s linear infinite",
        pointerEvents: "none",
        zIndex:     1,
      }} />

      {/* ── Content ── */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* ── Logo with orbiting rings ── */}
        <div style={{ position: "relative", width: 100, height: 100, marginBottom: 32 }}>
          {/* Outer ring */}
          <div className="orbit-cw" style={{
            position:  "absolute",
            inset:     -16,
            borderRadius: "50%",
            border:    "1px dashed rgba(124,58,237,0.3)",
          }}>
            {/* Dot on ring */}
            <div style={{
              position:   "absolute",
              top:        -3, left: "50%",
              transform:  "translateX(-50%)",
              width:      6, height: 6,
              borderRadius: "50%",
              background: "#a78bfa",
              boxShadow:  "0 0 10px #a78bfa, 0 0 20px rgba(124,58,237,0.6)",
            }} />
          </div>

          {/* Inner ring (counter-clockwise) */}
          <div className="orbit-ccw" style={{
            position:  "absolute",
            inset:     -6,
            borderRadius: "50%",
            border:    "1px solid rgba(6,182,212,0.2)",
          }}>
            <div style={{
              position:   "absolute",
              bottom:     -3, right: "25%",
              width:      5, height: 5,
              borderRadius: "50%",
              background: "#06b6d4",
              boxShadow:  "0 0 8px #06b6d4, 0 0 16px rgba(6,182,212,0.5)",
            }} />
          </div>

          {/* Pulsing glow backdrop */}
          <motion.div
            animate={{
              opacity:   [0.4, 0.9, 0.4],
              scale:     [1, 1.3, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position:     "absolute",
              inset:        -24,
              borderRadius: "50%",
              background:   "radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)",
              filter:       "blur(12px)",
            }}
          />

          {/* Logo box */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.34, 1.3, 0.64, 1] }}
            className="float"
            style={{
              width:        100,
              height:       100,
              borderRadius: 24,
              background:   "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #06b6d4 100%)",
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              fontSize:     30,
              fontWeight:   900,
              color:        "white",
              fontFamily:   "'JetBrains Mono', monospace",
              boxShadow:    "0 0 60px rgba(124,58,237,0.7), 0 0 120px rgba(124,58,237,0.25)",
              animation:    "float 4s ease-in-out infinite, glow-pulse 2s ease-in-out infinite",
              letterSpacing: "-1px",
            }}
          >
            CM
          </motion.div>
        </div>

        {/* ── Typewriter title ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          style={{ height: 56, display: "flex", alignItems: "center" }}
        >
          <h1 style={{
            fontSize:      40,
            fontWeight:    900,
            letterSpacing: "-1.5px",
            fontFamily:    "'Inter', sans-serif",
            background:    "linear-gradient(135deg, #f1f5f9 30%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor:  "transparent",
            backgroundClip: "text",
          }}>
            {displayText}
            <span className="cursor" />
          </h1>
        </motion.div>

        {/* ── Tagline ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          style={{
            fontSize:      13,
            color:         "#475569",
            marginTop:     8,
            marginBottom:  44,
            fontFamily:    "'Inter', sans-serif",
            letterSpacing: "0.03em",
          }}
        >
          AI-powered code review · Zero setup
        </motion.p>

        {/* ── Progress bar ── */}
        <div style={{
          width:     240,
          height:    3,
          background:"rgba(255,255,255,0.06)",
          borderRadius: 999,
          overflow:  "hidden",
          boxShadow: "0 0 10px rgba(124,58,237,0.15)",
        }}>
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              height:     "100%",
              borderRadius: 999,
              background: "linear-gradient(90deg, #7c3aed, #a78bfa, #06b6d4, #7c3aed)",
              backgroundSize: "200% auto",
              animation:  "progress-sweep 1.5s linear infinite",
              boxShadow:  "0 0 12px rgba(124,58,237,0.6)",
            }}
          />
        </div>

        {/* ── Cycling status text ── */}
        <motion.p
          key={statusIdx}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            fontSize:  11,
            color:     "#475569",
            marginTop: 14,
            fontFamily:"'JetBrains Mono', monospace",
            letterSpacing: "0.06em",
          }}
        >
          {STATUS_STEPS[statusIdx]}
        </motion.p>
      </div>
    </motion.div>
  );
}
