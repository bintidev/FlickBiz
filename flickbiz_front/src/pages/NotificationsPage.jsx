import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FiBell, FiCheck, FiCheckCircle, FiTrash2,
  FiHeart, FiStar, FiMessageSquare, FiFilm,
  FiTv, FiUser, FiZap, FiX, FiInbox
} from "react-icons/fi";
import api from "../services/api";
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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleMouseMove = (e) => {
      const m = mouseRef.current;
      m.x = e.clientX;
      m.y = e.clientY;
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

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0 mix-blend-screen" />;
}

const TYPE_CONFIG = {
  new_content: { 
    icon: FiStar,          
    textColor: "text-[#ffb834]", 
    label: "New content",   
    bg: "bg-[#ffb834]/10",     
    border: "group-hover:border-[#ffb834]/30" 
  },
  review_like: { 
    icon: FiHeart,         
    textColor: "text-[#ff3f6c]", 
    label: "Review liked",  
    bg: "bg-[#ff3f6c]/10",     
    border: "group-hover:border-[#ff3f6c]/30" 
  },
  availability: { 
    icon: FiZap,           
    textColor: "text-[#ff8c42]", 
    label: "Available",     
    bg: "bg-[#ff8c42]/10",     
    border: "group-hover:border-[#ff8c42]/30" 
  },
};

const getConfig = type => TYPE_CONFIG[type] || { icon: FiBell, textColor: "text-zinc-400", label: "Notification", bg: "bg-zinc-800/20", border: "group-hover:border-zinc-700" };

