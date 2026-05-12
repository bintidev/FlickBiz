import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { FiFilm, FiHeart, FiStar, FiGlobe, FiBell, FiShuffle } from "react-icons/fi";
import LoginModal from "../components/auth/LoginModal";
import RegisterModal from "../components/auth/RegisterModal";

const POSTERS = [
  { src: "https://image.tmdb.org/t/p/w300/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", x: "4%", y: "8%", rot: -9, delay: 0 },
  { src: "https://image.tmdb.org/t/p/w300/1E5baAaEse26fej7uHcjOgEE2t2.jpg", x: "76%", y: "4%", rot: 7, delay: 0.2 },
  { src: "https://image.tmdb.org/t/p/w300/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", x: "85%", y: "52%", rot: -6, delay: 0.4 },
  { src: "https://image.tmdb.org/t/p/w300/iuFNMS8vlzmxnVHD8guJkgx9QaJ.jpg", x: "1%", y: "58%", rot: 8, delay: 0.6 },
  { src: "https://image.tmdb.org/t/p/w300/8Gxv8giaHnN5Zz6UnQ7ZIzsAFcR.jpg", x: "68%", y: "70%", rot: -5, delay: 0.8 },
  { src: "https://image.tmdb.org/t/p/w300/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", x: "14%", y: "76%", rot: 6, delay: 1.0 },
  { src: "https://image.tmdb.org/t/p/w300/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", x: "55%", y: "2%", rot: 4, delay: 1.2 },
  { src: "https://image.tmdb.org/t/p/w300/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", x: "30%", y: "82%", rot: -7, delay: 1.4 },
];

const features = [
  { icon: FiFilm,    title: "Your vault",   desc: "Track every movie and series — watched, watching, or on your list.", color: "#ff3f6c", num: "01", tag: "TRACKING",      angle: -2  },
  { icon: FiStar,    title: "Reviews",      desc: "Write and discover reviews. Like the ones you love.",               color: "#ff8c42", num: "02", tag: "COMMUNITY",     angle: 1.5 },
  { icon: FiGlobe,   title: "Near you",     desc: "See what's streaming in your country across all platforms.",        color: "#a78bfa", num: "03", tag: "DISCOVERY",     angle: -1  },
  { icon: FiHeart,   title: "Favourites",   desc: "Build your personal collection of all-time favourites.",            color: "#34d399", num: "04", tag: "COLLECTION",    angle: 2   },
  { icon: FiBell,    title: "Alerts",       desc: "Get notified when a watchlist title lands in your country.",        color: "#60a5fa", num: "05", tag: "NOTIFICATIONS", angle: -1.5},
  { icon: FiShuffle, title: "Surprise me",  desc: "Let FlickBiz pick something based on your taste.",                  color: "#f472b6", num: "06", tag: "RANDOM",        angle: 1   },
];

const FeatureIcon = ({ feature, size = 20, color }) => {
  const Icon = feature.icon;
  return <Icon size={size} style={{ color: color || feature.color }} />;
};

