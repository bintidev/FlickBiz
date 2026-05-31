import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft, FiHeart, FiClock, FiEye, FiCheck, FiStar, FiMessageSquare, FiTv, FiLayers
} from "react-icons/fi";
import { getSeriesDetail, toggleFavorite, removeFavorite, setStatus, removeStatus } from "../services/mediaService";
import { getReviews } from "../services/reviewService";
import toast from "react-hot-toast";

const ST = [
  { value: "watchlist", label: "Watchlist", icon: FiClock,  color: "#a78bfa", bgAlpha: "rgba(167,139,250,0.03)" },
  { value: "watching",  label: "Watching",  icon: FiEye,    color: "#ff8c42", bgAlpha: "rgba(255,140,66,0.03)" },
  { value: "watched",   label: "Watched",   icon: FiCheck,  color: "#34d399", bgAlpha: "rgba(52,211,153,0.03)" },
];

const STATUS_META = {
  ongoing:   { label: "En emisión", color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  ended:     { label: "Finalizada", color: "#8888aa", bg: "rgba(136,136,170,0.1)" },
  cancelled: { label: "Cancelada",  color: "#ff3f6c", bg: "rgba(255,63,108,0.1)" },
};

const DRAMATIC_EASE = [0.16, 1, 0.3, 1];

export default function SeriesDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fav, setFav] = useState(false);
  const [st, setSt] = useState(null);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [sRes, rRes] = await Promise.all([getSeriesDetail(id), getReviews({ series: id })]);
        setSeries(sRes.data);
        setReviews(rRes.data.results || rRes.data || []);
        if (sRes.data) {
          setFav(!!sRes.data.is_favorite);
          setSt(sRes.data.user_status || null);
        }
      } catch (e) { 
        console.error(e); 
        toast.error("Error loading transmission records");
      } finally { 
        setLoading(false); 
      }
    })();
  }, [id]);

  const handleFav = async () => {
    try {
      if (fav) {
        await removeFavorite({ series: id });
        setFav(false);
        toast.success("Removed from favourites");
      } else {
        await toggleFavorite({ series: id });
        setFav(true);
        toast.success("Added to favourites");
      }
    } catch { 
      toast.error("Error updating favourites"); 
    }
  };
  
  const handleSt = async (s) => {
    try {
      if (st === s) {
        await removeStatus({ series: id });
        setSt(null);
      } else {
        await setStatus({ series: id, status: s });
        setSt(s);
      }
      toast.success(`Status updated`);
    } catch { 
      toast.error("Error updating status"); 
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#05050a] text-[#ff8c42] font-bold tracking-widest uppercase text-xs font-mono animate-pulse">Loading vibrant theater...</div>;
  if (!series) return <div className="min-h-screen flex items-center justify-center bg-[#05050a] text-[#8888aa]">Series not found.</div>;

  const year = series.release_date ? new Date(series.release_date).getFullYear() : "—";
  const providers = [...new Set((series.availability || []).map(a => a.provider).filter(Boolean))];
  const statusMeta = STATUS_META[series.status] || { label: series.status, color: "#8888aa", bg: "rgba(136,136,170,0.1)" };

  return (
    <div className="w-full min-h-screen lg:h-screen bg-[#05050a] flex flex-col lg:flex-row antialiased lg:overflow-hidden select-none relative text-white">
      
      {/* Luz ambiental estática de fondo - Escalada para Mobile */}
      <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-gradient-to-bl from-[#ff3f6c]/10 via-[#a78bfa]/5 to-transparent rounded-full filter blur-[80px] md:blur-[120px] pointer-events-none z-0" />

      {/* ── MITAD IZQUIERDA: HERO HEADER (MOBILE) / PORTADA FIJA (DESKTOP) ── */}
      <section className="w-full lg:w-[45%] h-[55vh] sm:h-[65vh] lg:h-full relative lg:absolute lg:inset-y-0 lg:left-0 overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 z-20 flex-shrink-0">
        <motion.div 
          initial={{ scale: 1.15, filter: "brightness(0) saturate(0.5)" }}
          animate={{ scale: 1, filter: "brightness(0.6) saturate(1.25) contrast(1.05)" }}
          transition={{ duration: 1.2, ease: DRAMATIC_EASE }}
          className="absolute inset-0"
        >
          <img src={series.poster || series.backdrop} alt="" className="w-full h-full object-cover object-top lg:object-center" />
        </motion.div>

        {/* Degradado adaptativo para fundir la imagen con el fondo oscuro en mobile */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-black/40 to-transparent lg:via-black/20 lg:to-[#ff3f6c]/15 z-10" />

        {/* Botón de retroceso adaptado */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 md:top-6 md:left-6 z-20 flex items-center gap-2 text-[10px] font-bold tracking-widest px-3.5 py-1.5 rounded-full bg-black/60 lg:bg-[#ff3f6c]/10 hover:bg-[#ff3f6c]/20 border border-white/10 lg:border-[#ff3f6c]/30 text-white transition-all backdrop-blur-md"
        >
          <FiArrowLeft size={12} /> BACK
        </button>

        {/* Estado de Emisión Flotante */}
        <div 
          className="absolute top-4 right-4 md:top-6 md:right-6 z-20 text-[9px] font-mono font-black uppercase tracking-widest px-3 py-1.5 rounded-md border backdrop-blur-md"
          style={{ backgroundColor: statusMeta.bg, borderColor: `${statusMeta.color}30`, color: statusMeta.color }}
        >
          {statusMeta.label}
        </div>

        {/* Metadatos inferiores del Hero */}
        <div className="absolute bottom-0 inset-x-0 p-4 md:p-8 z-20 pointer-events-auto bg-gradient-to-t from-[#05050a] via-[#05050a]/80 to-transparent lg:bg-none lg:p-6 lg:bottom-6 lg:left-6 lg:right-6">
          
          {/* Etiquetas de Género */}
          <div className="flex gap-1.5 flex-wrap mb-2.5 lg:mb-3.5">
            {(series.genres || []).map(g => (
              <span key={g.id} className="text-[9px] lg:text-[10px] uppercase tracking-wider font-mono font-black px-2.5 py-0.5 lg:px-3.5 lg:py-1 bg-[#ff8c42]/15 border border-[#ff8c42]/30 text-[#ff8c42] rounded-full backdrop-blur-md shadow-md">
                {g.name}
              </span>
            ))}
          </div>
          
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60 tracking-tighter leading-none mb-2 break-words" style={{ fontFamily: "var(--font-display)" }}>
            {series.title}
          </h1>

          <div className="flex items-center gap-1.5 sm:gap-2.5 text-[10px] lg:text-[11px] mt-2 lg:mt-3 text-white/60 font-mono bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg w-fit border border-white/5 shadow-lg flex-wrap">
            <span className="text-[#ff8c42] font-bold flex items-center gap-0.5">
              <FiStar size={11} fill="#ff8c42" /> {series.average_rating?.toFixed(1) || "—"}
            </span>
            <span className="text-white/20">•</span><span>{year}</span>
            <span className="text-white/20">•</span><span className="text-[#a78bfa] font-semibold">{series.num_seasons} SEASONS</span>
            <span className="text-white/20">•</span><span className="text-[#60a5fa] font-semibold">{series.num_episodes} EPS</span>
          </div>
        </div>
      </section>

      {/* ── MITAD DERECHA: SECCIONES TÉCNICAS E INTERACTIVAS ── */}
      <main className="w-full lg:w-[55%] lg:ml-[45%] h-auto lg:h-full px-4 sm:px-8 md:px-12 py-8 lg:py-14 flex flex-col gap-8 lg:gap-10 z-10 relative overflow-y-visible lg:overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        
        {/* Sinopsis Editorial de la Serie */}
        <section className="relative pl-4 border-l-2 border-[#ff3f6c] bg-gradient-to-r from-[#ff3f6c]/3 to-transparent py-2.5 lg:py-3.5 pr-4 rounded-r-xl">
          <span className="text-[9px] tracking-[0.25em] uppercase text-[#ff3f6c] block mb-1.5 lg:mb-2 font-mono font-black">THE OVERVIEW</span>
          <p className="text-xs sm:text-sm lg:text-base font-light text-white/90 leading-relaxed tracking-tight">
            {showFullSynopsis ? series.synopsis : (series.synopsis?.slice(0, 180) + (series.synopsis?.length > 180 ? "…" : ""))}
          </p>
          {series.synopsis?.length > 180 && (
            <button 
              onClick={() => setShowFullSynopsis(!showFullSynopsis)}
              className="text-[10px] uppercase font-bold tracking-wider mt-2 text-[#ff8c42] hover:text-[#ff3f6c] transition-colors block"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {showFullSynopsis ? "[-] Collapse" : "[+] Read Full Manifest"}
            </button>
          )}
        </section>

        {/* Panel de Interacciones en Fila Compacta */}
        <section className="flex flex-col gap-2.5 bg-white/[0.01] border border-white/5 p-3.5 sm:p-4 rounded-2xl backdrop-blur-sm">
          <span className="text-[9px] tracking-[0.2em] uppercase text-white/30 font-mono font-bold block">USER HUB // CONTROLS</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            
            {/* Botón Favorito Compacto */}
            <button 
              onClick={handleFav}
              className="py-2.5 px-2 rounded-lg font-bold text-[10px] sm:text-[11px] uppercase tracking-wider border flex items-center justify-center gap-1.5 transition-all duration-300 scale-100 hover:scale-[1.02] text-white relative overflow-hidden group min-w-0"
              style={{ 
                background: fav ? "linear-gradient(45deg, #ff3f6c, #ff8c42)" : "rgba(255,63,108,0.03)",
                borderColor: fav ? "transparent" : "rgba(255,63,108,0.2)",
                boxShadow: fav ? "0 0 20px rgba(255,63,108,0.3)" : "none",
                fontFamily: "var(--font-display)"
              }}
            >
              <FiHeart size={13} fill={fav ? "white" : "none"} className={fav ? "text-white" : "text-[#ff3f6c]"} /> 
              <span className="font-black truncate">{fav ? "FAV" : "ADD FAV"}</span>
            </button>

            {/* Botones de Estado en Fila */}
            {ST.map(o => {
              const isActive = st === o.value;
              return (
                <button
                  key={o.value}
                  onClick={() => handleSt(o.value)}
                  className="py-2.5 px-1.5 sm:px-2 rounded-lg border text-[10px] sm:text-[11px] font-bold transition-all duration-300 flex items-center justify-center gap-1.5 relative overflow-hidden group min-w-0"
                  style={{
                    borderColor: isActive ? o.color : "rgba(255,255,255,0.05)",
                    background: isActive ? `${o.color}20` : o.bgAlpha,
                    fontFamily: "var(--font-display)"
                  }}
                >
                  <o.icon size={13} style={{ color: isActive ? "white" : o.color }} className="flex-shrink-0" />
                  <span className="tracking-wide uppercase truncate" style={{ color: isActive ? "white" : "rgba(255,255,255,0.5)" }}>{o.label}</span>
                  {isActive && <span className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: o.color }} />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Ficha Técnica Estructurada (1 col en mobile, 3 en desktop) */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 border-t border-b border-white/5 py-5 bg-gradient-to-r from-white/[0.01] to-transparent px-3 rounded-xl">
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider">Network / Studio</span>
            <span className="text-white font-bold text-[11px] bg-white/[0.02] px-3 py-2 rounded-lg border border-white/5 block text-center truncate" style={{ fontFamily: "var(--font-display)" }}>
              {series.network || "Unknown Network"}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider">Episode Runtime</span>
            <span className="text-[#34d399] font-mono font-bold text-[11px] bg-[#34d399]/10 px-3 py-2 rounded-lg border border-[#34d399]/20 tracking-wider block text-center">
              {series.episode_runtime ? `${series.episode_runtime} MIN` : "—"}
            </span>
          </div>

          {providers.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider">Streaming Networks</span>
              <span className="text-[#ff8c42] text-[11px] font-semibold bg-[#ff8c42]/10 px-3 py-2 rounded-lg border border-[#ff8c42]/20 block truncate text-center">
                {providers.join(", ")}
              </span>
            </div>
          )}
        </section>

        {/* THE REEL DIARIES */}
        <section className="bg-gradient-to-br from-white/[0.01] to-transparent border border-white/5 p-4 sm:p-5 rounded-2xl relative overflow-hidden border-l-2 border-l-[#ff3f6c] shadow-lg mb-4 lg:mb-0">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#ff3f6c]/10 text-[#ff3f6c] rounded-lg border border-[#ff3f6c]/20">
                <FiMessageSquare size={13} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider leading-none" style={{ fontFamily: "var(--font-display)" }}>
                  THE REEL DIARIES
                </h3>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-white/5 rounded-md text-white/40 border border-white/10">
              {reviews.length} LOGS
            </span>
          </div>

          {reviews.length === 0 ? (
            <p className="text-[11px] font-mono text-white/30 italic py-4 text-center border border-dashed border-white/5 rounded-xl">
              No transmission records found.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-[280px] lg:max-h-[320px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {reviews.map((rev, i) => (
                <div
                  key={rev.id || i}
                  className="p-3.5 bg-[#0a0a12]/60 border border-white/5 rounded-xl hover:border-[#ff8c42]/20 transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-white text-[11px] uppercase truncate max-w-[70%]" style={{ fontFamily: "var(--font-display)" }}>{rev.title}</span>
                    <div className="flex items-center gap-0.5 text-[9px] text-[#ff8c42] font-mono font-bold bg-[#ff8c42]/10 px-1.5 py-0.5 rounded-md flex-shrink-0">
                      <FiStar size={9} fill="#ff8c42" /> {rev.rating}/5
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-white/60 font-light leading-relaxed mb-2.5 italic break-words">
                    "{rev.preview}"
                  </p>

                  <div className="flex items-center justify-between border-t border-white/5 pt-1.5 text-[8px] font-mono text-white/30">
                    <span className="text-[#a78bfa] font-bold truncate max-w-[60%]">@{rev.user?.username || "anon"}</span>
                    <span className="flex-shrink-0">{rev.published_at ? new Date(rev.published_at).toLocaleDateString() : ""}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}