function NotifCard({ notif, onRead, onDelete }) {
  const navigate = useNavigate();
  const cfg = getConfig(notif.type);
  const IconComp = cfg.icon;
  const [removing, setRemoving] = useState(false);

  const handleClick = async () => {
    if (!notif.is_read) await onRead(notif.id);
    if (notif.movie) navigate(`/movies/${notif.movie}`);
    else if (notif.series) navigate(`/series/${notif.series}`);
    else if (notif.review) navigate(`/reviews/${notif.review}`);
  };

  const handleDelete = async e => {
    e.stopPropagation();
    setRemoving(true);
    await onDelete(notif.id);
  };

  const handleRead = async e => {
    e.stopPropagation();
    if (!notif.is_read) await onRead(notif.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -40, scale: 0.94, filter: "blur(6px)", height: 0, marginBottom: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onClick={handleClick}
      className={`awwwards-blur-card relative rounded-2xl overflow-hidden transition-all duration-300 group cursor-pointer border ${
        notif.is_read ? "border-zinc-900/60 opacity-75" : `border-zinc-800/80 ${cfg.border}`
      }`}
    >
      {!notif.is_read && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#ff8c42] to-[#ff3f6c]" />
      )}

      <div className="relative z-10 flex items-start gap-4 p-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-zinc-950/60 border border-zinc-900 transparent transition-all duration-300 ${cfg.textColor} ${cfg.bg}`}>
          <IconComp size={14} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-950/80 border border-zinc-900/80 ${cfg.textColor}`}>
                {cfg.label}
              </span>
              {!notif.is_read && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff3f6c] shadow-[0_0_8px_#ff3f6c]" />
              )}
            </div>
            <span className="font-mono text-[11px] text-zinc-500 tracking-wider">
              {formatTime(notif.created_at)}
            </span>
          </div>

          <p className={`text-sm font-medium leading-relaxed font-sans ${notif.is_read ? "text-zinc-400" : "text-zinc-200"}`}>
            {notif.message || buildMessage(notif)}
          </p>

          {(notif.movie_title || notif.series_title) && (
            <p className="text-xs font-mono font-bold mt-1.5 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#ff8c42] to-[#ff3f6c]">
              // {notif.movie_title || notif.series_title}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {!notif.is_read && (
            <button 
              onClick={handleRead}
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-zinc-900/40 border border-zinc-800/40 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-200"
            >
              <FiCheck size={12} />
            </button>
          )}
          <button 
            onClick={handleDelete} 
            disabled={removing}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-zinc-900/40 border border-zinc-800/40 text-[#ff3f6c] hover:text-red-400 hover:bg-[#ff3f6c]/10 transition-all duration-200"
          >
            <FiX size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function formatTime(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff/60000);
  const hours = Math.floor(mins/60);
  const days  = Math.floor(hours/24);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function groupByDate(notifs) {
  const groups = {};
  notifs.forEach(n => {
    const d = new Date(n.created_at);
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate()-1);
    let label;
    if (d.toDateString() === today.toDateString())          label = "Today";
    else if (d.toDateString() === yesterday.toDateString()) label = "Yesterday";
    else label = d.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });
  return groups;
}

const FILTERS = [
  { id:"all",    label:"All"    },
  { id:"unread", label:"Unread" },
  { id:"movies", label:"Movies" },
  { id:"series", label:"Series" },
  { id:"social", label:"Social" },
];

function filterNotifs(notifs, filter) {
  switch(filter) {
    case "unread": return notifs.filter(n => !n.is_read);
    case "movies": return notifs.filter(n => ["new_content", "availability"].includes(n.type) && n.movie);
    case "series": return notifs.filter(n => ["new_content", "availability"].includes(n.type) && n.series);
    case "social": return notifs.filter(n => ["review_like"].includes(n.type));
    default:       return notifs;
  }
}

// 2. Update buildMessage to read fallback messages safely:
function buildMessage(n) {
  if (n.message) return n.message; // Yield to backend message strings first
  
  switch (n.type) {
    case "new_content": return `New content updates are available.`;
    case "review_like": return `Your review received a new like.`;
    case "availability": return `A title is now available.`;
    default:             return "You have a new notification.";
  }
}

export default function NotificationsPage() {
  const [notifs, setNotifs]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");
  const [markingAll, setMarkAll] = useState(false);
  const [clearingAll, setClearAll] = useState(false);

  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications/");
      setNotifs(res.data.results || res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const handleRead = async id => {
    try {
      await api.patch(`/notifications/${id}/read/`);
      setNotifs(prev => prev.map(n => n.id===id ? {...n,is_read:true} : n));
    } catch { toast.error("Sync action failed"); }
  };

  const handleDelete = async id => {
    try {
      await api.delete(`/notifications/${id}/`);
      setNotifs(prev => prev.filter(n => n.id!==id));
      toast.success("Notification removed");
    } catch { toast.error("Action error"); }
  };

  const handleMarkAll = async () => {
    setMarkAll(true);
    try {
      await api.post("/notifications/read-all/");
      setNotifs(prev => prev.map(n => ({...n, is_read:true})));
      toast.success("All marked as read");
    } catch { toast.error("Matrix action error"); }
    finally { setMarkAll(false); }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Clear all notifications?")) return;
    setClearAll(true);
    try {
      await api.delete("/notifications/clear-all/");
      setNotifs([]);
      toast.success("All notifications cleared");
    } catch { toast.error("Pipeline breakdown"); }
    finally { setClearAll(false); }
  };

  const filtered  = filterNotifs(notifs, filter);
  const grouped   = groupByDate(filtered);
  const unreadCnt = notifs.filter(n => !n.is_read).length;

  return (
    <div className="relative min-h-screen px-4 sm:px-8 lg:px-16 py-16 bg-[#070205] text-white overflow-x-hidden antialiased font-sans select-none selection:bg-[#ff3f6c] selection:text-white">
      
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

      <div className="w-full relative z-10">

        {/* ── HEADER (DiscoverPage.jsx Typography Symmetry Match) ── */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-20 border-b border-zinc-900/60 pb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff3f6c] animate-pulse" />
              <p className="text-[11px] font-mono uppercase tracking-[0.4em] text-[#ff8c42]">
                Notification Center Matrix v4.0
              </p>
            </div>
            <h1 className="text-6xl sm:text-8xl font-black tracking-tighter leading-none text-white uppercase select-none">
              Notif<span className="text-stroke-thin text-zinc-100">i</span>cations
            </h1>
          </div>

          <div className="flex gap-3 flex-shrink-0 w-full lg:w-auto self-end lg:self-auto">
            {unreadCnt > 0 && (
              <button 
                onClick={handleMarkAll} 
                disabled={markingAll}
                className="px-6 py-3.5 rounded-full flex items-center gap-3 text-[10px] font-mono font-bold tracking-widest bg-zinc-950/80 border border-zinc-800/40 hover:text-black hover:bg-gradient-to-r hover:from-[#ff8c42] hover:to-[#ff3f6c] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl backdrop-blur-xl"
              >
                {markingAll ? (
                  <div className="w-3 h-3 rounded-full border-2 border-zinc-400 border-t-white animate-spin" />
                ) : (
                  <FiCheckCircle size={12} />
                )}
                <span>MARK_ALL_READ</span>
              </button>
            )}
            {notifs.length > 0 && (
              <button 
                onClick={handleClearAll} 
                disabled={clearingAll}
                className="px-6 py-3.5 rounded-full flex items-center gap-3 text-[10px] font-mono font-bold tracking-widest bg-zinc-950/80 border border-zinc-800/40 hover:text-black hover:bg-[#ff3f6c] hover:border-transparent transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl backdrop-blur-xl"
              >
                {clearingAll ? (
                  <div className="w-3 h-3 rounded-full border-2 border-zinc-400 border-t-white animate-spin" />
                ) : (
                  <FiTrash2 size={12} />
                )}
                <span>CLEAR_ALL_STREAM</span>
              </button>
            )}
          </div>
        </div>

        {/* ── FILTER TABS ── */}
        <div className="flex gap-1.5 p-1.5 rounded-2xl mb-10 overflow-x-auto bg-zinc-950/40 border border-zinc-900/60 backdrop-blur-md w-full sm:w-max">
          {FILTERS.map(f => {
            const cnt = filterNotifs(notifs, f.id).length;
            const isActive = filter === f.id;
            return (
              <button 
                key={f.id} 
                onClick={() => setFilter(f.id)} 
                className={`relative px-4 py-2.5 rounded-xl text-[10px] font-mono uppercase font-bold tracking-wider flex items-center gap-2 flex-shrink-0 transition-colors ${
                  isActive ? "text-black font-black" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="notifTab" 
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#ff8c42] to-[#ff3f6c]" 
                  />
                )}
                <span className="relative z-10">{f.label}</span>
                {cnt > 0 && (
                  <span className={`relative z-10 text-[9px] px-1.5 py-0.5 rounded ${
                    isActive ? "bg-black/20 text-black font-bold" : "bg-zinc-900 text-zinc-400"
                  }`}>
                    {cnt}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── CONTENT STREAM ── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-4 w-full">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl bg-white/[0.01] border border-zinc-900/80 p-5 h-24 animate-pulse w-full" />
              ))}
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div 
              key="empty" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="flex flex-col items-center justify-center py-40 border border-dashed border-zinc-900 rounded-3xl bg-zinc-950/10 w-full"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#ff8c42]/10 text-[#ff8c42] mb-4">
                <FiInbox size={20} className="animate-pulse" />
              </div>
              <p className="text-xs font-mono tracking-[0.2em] text-zinc-400 uppercase mb-1">
                {filter === "unread" ? "// ALL_CAUGHT_UP" : "// NO_NOTIFS_PENDING"}
              </p>
              <p className="text-[11px] text-zinc-600 font-mono uppercase">
                {filter === "unread" ? "No pending changes detected." : "The current selection is fully empty."}
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key={filter} 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="space-y-14 w-full"
            >
              {Object.entries(grouped).map(([date, items]) => (
                <div key={date} className="space-y-6 w-full">
                  <div className="flex items-center gap-4 w-full">
                    <p className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#ff3f6c] uppercase flex-shrink-0">
                      // {date}
                    </p>
                    <div className="flex-1 h-px bg-gradient-to-r from-zinc-900 via-zinc-900/20 to-transparent" />
                  </div>

                  <div className="grid grid-cols-1 gap-4 w-full">
                    <AnimatePresence>
                      {items.map(n => (
                        <NotifCard key={n.id} notif={n} onRead={handleRead} onDelete={handleDelete} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}