// ── Canvas cinematic background ──
function CinemaCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    const onMouse = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouse);

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.3, alpha: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.6 ? "#ff3f6c" : Math.random() > 0.5 ? "#ff8c42" : "#ffffff",
    }));

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 0.8 + 0.2, alpha: Math.random() * 0.5 + 0.1,
      twinkle: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const draw = () => {
      frameRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, W, H);
      t += 0.008;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.8);
      bg.addColorStop(0, "rgba(20,10,20,1)");
      bg.addColorStop(1, "rgba(5,5,10,1)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, 300);
      mg.addColorStop(0, "rgba(255,63,108,0.07)");
      mg.addColorStop(1, "transparent");
      ctx.fillStyle = mg;
      ctx.fillRect(0, 0, W, H);

      [{ x: W*0.25, y: H*0.35, r: 180, c: "rgba(255,63,108,0.06)" },
       { x: W*0.75, y: H*0.6,  r: 220, c: "rgba(255,140,66,0.05)" },
       { x: W*0.5,  y: H*0.8,  r: 160, c: "rgba(167,139,250,0.05)" }
      ].forEach((o, i) => {
        const ox = o.x + Math.sin(t + i * 1.2) * 60;
        const oy = o.y + Math.cos(t * 0.8 + i) * 40;
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
        g.addColorStop(0, o.c); g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      });

      for (let y = 0; y < H; y += 4) { ctx.fillStyle = "rgba(0,0,0,0.03)"; ctx.fillRect(0, y, W, 1); }

      const beamY = ((t * 80) % (H + 100)) - 50;
      const beam = ctx.createLinearGradient(0, beamY, 0, beamY + 50);
      beam.addColorStop(0, "transparent");
      beam.addColorStop(0.5, "rgba(255,63,108,0.04)");
      beam.addColorStop(1, "transparent");
      ctx.fillStyle = beam; ctx.fillRect(0, beamY, W, 50);

      ctx.strokeStyle = "rgba(255,63,108,0.04)"; ctx.lineWidth = 0.5;
      const vx = W / 2 + Math.sin(t * 0.3) * 80, vy = H * 0.5;
      for (let i = 0; i <= 20; i++) {
        ctx.beginPath(); ctx.moveTo((W / 20) * i, H); ctx.lineTo(vx, vy); ctx.stroke();
      }
      for (let i = 0; i <= 12; i++) {
        const p = i / 12, e = Math.pow(p, 2);
        const y = vy + (H - vy) * e;
        ctx.beginPath(); ctx.moveTo(vx - (W/2)*e, y); ctx.lineTo(vx + (W/2)*e, y); ctx.stroke();
      }

      stars.forEach((s) => {
        s.twinkle += 0.02;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha * (0.6 + 0.4 * Math.sin(s.twinkle))})`; ctx.fill();
      });

      particles.forEach((p) => {
        const dx = mx - p.x, dy = my - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 200) { p.vx += (dx/dist)*0.015; p.vy += (dy/dist)*0.015; }
        p.vx *= 0.98; p.vy *= 0.98;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color; ctx.fill(); ctx.globalAlpha = 1;
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i+1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < 80) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,63,108,${0.06*(1-d/80)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
    };

    draw();
    return () => { cancelAnimationFrame(frameRef.current); window.removeEventListener("resize", onResize); window.removeEventListener("mousemove", onMouse); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />;
}

// ── Custom cursor ──
function CustomCursor() {
  const cx = useMotionValue(-200), cy = useMotionValue(-200);
  const sx = useSpring(cx, { stiffness: 600, damping: 35 });
  const sy = useSpring(cy, { stiffness: 600, damping: 35 });
  const tx = useSpring(cx, { stiffness: 100, damping: 18 });
  const ty = useSpring(cy, { stiffness: 100, damping: 18 });
  const [st, setSt] = useState("default");

  useEffect(() => {
    const mv = (e) => { cx.set(e.clientX); cy.set(e.clientY); };
    const md = () => setSt("click");
    const mu = () => setSt("default");
    const mo = (e) => setSt(e.target.closest("button,a") ? "hover" : "default");
    window.addEventListener("mousemove", mv);
    window.addEventListener("mousedown", md);
    window.addEventListener("mouseup", mu);
    window.addEventListener("mouseover", mo);
    return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mousedown", md); window.removeEventListener("mouseup", mu); window.removeEventListener("mouseover", mo); };
  }, []);

  return (
    <>
      <motion.div className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border"
        style={{ x: tx, y: ty, translateX: "-50%", translateY: "-50%", borderColor: st === "hover" ? "#ff3f6c" : "rgba(255,255,255,0.3)" }}
        animate={{ width: st === "hover" ? 44 : st === "click" ? 20 : 32, height: st === "hover" ? 44 : st === "click" ? 20 : 32 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }} />
      {st === "hover" && (
        <motion.div className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full"
          style={{ x: tx, y: ty, translateX: "-50%", translateY: "-50%", width: 80, height: 80, background: "radial-gradient(circle,rgba(255,63,108,0.2),transparent)", filter: "blur(8px)" }}
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} />
      )}
      <motion.div className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
        animate={{ width: 8, height: 8, background: st === "hover" ? "#ff3f6c" : "white", boxShadow: st === "hover" ? "0 0 10px #ff3f6c" : "none" }}
        transition={{ type: "spring", stiffness: 800, damping: 35 }} />
    </>
  );
}

// ── Full-width feature deck ──
function FeatureDeck() {
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const f = features[active];

  const next = () => setActive((p) => (p + 1) % features.length);
  const prev = () => setActive((p) => (p - 1 + features.length) % features.length);

  return (
    <div className="w-full">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="text-xs tracking-widest uppercase mb-10 text-center"
        style={{ color: "#8888aa", fontFamily: "var(--font-display)" }}>
        ← drag or click arrows to explore →
      </motion.p>

      <div className="relative flex items-stretch gap-4 w-full" style={{ minHeight: 340 }}>

        {/* Prev ghost */}
        <motion.div
          className="hidden md:flex flex-col justify-between rounded-3xl p-6 flex-shrink-0 overflow-hidden relative"
          style={{ width: 200, background: "#0d0d14", border: `1px solid ${features[(active-1+features.length)%features.length].color}22`, opacity: 0.5, cursor: "none" }}
          whileHover={{ opacity: 0.75 }}
          onClick={prev}
        >
          {(() => {
            const pf = features[(active - 1 + features.length) % features.length];
            const PIcon = pf.icon;
            return (
              <>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${pf.color}18` }}>
                  <PIcon size={18} style={{ color: pf.color }} />
                </div>
                <div>
                  <span className="text-xs font-bold tracking-widest block mb-1" style={{ color: pf.color, fontFamily: "var(--font-display)" }}>{pf.tag}</span>
                  <p className="font-bold text-lg" style={{ fontFamily: "var(--font-display)", color: "#f0f0f5" }}>{pf.title}</p>
                </div>
                <div className="absolute -bottom-4 -right-2 font-extrabold opacity-[0.06] leading-none select-none pointer-events-none"
                  style={{ fontSize: 90, color: pf.color, fontFamily: "var(--font-display)" }}>{pf.num}</div>
              </>
            );
          })()}
        </motion.div>

        {/* Main card */}
        <div className="relative flex-1 overflow-hidden" style={{ minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="w-full h-full rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #13131a 0%, #0d0d14 100%)", border: `1px solid ${f.color}44`, minHeight: 340, cursor: "none" }}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragStart={() => setDragging(true)}
              onDragEnd={(_, info) => {
                setDragging(false);
                if (info.offset.x < -60) next();
                else if (info.offset.x > 60) prev();
              }}
              whileDrag={{ scale: 1.01 }}
            >
              {/* Glow */}
              <motion.div className="absolute -top-20 -right-20 rounded-full pointer-events-none"
                animate={{ scale: [1, 1.25, 1], opacity: [0.12, 0.2, 0.12] }}
                transition={{ duration: 3.5, repeat: Infinity }}
                style={{ width: 260, height: 260, background: f.color, filter: "blur(70px)" }} />

              {/* Stripe texture */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden">
                <div style={{ position: "absolute", inset: 0, opacity: 0.03,
                  backgroundImage: "repeating-linear-gradient(45deg, white 0px, white 1px, transparent 0px, transparent 50%)",
                  backgroundSize: "24px 24px" }} />
              </div>

              {/* Big number */}
              <div className="absolute -bottom-6 -right-4 font-extrabold opacity-[0.06] leading-none select-none pointer-events-none"
                style={{ fontSize: 180, color: f.color, fontFamily: "var(--font-display)" }}>{f.num}</div>

              {/* Top row */}
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: `${f.color}22`, border: `1px solid ${f.color}33` }}>
                    <FeatureIcon feature={f} size={26} />
                  </div>
                  <div>
                    <span className="text-xs font-bold tracking-[0.3em] block mb-1"
                      style={{ color: f.color, fontFamily: "var(--font-display)", opacity: 0.8 }}>{f.tag}</span>
                    <h3 className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{f.title}</h3>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: `${f.color}15`, color: f.color, fontFamily: "var(--font-display)", border: `1px solid ${f.color}33` }}>
                  {f.num} / 06
                </span>
              </div>

              {/* Description */}
              <div className="relative z-10 max-w-xl">
                <p className="text-lg leading-relaxed" style={{ color: "#9a9ab0" }}>{f.desc}</p>
              </div>

              {/* Progress + dots */}
              <div className="relative z-10">
                <div className="h-px w-full mb-4" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div className="h-full rounded-full"
                    animate={{ width: `${((active + 1) / features.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                    style={{ background: `linear-gradient(90deg, ${f.color}, ${f.color}88)` }} />
                </div>
                <div className="flex gap-2">
                  {features.map((feat, i) => (
                    <motion.button key={i}
                      onClick={() => { if (!dragging) setActive(i); }}
                      animate={{ width: i === active ? 28 : 8, background: i === active ? feat.color : "#333" }}
                      className="h-2 rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 25 }} />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next ghost */}
        <motion.div
          className="hidden md:flex flex-col justify-between rounded-3xl p-6 flex-shrink-0 overflow-hidden relative"
          style={{ width: 200, background: "#0d0d14", border: `1px solid ${features[(active+1)%features.length].color}22`, opacity: 0.5, cursor: "none" }}
          whileHover={{ opacity: 0.75 }}
          onClick={next}
        >
          {(() => {
            const nf = features[(active + 1) % features.length];
            const NIcon = nf.icon;
            return (
              <>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${nf.color}18` }}>
                  <NIcon size={18} style={{ color: nf.color }} />
                </div>
                <div>
                  <span className="text-xs font-bold tracking-widest block mb-1" style={{ color: nf.color, fontFamily: "var(--font-display)" }}>{nf.tag}</span>
                  <p className="font-bold text-lg" style={{ fontFamily: "var(--font-display)", color: "#f0f0f5" }}>{nf.title}</p>
                </div>
                <div className="absolute -bottom-4 -right-2 font-extrabold opacity-[0.06] leading-none select-none pointer-events-none"
                  style={{ fontSize: 90, color: nf.color, fontFamily: "var(--font-display)" }}>{nf.num}</div>
              </>
            );
          })()}
        </motion.div>
      </div>

      {/* Arrow nav */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <motion.button whileHover={{ scale: 1.1, x: -3 }} whileTap={{ scale: 0.9 }}
          onClick={prev}
          className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
          style={{ border: `1px solid ${f.color}44`, color: f.color, cursor: "none" }}>←</motion.button>
        <span className="text-xs" style={{ color: "#8888aa", fontFamily: "var(--font-display)" }}>{active + 1} / {features.length}</span>
        <motion.button whileHover={{ scale: 1.1, x: 3 }} whileTap={{ scale: 0.9 }}
          onClick={next}
          className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
          style={{ border: `1px solid ${f.color}44`, color: f.color, cursor: "none" }}>→</motion.button>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [modal, setModal] = useState(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const postersY = useTransform(scrollYProgress, [0, 1], [0, -120]);

  return (
    <div style={{ background: "#05050a", minHeight: "100vh", overflowX: "hidden", cursor: "none" }}>
      <CustomCursor />

      {/* Nav */}
      <motion.nav initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-5"
        style={{ background: "rgba(5,5,10,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <motion.div whileHover={{ rotate: 15, scale: 1.15 }} transition={{ type: "spring", stiffness: 400 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg,#ff3f6c,#ff8c42)", fontFamily: "var(--font-display)" }}>F</motion.div>
          <span className="font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>FlickBiz</span>
        </div>
        <div className="flex items-center gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setModal("login")}
            className="px-5 py-2 rounded-lg text-sm font-medium"
            style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f5", fontFamily: "var(--font-display)" }}>Sign in</motion.button>
          <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,63,108,0.4)" }} whileTap={{ scale: 0.95 }}
            onClick={() => setModal("register")}
            className="px-5 py-2 rounded-lg text-sm font-medium"
            style={{ background: "linear-gradient(135deg,#ff3f6c,#ff8c42)", color: "white", fontFamily: "var(--font-display)" }}>Get started</motion.button>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <CinemaCanvas />

        <motion.div className="absolute inset-0 pointer-events-none z-[1]" style={{ y: postersY }}>
          {POSTERS.map((p, i) => (
            <motion.div key={i} className="absolute" style={{ left: p.x, top: p.y, rotate: p.rot }}
              initial={{ opacity: 0, scale: 0.6, y: 50 }}
              animate={{ opacity: 0.22, scale: 1, y: 0 }}
              transition={{ delay: p.delay, duration: 1.2, ease: [0.22,1,0.36,1] }}>
              <motion.div animate={{ y: [0,-16,0], rotate:[p.rot,p.rot+2,p.rot] }}
                transition={{ duration: 5+i*0.6, repeat: Infinity, ease: "easeInOut" }}>
                <div className="relative">
                  <img src={p.src} alt="" className="rounded-xl"
                    style={{ width: "110px", filter: "saturate(0.45) brightness(0.8)" }}
                    onError={(e) => { e.target.style.display="none"; }} />
                  <div className="absolute inset-0 rounded-xl"
                    style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.07) 0%,transparent 60%)", boxShadow:"inset 0 0 0 1px rgba(255,255,255,0.08)" }} />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div className="relative z-10 text-center px-8 max-w-5xl mx-auto pt-24"
          style={{ opacity: heroOpacity, y: heroY }}>
          <motion.div initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.3, duration:0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-10"
            style={{ background:"rgba(255,63,108,0.1)", border:"1px solid rgba(255,63,108,0.35)", color:"#ff8c42" }}>
            <motion.span animate={{ scale:[1,1.5,1], opacity:[1,0.5,1] }} transition={{ duration:1.5, repeat:Infinity }}
              className="w-2 h-2 rounded-full" style={{ background:"#ff3f6c" }} />
            Your personal movie & series vault
          </motion.div>

          {["Watch it.", "Track it.", "Love it."].map((line, i) => (
            <motion.div key={line}
              initial={{ opacity:0, x: i%2===0 ? -80 : 80, filter:"blur(10px)" }}
              animate={{ opacity:1, x:0, filter:"blur(0px)" }}
              transition={{ delay:0.35+i*0.18, duration:0.9, ease:[0.22,1,0.36,1] }}>
              <span className={`block font-extrabold leading-[0.88] mb-1 ${i===1?"text-gradient":""}`}
                style={{ fontFamily:"var(--font-display)", fontSize:"clamp(3.5rem,10vw,7.5rem)" }}>{line}</span>
            </motion.div>
          ))}

          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1, duration:0.7 }}
            className="text-lg max-w-xl mx-auto mt-8 mb-10" style={{ color:"#8888aa" }}>
            Track everything you watch, discover what's new in your country,
            read and write reviews, and never forget what to watch next.
          </motion.p>

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:1.2 }}
            className="flex items-center justify-center gap-4 flex-wrap">
            <motion.button whileHover={{ scale:1.07, boxShadow:"0 0 50px rgba(255,63,108,0.45)" }} whileTap={{ scale:0.96 }}
              onClick={() => setModal("register")}
              className="px-8 py-4 rounded-xl font-bold text-base"
              style={{ background:"linear-gradient(135deg,#ff3f6c,#ff8c42)", color:"white", fontFamily:"var(--font-display)" }}>
              Start for free
            </motion.button>
            <motion.button whileHover={{ scale:1.07 }} whileTap={{ scale:0.96 }}
              onClick={() => setModal("login")}
              className="px-8 py-4 rounded-xl font-bold text-base"
              style={{ border:"1px solid rgba(255,255,255,0.1)", color:"#f0f0f5", fontFamily:"var(--font-display)" }}>
              Sign in
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y:[0,10,0] }} transition={{ duration:1.8, repeat:Infinity }} style={{ color:"#8888aa" }}>
          <span className="text-xs tracking-[0.35em] uppercase" style={{ fontFamily:"var(--font-display)" }}>Scroll</span>
          <motion.div className="w-px" animate={{ height:[24,40,24], opacity:[0.4,1,0.4] }} transition={{ duration:1.8, repeat:Infinity }}
            style={{ background:"linear-gradient(to bottom,#ff3f6c,transparent)" }} />
        </motion.div>
      </section>

      {/* ── FEATURES — draggable deck ── */}
      <section className="py-32 relative overflow-hidden">
        {/* Section background — NOT flat */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,63,108,0.06) 0%, transparent 60%)" }} />
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 40% at 80% 100%, rgba(167,139,250,0.06) 0%, transparent 60%)" }} />
          {/* Diagonal stripes */}
          <div style={{ position:"absolute", inset:0, opacity:0.025,
            backgroundImage:"repeating-linear-gradient(45deg, #ff3f6c 0px, #ff3f6c 1px, transparent 0px, transparent 50%)",
            backgroundSize:"40px 40px" }} />
        </div>

        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="text-center mb-4 px-8">
          <h2 className="text-5xl font-bold mb-3" style={{ fontFamily:"var(--font-display)" }}>Everything you need</h2>
          <p style={{ color:"#8888aa" }}>Drag or click the cards to explore every feature.</p>
        </motion.div>

        {/* Ticker */}
        <div className="relative my-12 overflow-hidden border-y py-3" style={{ borderColor:"rgba(255,255,255,0.05)" }}>
          <motion.div animate={{ x:["0%","-50%"] }} transition={{ duration:20, repeat:Infinity, ease:"linear" }}
            className="flex gap-12 whitespace-nowrap">
            {[...features,...features].map((f,i) => (
              <span key={i} className="text-xs font-bold tracking-[0.3em] flex items-center gap-3"
                style={{ color: i%3===0 ? f.color : "#2a2a3a", fontFamily:"var(--font-display)" }}>
                <span style={{ color:f.color }}>◆</span> {f.tag}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Deck — full width */}
        <div className="max-w-6xl mx-auto px-8 w-full">
          <FeatureDeck />
        </div>
      </section>

      {/* ── LOGOS ── */}
      <section className="max-w-6xl mx-auto px-8 py-16 border-t" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
        <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          className="text-center text-xs font-semibold tracking-[0.4em] uppercase mb-10"
          style={{ color:"#8888aa", fontFamily:"var(--font-display)" }}>Logo concepts</motion.p>
        <div className="flex items-center justify-center gap-10 flex-wrap">
          {[
            { label:"Lettermark", el:<div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold" style={{ background:"linear-gradient(135deg,#ff3f6c,#ff8c42)", fontFamily:"var(--font-display)" }}>FB</div> },
            { label:"Icon mark",  el:<div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background:"#1c1c26", border:"2px solid #ff3f6c" }}><FiFilm size={28} style={{ color:"#ff3f6c" }} /></div> },
            { label:"Wordmark",   el:<div className="px-4 py-3 rounded-2xl" style={{ background:"#1c1c26", border:"1px solid rgba(255,255,255,0.08)" }}><span className="text-2xl font-extrabold text-gradient" style={{ fontFamily:"var(--font-display)" }}>FLICKBIZ</span></div> },
            { label:"Combined",   el:<div className="flex items-center gap-2 px-4 py-3 rounded-2xl" style={{ background:"#1c1c26", border:"1px solid rgba(255,255,255,0.08)" }}><div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-extrabold text-sm" style={{ background:"linear-gradient(135deg,#ff3f6c,#ff8c42)", fontFamily:"var(--font-display)" }}>F</div><span className="font-bold text-lg" style={{ fontFamily:"var(--font-display)" }}>FlickBiz</span></div> },
          ].map((logo,i) => (
            <motion.div key={logo.label} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              transition={{ delay:i*0.1 }} whileHover={{ scale:1.1, y:-6 }}
              className="flex flex-col items-center gap-3">
              {logo.el}
              <span className="text-xs" style={{ color:"#8888aa" }}>{logo.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <motion.div initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="rounded-3xl p-16 text-center relative overflow-hidden"
          style={{ background:"#13131a", border:"1px solid rgba(255,255,255,0.06)" }}>
          <motion.div animate={{ x:[0,40,0], y:[0,-30,0] }} transition={{ duration:8, repeat:Infinity }}
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
            style={{ background:"#ff3f6c", opacity:0.1, filter:"blur(100px)" }} />
          <motion.div animate={{ x:[0,-40,0], y:[0,30,0] }} transition={{ duration:10, repeat:Infinity }}
            className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
            style={{ background:"#ff8c42", opacity:0.1, filter:"blur(100px)" }} />
          <h2 className="text-5xl font-bold mb-4 relative z-10" style={{ fontFamily:"var(--font-display)" }}>
            Ready to start<br />your vault?
          </h2>
          <p className="mb-8 relative z-10" style={{ color:"#8888aa" }}>Free forever. No ads. Just you and your films.</p>
          <motion.button whileHover={{ scale:1.07, boxShadow:"0 0 60px rgba(255,63,108,0.45)" }} whileTap={{ scale:0.96 }}
            onClick={() => setModal("register")}
            className="px-10 py-4 rounded-xl font-bold text-base relative z-10"
            style={{ background:"linear-gradient(135deg,#ff3f6c,#ff8c42)", color:"white", fontFamily:"var(--font-display)" }}>
            Create free account
          </motion.button>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative overflow-hidden border-t" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <motion.span animate={{ opacity:[0.025,0.04,0.025] }} transition={{ duration:4, repeat:Infinity }}
            className="font-extrabold whitespace-nowrap"
            style={{ fontFamily:"var(--font-display)", fontSize:"20vw", color:"white", letterSpacing:"-0.05em" }}>
            FLICKBIZ
          </motion.span>
        </div>
        <div className="absolute inset-x-0 top-0 h-px" style={{ background:"linear-gradient(90deg,transparent,#ff3f6c,transparent)" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ background:"linear-gradient(135deg,#ff3f6c,#ff8c42)", fontFamily:"var(--font-display)" }}>F</div>
                <span className="font-bold text-lg" style={{ fontFamily:"var(--font-display)" }}>FlickBiz</span>
              </div>
              <p className="text-sm" style={{ color:"#8888aa", lineHeight:1.7 }}>Your personal cinema vault.<br />Track it. Love it. Never forget it.</p>
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ color:"#8888aa", fontFamily:"var(--font-display)" }}>Features</p>
              <div className="flex flex-col gap-2">
                {features.slice(0,4).map((f) => (
                  <motion.span key={f.title} whileHover={{ x:6, color:f.color }}
                    className="text-sm flex items-center gap-2" style={{ color:"#5a5a7a", cursor:"none" }}>
                    <span style={{ color:f.color, fontSize:8 }}>◆</span> {f.title}
                  </motion.span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ color:"#8888aa", fontFamily:"var(--font-display)" }}>Get started</p>
              <p className="text-sm mb-4" style={{ color:"#5a5a7a" }}>Join thousands of film lovers tracking their watchlife.</p>
              <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                onClick={() => setModal("register")}
                className="text-sm font-bold px-5 py-3 rounded-xl w-fit"
                style={{ background:"linear-gradient(135deg,#ff3f6c,#ff8c42)", color:"white", fontFamily:"var(--font-display)" }}>
                Create free account →
              </motion.button>
            </div>
          </div>
          <div className="pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-3 text-xs"
            style={{ borderColor:"rgba(255,255,255,0.06)", color:"#8888aa" }}>
            <span>© {new Date().getFullYear()} FlickBiz. Made with 🎬</span>
            <div className="flex gap-6">
              {["Privacy","Terms","Contact"].map((l) => (
                <motion.a key={l} href="#" whileHover={{ color:"#f0f0f5" }}
                  style={{ color:"#8888aa", textDecoration:"none" }}>{l}</motion.a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {modal==="login" && <LoginModal onClose={() => setModal(null)} onSwitchToRegister={() => setModal("register")} />}
      {modal==="register" && <RegisterModal onClose={() => setModal(null)} onSwitchToLogin={() => setModal("login")} />}
    </div>
  );
}