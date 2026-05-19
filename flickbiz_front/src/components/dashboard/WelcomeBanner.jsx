import { motion } from "framer-motion";
import { FiFilm, FiEye, FiHeart, FiClock } from "react-icons/fi";

export default function WelcomeBanner({ user, statuses }) {
  const watched  = Array.isArray(statuses) ? statuses.filter((s) => s.status === "watched").length  : 0;
  const watching = Array.isArray(statuses) ? statuses.filter((s) => s.status === "watching").length : 0;
  const watchlist= Array.isArray(statuses) ? statuses.filter((s) => s.status === "watchlist").length: 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const stats = [
    { icon: FiFilm,  label: "Watched",   value: watched,   color: "#ff3f6c" },
    { icon: FiEye,   label: "Watching",  value: watching,  color: "#ff8c42" },
    { icon: FiClock, label: "Watchlist", value: watchlist, color: "#a78bfa" },
    { icon: FiHeart, label: "Favourites",value: 0,         color: "#34d399" },
  ];

  return (
    <div className="relative rounded-3xl overflow-hidden p-8"
      style={{ background: "#0d0d16", border: "1px solid rgba(255,255,255,0.07)" }}>

      {/* Animated orbs */}
      <motion.div animate={{ x:[0,30,0], y:[0,-20,0] }} transition={{ duration:7, repeat:Infinity }}
        className="absolute -top-20 -left-20 rounded-full pointer-events-none"
        style={{ width:260, height:260, background:"#ff3f6c", opacity:0.07, filter:"blur(80px)" }} />
      <motion.div animate={{ x:[0,-20,0], y:[0,25,0] }} transition={{ duration:9, repeat:Infinity }}
        className="absolute -bottom-20 -right-20 rounded-full pointer-events-none"
        style={{ width:260, height:260, background:"#ff8c42", opacity:0.06, filter:"blur(80px)" }} />

      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage:"linear-gradient(rgba(255,63,108,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,63,108,1) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <motion.p initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1 }}
            className="text-xs font-bold tracking-[0.3em] uppercase mb-1"
            style={{ color:"#8888aa", fontFamily:"var(--font-display)" }}>
            {greeting}
          </motion.p>
          <motion.h1 initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2, type:"spring", stiffness:200 }}
            className="text-4xl font-extrabold" style={{ fontFamily:"var(--font-display)" }}>
            {user?.username}
            <motion.span animate={{ rotate:[0,20,0] }} transition={{ duration:1.5, repeat:Infinity, repeatDelay:3 }}
              className="inline-block ml-2">👋</motion.span>
          </motion.h1>
          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.35 }}
            className="text-sm mt-1" style={{ color:"#8888aa" }}>
            Here's what's happening in your vault today.
          </motion.p>
        </div>

        {/* Stats */}
        <div className="flex gap-3 flex-wrap">
          {stats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity:0, scale:0.7, y:20 }}
              animate={{ opacity:1, scale:1, y:0 }}
              transition={{ delay:0.15 + i*0.08, type:"spring", stiffness:300, damping:18 }}
              whileHover={{ scale:1.06, y:-3, boxShadow:`0 8px 30px ${s.color}22` }}
              className="flex flex-col items-center gap-1 px-5 py-4 rounded-2xl relative overflow-hidden"
              style={{ background:`${s.color}0e`, border:`1px solid ${s.color}28`, cursor:"none" }}>
              {/* Glow dot */}
              <motion.div animate={{ opacity:[0.4,1,0.4] }} transition={{ duration:2, repeat:Infinity, delay:i*0.3 }}
                className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
                style={{ background:s.color, boxShadow:`0 0 6px ${s.color}` }} />
              <s.icon size={18} style={{ color:s.color }} />
              <motion.span
                initial={{ opacity:0 }} animate={{ opacity:1 }}
                className="text-2xl font-extrabold tabular-nums"
                style={{ fontFamily:"var(--font-display)", color:s.color }}>
                {s.value}
              </motion.span>
              <span className="text-xs" style={{ color:"#8888aa", fontFamily:"var(--font-display)" }}>{s.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}