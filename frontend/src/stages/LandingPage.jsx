import { useRef, useEffect, useState, useCallback, forwardRef } from "react";
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from "framer-motion";
import ParticleCanvas from "../components/ParticleCanvas";

// ─────────────────────────────────────────────────────────────────
//  Cyberpunk grid overlay
// ─────────────────────────────────────────────────────────────────
function GridBg() {
  return (
    <div style={{
      position:       "fixed",
      inset:          0,
      backgroundImage: [
        "linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px)",
        "linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)",
      ].join(", "),
      backgroundSize: "48px 48px",
      pointerEvents:  "none",
      zIndex:         0,
      maskImage:      "radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 100%)",
      WebkitMaskImage:"radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 100%)",
    }} />
  );
}

// ─────────────────────────────────────────────────────────────────
//  Mouse-parallax background orbs
// ─────────────────────────────────────────────────────────────────
function ParallaxOrbs() {
  const mx  = useMotionValue(0);
  const my  = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 50, damping: 20 });
  const smy = useSpring(my, { stiffness: 50, damping: 20 });
  const ox1 = useTransform(smx, [-1,1], [-30,  30]);
  const oy1 = useTransform(smy, [-1,1], [-20,  20]);
  const ox2 = useTransform(smx, [-1,1], [ 20, -20]);
  const oy2 = useTransform(smy, [-1,1], [ 25, -25]);

  useEffect(() => {
    const h = (e) => {
      mx.set((e.clientX / window.innerWidth  - 0.5) * 2);
      my.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, [mx, my]);

  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
      <motion.div style={{
        position:"absolute", top:"-15%", left:"-10%",
        width:"70vw", height:"70vh", borderRadius:"50%",
        background:"radial-gradient(ellipse, rgba(124,58,237,0.13) 0%, transparent 65%)",
        filter:"blur(50px)", x:ox1, y:oy1,
      }} />
      <motion.div style={{
        position:"absolute", bottom:"-10%", right:"-8%",
        width:"55vw", height:"55vh", borderRadius:"50%",
        background:"radial-gradient(ellipse, rgba(6,182,212,0.08) 0%, transparent 65%)",
        filter:"blur(50px)", x:ox2, y:oy2,
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Subtle floating decorative shapes (much more transparent)
// ─────────────────────────────────────────────────────────────────
function FloatingShapes() {
  const shapes = [
    { top:"12%", left:"2%",  size:56, cls:"float-a shape-hex",    grad:"rgba(124,58,237,0.05)", border:"rgba(124,58,237,0.12)", delay:0   },
    { top:"72%", left:"4%",  size:40, cls:"float-b shape-diamond", grad:"rgba(6,182,212,0.04)",  border:"rgba(6,182,212,0.1)",   delay:1.4 },
    { top:"18%", right:"3%", size:48, cls:"float-c shape-hex",     grad:"rgba(6,182,212,0.04)",  border:"rgba(6,182,212,0.1)",   delay:0.8 },
    { top:"78%", right:"6%", size:34, cls:"float-a shape-diamond", grad:"rgba(167,139,250,0.05)",border:"rgba(167,139,250,0.12)",delay:2.1 },
  ];
  return (
    <>
      {shapes.map((s,i) => (
        <div key={i} className={s.cls} style={{
          position:"fixed", top:s.top, left:s.left, right:s.right,
          width:s.size, height:s.size,
          background:s.grad, border:`1px solid ${s.border}`,
          backdropFilter:"blur(4px)", pointerEvents:"none", zIndex:0,
          animationDelay:`${s.delay}s`,
        }} />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
//  3D Tilt Card — FIXED with forwardRef so useInView works
// ─────────────────────────────────────────────────────────────────
const TiltCard = forwardRef(function TiltCard({ children, style, ...rest }, fwdRef) {
  const localRef = useRef(null);
  const cardRef  = fwdRef || localRef;
  const [tilt, setTilt] = useState({ x:0, y:0 });

  const handleMove = useCallback((e) => {
    const r = (typeof cardRef === "object" && cardRef.current?.getBoundingClientRect?.()) 
              || { left:0, top:0, width:0, height:0 };
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    setTilt({
      x: ((e.clientY - cy) / (r.height / 2)) * -5,
      y: ((e.clientX - cx) / (r.width  / 2)) *  5,
    });
  }, [cardRef]);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x:0, y:0 })}
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      transition={{ type:"spring", stiffness:280, damping:26 }}
      style={{ transformStyle:"preserve-3d", ...style }}
      {...rest}
    >
      {children}
    </motion.div>
  );
});

// ─────────────────────────────────────────────────────────────────
//  Animated code terminal (hero right side)
// ─────────────────────────────────────────────────────────────────
const CODE_LINES = [
  { text:"def calculate_average(numbers):", color:"#c4b5fd" },
  { text:"    total = 0",                   color:"#e2e8f0" },
  { text:"    for n in numbers:",           color:"#e2e8f0" },
  { text:"        total += n",              color:"#e2e8f0" },
  { text:"    return total / len(numbers)", color:"#e2e8f0" },
  { text:"",                                color:"#e2e8f0" },
  { text:"result = calculate_average([])",  color:"#94a3b8" },
  { text:'print(result)  # ← ZeroDivisionError!', color:"#f87171" },
];

function CodeTerminal() {
  const [visible, setVisible] = useState(0);
  const [showBug, setShowBug] = useState(false);
  const [scanning,setScanning]= useState(false);

  useEffect(() => {
    const ts = CODE_LINES.map((_,i) => setTimeout(() => setVisible(i+1), i*290+500));
    const s1 = setTimeout(() => setScanning(true),  CODE_LINES.length*290+700);
    const s2 = setTimeout(() => { setShowBug(true); setScanning(false); }, CODE_LINES.length*290+1500);
    return () => { ts.forEach(clearTimeout); clearTimeout(s1); clearTimeout(s2); };
  }, []);

  return (
    <div style={{
      position:"relative",
      background:"rgba(8,8,20,0.85)",
      border:"1px solid rgba(124,58,237,0.2)",
      borderRadius:18, overflow:"hidden",
      fontFamily:"'JetBrains Mono', monospace",
      boxShadow:[
        "0 0 0 1px rgba(124,58,237,0.08)",
        "0 32px 80px rgba(0,0,0,0.65)",
        "0 0 60px rgba(124,58,237,0.1)",
      ].join(", "),
    }}>
      {/* Animated gradient top line */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:1,
        background:"linear-gradient(90deg, transparent, #7c3aed, #06b6d4, transparent)",
        backgroundSize:"200% auto",
        animation:"bg-gradient-shift 3s ease infinite",
      }} />

      {/* Title bar */}
      <div style={{
        padding:"11px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)",
        background:"rgba(255,255,255,0.02)",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", gap:7 }}>
          {["#ef4444","#f59e0b","#10b981"].map((c,i)=>(
            <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:c, opacity:0.65 }} />
          ))}
        </div>
        <span style={{ fontSize:12, color:"#475569" }}>main.py</span>
        <motion.span
          animate={{ opacity:[1,0.3,1] }}
          transition={{ duration:1.4, repeat:Infinity }}
          style={{ fontSize:11, color: scanning ? "#f59e0b" : showBug ? "#ef4444" : "#7c3aed" }}
        >
          {scanning ? "⚡ scanning..." : showBug ? "🔴 issue found" : "● analyzing..."}
        </motion.span>
      </div>

      {/* Code */}
      <div style={{ padding:"18px 20px", minHeight:224 }}>
        {CODE_LINES.slice(0, visible).map((line,i) => {
          const isBug = i === CODE_LINES.length - 1;
          return (
            <motion.div key={i}
              initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
              transition={{ duration:0.2 }}
              style={{
                display:"flex", gap:14, lineHeight:"23px",
                background: isBug && showBug ? "rgba(239,68,68,0.1)" : "transparent",
                borderLeft: isBug && showBug ? "2px solid #ef4444" : "2px solid transparent",
                paddingLeft:4, transition:"all 0.4s",
              }}
            >
              <span style={{ color:"#2d3748", fontSize:11.5, width:18, textAlign:"right", userSelect:"none", flexShrink:0 }}>{i+1}</span>
              <span style={{ color:line.color, fontSize:12.5, whiteSpace:"pre" }}>{line.text}</span>
            </motion.div>
          );
        })}
        {visible < CODE_LINES.length && (
          <div style={{ paddingLeft:36, lineHeight:"23px" }}><span className="cursor" /></div>
        )}
      </div>

      {/* Bug card */}
      {showBug && (
        <motion.div
          initial={{ opacity:0, y:10, scale:0.97 }}
          animate={{ opacity:1, y:0, scale:1 }}
          transition={{ duration:0.4, ease:[0.34,1.2,0.64,1] }}
          style={{
            margin:"0 16px 16px", padding:"12px 16px",
            background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.28)",
            borderRadius:11, display:"flex", alignItems:"center", gap:10,
            boxShadow:"0 0 24px rgba(239,68,68,0.12)",
          }}
        >
          <span style={{ fontSize:14 }}>🔴</span>
          <div>
            <span style={{ fontSize:12, color:"#fca5a5", fontWeight:600, display:"block" }}>
              Critical · Line 7 — ZeroDivisionError
            </span>
            <span style={{ fontSize:11, color:"#6b7280" }}>Empty list passed to calculate_average()</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Feature Card — FIXED: whileInView instead of broken useInView ref
// ─────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon:"🐛", title:"Bug Detection",            desc:"Every real bug flagged with exact line number and severity — critical, warning, or info.",         color:"#ef4444", glow:"rgba(239,68,68,0.12)",  border:"rgba(239,68,68,0.22)"  },
  { icon:"⚡", title:"Smart Optimizations",      desc:"Performance improvements with working code examples you can copy in one click.",                   color:"#f59e0b", glow:"rgba(245,158,11,0.12)",border:"rgba(245,158,11,0.22)" },
  { icon:"📖", title:"Plain-English Explanation", desc:"What your code does, how it works, which patterns it uses — explained in language anyone can understand.", color:"#06b6d4", glow:"rgba(6,182,212,0.12)", border:"rgba(6,182,212,0.22)"  },
];

function FeatureCard({ feat, index }) {
  return (
    <motion.div
      initial={{ opacity:0, y:32 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, margin:"-40px" }}
      transition={{ duration:0.55, delay:index*0.13, ease:"easeOut" }}
      style={{ flex:1, minWidth:300 }}
    >
      <TiltCard
        whileHover={{
          boxShadow: `0 16px 48px ${feat.glow.replace("0.12","0.28")}, 0 0 0 1px ${feat.border}`,
          borderColor: feat.border,
        }}
        style={{
          height: "100%",
          background:"rgba(255,255,255,0.028)",
          border:`1px solid rgba(255,255,255,0.08)`,
          borderRadius:20, padding:"30px 26px",
          cursor:"default", position:"relative", overflow:"hidden",
          boxShadow:"0 4px 24px rgba(0,0,0,0.3)",
          transition:"border-color 0.3s",
        }}
      >
        {/* Corner glow */}
        <div style={{
        position:"absolute", top:0, right:0, width:120, height:120,
        background:`radial-gradient(circle at top right, ${feat.glow} 0%, transparent 70%)`,
        pointerEvents:"none",
      }} />
      {/* Icon */}
      <div style={{
        width:52, height:52, borderRadius:15,
        background:feat.glow, border:`1px solid ${feat.border}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:22, marginBottom:20,
        boxShadow:`0 0 20px ${feat.glow}`,
      }}>
        {feat.icon}
      </div>
      <h3 style={{ color:"#f1f5f9", fontSize:17, fontWeight:700, margin:"0 0 10px", letterSpacing:"-0.3px" }}>
        {feat.title}
      </h3>
      <p style={{ color:"#64748b", fontSize:14, lineHeight:1.72, margin:0 }}>
        {feat.desc}
      </p>
      </TiltCard>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Horizontal Scroll Capabilities
// ─────────────────────────────────────────────────────────────────
const CAPABILITIES = [
  { icon:"🎯", title:"Precise Line References",  desc:"Every bug pinpointed to an exact line — no guessing, no vague hints." },
  { icon:"🧩", title:"Pattern Recognition",       desc:"Spots anti-patterns, code smells, and architectural issues automatically." },
  { icon:"🚀", title:"Performance Suggestions",   desc:"Swap slow patterns for Python builtins and JavaScript idioms." },
  { icon:"🔐", title:"Security Awareness",        desc:"Flags common injection risks, unsafe operations, and dangerous patterns." },
  { icon:"📚", title:"Beginner-Friendly Output",  desc:"All feedback in plain English — no jargon, no condescension." },
];

function HorizontalScrollSection() {
  return (
    <section style={{ padding: "60px 0 80px", position: "relative" }}>
      <div style={{
        display:"flex", flexDirection:"column", justifyContent:"center",
        overflow:"hidden", padding:"0 0 0 40px",
      }}>
        <motion.div
          initial={{ opacity:0, y:20 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          transition={{ duration:0.5 }}
          style={{ maxWidth:520, marginBottom:30 }}
        >
          <p style={{ color:"#7c3aed", fontSize:12, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", margin:"0 0 10px" }}>
            Capabilities
          </p>
          <h2 style={{ fontSize:"clamp(22px,2.8vw,36px)", fontWeight:800, letterSpacing:"-0.6px", lineHeight:1.2, color:"#f1f5f9", margin:0 }}>
            Built for developers who care about quality
          </h2>
        </motion.div>

        <div style={{ 
          display:"flex", gap:20, overflowX: "auto", paddingBottom: "30px", paddingRight: "40px",
          scrollbarWidth: "none", "-ms-overflow-style": "none"
        }} className="hide-scroll">
          {CAPABILITIES.map((cap,i) => (
            <motion.div 
              key={i}
              initial={{ opacity:0, x:30 }}
              whileInView={{ opacity:1, x:0 }}
              viewport={{ once:true, margin: "-40px" }}
              transition={{ duration:0.5, delay: i * 0.1 }}
              style={{ width: "28vw", minWidth: 280, flexShrink: 0 }}
            >
              <TiltCard
                whileHover={{ boxShadow:"0 12px 40px rgba(124,58,237,0.18), 0 0 0 1px rgba(124,58,237,0.2)", borderColor:"rgba(124,58,237,0.25)" }}
                style={{
                  height: "100%",
                  background:"rgba(255,255,255,0.028)",
                  border:"1px solid rgba(255,255,255,0.08)",
                  borderRadius:20, padding:"32px 28px",
                  position:"relative", overflow:"hidden",
                  boxShadow:"0 4px 24px rgba(0,0,0,0.3)",
                }}
              >
                <div style={{
                  position:"absolute", top:0, right:0, width:90, height:90,
                  background:"radial-gradient(circle at top right, rgba(124,58,237,0.08) 0%, transparent 70%)",
                }} />
                <span style={{ fontSize:34, display:"block", marginBottom:20 }}>{cap.icon}</span>
                <h3 style={{ color:"#f1f5f9", fontSize:16, fontWeight:700, margin:"0 0 10px", letterSpacing:"-0.2px" }}>
                  {cap.title}
                </h3>
                <p style={{ color:"#64748b", fontSize:14, lineHeight:1.7, margin:0 }}>
                  {cap.desc}
                </p>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
//  How It Works — FIXED with whileInView
// ─────────────────────────────────────────────────────────────────
const HOW_STEPS = [
  { num:"01", title:"Paste Your Code",       desc:"Drop up to 200 lines of Python or JavaScript into the Monaco editor. No setup, no account required." },
  { num:"02", title:"AI Analyzes",           desc:"GPT-4o-mini reviews your code with a precision-engineered prompting system that prevents hallucinations." },
  { num:"03", title:"Bugs Detected",         desc:"Every real bug is flagged with its exact line number, severity level, and a concrete suggested fix." },
  { num:"04", title:"Suggestions Generated", desc:"Get 1–3 impactful optimizations with working code snippets. Copy and apply in seconds." },
];

function HowStep({ step, index }) {
  return (
    <motion.div
      initial={{ opacity:0, y:24 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, margin:"-40px" }}
      transition={{ duration:0.5, delay:(index%2)*0.1, ease:"easeOut" }}
    >
      <TiltCard
        whileHover={{ boxShadow:"0 12px 40px rgba(124,58,237,0.15), 0 0 0 1px rgba(124,58,237,0.2)", borderColor:"rgba(124,58,237,0.22)" }}
        style={{
          height: "100%",
          background:"rgba(255,255,255,0.028)",
          border:"1px solid rgba(255,255,255,0.08)",
          borderRadius:20, padding:"30px 26px",
          display:"flex", gap:22,
          position:"relative", overflow:"hidden",
          boxShadow:"0 4px 24px rgba(0,0,0,0.3)",
          transition:"border-color 0.3s",
        }}
      >
        <div style={{
        position:"absolute", top:0, left:0, right:0, bottom:0,
        background:"radial-gradient(ellipse at top left, rgba(124,58,237,0.05) 0%, transparent 55%)",
        pointerEvents:"none",
      }} />
      <span style={{
        fontSize:13, fontWeight:900, color:"#7c3aed",
        fontFamily:"'JetBrains Mono', monospace",
        flexShrink:0, marginTop:2, letterSpacing:"0.04em",
        textShadow:"0 0 20px rgba(124,58,237,0.5)",
      }}>
        {step.num}
      </span>
      <div>
        <h3 style={{ color:"#f1f5f9", fontSize:16, fontWeight:700, margin:"0 0 8px", letterSpacing:"-0.2px" }}>
          {step.title}
        </h3>
        <p style={{ color:"#64748b", fontSize:14, lineHeight:1.7, margin:0 }}>
          {step.desc}
        </p>
      </div>
      </TiltCard>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  LANDING PAGE
// ─────────────────────────────────────────────────────────────────
export default function LandingPage({ onStart }) {
  return (
    <motion.div
      key="landing"
      initial={{ opacity:0 }}
      animate={{ opacity:1 }}
      exit={{ opacity:0, scale:0.97 }}
      transition={{ duration:0.5 }}
      style={{ background:"#080810", color:"#f1f5f9", fontFamily:"'Inter', sans-serif", overflowX:"hidden" }}
    >
      {/* ── Global background layers ── */}
      <ParticleCanvas opacity={0.55} count={50} />
      <GridBg />
      <ParallaxOrbs />
      <FloatingShapes />

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ y:-20, opacity:0 }}
        animate={{ y:0, opacity:1 }}
        transition={{ duration:0.5, delay:0.1 }}
        style={{
          position:"fixed", top:0, left:0, right:0, height:60, zIndex:200,
          background:"rgba(8,8,16,0.85)",
          backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
          borderBottom:"1px solid rgba(124,58,237,0.1)",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 36px",
        }}
      >
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:32, height:32, borderRadius:9,
            background:"linear-gradient(135deg, #7c3aed, #06b6d4)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:12, fontWeight:900, color:"white",
            fontFamily:"'JetBrains Mono', monospace",
            boxShadow:"0 0 22px rgba(124,58,237,0.55)",
          }}>CM</div>
          <span style={{ fontWeight:700, fontSize:15, color:"#f1f5f9" }}>CodeMind</span>
          <span style={{
            fontSize:10, fontWeight:700, color:"#7c3aed",
            background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)",
            padding:"2px 8px", borderRadius:999,
          }}>AI</span>
        </div>

        <motion.button
          onClick={onStart}
          whileHover={{ scale:1.04, boxShadow:"0 0 40px rgba(124,58,237,0.55)" }}
          whileTap={{ scale:0.96 }}
          style={{
            position:"relative", overflow:"hidden",
            padding:"8px 24px", borderRadius:10,
            background:"linear-gradient(135deg, #7c3aed, #4f46e5)",
            border:"none", color:"white",
            fontSize:13, fontWeight:700, cursor:"pointer",
            boxShadow:"0 0 24px rgba(124,58,237,0.35)",
            fontFamily:"inherit",
          }}
        >
          <span style={{
            position:"absolute", top:0, left:0, width:"40%", height:"100%",
            background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
            animation:"shimmer-sweep 2.5s infinite",
          }} />
          Open App →
        </motion.button>
      </motion.nav>

      {/* ══════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <section style={{
        minHeight:"100vh", display:"flex", alignItems:"center",
        padding:"110px 40px 80px",
        position:"relative", overflow:"hidden",
        maxWidth:1200, margin:"0 auto", zIndex:1,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:64, width:"100%", position:"relative", zIndex:1 }}>

          {/* LEFT */}
          <div style={{ flex:1 }}>
            <motion.div
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
              style={{
                display:"inline-flex", alignItems:"center", gap:8,
                padding:"5px 14px", borderRadius:999, marginBottom:28,
                background:"rgba(124,58,237,0.1)", border:"1px solid rgba(124,58,237,0.25)",
                fontSize:12, color:"#a78bfa", fontWeight:600,
                boxShadow:"0 0 20px rgba(124,58,237,0.1)",
              }}
            >
              <span style={{
                width:6, height:6, borderRadius:"50%",
                background:"#10b981", boxShadow:"0 0 8px #10b981",
                display:"inline-block", animation:"dot-pulse 2s ease-in-out infinite",
              }} />
              Powered by GPT-4o-mini
            </motion.div>

            <motion.h1
              initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.8, delay:0.1, ease:"easeOut" }}
              style={{
                fontSize:"clamp(38px,5.8vw,68px)",
                fontWeight:900, lineHeight:1.06,
                letterSpacing:"-2.5px", margin:"0 0 22px", color:"#f1f5f9",
              }}
            >
              Your AI{" "}
              <span className="gradient-text neon-text" style={{ display:"inline-block" }}>
                Code Reviewer
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.65, delay:0.22 }}
              style={{ fontSize:17, color:"#64748b", lineHeight:1.72, margin:"0 0 38px", maxWidth:460 }}
            >
              Paste your Python or JavaScript code and get instant line-by-line AI feedback — bugs, optimizations, and plain-English explanations in seconds.
            </motion.p>

            <motion.div
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.6, delay:0.38 }}
              style={{ display:"flex", gap:18, alignItems:"center" }}
            >
              <motion.button
                onClick={onStart}
                whileHover={{ scale:1.04, boxShadow:"0 0 70px rgba(124,58,237,0.7), 0 8px 40px rgba(0,0,0,0.3)" }}
                whileTap={{ scale:0.97 }}
                style={{
                  position:"relative", overflow:"hidden",
                  padding:"16px 38px", borderRadius:14,
                  background:"linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                  border:"none", color:"white",
                  fontSize:16, fontWeight:800, cursor:"pointer",
                  boxShadow:"0 0 44px rgba(124,58,237,0.48), 0 4px 24px rgba(0,0,0,0.3)",
                  fontFamily:"inherit", letterSpacing:"-0.2px",
                }}
              >
                <span style={{
                  position:"absolute", top:0, left:0, width:"40%", height:"100%",
                  background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
                  animation:"shimmer-sweep 2.5s infinite",
                }} />
                Start Analyzing →
              </motion.button>
              <span style={{ fontSize:13, color:"#334155", fontWeight:500 }}>Free · No signup</span>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }}
              transition={{ delay:0.7, duration:0.5 }}
              style={{ display:"flex", gap:28, marginTop:40 }}
            >
              {[
                { label:"Languages",  value:"Python & JS"  },
                { label:"Max lines",  value:"200"          },
                { label:"Powered by", value:"GPT-4o-mini"  },
              ].map((s,i) => (
                <div key={i}>
                  <div style={{ fontSize:16, fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.3px" }}>{s.value}</div>
                  <div style={{ fontSize:11, color:"#334155", marginTop:2, fontFamily:"'JetBrains Mono', monospace" }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: Code terminal */}
          <motion.div
            initial={{ opacity:0, x:50, y:10 }} animate={{ opacity:1, x:0, y:0 }}
            transition={{ duration:1, delay:0.3, ease:"easeOut" }}
            style={{ flex:1, maxWidth:500 }}
            className="float"
          >
            <CodeTerminal />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES — cards now actually show!
      ══════════════════════════════════════════ */}
      <section style={{ padding:"60px 40px 40px", maxWidth:1200, margin:"0 auto", position:"relative", zIndex:1 }}>
        <motion.div
          initial={{ opacity:0, y:20 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true, margin:"-40px" }}
          transition={{ duration:0.6 }}
          style={{ textAlign:"center", marginBottom:40 }}
        >
          <p style={{ color:"#7c3aed", fontSize:12, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", margin:"0 0 12px" }}>
            What you get
          </p>
          <h2 style={{ fontSize:"clamp(24px,3.2vw,42px)", fontWeight:800, margin:"0 0 14px", letterSpacing:"-1px", color:"#f1f5f9" }}>
            Everything you need to write better code
          </h2>
          <p style={{ color:"#64748b", fontSize:16, margin:0 }}>
            Powered by GPT-4o-mini with a precision-engineered review system
          </p>
        </motion.div>

        {/* Feature cards — visible! */}
        <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
          {FEATURES.map((feat,i) => <FeatureCard key={i} feat={feat} index={i} />)}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HORIZONTAL SCROLL CAPABILITIES
      ══════════════════════════════════════════ */}
      <HorizontalScrollSection />

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section style={{ padding:"60px 40px 40px", maxWidth:1200, margin:"0 auto", position:"relative", zIndex:1 }}>
        <motion.div
          initial={{ opacity:0, y:20 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true, margin:"-40px" }}
          transition={{ duration:0.6 }}
          style={{ textAlign:"center", marginBottom:40 }}
        >
          <p style={{ color:"#7c3aed", fontSize:12, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", margin:"0 0 12px" }}>
            How it works
          </p>
          <h2 style={{ fontSize:"clamp(24px,3.2vw,42px)", fontWeight:800, margin:0, letterSpacing:"-1px", color:"#f1f5f9" }}>
            From code to insights in seconds
          </h2>
        </motion.div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
          {HOW_STEPS.map((step,i) => <HowStep key={i} step={step} index={i} />)}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section style={{ padding:"80px 40px 80px", textAlign:"center", position:"relative", overflow:"hidden", zIndex:1 }}>
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          background:"radial-gradient(ellipse 60% 65% at 50% 50%, rgba(124,58,237,0.14) 0%, transparent 70%)",
        }} />
        <motion.div
          initial={{ opacity:0, y:30 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true, margin:"-40px" }}
          transition={{ duration:0.7, ease:"easeOut" }}
          style={{ position:"relative", zIndex:1 }}
        >
          <h2 style={{ fontSize:"clamp(28px,4.5vw,56px)", fontWeight:900, margin:"0 0 18px", letterSpacing:"-1.5px" }}>
            Ready to write{" "}
            <span className="gradient-text">better code?</span>
          </h2>
          <p style={{ color:"#64748b", fontSize:16, margin:"0 0 48px", lineHeight:1.65 }}>
            No signup required. Paste your code and get AI feedback in seconds.
          </p>

          <motion.button
            onClick={onStart}
            whileHover={{ scale:1.05, boxShadow:"0 0 90px rgba(124,58,237,0.7)" }}
            whileTap={{ scale:0.97 }}
            style={{
              position:"relative", overflow:"hidden",
              padding:"18px 52px", borderRadius:18,
              background:"linear-gradient(135deg, #7c3aed, #4f46e5)",
              border:"none", color:"white",
              fontSize:18, fontWeight:800, cursor:"pointer",
              boxShadow:"0 0 56px rgba(124,58,237,0.52)",
              fontFamily:"inherit", letterSpacing:"-0.3px",
            }}
          >
            <span style={{
              position:"absolute", top:0, left:0, width:"40%", height:"100%",
              background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
              animation:"shimmer-sweep 2.5s infinite",
            }} />
            Try CodeMind AI →
          </motion.button>
        </motion.div>

        <div style={{ marginTop:80, paddingTop:28, borderTop:"1px solid rgba(255,255,255,0.04)" }}>
          <p style={{ color:"#1e293b", fontSize:12, fontFamily:"'JetBrains Mono', monospace" }}>
            CodeMind AI · Powered by GPT-4o-mini
          </p>
        </div>
      </section>
    </motion.div>
  );
}
