import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  FiGrid, FiList, FiSliders, FiChevronLeft, 
  FiChevronRight, FiSearch, FiLayers, FiCalendar, FiActivity, FiX
} from "react-icons/fi";

import { getMovies, getGenres } from "../services/mediaService";
import MediaGridCard from "../components/media/MediaGridCard";

const LAYOUT_CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.05 }
  },
  exit: { opacity: 0, transition: { duration: 0.25 } }
};

const DYNAMIC_CARD_VARIANTS = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 90, damping: 18 }
  }
};

function LiquidPortalCard({ item, view, navigate }) {
  return (
    <motion.div
      variants={DYNAMIC_CARD_VARIANTS}
      onClick={() => navigate(`/movies/${item.id}`)}
      className="w-full h-full"
    >
      <MediaGridCard 
        item={item} 
        type="movie" 
        view={view} 
        isFavorite={item.is_favorite || false}
        currentStatus={item.status || null}
      />
    </motion.div>
  );
}

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
    const resizeObserver = new ResizeObserver(() => resizeCanvas());
    if (canvas.parentNode) resizeObserver.observe(canvas.parentNode);

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
      resizeObserver.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 mix-blend-screen" />;
}

export default function MoviesPage() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [filters, setFilters] = useState({
    search: "",
    genre: "",
    ordering: "-release_date",
    year: ""
  });

  const [searchInput, setSearchInput] = useState("");
  const [rawMovies, setRawMovies] = useState([]); 
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState("grid");
  
  // Estado para controlar los filtros desplegables en móviles
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const BACKEND_PAGE_SIZE = 20; 

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); 
  };

  const resetAllFilters = () => {
    setSearchInput("");
    setFilters({ search: "", genre: "", ordering: "-release_date", year: "" });
    setPage(1);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchMoviesData = async () => {
      setLoading(true);
      
      const apiParams = {
        page: page,
      };

      if (filters.search) apiParams.search = filters.search;
      if (filters.genre) apiParams.genre = filters.genre;
      
      if (filters.year) {
        apiParams.year = filters.year; 
        apiParams.release_date__year = filters.year; 
      }

      try {
        const res = await getMovies(apiParams);
        if (isMounted) {
          const dataResults = res?.data?.results || res?.results || [];
          const dataCount = res?.data?.count || res?.count || 0;
          
          setRawMovies(Array.isArray(dataResults) ? dataResults : []);
          setTotal(dataCount); 
        }
      } catch (error) {
        console.error("Failed to load movies stream:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMoviesData();
    return () => { isMounted = false; };
  }, [page, filters.search, filters.genre, filters.year]); 

  const displayMovies = useMemo(() => {
    let result = [...rawMovies];

    result.sort((a, b) => {
      const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
      const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
      
      if (filters.ordering === "-release_date") return dateB - dateA;
      if (filters.ordering === "release_date") return dateA - dateB;
      if (filters.ordering === "rating_desc") {
        const ratingA = a.vote_average ?? a.rating ?? a.score ?? 0;
        const ratingB = b.vote_average ?? b.rating ?? b.score ?? 0;
        return ratingB - ratingA;
      }
      if (filters.ordering === "title_asc") {
        const titleA = String(a.title || "").trim().toLowerCase();
        const titleB = String(b.title || "").trim().toLowerCase();
        return titleA.localeCompare(titleB);
      }
      return 0;
    });

    return result;
  }, [rawMovies, filters.ordering]);

  useEffect(() => {
    getGenres()
      .then(res => {
        const genreList = res?.data?.results || res?.data || res?.results || [];
        setGenres(genreList);
      })
      .catch(err => console.error("Failed to load global genres:", err));
  }, []);

  const totalPages = Math.ceil(total / BACKEND_PAGE_SIZE);
  const { scrollYProgress } = useScroll();
  const headerY = useTransform(scrollYProgress, [0, 0.2], [0, -30]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  // Evaluador para saber si hay filtros activos (excluyendo el orden por defecto)
  const hasActiveAdvancedFilters = filters.genre !== "" || filters.year !== "";

  return (
    <div ref={containerRef} className="relative min-h-screen px-4 sm:px-8 lg:px-16 py-16 bg-[#070205] text-white overflow-x-hidden antialiased font-sans select-none selection:bg-[#ff3f6c] selection:text-white">
      
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
        .thermal-select-premium {
          appearance: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ff8c42' stroke-width='3'><polyline points='6 9 12 15 18 9'></polyline></svg>");
          background-repeat: no-repeat;
          background-position: right 1rem center;
        }
        .thermal-select-premium:focus { outline: none; }
        
        @keyframes mobileFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-mobile-panel {
          animation: mobileFadeIn 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      <SolarFlareEngine />

      <div className="max-w-[1700px] mx-auto relative z-10">
        
        <motion.div 
          style={{ y: headerY, opacity: headerOpacity }}
          className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-20 border-b border-zinc-900/60 pb-12"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff3f6c] animate-pulse" />
              <p className="text-[11px] font-mono uppercase tracking-[0.4em] text-[#ff8c42]">
                Cinematheque Matrix v4.0
              </p>
            </div>
            <h1 className="text-6xl sm:text-8xl font-black tracking-tighter leading-none text-white uppercase select-none">
              M<span className="text-stroke-thin text-zinc-100">o</span>vies
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto">
            <div className="font-mono text-right hidden sm:block">
              <p className="text-[10px] text-zinc-500 tracking-widest uppercase">// STREAMS_MATCHED</p>
              <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8c42] to-[#ff3f6c]">{total} NODES</p>
            </div>
            
            <div className="flex p-1 rounded-full bg-zinc-950/80 border border-zinc-800/40 backdrop-blur-xl self-end lg:self-auto">
              {[{ v: "grid", icon: FiGrid, label: "GRID" }, { v: "list", icon: FiList, label: "LIST" }].map(({ v, icon: Icon, label }) => (
                <button 
                  key={v} onClick={() => setView(v)}
                  className="px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-bold tracking-widest relative transition-all"
                  style={{ color: view === v ? "#000" : "#71717a" }}
                >
                  {view === v && (
                    <motion.div 
                      layoutId="premiumViewActive" 
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#ff8c42] to-[#ff3f6c]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon size={12} className="relative z-10" />
                  <span className="relative z-10">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CONTENEDOR DE FILTROS OPTIMIZADO */}
        <div className="mb-14 grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-4 sticky top-4 sm:top-6 z-40">
          
          {/* Fila superior en móviles: Buscador + Botón Gatillo */}
          <div className="xl:col-span-5 flex gap-2 w-full">
            <div className="flex-1 awwwards-blur-card rounded-2xl p-2 flex items-center group focus-within:ring-1 focus-within:ring-[#ff8c42]/30 transition-all shadow-2xl">
              <div className="p-3 text-zinc-500 group-focus-within:text-[#ff8c42] transition-colors">
                <FiSearch size={18} className="text-[#ff8c42]" />
              </div>
              <input 
                type="text"
                placeholder="Discover titles, directors or genres..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-transparent pl-2 pr-4 py-2 text-sm font-medium text-white placeholder-zinc-600 outline-none"
              />
              {searchInput && (
                <button onClick={() => setSearchInput("")} className="p-2 text-zinc-500 hover:text-white">
                  <FiX size={14} />
                </button>
              )}
            </div>

            {/* Botón de Filtros Avanzados (Oculto en pantallas XL) */}
            <button 
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className={`xl:hidden flex items-center justify-center gap-2 px-5 rounded-2xl border transition-all shadow-2xl text-[11px] font-mono uppercase tracking-wider h-full min-h-[54px] ${
                mobileFiltersOpen || hasActiveAdvancedFilters 
                  ? "bg-[#ff3f6c]/10 border-[#ff3f6c]/40 text-[#ff3f6c]" 
                  : "awwwards-blur-card border-zinc-800/80 text-zinc-400"
              }`}
            >
              <FiSliders size={14} />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveAdvancedFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff3f6c] shadow-[0_0_8px_#ff3f6c]" />
              )}
            </button>
          </div>

          {/* Panel de Selectores (Colapsable en móvil, Inline permanente en XL) */}
          <div className={`${
            mobileFiltersOpen ? "grid animate-mobile-panel" : "hidden"
          } xl:grid xl:col-span-7 awwwards-blur-card rounded-2xl p-2 grid-cols-1 sm:grid-cols-3 gap-2 shadow-2xl`}>
            
            <div className="relative flex items-center bg-zinc-950/30 rounded-xl px-3 border border-zinc-900/50">
              <FiLayers className="text-[#00ffcc] shrink-0" size={13} />
              <select
                aria-label="Filter by Genre"
                value={filters.genre}
                onChange={(e) => handleFilterChange("genre", e.target.value)}
                className="w-full thermal-select-premium bg-transparent pl-3 pr-6 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-300 outline-none cursor-pointer"
              >
                <option value="" className="bg-[#0c060a]">All Genres</option>
                {genres.map(g => (
                  <option key={g.id} value={g.id} className="bg-[#0c060a]">{g.name}</option>
                ))}
              </select>
            </div>

            <div className="relative flex items-center bg-zinc-950/30 rounded-xl px-3 border border-zinc-900/50">
              <FiSliders className="text-[#ff3f6c] shrink-0" size={13} />
              <select
                aria-label="Sort options"
                value={filters.ordering}
                onChange={(e) => handleFilterChange("ordering", e.target.value)}
                className="w-full thermal-select-premium bg-transparent pl-3 pr-6 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-300 outline-none cursor-pointer"
              >
                <option value="-release_date" className="bg-[#0c060a]">↓ Estreno (Reciente)</option>
                <option value="release_date" className="bg-[#0c060a]">↑ Estreno (Antiguo)</option>
                <option value="rating_desc" className="bg-[#0c060a]">★ Rating (Mayor)</option>
                <option value="title_asc" className="bg-[#0c060a]">🔤 Título (A-Z)</option>
              </select>
            </div>

            <div className="relative flex items-center bg-zinc-950/30 rounded-xl px-3 border border-zinc-900/50">
              <FiCalendar className="text-[#ffb834] shrink-0" size={13} />
              <select
                aria-label="Filter by Year"
                value={filters.year}
                onChange={(e) => handleFilterChange("year", e.target.value)}
                className="w-full thermal-select-premium bg-transparent pl-3 pr-6 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-300 outline-none cursor-pointer"
              >
                <option value="" className="bg-[#0c060a]">Any Timeline</option>
                {Array.from({ length: 30 }, (_, i) => 2026 - i).map(y => (
                  <option key={y} value={y} className="bg-[#0c060a]">{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Botón de Reset */}
          {(searchInput || Object.values(filters).some(v => v !== "" && v !== "-release_date")) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={resetAllFilters}
              className="absolute -bottom-10 right-4 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest shadow-lg"
            >
              <FiX size={10} /> Reset Filters Matrix
            </motion.button>
          )}
        </div>

        <div className="min-h-[50vh]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="skeleton" variants={LAYOUT_CONTAINER_VARIANTS} initial="hidden" animate="visible" exit="exit"
                className={view === "grid" ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8" : "flex flex-col gap-3"}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="rounded-2xl bg-white/[0.02] border border-zinc-900/80 animate-pulse overflow-hidden relative"
                    style={{ 
                      aspectRatio: view === "grid" ? "10/15" : undefined, 
                      height: view === "list" ? 90 : undefined 
                    }} 
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" style={{ transform: 'skewX(-20deg)' }} />
                  </div>
                ))}
              </motion.div>
            ) : displayMovies.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-40 border border-dashed border-zinc-900 rounded-3xl bg-zinc-950/10">
                <FiActivity size={40} className="text-[#ff3f6c] mb-4 animate-pulse" />
                <p className="text-xs font-mono tracking-[0.3em] text-zinc-500 uppercase">// NO_DATA_STREAM_FOUND</p>
              </motion.div>
            ) : (
              <motion.div 
                key={view} 
                variants={LAYOUT_CONTAINER_VARIANTS} initial="hidden" animate="visible" exit="exit"
                className={view === "grid" 
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10" 
                  : "flex flex-col gap-3 max-w-5xl mx-auto"}
              >
                {displayMovies.map((item) => (
                  <LiquidPortalCard 
                    key={item.id} 
                    item={item} 
                    view={view} 
                    navigate={navigate} 
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {totalPages > 1 && (
          <div className="mt-28 flex flex-col items-center gap-4">
            <div className="p-1.5 rounded-full bg-zinc-950/90 border border-zinc-900 flex items-center gap-3 shadow-2xl backdrop-blur-md relative overflow-hidden">
              <motion.button 
                whileHover={{ scale: 1.05, x: -2 }} whileTap={{ scale: 0.95 }}
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-zinc-900/50 border border-zinc-800/60 text-zinc-400 hover:text-[#ff8c42] hover:border-[#ff8c42]/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronLeft size={18} />
              </motion.button>
              
              <div className="px-4 flex items-center gap-2 font-mono text-sm tracking-widest">
                <span className="text-white font-black">{String(page).padStart(2, '0')}</span>
                <span className="text-zinc-800">/</span>
                <span className="text-zinc-500">{String(totalPages).padStart(2, '0')}</span>
              </div>

              <motion.button 
                whileHover={{ scale: 1.05, x: 2 }} whileTap={{ scale: 0.95 }}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-zinc-900/50 border border-zinc-800/60 text-zinc-400 hover:text-[#ff8c42] hover:border-[#ff8c42]/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronRight size={18} />
              </motion.button>
            </div>
            <div className="w-32 h-[2px] bg-zinc-900 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-[#ff3f6c] to-[#ff8c42]" initial={{ width: 0 }} animate={{ width: `${(page / totalPages) * 100}%` }} transition={{ duration: 0.3 }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}