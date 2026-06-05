import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FiShuffle, FiHeart, FiClock, FiEye, FiCheck, FiStar,
  FiFilm, FiTv, FiRefreshCw, FiZap, FiMoreVertical, FiInfo
} from "react-icons/fi";
import {
  getMovies, getSeries, getFavorites,
  toggleFavorite, removeFavorite, setStatus, removeStatus
} from "../services/mediaService";
import toast from "react-hot-toast";

function SolarFlareEngine() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, lastX: 0, lastY: 0 });
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    const resizeCanvas = () => {
      const parent = canvas.parentNode;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleMouseMove = (e) => {
      const m = mouseRef.current;
      const rect = canvas.getBoundingClientRect();
      m.x = e.clientX - rect.left;
      m.y = e.clientY - rect.top;
      m.vx = m.x - m.lastX;
      m.vy = m.y - m.lastY;
      m.lastX = m.x;
      m.lastY = m.y;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const config = {
      glow1: "rgba(255, 63, 108, 0.12)",   
      glow2: "rgba(255, 140, 66, 0.09)",   
      lineRGB: "255, 140, 66",
      particles: ["#ff3f6c", "#ff8c42", "#ffb834", "#ff0055"]
    };

    const nodes = Array.from({ length: 45 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      r: Math.random() * 2.5 + 1,
      angle: Math.random() * Math.PI * 2,
      speed: 0.005 + Math.random() * 0.01
    }));

    let tick = 0;

    const loop = () => {
      frameRef.current = requestAnimationFrame(loop);
      tick += 0.002;

      const W = canvas.width;
      const H = canvas.height;

      ctx.fillStyle = "#070205";
      ctx.fillRect(0, 0, W, H);

      const m = mouseRef.current;
      m.vx *= 0.95;
      m.vy *= 0.95;

      const g1 = ctx.createRadialGradient(
        W * 0.5 + Math.sin(tick) * 200, H * 0.3 + Math.cos(tick * 0.5) * 150, 10,
        W * 0.5, H * 0.3, Math.max(W, H) * 0.7
      );
      g1.addColorStop(0, config.glow1);
      g1.addColorStop(1, "transparent");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      const g2 = ctx.createRadialGradient(
        W * 0.8 + Math.cos(tick * 0.8) * 150, H * 0.7 + Math.sin(tick) * 180, 10,
        W * 0.7, H * 0.8, Math.max(W, H) * 0.6
      );
      g2.addColorStop(0, config.glow2);
      g2.addColorStop(1, "transparent");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);

      nodes.forEach((n, idx) => {
        n.angle += n.speed;
        n.x += n.vx + Math.cos(n.angle) * 0.15;
        n.y += n.vy + Math.sin(n.angle) * 0.15;

        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;

        const dx = m.x - n.x;
        const dy = m.y - n.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 150) {
          const factor = (150 - d) / 150;
          n.x -= (dx / d) * factor * 1.8;
          n.y -= (dy / d) * factor * 1.8;
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + (d < 100 ? 1.5 : 0), 0, Math.PI * 2);
        ctx.fillStyle = config.particles[idx % config.particles.length];
        ctx.fill();

        for (let j = idx + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const lx = n.x - n2.x;
          const ly = n.y - n2.y;
          const ldist = Math.sqrt(lx * lx + ly * ly);
          if (ldist < 110) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(${config.lineRGB}, ${0.05 * (1 - ldist / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      });
    };

    loop();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 mix-blend-screen" />;
}

const ST = [
  { value: "watchlist", label: "Watchlist", icon: FiClock, color: "text-[#ffb834]", bgGlow: "hover:bg-[#ffb834]/10" },
  { value: "watching",  label: "Watching",  icon: FiEye,   color: "text-[#ff8c42]", bgGlow: "hover:bg-[#ff8c42]/10" },
  { value: "watched",   label: "Watched",   icon: FiCheck, color: "text-[#ff3f6c]", bgGlow: "hover:bg-[#ff3f6c]/10" },
];

function PickCard({ item, type, index, onUpdate }) {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  
  // Card 3D tilt tracking variables
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 90, damping: 18 });
  const sry = useSpring(ry, { stiffness: 90, damping: 18 });
  const glowX = useTransform(sry, [-15, 15], ["0%", "100%"]);
  const glowY = useTransform(srx, [15, -15], ["0%", "100%"]);

  const [fav, setFav] = useState(item.is_favorite || false);
  const [st, setSt] = useState(item.status || null);
  const [menu, setMenu] = useState(false);
  const [hovered, setHovered] = useState(false);

  const onMove = e => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    ry.set(((e.clientX - r.left - r.width / 2) / r.width) * 12);
    rx.set(-((e.clientY - r.top - r.height / 2) / r.height) * 12);
  };
  const onLeave = () => { rx.set(0); ry.set(0); setHovered(false); };

  const handleFav = async e => {
    e.stopPropagation();
    try {
      fav ? await removeFavorite({ [type]: item.id }) : await toggleFavorite({ [type]: item.id });
      setFav(!fav); onUpdate?.();
    } catch { toast.error("Matrix action failed"); }
  };

  const handleSt = async s => {
    setMenu(false);
    try {
      st === s ? (await removeStatus({ [type]: item.id }), setSt(null)) : (await setStatus({ [type]: item.id, status: s }), setSt(s));
      onUpdate?.();
    } catch { toast.error("Matrix sync error"); }
  };

  const ao = ST.find(o => o.value === st);
  const year = item.release_date ? new Date(item.release_date).getFullYear() : "—";
  const rating = item.average_rating ? Math.round(item.average_rating * 10) / 10 : null;
  const genres = item.genres?.slice(0, 2) || [];
  const tags = item.tags?.slice(0, 2) || [];
  
  const isMovie = type === "movie";
  const accentColor = isMovie ? "text-[#ff3f6c]" : "text-[#ff8c42]";
  const borderGlow = isMovie ? "group-hover:border-[#ff3f6c]/30" : "group-hover:border-[#ff8c42]/30";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      transition={{ type: "spring", stiffness: 90, damping: 18, delay: index * 0.05 }}
      ref={cardRef} onMouseMove={onMove} onMouseLeave={onLeave}
      onHoverStart={() => setHovered(true)}
      style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d", perspective: 1000 }}
      className="relative flex flex-col group w-full"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-950/60 border border-zinc-900 transparent transition-all duration-300 ${borderGlow}`}>
          {isMovie ? <FiFilm size={14} className="text-[#ff3f6c]" /> : <FiTv size={14} className="text-[#ff8c42]" />}
        </div>
        <div>
          <p className={`text-[11px] font-mono uppercase tracking-[0.3em] font-bold ${accentColor}`}>
            {isMovie ? "Movie pick" : "Series pick"}
          </p>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">// MATCHED_TARGET</p>
        </div>
      </div>

      <div className="awwwards-blur-card rounded-3xl overflow-hidden flex-1 flex flex-col relative transition-all duration-300 group-hover:border-zinc-800">
        <div className="relative overflow-hidden w-full" style={{ aspectRatio: "10/15" }}>
          {item.poster ? (
            <motion.img 
              src={item.poster} 
              alt={item.title}
              className="w-full h-full object-cover"
              animate={{ scale: hovered ? 1.04 : 1 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-zinc-950/40">
              {isMovie ? <FiFilm size={32} className="text-[#ff3f6c]/20" /> : <FiTv size={32} className="text-[#ff8c42]/20" />}
              <p className="text-[11px] font-mono text-zinc-600 uppercase tracking-widest text-center px-4">{item.title}</p>
            </div>
          )}

          <motion.div 
            className="absolute inset-0 pointer-events-none mix-blend-screen"
            style={{ background: `radial-gradient(circle at ${glowX} ${glowY}, rgba(255, 140, 66, 0.1) 0%, transparent 60%)`, opacity: hovered ? 1 : 0 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070205] via-[#070205]/20 to-transparent opacity-90" />

          {rating && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-zinc-950/80 border border-zinc-800/60 text-[#ffb834] backdrop-blur-md shadow-lg">
              <FiStar size={10} className="fill-[#ffb834] stroke-none" /> {rating}
            </div>
          )}

          <div className="absolute top-4 right-4 flex items-center gap-2">
            {ao && (
              <div className={`p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/60 backdrop-blur-md shadow-lg ${ao.color}`}>
                <ao.icon size={11} />
              </div>
            )}
            <button 
              onClick={handleFav}
              className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 backdrop-blur-md ${
                fav ? "bg-[#ff3f6c] border-[#ff3f6c] text-white" : "bg-zinc-950/60 border-zinc-800/60 text-zinc-400 hover:text-white"
              }`}
            >
              <FiHeart size={12} className={fav ? "fill-white" : ""} />
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 z-10 flex flex-col justify-end">
            <div className="flex gap-1.5 flex-wrap mb-2">
              {genres.map(g => (
                <span key={g.id||g.name} className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-950/80 border border-zinc-900/80 text-zinc-400">
                  {g.name}
                </span>
              ))}
              {tags.map(tg => (
                <span key={tg.id||tg.name} className="text-[9px] font-mono tracking-wider px-2 py-0.5 rounded bg-[#ff3f6c]/10 text-[#ff3f6c]">
                  #{tg.name}
                </span>
              ))}
            </div>

            <h3 className="text-xl font-black tracking-tight uppercase text-white leading-none mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#ff8c42] group-hover:to-[#ff3f6c] transition-all duration-300">
              {item.title}
            </h3>
            
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-[11px] text-zinc-500 tracking-wider">{year}</span>
              <div className="relative">
                <button 
                  onClick={e => { e.stopPropagation(); setMenu(!menu); }}
                  className="w-6 h-6 rounded-md flex items-center justify-center bg-zinc-900/40 border border-zinc-800/40 text-zinc-400 hover:text-white"
                >
                  <FiMoreVertical size={12} />
                </button>
                
                <AnimatePresence>
                  {menu && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 8 }} 
                      animate={{ opacity: 1, scale: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute bottom-full right-0 mb-2 p-1 rounded-xl bg-zinc-950 border border-zinc-900 min-w-[140px] z-50 shadow-2xl backdrop-blur-xl"
                    >
                      {ST.map(o => (
                        <button 
                          key={o.value} 
                          onClick={() => handleSt(o.value)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-[10px] font-mono uppercase tracking-wider rounded-lg transition-colors text-left ${o.bgGlow} ${
                            st === o.value ? o.color : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <o.icon size={11} /> {o.label}
                          {st === o.value && <FiCheck size={10} className="ml-auto" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {item.synopsis && (
          <motion.div 
            animate={{ opacity: hovered ? 1 : 0, height: hovered ? "auto" : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="px-5 overflow-hidden border-t border-zinc-900/60 bg-zinc-950/20"
            style={{ paddingBottom: hovered ? 16 : 0, paddingTop: hovered ? 14 : 0 }}
          >
            <p className="text-[11px] leading-relaxed text-zinc-400 line-clamp-3">
              {item.synopsis}
            </p>
          </motion.div>
        )}
      </div>

      <button 
        onClick={() => navigate(`/${isMovie ? "movies" : "series"}/${item.id}`)}
        className="mt-3 w-full py-3 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-zinc-900/60 border border-zinc-800/40 text-zinc-300 hover:text-black hover:bg-gradient-to-r hover:from-[#ff8c42] hover:to-[#ff3f6c] hover:border-transparent transition-all duration-300 shadow-md"
      >
        View details stream
      </button>
    </motion.div>
  );
}

function MatrixStatChip({ name, score, max, accentClass }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-900/60 flex items-center gap-4 transition-all duration-200 hover:border-zinc-800">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-mono tracking-wide text-zinc-300 truncate uppercase font-bold">
          {name.startsWith('#') ? name : `// ${name}`}
        </p>
        <div className="h-1 bg-zinc-900 rounded-full mt-2 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${pct}%` }} 
            transition={{ delay: 0.2, duration: 0.6 }}
            className={`h-full rounded-full ${accentClass}`} 
          />
        </div>
      </div>
      <span className="font-mono text-xs font-black text-zinc-500 w-6 text-right">
        {String(score).padStart(2, '0')}
      </span>
    </div>
  );
}

export default function DiscoverPage() {
  const [picks, setPicks] = useState({ movie: null, series: null });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState({ genreScores: {}, tagScores: {}, totalFavs: 0 });
  const [pickKey, setPickKey] = useState(0); 
  const [error, setError] = useState(null);

  // Computes affinity weight metrics based on favorite clusters
  const buildProfile = useCallback(async () => {
    try {
      const res = await getFavorites();
      const favs = res?.data?.results || res?.data || [];

      const genreScores = {};
      const tagScores = {};

      favs.forEach(fav => {
        const item = fav.movie || fav.series;
        if (!item) return;
        (item.genres || []).forEach(g => {
          genreScores[g.name] = (genreScores[g.name] || 0) + 1;
        });
        (item.tags || []).forEach(tg => {
          tagScores[tg.name] = (tagScores[tg.name] || 0) + 1;
        });
      });

      setProfileData({ genreScores, tagScores, totalFavs: favs.length });
      return { genreScores, tagScores };
    } catch (e) {
      console.error("Favorites fetch error:", e);
      return { genreScores: {}, tagScores: {} };
    }
  }, []);

  // Requests media indexes matching user weighted matrix bounds
  const fetchPicks = useCallback(async (profile) => {
    try {
      const topGenres = Object.entries(profile.genreScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name);

      const genreParam = topGenres.length > 0
        ? topGenres[Math.floor(Math.random() * topGenres.length)]
        : "";

      const movieParams = { page_size: 20, ordering: "-popularity" };
      const seriesParams = { page_size: 20, ordering: "-popularity" };
      if (genreParam) {
        movieParams.genre = genreParam;
        seriesParams.genre = genreParam;
      }

      const [mRes, sRes] = await Promise.all([
        getMovies(movieParams).catch(() => ({ data: { results: [] } })),
        getSeries(seriesParams).catch(() => ({ data: { results: [] } })),
      ]);

      const movies = mRes?.data?.results || mRes?.results || [];
      const series = sRes?.data?.results || sRes?.results || [];

      const randomPick = arr => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

      setPicks({
        movie: randomPick(movies),
        series: randomPick(series),
      });
    } catch (e) {
      console.error("Pick fetch error:", e);
      setError("Personalized pipeline collapsed. Verify terminal status stream.");
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const profile = await buildProfile();
      if (isMounted) {
        await fetchPicks(profile);
        setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [buildProfile, fetchPicks]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setPickKey(k => k + 1);
    const profile = await buildProfile();
    await fetchPicks(profile);
    setRefreshing(false);
  };

  const sortedGenres = Object.entries(profileData.genreScores).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const sortedTags = Object.entries(profileData.tagScores).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxGenre = sortedGenres[0]?.[1] || 1;
  const maxTag = sortedTags[0]?.[1] || 1;
  const hasTaste = profileData.totalFavs > 0;

  return (
    <div className="relative min-h-screen px-4 sm:px-8 lg:px-16 py-16 bg-[#070205] text-white overflow-x-hidden antialiased font-sans select-none selection:bg-[#ff3f6c] selection:text-white">
      
      {/* Structural layout rules for global engine scopes */}
      <style>{`
        .awwwards-blur-card {
          background: rgba(12, 6, 10, 0.45) !important;
          backdrop-filter: blur(40px) saturate(140%) !important;
          border: 1px solid rgba(255, 255, 255, 0.04) !important;
        }
        .text-stroke-thin {
          -webkit-text-stroke: 1px rgba(255,255,255,0.15);
          color: transparent;
        }
      `}</style>

      <SolarFlareEngine />

      <div className="max-w-[1700px] mx-auto relative z-10">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-20 border-b border-zinc-900/60 pb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff3f6c] animate-pulse" />
              <p className="text-[11px] font-mono uppercase tracking-[0.4em] text-[#ff8c42]">
                Taste Engine Matrix v4.0
              </p>
            </div>
            <h1 className="text-6xl sm:text-8xl font-black tracking-tighter leading-none text-white uppercase select-none">
              Disc<span className="text-stroke-thin text-zinc-100">o</span>ver
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto self-end lg:self-auto">
            <button 
              onClick={handleRefresh} 
              disabled={loading || refreshing}
              className="px-6 py-3.5 rounded-full flex items-center gap-3 text-[10px] font-mono font-bold tracking-widest bg-zinc-950/80 border border-zinc-800/40 hover:text-black hover:bg-gradient-to-r hover:from-[#ff8c42] hover:to-[#ff3f6c] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl backdrop-blur-xl"
            >
              <FiRefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
              <span>{refreshing ? "REFRESHING_STREAM" : "GENERATE_NEW_PICKS"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

          <div className="xl:col-span-8 min-h-[50vh]">
            <AnimatePresence mode="wait">
              {loading ? (
                <div key="skeleton" className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl">
                  {[0, 1].map(i => (
                    <div key={i} className="rounded-3xl bg-white/[0.01] border border-zinc-900/80 p-2 animate-pulse overflow-hidden relative">
                      <div className="w-full rounded-2xl bg-zinc-900/40" style={{ aspectRatio: "10/15" }} />
                      <div className="h-4 bg-zinc-900 w-2/3 mt-4 rounded mx-4" />
                      <div className="h-3 bg-zinc-900 w-1/2 mt-2 rounded mx-4 mb-4" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 border border-dashed border-red-500/20 rounded-3xl bg-red-500/[0.01]">
                  <FiInfo size={32} className="text-[#ff3f6c] mb-4 opacity-70" />
                  <p className="text-xs font-mono tracking-[0.2em] text-red-400 uppercase">// PIPELINE_ERROR: {error}</p>
                </motion.div>
              ) : !picks.movie && !picks.series ? (
                <motion.div key="empty" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-40 border border-dashed border-zinc-900 rounded-3xl bg-zinc-950/10">
                  <FiShuffle size={36} className="text-[#ff8c42] mb-4 animate-pulse" />
                  <p className="text-xs font-mono tracking-[0.3em] text-zinc-500 uppercase">// NO_COMPATIBLE_STREAMS_FOUND</p>
                </motion.div>
              ) : (
                <motion.div key={pickKey} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-4xl">
                  {picks.movie && <PickCard item={picks.movie} type="movie" index={0} onUpdate={buildProfile} />}
                  {picks.series && <PickCard item={picks.series} type="series" index={1} onUpdate={buildProfile} />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="xl:col-span-4 space-y-6 lg:sticky lg:top-24 lg:self-start">
            
            <div className="awwwards-blur-card rounded-3xl p-6 relative overflow-hidden shadow-2xl">
              <div className="flex items-center gap-3.5 mb-6 border-b border-zinc-900/60 pb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#ff3f6c]/10 text-[#ff3f6c]">
                  <FiZap size={14} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-black uppercase tracking-widest text-zinc-200">TASTE_ANALYSIS_CHIPS</h4>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">// QUANTUM MATRIX GRAPH</p>
                </div>
              </div>

              {!hasTaste ? (
                <div className="text-center py-10">
                  <FiHeart size={24} className="text-[#ff3f6c]/20 mx-auto mb-3" />
                  <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Awaiting preferences stream synchronization...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedGenres.length > 0 && (
                    <div>
                      <h5 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#ff8c42] mb-3">// BIAS_GENRES_STREAM</h5>
                      <div className="space-y-2">
                        {sortedGenres.map(([name, score]) => (
                          <MatrixStatChip key={name} name={name} score={score} max={maxGenre} accentClass="bg-gradient-to-r from-[#ff8c42] to-[#ff3f6c]" />
                        ))}
                      </div>
                    </div>
                  )}

                  {sortedTags.length > 0 && (
                    <div>
                      <h5 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#ff3f6c] mb-3">// BIAS_TAGS_INDEX</h5>
                      <div className="space-y-2">
                        {sortedTags.map(([name, score]) => (
                          <MatrixStatChip key={name} name={name} score={score} max={maxTag} accentClass="bg-gradient-to-r from-[#ff3f6c] to-zinc-700" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="awwwards-blur-card rounded-3xl p-6 shadow-2xl">
              <h4 className="text-[10px] font-mono font-bold tracking-[0.3em] text-zinc-400 uppercase mb-4">// ENGINE_LOGIC_PIPELINE</h4>
              <div className="space-y-4">
                {[
                  { id: "01", t: "SCANNING_CORES", d: "We scan your favorites data structures and cluster metrics." },
                  { id: "02", t: "CATALOGUE_FILTER", d: "Top statistical dimensions are mapped into global parameters." },
                  { id: "03", t: "STOCHASTIC_DRAW", d: "A pseudo-random distribution algorithm extracts matching node entries." }
                ].map(step => (
                  <div key={step.id} className="flex gap-4 items-start border-l-2 border-zinc-900 pl-4 py-0.5 hover:border-[#ff8c42] transition-colors duration-200">
                    <span className="font-mono text-[10px] font-black text-[#ff3f6c]">{step.id}</span>
                    <div>
                      <h5 className="text-[10px] font-mono uppercase tracking-widest font-bold text-zinc-300">{step.t}</h5>
                      <p className="text-[11px] text-zinc-500 leading-normal font-sans mt-0.5">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}