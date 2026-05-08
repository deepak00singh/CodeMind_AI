import { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────
//  ParticleCanvas — lightweight canvas-based particle field
//  60fps, mouse parallax, connection mesh, no external deps
// ─────────────────────────────────────────────────────────────────
export default function ParticleCanvas({ opacity = 0.6, count = 55 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let mx = 0, my = 0;  // normalized mouse (-1 to 1)

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouse = (e) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse);

    // Particle colours: purple, cyan, white (weighted)
    const COLORS = [
      "124,58,237",   // purple
      "124,58,237",
      "6,182,212",    // cyan
      "167,139,250",  // lavender
      "255,255,255",  // white
    ];

    const particles = Array.from({ length: count }, () => ({
      x:        Math.random() * window.innerWidth,
      y:        Math.random() * window.innerHeight,
      r:        Math.random() * 1.4 + 0.4,
      vx:       (Math.random() - 0.5) * 0.28,
      vy:       (Math.random() - 0.5) * 0.28,
      baseAlpha: Math.random() * 0.45 + 0.12,
      color:    COLORS[Math.floor(Math.random() * COLORS.length)],
      phase:    Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const CONNECT_DIST = 110;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.012;

      // — Update & draw particles —
      for (const p of particles) {
        // Drift + very gentle mouse attraction
        p.x += p.vx + mx * 0.04;
        p.y += p.vy + my * 0.04;

        // Wrap edges
        if (p.x < -10)              p.x = canvas.width  + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10)              p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        // Breathing alpha
        const alpha = p.baseAlpha * (0.75 + 0.25 * Math.sin(t + p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${alpha.toFixed(2)})`;
        ctx.fill();
      }

      // — Draw connection lines —
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const lineAlpha = (1 - dist / CONNECT_DIST) * 0.07;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(124,58,237,${lineAlpha.toFixed(3)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      "fixed",
        inset:         0,
        width:         "100%",
        height:        "100%",
        pointerEvents: "none",
        zIndex:        0,
        opacity,
      }}
    />
  );
}
