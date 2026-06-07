import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { FiFilm, FiHeart, FiStar, FiGlobe, FiBell, FiShuffle } from "react-icons/fi";
import LoginModal from "../components/auth/LoginModal";
import RegisterModal from "../components/auth/RegisterModal";
import Navbar from "../components/layout/NavBar";

const POSTERS = [
  { src: "https://image.tmdb.org/t/p/w300/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", x: "4%", y: "8%", rot: -9, delay: 0 },
  { src: "https://image.tmdb.org/t/p/w300/1E5baAaEse26fej7uHcjOgEE2t2.jpg", x: "76%", y: "4%", rot: 7, delay: 0.2 },
  { src: "https://image.tmdb.org/t/p/w300/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", x: "85%", y: "52%", rot: -6, delay: 0.4 },
  { src: "https://image.tmdb.org/t/p/w300/iuFNMS8vlzmxnVHD8guJkgx9QaJ.jpg", x: "1%", y: "58%", rot: 8, delay: 0.6 },
  { src: "https://image.tmdb.org/t/p/w300/8Gxv8giaHnN5Zz6UnQ7ZIzsAFcR.jpg", x: "68%", y: "70%", rot: -5, delay: 0.8 },
  { src: "https://image.tmdb.org/t/p/w300/arw2vcBveWOV6pxd9XTd1TdQa.jpg", x: "14%", y: "76%", rot: 6, delay: 1.0 },
  { src: "https://image.tmdb.org/t/p/w300/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", x: "55%", y: "2%", rot: 4, delay: 1.2 },
  { src: "https://image.tmdb.org/t/p/w300/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", x: "30%", y: "82%", rot: -7, delay: 1.4 },
];

