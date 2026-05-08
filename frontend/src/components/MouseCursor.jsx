import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// ─────────────────────────────────────────────────────────────────
//  MouseCursor — glowing custom cursor with smooth spring follow
// ─────────────────────────────────────────────────────────────────
export default function MouseCursor() {
  const rawX = useMotionValue(-200);
  const rawY = useMotionValue(-200);

  // Outer glow follows with spring lag (feels weighty/premium)
  const glowX = useSpring(rawX, { stiffness: 80,  damping: 22 });
  const glowY = useSpring(rawY, { stiffness: 80,  damping: 22 });

  // Inner dot follows cursor tightly
  const dotX  = useSpring(rawX, { stiffness: 400, damping: 30 });
  const dotY  = useSpring(rawY, { stiffness: 400, damping: 30 });

  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const onMove = (e) => { rawX.set(e.clientX); rawY.set(e.clientY); };

    const onDown  = () => setClicking(true);
    const onUp    = () => setClicking(false);

    // Detect when hovering a clickable element
    const onOver = (e) => {
      const tag = e.target.tagName.toLowerCase();
      const isClickable = ["button","a","input","textarea","select"].includes(tag)
        || e.target.closest("button, a, [role=button]");
      setHovering(!!isClickable);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);
    window.addEventListener("mouseover", onOver);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
      window.removeEventListener("mouseover", onOver);
    };
  }, [rawX, rawY]);

  return (
    <>
      {/* Large ambient glow — follows with lag */}
      <motion.div
        style={{
          position:      "fixed",
          left:          glowX,
          top:           glowY,
          width:         clicking ? 200 : hovering ? 280 : 340,
          height:        clicking ? 200 : hovering ? 280 : 340,
          borderRadius:  "50%",
          background:    "radial-gradient(circle, rgba(124,58,237,0.07) 0%, rgba(6,182,212,0.02) 40%, transparent 70%)",
          translateX:    "-50%",
          translateY:    "-50%",
          pointerEvents: "none",
          zIndex:        9990,
          filter:        "blur(8px)",
          transition:    "width 0.3s, height 0.3s",
        }}
      />

      {/* Ring cursor */}
      <motion.div
        style={{
          position:      "fixed",
          left:          dotX,
          top:           dotY,
          translateX:    "-50%",
          translateY:    "-50%",
          pointerEvents: "none",
          zIndex:        9999,
        }}
        animate={{
          width:  clicking ? 10 : hovering ? 32 : 14,
          height: clicking ? 10 : hovering ? 32 : 14,
          opacity: hovering ? 0.8 : 0.9,
        }}
        transition={{ duration: 0.15 }}
      >
        <div style={{
          width:        "100%",
          height:       "100%",
          borderRadius: "50%",
          background:   clicking
            ? "#7c3aed"
            : hovering
            ? "transparent"
            : "rgba(124,58,237,0.9)",
          border:       hovering ? "1.5px solid rgba(124,58,237,0.8)" : "none",
          boxShadow:    clicking
            ? "0 0 16px rgba(124,58,237,1), 0 0 30px rgba(124,58,237,0.6)"
            : hovering
            ? "0 0 12px rgba(124,58,237,0.5)"
            : "0 0 10px rgba(124,58,237,0.8), 0 0 18px rgba(124,58,237,0.3)",
        }} />
      </motion.div>
    </>
  );
}
