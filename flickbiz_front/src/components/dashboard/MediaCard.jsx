import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiMoreVertical, FiEye, FiClock, FiCheck } from "react-icons/fi";
import { toggleFavorite, removeFavorite, setStatus, removeStatus } from "../../services/mediaService";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
  { value:"watchlist", label:"Watchlist", icon:FiClock,  color:"#a78bfa" },
  { value:"watching",  label:"Watching",  icon:FiEye,   color:"#ff8c42" },
  { value:"watched",   label:"Watched",   icon:FiCheck, color:"#34d399" },
];

export default function MediaCard({ item, type="movie", isFavorite=false, currentStatus=null, onUpdate }) {
  const [fav, setFav]                   = useState(isFavorite);
  const [status, setCurrentStatus]      = useState(currentStatus);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [loading, setLoading]           = useState(false);

  const handleFavorite = async (e) => {
    e.stopPropagation();
    try {
      fav ? await removeFavorite({ [type]: item.id }) : await toggleFavorite({ [type]: item.id });
      setFav(!fav);
      onUpdate?.();
    } catch { toast.error("Could not update favourite."); }
  };

  const handleStatus = async (newStatus) => {
    setLoading(true); setMenuOpen(false);
    try {
      if (status === newStatus) {
        await removeStatus({ [type]: item.id }); setCurrentStatus(null);
      } else {
        await setStatus({ [type]: item.id, status: newStatus }); setCurrentStatus(newStatus);
      }
      onUpdate?.();
    } catch { toast.error("Could not update status."); }
    finally { setLoading(false); }
  };

  const poster = item.poster || null;
  const year   = item.release_date ? new Date(item.release_date).getFullYear() : "—";
  const activeOpt = STATUS_OPTIONS.find((o) => o.value === status);

  return (
    <motion.div whileHover={{ y:-6, scale:1.03 }} transition={{ type:"spring", stiffness:300, damping:22 }}
      className="relative flex-shrink-0 group" style={{ width:150, cursor:"none" }}>

      {/* Poster */}
      <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio:"2/3", background:"#1a1a26" }}>
        {poster
          ? <img src={poster} alt={item.title} className="w-full h-full object-cover" style={{ filter:"brightness(0.88)" }} />
          : <div className="w-full h-full flex items-center justify-center" style={{ background:"linear-gradient(135deg,#1a1a26,#0d0d16)" }}>
              <span className="text-3xl font-extrabold opacity-20" style={{ fontFamily:"var(--font-display)", color:"#ff3f6c" }}>
                {item.title?.[0]}
              </span>
            </div>
        }

        {/* Hover overlay */}
        <motion.div className="absolute inset-0 pointer-events-none"
          initial={{ opacity:0 }} whileHover={{ opacity:1 }}
          style={{ background:"linear-gradient(to top,rgba(5,5,10,0.85) 0%,transparent 55%)" }} />

        {/* Status badge */}
        {activeOpt && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
            style={{ background:`${activeOpt.color}22`, border:`1px solid ${activeOpt.color}44`, color:activeOpt.color, fontFamily:"var(--font-display)" }}>
            <activeOpt.icon size={10} /> {activeOpt.label}
          </div>
        )}

        {/* Fav button */}
        <motion.button whileHover={{ scale:1.25 }} whileTap={{ scale:0.8 }}
          onClick={handleFavorite}
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: fav ? "rgba(255,63,108,0.9)" : "rgba(0,0,0,0.55)", cursor:"none" }}
          data-cursor>
          <FiHeart size={14} fill={fav ? "white":"none"} color="white" />
        </motion.button>

        {/* 3-dot menu */}
        <div className="absolute bottom-2 right-2">
          <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background:"rgba(0,0,0,0.65)", cursor:"none" }} data-cursor>
            <FiMoreVertical size={14} color="white" />
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div initial={{ opacity:0, scale:0.88, y:6 }} animate={{ opacity:1, scale:1, y:0 }}
                exit={{ opacity:0, scale:0.88, y:6 }} transition={{ type:"spring", stiffness:400, damping:26 }}
                className="absolute bottom-full right-0 mb-1 rounded-2xl overflow-hidden"
                style={{ background:"#0d0d16", border:"1px solid rgba(255,255,255,0.09)", minWidth:148, zIndex:10, boxShadow:"0 16px 50px rgba(0,0,0,0.7)" }}>
                {STATUS_OPTIONS.map((o) => (
                  <motion.button key={o.value} whileHover={{ background:`${o.color}12`, x:3 }}
                    onClick={() => handleStatus(o.value)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium"
                    style={{ color: status===o.value ? o.color : "#c0c0d0", fontFamily:"var(--font-display)", cursor:"none" }}
                    data-cursor>
                    <o.icon size={12} style={{ color:o.color }} />
                    {o.label}
                    {status===o.value && <FiCheck size={10} className="ml-auto" style={{ color:o.color }} />}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 px-1">
        <p className="text-sm font-bold truncate" style={{ fontFamily:"var(--font-display)", color:"#f0f0f5" }}>{item.title}</p>
        <p className="text-xs" style={{ color:"#8888aa" }}>{year}</p>
      </div>
    </motion.div>
  );
}