const features = [
  { icon: FiFilm,    title: "Your vault",   desc: "Track every movie and series — watched, watching, or on your list.", color: "#ff3f6c", num: "01", tag: "TRACKING",      angle: -2  },
  { icon: FiStar,    title: "Reviews",      desc: "Write and discover reviews. Like the ones you love.",               color: "#ff8c42", num: "02", tag: "COMMUNITY",     angle: 1.5 },
  { icon: FiGlobe,   title: "Near you",     desc: "See what's streaming in your country across all platforms.",        color: "#a78bfa", num: "03", tag: "DISCOVERY",     angle: -1  },
  { icon: FiHeart,   title: "Favourites",   desc: "Build your personal collection of all-time favourites.",        color: "#60a5fa", num: "04", tag: "NOTIFICATIONS", angle: -1.5},
  { icon: FiShuffle, title: "Surprise me",  desc: "Let FlickBiz pick something based on your taste.",                  color: "#f472b6", num: "05", tag: "RANDOM",        angle: 1   },
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
      <motion.div className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border hidden md:block"
        style={{ x: tx, y: ty, translateX: "-50%", translateY: "-50%", borderColor: st === "hover" ? "#ff3f6c" : "rgba(255,255,255,0.3)" }}
        animate={{ width: st === "hover" ? 44 : st === "click" ? 20 : 32, height: st === "hover" ? 44 : st === "click" ? 20 : 32 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }} />
      {st === "hover" && (
        <motion.div className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full hidden md:block"
          style={{ x: tx, y: ty, translateX: "-50%", translateY: "-50%", width: 80, height: 80, background: "radial-gradient(circle,rgba(255,63,108,0.2),transparent)", filter: "blur(8px)" }}
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} />
      )}
      <motion.div className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full hidden md:block"
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

  // Animaciones para las tarjetas laterales (fantasmas)
  const ghostVariants = {
    hidden: { opacity: 0, x: 0 },
    visible: { opacity: 0.4, transition: { duration: 0.5 } },
    hover: { opacity: 0.8, x: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="w-full">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="text-[11px] font-mono tracking-[0.4em] uppercase mb-12 text-center"
        style={{ color: "#777799" }}>
        Swipe the cards or use controls
      </motion.p>

      <div className="relative flex items-stretch gap-6 w-full" style={{ minHeight: 400 }}>

        {/* Prev ghost */}
        <motion.div
          className="hidden xl:flex flex-col justify-between rounded-3xl p-8 flex-shrink-0 overflow-hidden relative cursor-pointer group"
          style={{ width: 220, background: "#0c0c12", border: `1px solid rgba(255,255,255,0.03)` }}
          variants={ghostVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          onClick={prev}
        >
          {(() => {
            const pf = features[(active - 1 + features.length) % features.length];
            const PIcon = pf.icon;
            return (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
                <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: `${pf.color}10`, borderColor: `${pf.color}30` }}>
                  <PIcon size={20} style={{ color: pf.color }} />
                </div>
                <div className="relative z-10">
                  <span className="text-[10px] font-mono font-bold tracking-[0.3em] block mb-2 uppercase opacity-80" style={{ color: pf.color }}>{pf.tag}</span>
                  <p className="font-extrabold text-2xl uppercase tracking-tighter text-white" style={{ fontFamily: "var(--font-display)" }}>{pf.title}</p>
                </div>
                <div className="absolute -bottom-6 -right-3 font-extrabold opacity-[0.03] leading-none select-none pointer-events-none transition-opacity group-hover:opacity-[0.06]"
                  style={{ fontSize: 110, color: pf.color, fontFamily: "var(--font-display)" }}>{pf.num}</div>
              </>
            );
          })()}
        </motion.div>

        {/* Main card */}
        <div className="relative flex-1 overflow-hidden" style={{ minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="w-full h-full rounded-3xl p-12 flex flex-col justify-between relative overflow-hidden group shadow-[0_30px_90px_-15px_rgba(0,0,0,0.9)]"
              style={{ background: "linear-gradient(135deg, #0e0e16 0%, #08080f 100%)", border: `1px solid rgba(255,255,255,0.04)`, minHeight: 400, cursor: "grab" }}
              initial={{ opacity: 0, scale: 0.95, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: -30 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragStart={() => setDragging(true)}
              onDragEnd={(_, info) => {
                setDragging(false);
                if (info.offset.x < -70) next();
                else if (info.offset.x > 70) prev();
              }}
              whileDrag={{ scale: 1.02, cursor: "grabbing", boxShadow: "0 40px 120px -20px rgba(0,0,0,1)" }}
            >
              {/* Glow Dinámico */}
              <motion.div className="absolute -top-32 -right-32 rounded-full pointer-events-none mix-blend-screen"
                animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: 350, height: 350, background: f.color, filter: "blur(90px)" }} />

              {/* Textura de rejilla ciberpunk */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden opacity-30">
                <div style={{ position: "absolute", inset: 0,
                  backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
                  backgroundSize: "25px 25px" }} />
              </div>

              {/* Número gigante Brutalista */}
              <div className="absolute -bottom-10 -right-5 font-black opacity-[0.04] leading-none select-none pointer-events-none transition-all duration-700 group-hover:opacity-[0.07] group-hover:-translate-y-2"
                style={{ fontSize: 240, color: f.color, fontFamily: "var(--font-display)" }}>{f.num}</div>

              {/* Fila superior: Icono, Título y Tag */}
             <div className="flex flex-col relative z-10 w-full gap-4">
              {/* Fila superior: Icono y Contador */}
              <div className="flex items-center justify-between w-full">
                <motion.div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-xl flex-shrink-0"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  style={{ background: `${f.color}15`, borderColor: `${f.color}40`, boxShadow: `0 0 20px ${f.color}10` }}
                >
                  <FeatureIcon feature={f} size={22} />
                </motion.div>

                {/* Contador con margen extra para separación visual */}
                <div className="font-mono text-[10px] tracking-widest px-3 py-1 rounded-full border border-white/5 bg-white/5 text-zinc-500 whitespace-nowrap">
                  <span className="text-white font-bold">{f.num}</span> / 05
                </div>
              </div>

              {/* Fila inferior: Tag y Título */}
              <div className="min-w-0 w-full">
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] block mb-1 uppercase"
                  style={{ color: f.color, opacity: 0.9 }}>// {f.tag}</span>
                
                <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tighter text-white leading-tight break-words" 
                    style={{ fontFamily: "var(--font-display)" }}>
                  {f.title}
                </h3>
              </div>
            </div>

              {/* Descripción con tipografía refinada */}
              <div className="relative z-10 max-w-2xl my-8">
                <p className="text-xl font-light leading-relaxed text-zinc-300 transition-colors group-hover:text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{f.desc}</p>
              </div>

              {/* Barra de progreso y puntos de navegación (Dots) */}
              <div className="relative z-10">
                <div className="h-[2px] w-full mb-6 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50 shadow-inner">
                  <motion.div className="h-full rounded-full"
                    animate={{ width: `${((active + 1) / features.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ background: `linear-gradient(90deg, ${f.color}, ${f.color}AA)`, boxShadow: `0 0 15px ${f.color}AA` }} />
                </div>
                <div className="flex gap-2.5">
                  {features.map((feat, i) => (
                    <motion.button key={i}
                      onClick={() => { if (!dragging) setActive(i); }}
                      whileHover={{ y: -2 }}
                      animate={{ 
                        width: i === active ? 35 : 10, 
                        background: i === active ? feat.color : "rgba(255,255,255,0.1)",
                        boxShadow: i === active ? `0 0 15px ${feat.color}` : "none"
                      }}
                      className="h-2.5 rounded-full transition-shadow duration-300"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }} />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next ghost */}
        <motion.div
          className="hidden xl:flex flex-col justify-between rounded-3xl p-8 flex-shrink-0 overflow-hidden relative cursor-pointer group"
          style={{ width: 220, background: "#0c0c12", border: `1px solid rgba(255,255,255,0.03)` }}
          variants={ghostVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          onClick={next}
        >
          {(() => {
            const nf = features[(active + 1) % features.length];
            const NIcon = nf.icon;
            return (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
                <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: `${nf.color}10`, borderColor: `${nf.color}30` }}>
                  <NIcon size={20} style={{ color: nf.color }} />
                </div>
                <div className="relative z-10">
                  <span className="text-[10px] font-mono font-bold tracking-[0.3em] block mb-2 uppercase opacity-80" style={{ color: nf.color }}>{nf.tag}</span>
                  <p className="font-extrabold text-2xl uppercase tracking-tighter text-white" style={{ fontFamily: "var(--font-display)" }}>{nf.title}</p>
                </div>
                <div className="absolute -bottom-6 -right-3 font-extrabold opacity-[0.03] leading-none select-none pointer-events-none transition-opacity group-hover:opacity-[0.06]"
                  style={{ fontSize: 110, color: nf.color, fontFamily: "var(--font-display)" }}>{nf.num}</div>
              </>
            );
          })()}
        </motion.div>
      </div>

      {/* Navegación por flechas (Estilo Brutalista) */}
      <div className="flex items-center justify-center gap-5 mt-12">
        <motion.button whileHover={{ x: -4, background: "rgba(255,255,255,0.03)" }} whileTap={{ scale: 0.96 }}
          onClick={prev}
          className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl transition-all shadow-md group"
          style={{ border: `1px solid rgba(255,255,255,0.06)`, background: "rgba(255,255,255,0.01)", color: f.color }}>
          <span className="group-hover:scale-110 transition-transform">←</span>
        </motion.button>
        <span className="text-[10px] font-mono tracking-[0.3em] uppercase" style={{ color: "#777799" }}>
          <span className="text-white font-bold">{active + 1}</span> / {features.length}
        </span>
        <motion.button whileHover={{ x: 4, background: "rgba(255,255,255,0.03)" }} whileTap={{ scale: 0.96 }}
          onClick={next}
          className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl transition-all shadow-md group"
          style={{ border: `1px solid rgba(255,255,255,0.06)`, background: `rgba(255,255,255,0.01)`, color: f.color }}>
          <span className="group-hover:scale-110 transition-transform">→</span>
        </motion.button>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [modal, setModal] = useState(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  
  // Transformaciones de opacidad y posición basadas en el scroll
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const postersY = useTransform(scrollYProgress, [0, 1], [0, -120]);

  return (
    <div className="antialiased selection:bg-[#ff3f6c]/30 min-h-screen w-full overflow-x-hidden">
      <style>{`
        .text-gradient {
          background: linear-gradient(135deg, #ff3f6c 0%, #ff8c42 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .text-stroke-tech {
          -webkit-text-stroke: 1px rgba(255,255,255,0.1);
          color: transparent;
        }
        /* Correcciones de desbordamiento */
        .break-words {
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
        }
        @media (max-width: 480px) {
          .mobile-text-sm { font-size: 2.2rem !important; }
        `}
        </style>
      
      <CustomCursor />

      {/* Nav - Mantenido estética original */}
      <Navbar />

      {/* ── HERO ── Mantenido fondo CinemaCanvas */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <CinemaCanvas />

        {/* Posters flotantes con estética mejorada (Saturación y Brillo) */}
        <motion.div className="absolute inset-0 pointer-events-none z-[1]" style={{ y: postersY }}>
          {POSTERS.map((p, i) => (
            <motion.div key={i} className="absolute hidden sm:block" style={{ left: p.x, top: p.y, rotate: p.rot }}
              initial={{ opacity: 0, scale: 0.6, y: 50 }}
              animate={{ opacity: 0.22, scale: 1, y: 0 }}
              transition={{ delay: p.delay, duration: 1.2, ease: [0.22,1,0.36,1] }}>
              <motion.div animate={{ y: [0,-16,0], rotate:[p.rot,p.rot+2,p.rot] }}
                transition={{ duration: 5+i*0.6, repeat: Infinity, ease: "easeInOut" }}>
                <div className="relative group hover:opacity-100 transition-opacity duration-500">
                  <img src={p.src} alt="" className="rounded-xl border border-white/5 shadow-2xl transition-all duration-500 group-hover:scale-105"
                    style={{ width: "110px", filter: "saturate(0.5) brightness(0.9) contrast(1.1)" }}
                    onError={(e) => { e.target.style.display="none"; }} />
                  <div className="absolute inset-0 rounded-xl"
                    style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.07) 0%,transparent 60%)", boxShadow:"inset 0 0 0 1px rgba(255,255,255,0.08)" }} />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Contenido Hero con Tipografía Brutalista */}
        <motion.div className="relative z-10 text-center px-8 max-w-5xl mx-auto pt-24"
          style={{ opacity: heroOpacity, y: heroY }}>
          <motion.div initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.3, duration:0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-10 border shadow-lg"
            style={{ background:"rgba(255,63,108,0.07)", border:"1px solid rgba(255,63,108,0.25)", color:"#ff8c42" }}>
            <motion.span animate={{ scale:[1,1.5,1], opacity:[1,0.5,1] }} transition={{ duration:1.5, repeat:Infinity, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full shadow-[0_0_8px_#ff3f6c]" style={{ background:"#ff3f6c" }} />
            <span className="font-mono tracking-widest text-[#f0f0f5]">Your personal cinematic collection</span>
          </motion.div>

          {/* Títulos con efecto de degradado y contorno (Stroke) */}
          {["Watch it.", "Track it.", "Love it."].map((line, i) => (
            <motion.div key={line}
              initial={{ opacity:0, x: i%2===0 ? -80 : 80, filter:"blur(10px)" }}
              animate={{ opacity:1, x:0, filter:"blur(0px)" }}
              transition={{ delay:0.35+i*0.18, duration:0.9, ease:[0.22,1,0.36,1] }}>
              <span className={`block font-black leading-[0.8] mb-2 uppercase tracking-tighter ...`}
                style={{ fontFamily:"var(--font-display)", fontSize:"clamp(3rem, 8vw, 7.5rem)" }}>
                {line}
              </span>
            </motion.div>
          ))}

          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1, duration:0.7 }}
            className="text-lg max-w-xl mx-auto mt-10 mb-12 font-light leading-relaxed" style={{ color:"#ababcc", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
            Track everything you watch, discover what's new in your country,
            read and write reviews, and never forget what to watch next.
          </motion.p>

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:1.2 }}
            className="flex items-center justify-center gap-5 flex-wrap">
            <motion.button whileHover={{ scale:1.05, y: -2, boxShadow:"0 20px 60px rgba(255,63,108,0.4)" }} whileTap={{ scale:0.96 }}
              onClick={() => setModal("register")}
              className="px-10 py-4 rounded-xl font-extrabold text-base uppercase tracking-wider transition-all duration-300 shadow-xl"
              style={{ background:"linear-gradient(135deg,#ff3f6c,#ff8c42)", color:"white", fontFamily:"var(--font-display)" }}>
              Start for free
            </motion.button>
            <motion.button whileHover={{ scale:1.05, y: -2, background: "rgba(255,255,255,0.03)" }} whileTap={{ scale:0.96 }}
              onClick={() => setModal("login")}
              className="px-10 py-4 rounded-xl font-extrabold text-base uppercase tracking-wider transition-all duration-300 border border-white/10 shadow-xl"
              style={{ color:"#f0f0f5", fontFamily:"var(--font-display)" }}>
              Sign in
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Indicador de Scroll Ciberpunk */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5"
          animate={{ y:[0,10,0] }} transition={{ duration:2, repeat:Infinity, ease: "easeInOut" }} style={{ color:"#777799" }}>
          <span className="text-[10px] font-mono tracking-[0.4em] uppercase">Scroll</span>
          <motion.div className="w-px border-l border-dashed border-[#ff3f6c]/50" animate={{ height:[30,50,30] }} transition={{ duration:2, repeat:Infinity, ease: "easeInOut" }}/>
        </motion.div>
      </section>

      {/* ── FEATURES SECTION ── Estética Awwwards/Matrix */}
      <section className="py-36 relative overflow-hidden px-4 sm:px-8 lg:px-16">
        {/* Fondo de la sección - Mallas de degradado sutiles y rejilla */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,63,108,0.08) 0%, transparent 70%)" }} />
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 50% 50% at 90% 110%, rgba(167,139,250,0.06) 0%, transparent 70%)" }} />
          {/* Textura de rejilla ciberpunk */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.015,
            backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px" }} />
        </div>

        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin: "-100px" }}
          className="text-center mb-6 px-8 relative z-10">
          <h2 
            className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-white mb-4 px-4 leading-[1.1]" 
            style={{ fontFamily: "var(--font-display)", wordBreak: "break-word" }}
          >
            Everything you need
          </h2>
          <p className="max-w-lg mx-auto font-light text-zinc-400 text-lg">Interactive neural interface to manage and explore your absolute cinematic universe.</p>
        </motion.div>

        {/* Ticker de Tags (Infinite Scroll tech) */}
        <div className="relative my-16 overflow-hidden border-y bg-zinc-950/40 backdrop-blur-sm shadow-inner py-4" style={{ borderColor:"rgba(255,255,255,0.03)" }}>
          <motion.div animate={{ x:["0%","-50%"] }} transition={{ duration:25, repeat:Infinity, ease:"linear" }}
            className="flex gap-12 whitespace-nowrap">
            {[...features,...features].map((f,i) => (
              <span key={i} className="text-[11px] font-mono font-bold tracking-[0.4em] uppercase flex items-center gap-3.5"
                style={{ color: i%2===0 ? "#666688" : "#9999bb" }}>
                <span style={{ color:f.color }} className="text-sm">✦</span> {f.tag} <span className="text-zinc-800">//</span> {f.num}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Deck de características - Ancho completo */}
        <div className="w-full h-full rounded-3xl p-6 md:p-12 flex flex-col relative z-10">
          <FeatureDeck />
        </div>
      </section>

      {/* ── LOGOS ── Estética limpia y técnica */}
      <section className="max-w-[1500px] mx-auto px-8 py-24 border-t" style={{ borderColor:"rgba(255,255,255,0.04)" }}>
        <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          className="text-center text-[10px] font-mono font-black tracking-[0.5em] uppercase mb-16"
          style={{ color:"#666688" }}>OUR ESSENCE</motion.p>
        <div className="flex items-center justify-center gap-x-12 gap-y-10 flex-wrap">
          {[
            { label:"Lettermark_v1", el:<div className="w-18 h-18 rounded-3xl flex items-center justify-center text-white text-3xl font-black tracking-tighter border-2 shadow-xl hover:-rotate-6 hover:scale-110 transition-all" style={{ background:"linear-gradient(135deg,#ff3f6c,#ff8c42)", borderColor: "rgba(255,255,255,0.1)", fontFamily:"var(--font-display)" }}>F</div> },
            { label:"Icon_mark_v2",  el:<div className="w-18 h-18 rounded-3xl flex items-center justify-center bg-[#0d0d14] border-2 border-[#ff3f6c] shadow-[0_0_20px_rgba(255,63,108,0.2)] hover:rotate-6 hover:scale-110 transition-all hover:bg-[#ff3f6c]/5"><FiFilm size={32} style={{ color:"#ff3f6c" }} /></div> },
            { label:"Wordmark_v3",   el:<div className="px-6 py-4 rounded-3xl bg-[#0d0d14] border border-zinc-900/80 shadow-xl hover:-translate-y-2 hover:border-zinc-800 transition-all"><span className="text-3xl font-black uppercase tracking-tighter text-gradient" style={{ fontFamily:"var(--font-display)" }}>FLICKBIZ</span></div> },
            { label:"Combined_v4",   el:<div className="flex items-center gap-3 px-6 py-4 rounded-3xl bg-[#0d0d14] border border-zinc-900/80 shadow-xl hover:-translate-y-2 hover:border-zinc-800 transition-all"><div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black tracking-tight text-base" style={{ background:"linear-gradient(135deg,#ff3f6c,#ff8c42)", fontFamily:"var(--font-display)" }}>F</div><span className="font-bold text-xl text-white" style={{ fontFamily:"var(--font-display)" }}>FlickBiz</span></div> },
          ].map((logo,i) => (
            <motion.div key={logo.label} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              transition={{ delay:i*0.12 }} 
              className="flex flex-col items-center gap-4 group">
              {logo.el}
              <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-600 group-hover:text-zinc-400 transition-colors">{logo.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-[1500px] mx-auto px-4 md:px-8 py-24 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-150px" }}
          className="rounded-[2.5rem] p-8 md:p-20 text-center relative overflow-hidden group shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] flex flex-col items-center"
          style={{ background: "#08080d", border: "1px solid rgba(255,255,255,0.03)" }}
        >
          {/* Textura de fondo del CTA */}
          <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none overflow-hidden opacity-10">
            <div style={{ 
              position: "absolute", 
              inset: 0,
              backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "30px 30px" 
            }} />
          </div>

          {/* Elementos decorativos (Glows) */}
          <motion.div animate={{ x: [0, 50, 0], y: [0, -40, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-48 -left-48 w-[500px] h-[500px] rounded-full pointer-events-none mix-blend-screen"
            style={{ background: "#ff3f6c", opacity: 0.15, filter: "blur(120px)" }} />
          <motion.div animate={{ x: [0, -50, 0], y: [0, 40, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-48 -right-48 w-[500px] h-[500px] rounded-full pointer-events-none mix-blend-screen"
            style={{ background: "#ff8c42", opacity: 0.1, filter: "blur(120px)" }} />
          
          {/* Contenido */}
          <span className="text-[11px] font-mono font-black tracking-[0.5em] uppercase text-[#ff3f6c] block mb-5 relative z-10 animate-pulse">
            READY TO BEGIN
          </span>
          
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-6 relative z-10 leading-tight md:leading-[0.95] break-words max-w-4xl" 
              style={{ fontFamily: "var(--font-display)", wordBreak: "break-word" }}>
            Start Your<br />Cinematic Journe<span className="text-stroke-tech">y</span>
          </h2>
          
          <p className="text-lg mb-12 relative z-10 max-w-xl mx-auto font-light text-zinc-300 transition-colors group-hover:text-white" 
            style={{ textShadow: "0 2px 15px rgba(0,0,0,0.5)" }}>
            Seamless interface. Private storage. Yours forever. Create your library today.
          </p>
          
          <motion.button 
            whileHover={{ scale: 1.05, y: -4, boxShadow: "0 30px 80px rgba(255,63,108,0.5)" }} 
            whileTap={{ scale: 0.96 }}
            onClick={() => setModal("register")}
            className="px-12 py-5 rounded-2xl font-black text-lg uppercase tracking-wider relative z-10 transition-all duration-300 shadow-2xl w-full sm:w-auto"
            style={{ background: "linear-gradient(135deg,#ff3f6c,#ff8c42)", color: "white", fontFamily: "var(--font-display)" }}
          >
            Join for Free
          </motion.button>
        </motion.div>
      </section>

      {/* ── FOOTER — Técnico y Brutalista ── */}
      <footer className="max-w-[1500px] mx-auto px-8 py-12 mt-10 text-center border-t" style={{ borderColor:"rgba(255,255,255,0.03)" }}>
        <div className="text-gradient font-black text-2xl uppercase tracking-tighter mb-5" style={{ fontFamily: "var(--font-display)" }}>FlickBiz</div>
        <div className="font-mono text-xs mb-5 tracking-widest" style={{ color:"#555577" }}>
          © {new Date().getFullYear()} FlickBiz. All rights reserved.
        </div>
        <div className="flex gap-6 justify-center font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color:"#ababcc" }}>
          <span className="hover:text-[#00ffcc] cursor-pointer transition-colors">Privacy</span>
          <span className="hover:text-[#ff3f6c] cursor-pointer transition-colors">Terms</span>
          <span className="hover:text-[#ff8c42] cursor-pointer transition-colors">Support</span>
        </div>
      </footer>

      {/* Modals placeholders */}
      {modal === "login" && <LoginModal onClose={() => setModal(null)} />}
      {modal === "register" && <RegisterModal onClose={() => setModal(null)} />}
    </div>
  );
}