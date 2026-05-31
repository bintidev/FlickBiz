import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FiHeart, FiMoreVertical, FiEye, FiClock, FiCheck, FiStar, FiFilm, FiTv } from "react-icons/fi";
import { toggleFavorite, removeFavorite, setStatus, removeStatus } from "../../services/mediaService";
import toast from "react-hot-toast";

const ST = [
  { value: "watchlist", label: "Watchlist", icon: FiClock,  color: "#a78bfa" },
  { value: "watching",  label: "Watching",  icon: FiEye,    color: "#ff8c42" },
  { value: "watched",   label: "Watched",   icon: FiCheck,  color: "#34d399" },
];

export default function MediaGridCard({ item, type = "movie", isFavorite = false, currentStatus = null, onUpdate, onClick, view = "grid" }) {
  const [fav, setFav]   = useState(isFavorite);
  const [st, setSt]     = useState(currentStatus);
  const [menu, setMenu] = useState(false);
  const cardRef         = useRef(null);

  // 3D tilt
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });
  const glowX = useTransform(sry, [-12, 12], ["0%", "100%"]);
  const glowY = useTransform(srx, [12, -12],  ["0%", "100%"]);

  const onMove = (e) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    ry.set(((e.clientX - r.left - r.width / 2) / r.width) * 12);
    rx.set(-((e.clientY - r.top - r.height / 2) / r.height) * 12);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  const handleFav = async (e) => {
    e.stopPropagation();
    try {
      fav ? await removeFavorite({ [type]: item.id }) : await toggleFavorite({ [type]: item.id });
      setFav(!fav); onUpdate?.();
    } catch { toast.error("Error"); }
  };

  const handleSt = async (s) => {
    setMenu(false);
    try {
      st === s
        ? (await removeStatus({ [type]: item.id }), setSt(null))
        : (await setStatus({ [type]: item.id, status: s }), setSt(s));
      onUpdate?.();
    } catch { toast.error("Error"); }
  };

  const ao     = ST.find(o => o.value === st);
  const year   = item.release_date ? new Date(item.release_date).getFullYear() : "—";
  const rating = item.vote_average ?? item.average_rating ?? item.rating ?? item.score;
  const parsedRating = rating ? Math.round(parseFloat(rating) * 10) / 10 : null;
  const genres = item.genres?.slice(0, 2) || [];

  // ── List view ──
  if (view === "list") {
    return (
      <motion.div whileHover={{ x: 4, borderColor: "rgba(255,63,108,0.3)" }}
        onClick={onClick}
        className="flex items-center gap-4 p-3 rounded-2xl transition-all relative"
        style={{ background: "rgba(10,10,18,0.9)", border: "1px solid rgba(255,255,255,0.07)", cursor: "none", zIndex: menu ? 50 : 1 }}
        data-cursor>
        {item.poster
          ? <img src={item.poster} alt={item.title} className="w-12 h-16 rounded-xl object-cover flex-shrink-0" style={{ filter: "brightness(0.85)" }} />
          : <div className="w-12 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#1a1a26,#0d0d16)" }}>
              {type === "movie" ? <FiFilm size={20} style={{ color: "#ff3f6c", opacity: .5 }} /> : <FiTv size={20} style={{ color: "#a78bfa", opacity: .5 }} />}
            </div>
        }
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate" style={{ fontFamily: "var(--font-display)" }}>{item.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs" style={{ color: "#8888aa" }}>{year}</span>
            {genres.map(g => (
              <span key={g.id || g.name} className="text-xs px-1.5 py-0.5 rounded-md"
                style={{ background: "rgba(255,255,255,0.07)", color: "#c0c0d0", fontSize: "0.65rem", fontFamily: "var(--font-display)" }}>
                {g.name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 relative">
          {parsedRating && (
            <div className="flex items-center gap-1 text-xs" style={{ color: "#ff8c42" }}>
              <FiStar size={11} fill="#ff8c42" />{parsedRating}
            </div>
          )}
          {ao && <div className="px-2 py-1 rounded-lg text-xs font-bold" style={{ background: `${ao.color}22`, color: ao.color, fontFamily: "var(--font-display)" }}>{ao.label}</div>}
          
          <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: .8 }} onClick={handleFav}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: fav ? "rgba(255,63,108,.9)" : "rgba(255,255,255,.08)", cursor: "none" }} data-cursor>
            <FiHeart size={12} fill={fav ? "white" : "none"} color="white" />
          </motion.button>

          {/* Menú de 3 Puntos en Lista (Despliega hacia arriba) */}
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: .9 }}
              onClick={e => { e.stopPropagation(); setMenu(!menu); }}
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,.08)", cursor: "none" }} data-cursor>
              <motion.div animate={{ rotate: menu ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <FiMoreVertical size={12} color="white" />
              </motion.div>
            </motion.button>
            <AnimatePresence>
              {menu && (
                <motion.div 
                  initial={{ opacity: 0, scale: .85, y: 4 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: .85, y: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 26 }}
                  className="absolute bottom-full right-0 mb-1 rounded-2xl overflow-hidden"
                  style={{ background: "#080812", border: "1px solid rgba(255,255,255,.1)", minWidth: 140, zIndex: 60, boxShadow: "0 16px 50px rgba(0,0,0,.95)" }}>
                  {ST.map(o => (
                    <button key={o.value} onClick={(e) => { e.stopPropagation(); handleSt(o.value); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium hover:bg-zinc-900"
                      style={{ color: st === o.value ? o.color : "#c0c0d0", fontFamily: "var(--font-display)" }}>
                      <o.icon size={12} style={{ color: o.color }} />{o.label}
                      {st === o.value && <FiCheck size={9} className="ml-auto" style={{ color: o.color }} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Grid view ──
  return (
    <motion.div ref={cardRef} onMouseMove={onMove} onMouseLeave={onLeave}
      onClick={onClick}
      style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d", perspective: 600, cursor: "none", zIndex: menu ? 50 : 1 }}
      whileHover={{ zIndex: 40 }}
      className="group relative w-full h-full"
      data-cursor>
      <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "2/3", background: "#111118", boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>
        
        {item.poster
          ? <motion.img src={item.poster} alt={item.title} className="w-full h-full object-cover"
              style={{ filter: "brightness(0.82)" }}
              whileHover={{ filter: "brightness(0.68)", scale: 1.06 }}
              transition={{ duration: .4 }} />
          : <div className="w-full h-full flex flex-col items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg,#1a1a26,#0d0d16)" }}>
              {type === "movie" ? <FiFilm size={32} style={{ color: "#ff3f6c", opacity: .4 }} /> : <FiTv size={32} style={{ color: "#a78bfa", opacity: .4 }} />}
              <p className="text-xs text-center px-2 leading-tight" style={{ color: "#8888aa", fontFamily: "var(--font-display)" }}>{item.title}</p>
            </div>
        }

        {/* Foil shimmer */}
        <motion.div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `radial-gradient(circle at ${glowX} ${glowY}, rgba(255,255,255,0.08) 0%, transparent 55%)` }} />

        {/* Gradients */}
        <div className="absolute inset-x-0 top-0 h-16 pointer-events-none"
          style={{ background: "linear-gradient(to bottom,rgba(0,0,0,.55),transparent)" }} />
        <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
          style={{ background: "linear-gradient(to top,rgba(5,5,10,.98) 0%,rgba(5,5,10,.5) 55%,transparent 100%)" }} />

        {/* Top glow line */}
        <motion.div className="absolute inset-x-0 top-0 h-px pointer-events-none"
          initial={{ opacity: 0, scaleX: 0 }} whileHover={{ opacity: 1, scaleX: 1 }} transition={{ duration: .3 }}
          style={{ background: `linear-gradient(90deg,transparent,${type === "movie" ? "#ff3f6c" : "#a78bfa"},transparent)` }} />

        {/* Type & Rating badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
          style={{ background: "rgba(0,0,0,.7)", backdropFilter: "blur(8px)", color: "#ff8c42", fontFamily: "var(--font-display)" }}>
          {type === "movie" ? <FiFilm size={9} /> : <FiTv size={9} />}
          {parsedRating && <span style={{ color: "#ff8c42" }}>★ {parsedRating}</span>}
        </div>

        {/* Fav */}
        <motion.button whileHover={{ scale: 1.3 }} whileTap={{ scale: .7 }} onClick={handleFav}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: fav ? "rgba(255,63,108,.9)" : "rgba(0,0,0,.6)", backdropFilter: "blur(4px)", cursor: "none" }}
          data-cursor>
          <motion.div animate={fav ? { scale: [1, 1.5, 1] } : {}}>
            <FiHeart size={12} fill={fav ? "white" : "none"} color="white" />
          </motion.div>
        </motion.button>

        {/* Status dot */}
        {ao && (
          <div className="absolute top-2.5 right-11 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: `${ao.color}22`, border: `1px solid ${ao.color}66`, backdropFilter: "blur(4px)" }}>
            <ao.icon size={11} style={{ color: ao.color }} />
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute inset-x-0 bottom-0 p-3 z-20">
          {genres.length > 0 && (
            <div className="flex gap-1 mb-1.5 flex-wrap">
              {genres.map(g => (
                <span key={g.id || g.name} className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                  style={{ background: "rgba(255,255,255,0.08)", color: "#c0c0d0", fontSize: "0.6rem", fontFamily: "var(--font-display)" }}>
                  {g.name}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm font-bold leading-tight truncate" style={{ fontFamily: "var(--font-display)", color: "#f0f0f5" }}>{item.title}</p>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-xs" style={{ color: "#8888aa" }}>{year}</span>
            
            {/* Menú de 3 Puntos en Grid (Despliega hacia arriba) */}
            <div className="relative">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: .9 }}
                onClick={e => { e.stopPropagation(); setMenu(!menu); }}
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,.1)", cursor: "none" }} data-cursor>
                <motion.div animate={{ rotate: menu ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  <FiMoreVertical size={11} color="white" />
                </motion.div>
              </motion.button>
              <AnimatePresence>
                {menu && (
                  <motion.div 
                    initial={{ opacity: 0, scale: .85, y: 4 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: .85, y: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 26 }}
                    className="absolute bottom-full right-0 mb-1 rounded-2xl overflow-hidden"
                    style={{ background: "#080812", border: "1px solid rgba(255,255,255,.1)", minWidth: 140, zIndex: 60, boxShadow: "0 16px 50px rgba(0,0,0,.95)" }}>
                    {ST.map(o => (
                      <button key={o.value} onClick={(e) => { e.stopPropagation(); handleSt(o.value); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium hover:bg-zinc-900"
                        style={{ color: st === o.value ? o.color : "#c0c0d0", fontFamily: "var(--font-display)" }}>
                        <o.icon size={12} style={{ color: o.color }} />{o.label}
                        {st === o.value && <FiCheck size={9} className="ml-auto" style={{ color: o.color }} />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}