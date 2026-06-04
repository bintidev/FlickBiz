import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FiEdit, FiEye, FiHeart, FiClock, FiCheck, FiStar,
  FiCamera, FiLock, FiUser, FiMail, FiGlobe, FiSave,
  FiFilm, FiTv, FiShield, FiX, FiActivity
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile, getUserStatuses, getUserFavorites, getUserReviews } from "../services/userService";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

// Lista de zonas de disponibilidad / países sugeridos
const AVAILABILITY_ZONES = [
  { value: "US", label: "United States (US)" },
  { value: "ES", label: "Spain (ES)" },
  { value: "MX", label: "Mexico (MX)" },
  { value: "AR", label: "Argentina (AR)" },
  { value: "CO", label: "Colombia (CO)" },
  { value: "CL", label: "Chile (CL)" },
  { value: "BR", label: "Brazil (BR)" },
  { value: "GB", label: "United Kingdom (GB)" },
  { value: "FR", label: "France (FR)" },
  { value: "DE", label: "Germany (DE)" },
  { value: "JP", label: "Japan (JP)" },
  { value: "KR", label: "South Korea (KR)" },
];

function SolarFlareEngine() {
  const canvasRef = useRef(null);
  const frameRef  = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    const resize = () => { 
      if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    };
    resize();
    window.addEventListener("resize", resize);
    
    const nodes = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vx: (Math.random() - .5) * .7, vy: (Math.random() - .5) * .7,
      r: Math.random() * 2.5 + .5, angle: Math.random() * Math.PI * 2, speed: .006 + Math.random() * .008
    }));
    
    const colors = ["#ff3f6c", "#ff8c42", "#ff5e62", "#ffb834"];
    let t = 0;
    
    const loop = () => {
      frameRef.current = requestAnimationFrame(loop);
      t += .006;
      const W = canvas.width, H = canvas.height;
      ctx.fillStyle = "#090307"; ctx.fillRect(0, 0, W, H);
      
      const g = ctx.createRadialGradient(W * .5 + Math.sin(t) * 150, H * .4 + Math.cos(t * .5) * 100, 10, W * .5, H * .4, Math.max(W, H) * .7);
      g.addColorStop(0, "rgba(255,63,108,0.09)"); g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      
      const g2 = ctx.createRadialGradient(W * .8, H * .3, 10, W * .7, H * .4, Math.max(W, H) * .6);
      g2.addColorStop(0, "rgba(255,140,66,0.07)"); g2.addColorStop(1, "transparent");
      ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
      
      nodes.forEach((n, i) => {
        n.angle += n.speed; n.x += n.vx + Math.cos(n.angle) * .1; n.y += n.vy + Math.sin(n.angle) * .1;
        if(n.x < 0 || n.x > W) n.vx *= -1; if(n.y < 0 || n.y > H) n.vy *= -1;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = colors[i % colors.length]; ctx.fill();
        
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j], lx = n.x - n2.x, ly = n.y - n2.y, ld = Math.sqrt(lx * lx + ly * ly);
          if (ld < 110) {
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(255,94,98, ${0.05 * (1 - ld / 110)})`; ctx.lineWidth = .5; ctx.stroke();
          }
        }
      });
    };
    loop();
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0 mix-blend-screen" />;
}

function StatCard({ icon: Icon, value, label, color, active, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 6 }}
      className={`flex items-center justify-between p-5 rounded-xl transition-all duration-300 w-full backdrop-blur-md text-left select-none outline-none border ${
        active 
          ? "bg-zinc-950/80 shadow-2xl" 
          : "bg-[#0a0812]/10 border-zinc-950/80 hover:border-zinc-800/40"
      }`}
      style={{ borderColor: active ? `${color}40` : '' }}
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg" style={{ background: active ? `${color}18` : 'rgba(255,255,255,0.02)' }}>
          <Icon size={14} style={{ color: active ? color : '#71717a' }} />
        </div>
        <div>
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-500">// {label}</p>
          {active && (
            <motion.div layoutId="activeUnderline" className="h-[2px] w-4 mt-1 rounded-full" style={{ backgroundColor: color }} />
          )}
        </div>
      </div>
      <p className="text-2xl font-black font-mono tracking-tighter" style={{ color: active ? 'white' : '#44444a' }}>
        {String(value || 0).padStart(2, '0')}
      </p>
    </motion.button>
  );
}

function MediaRow({ item, onClick }) {
  const [details, setDetails] = useState(null);
  const [fetching, setFetching] = useState(false);

  const isMovie = !!item?.movie || (!item?.series && !!item?.movie);
  const rawTarget = item?.movie || item?.series;
  const targetId = (rawTarget && typeof rawTarget === "object") ? rawTarget.id : rawTarget;

  useEffect(() => {
    if (rawTarget && typeof rawTarget === "object" && (rawTarget.title || rawTarget.name)) {
      setDetails(rawTarget);
      return;
    }

    if (targetId && (typeof targetId === "number" || typeof targetId === "string")) {
      setFetching(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const segment = isMovie ? "movies" : "series";
      const url = `http://localhost:8000/api/media/${segment}/${targetId}/`;

      fetch(url, { headers })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Servidor respondió con estatus: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setDetails(data);
          setFetching(false);
        })
        .catch((err) => {
          console.error("Error cargando detalles del nodo multimedia:", err.message);
          setFetching(false);
        });
    }
  }, [targetId, rawTarget, isMovie]);

  if (fetching) {
    return (
      <div className="flex items-center gap-5 p-4 rounded-xl bg-[#0d0a14]/30 border border-zinc-950/80 animate-pulse">
        <div className="w-14 h-20 rounded-lg bg-zinc-900 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-zinc-900 rounded w-3/4" />
          <div className="h-3 bg-zinc-900 rounded w-1/4" />
        </div>
      </div>
    );
  }

  const core = details || {};
  const title = core.title || core.name || core.original_title || core.original_name || "Unknown Title";
  const poster = core.poster || core.poster_path || core.image || core.thumbnail;
  const rawDate = core.release_date || core.first_air_date;
  const year = rawDate ? new Date(rawDate).getFullYear() : "—";

  return (
    <motion.div 
      whileHover={{ scale: 1.01, y: -2 }}
      onClick={onClick}
      className="flex items-center gap-5 p-4 rounded-xl transition-all bg-[#0d0a14]/30 border border-zinc-950/80 hover:border-zinc-800/40 group cursor-pointer relative overflow-hidden"
    >
      {poster ? (
        <img src={poster} alt={title} className="w-14 h-20 rounded-lg object-cover flex-shrink-0 filter brightness-75 group-hover:brightness-100 transition-all shadow-md border border-zinc-900" />
      ) : (
        <div className="w-14 h-20 rounded-lg flex items-center justify-center flex-shrink-0 bg-zinc-950 border border-zinc-900">
          {isMovie ? <FiFilm size={18} className="text-[#ff3f6c] opacity-60" /> : <FiTv size={18} className="text-[#ff8c42] opacity-60" />}
        </div>
      )}
      
      <div className="flex-1 min-w-0 pr-16">
        <p className="text-base font-bold text-zinc-300 group-hover:text-white truncate font-sans tracking-tight">
          {title}
        </p>
        <p className="text-xs font-mono text-zinc-600 mt-1">
          {year}
        </p>
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
        <span className={`text-[9px] font-mono font-bold tracking-widest px-2.5 py-1 rounded border shadow-sm transition-colors ${
          isMovie 
            ? "bg-[#ff3f6c]/10 text-[#ff3f6c] border-[#ff3f6c]/20 group-hover:bg-[#ff3f6c]/20" 
            : "bg-[#ff8c42]/10 text-[#ff8c42] border-[#ff8c42]/20 group-hover:bg-[#ff8c42]/20"
        }`}>
          {isMovie ? "FILM" : "TV"}
        </span>
      </div>
    </motion.div>
  );
}

function ReviewRow({ rev, onClick }) {
  const mediaData = rev?.movie || rev?.series || rev?.content || rev?.media || rev;
  const isMovie = !!rev?.movie || rev?.media_type === "movie" || rev?.type === "movie";
  
  const title = mediaData?.title || mediaData?.name || rev?.media_title || rev?.title || "Unknown Title";
  const poster = mediaData?.poster || mediaData?.poster_path || rev?.media_poster || rev?.poster;

  return (
    <motion.div 
      whileHover={{ scale: 1.005, x: 4 }}
      onClick={onClick}
      className="relative rounded-xl p-5 transition-all bg-[#0d0a14]/30 border border-zinc-950 hover:border-zinc-800/40 cursor-pointer flex gap-5 items-start"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-gradient-to-b from-[#ffb834] to-[#ff8c42]" />
      
      {poster ? (
        <img src={poster} alt={title} className="w-16 h-24 rounded-lg object-cover flex-shrink-0 border border-zinc-900 shadow-md filter brightness-90 group-hover:brightness-100 transition-all" />
      ) : (
        <div className="w-16 h-24 rounded-lg flex items-center justify-center flex-shrink-0 bg-zinc-950 border border-zinc-900">
          {isMovie ? <FiFilm size={20} className="text-[#ffb834] opacity-50" /> : <FiTv size={20} className="text-[#ff8c42] opacity-50" />}
        </div>
      )}

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">// TARGET: {title}</span>
            <p className="font-bold text-lg text-zinc-200 truncate mt-0.5">{rev?.title || "No Title"}</p>
          </div>
          
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
              isMovie 
                ? "bg-[#ff3f6c]/10 text-[#ff3f6c] border-[#ff3f6c]/20" 
                : "bg-[#ff8c42]/10 text-[#ff8c42] border-[#ff8c42]/20"
            }`}>
              {isMovie ? "FILM" : "TV"}
            </span>
            <div className="flex gap-0.5 bg-zinc-950/80 px-2 py-1 rounded border border-zinc-900">
              {Array.from({ length: 5 }).map((_, j) => (
                <FiStar key={j} size={9} fill={j < (rev?.rating || 0) ? "#ffb834" : "none"} color={j < (rev?.rating || 0) ? "#ffb834" : "#27272a"} />
              ))}
            </div>
          </div>
        </div>

        <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed pt-1">{rev?.preview || rev?.content || ""}</p>
      </div>
    </motion.div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile]   = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [activeTab, setActiveTab] = useState("watchlist");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const avatarRef = useRef(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [pRes, sRes, fRes, rRes] = await Promise.all([
          getProfile(),
          getUserStatuses(),
          getUserFavorites(),
          getUserReviews(user?.username),
        ]);
        
        if (!isMounted) return;

        const profileData = pRes?.data || pRes || {};
        const statusesData = sRes?.data?.results || sRes?.data || sRes || [];
        const favoritesData = fRes?.data?.results || fRes?.data || fRes || [];
        const reviewsData = rRes?.data?.results || rRes?.data || rRes || [];

        setProfile(profileData);
        setStatuses(Array.isArray(statusesData) ? statusesData : []);
        setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);

        reset({
          username: profileData.username || "",
          email: profileData.email || "",
          bio: profileData.bio || "",
          country: profileData.country || "",
          is_private: profileData.is_private || false,
          hide_watchlist: profileData.hide_watchlist || false,
          hide_favorites: profileData.hide_favorites || false,
        });
      } catch (e) { 
        console.error("Error loading profile setup:", e); 
      } finally { 
        if (isMounted) setLoading(false); 
      }
    })();

    return () => { isMounted = false; };
  }, [user, reset]);

  const onSave = async (data) => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined) formData.append(k, v); });
      if (avatarRef.current?.files?.[0]) formData.append("profile_picture", avatarRef.current.files[0]);
      const res = await updateProfile(formData);
      setProfile(res?.data || res);
      setEditing(false);
      setAvatarPreview(null);
      toast.success("Profile updated successfully");
    } catch (e) {
      toast.error(e.response?.data?.username?.[0] || "Error saving changes");
    } finally { 
      setSaving(false); 
    }
  };

  const watchlist = Array.isArray(statuses) ? statuses.filter(s => s?.status === "watchlist") : [];
  const watching  = Array.isArray(statuses) ? statuses.filter(s => s?.status === "watching") : [];
  const watched   = Array.isArray(statuses) ? statuses.filter(s => s?.status === "watched") : [];

  const tabs = [
    { id: "watchlist", label: "Watchlist", count: watchlist.length, icon: FiClock, color: "#ff8c42" },
    { id: "watching",  label: "Watching",  count: watching.length,  icon: FiEye,   color: "#ff6b4a" },
    { id: "watched",   label: "Watched",   count: watched.length,   icon: FiCheck, color: "#ff5268" },
    { id: "favorites", label: "Favourites",count: favorites.length, icon: FiHeart, color: "#ff3f6c" },
    { id: "reviews",   label: "Reviews",   count: reviews.length,   icon: FiStar,  color: "#ffb834" },
  ];

  const currentItems = { watchlist, watching, watched, favorites, reviews }[activeTab] || [];
  const currentActiveTabObj = tabs.find(t => t.id === activeTab);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#070205]">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ duration: .8, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 rounded-full border-2 border-transparent border-t-[#ff3f6c]" 
      />
    </div>
  );

  return (
    <div className="bg-[#070205] min-h-screen text-white antialiased font-sans overflow-x-hidden selection:bg-[#ff3f6c] selection:text-black pb-32 profile-page-container">
      
      <style>{`
        .awwwards-blur-card {
          background: rgba(13, 9, 18, 0.4) !important;
          backdrop-filter: blur(50px) saturate(140%) !important;
          border: 1px solid rgba(255, 63, 108, 0.04) !important;
        }
        /* Limpieza del estilo por defecto de los selects en navegadores modernos */
        .cyber-select {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1em;
        }
        .cyber-select option {
          background-color: #0d0912;
          color: #d4d4d8;
        }
      `}</style>

      <SolarFlareEngine />

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-12 lg:px-20 pt-20 space-y-16">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 border-b border-zinc-900 pb-12 relative">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#ff3f6c]/5 blur-[140px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 w-full lg:w-auto">
            <div className="relative flex-shrink-0 group">
              <div className="w-32 h-32 rounded-3xl overflow-hidden bg-zinc-950 p-1 border border-zinc-900 shadow-2xl relative">
                {avatarPreview || profile?.profile_picture ? (
                  <img src={avatarPreview || profile.profile_picture} alt="" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-black bg-gradient-to-br from-[#ff3f6c] to-[#ff8c42] text-black font-mono">
                    {profile?.username?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
              {editing && (
                <motion.button 
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  onClick={() => avatarRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-r from-[#ff3f6c] to-[#ff8c42] text-black shadow-lg"
                >
                  <FiCamera size={13} />
                </motion.button>
              )}
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setAvatarPreview(URL.createObjectURL(f)); }} />
            </div>

            <div className="space-y-4 text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter uppercase font-sans leading-none break-all bg-gradient-to-r from-[#ff3f6c] via-[#ff6b4a] to-[#ff8c42] bg-clip-text text-transparent">
                  {profile?.username || "Anonymous Node"}
                </h1>
                {profile?.is_private && (
                  <span className="flex items-center gap-1 text-[9px] px-3 py-1 rounded-md font-mono uppercase bg-zinc-900/60 border border-[#ff3f6c]/20 tracking-widest text-[#ff3f6c] mt-2">
                    <FiLock size={9} /> PROTECTED_NODE
                  </span>
                )}
              </div>

              <div className="max-w-2xl space-y-2">
                {profile?.bio ? (
                  <p className="text-sm text-zinc-400 font-normal leading-relaxed">{profile.bio}</p>
                ) : (
                  <p className="text-xs font-mono text-zinc-700">// NO_BIOGRAPHY_YET</p>
                )}
                
                <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-mono text-zinc-500 uppercase">
                  {profile?.country && (
                    <span className="flex items-center gap-1.5"><FiGlobe size={11} className="text-[#ff8c42]" /> {profile.country}</span>
                  )}
                  <span>SYSTEM // AUTH_NODE</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setEditing(!editing)}
            className={`flex items-center gap-2 px-6 py-4 rounded-xl font-mono text-xs uppercase tracking-widest border transition-all duration-300 w-full lg:w-auto justify-center ${
              editing 
                ? "bg-red-500/10 border-red-500/20 text-red-400" 
                : "bg-zinc-950/60 border-zinc-900 text-zinc-400 hover:text-white hover:border-[#ff3f6c]/30"
            }`}
          >
            {editing ? <><FiX size={14} /> Abort Config</> : <><FiEdit size={14} /> EDIT PROFILE</>}
          </button>
        </div>

        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="awwwards-blur-card rounded-3xl p-6 sm:p-8 shadow-3xl"
              style={{ borderColor: 'rgba(255, 63, 108, 0.15)' }}
            >
              <form onSubmit={handleSubmit(onSave)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-[10px] font-mono tracking-widest uppercase block mb-2 text-zinc-500">Username</label>
                    <div className="relative flex items-center bg-zinc-950/60 rounded-xl px-4 border border-zinc-900 focus-within:border-[#ff3f6c]/50 transition-colors">
                      <FiUser size={14} className="text-zinc-600" />
                      <input {...register("username", { required: "Required", minLength: { value: 3, message: "Min 3 chars" } })} className="w-full bg-transparent px-3 py-3.5 text-sm text-white outline-none" />
                    </div>
                    {errors.username && <p className="text-xs mt-1 text-[#ff3f6c] font-mono">{errors.username.message}</p>}
                  </div>

                  <div>
                    <label className="text-[10px] font-mono tracking-widest uppercase block mb-2 text-zinc-500">Mail Address</label>
                    <div className="relative flex items-center bg-zinc-950/60 rounded-xl px-4 border border-zinc-900 focus-within:border-[#ff3f6c]/50 transition-colors">
                      <FiMail size={14} className="text-zinc-600" />
                      <input {...register("email")} type="email" className="w-full bg-transparent px-3 py-3.5 text-sm text-white outline-none" />
                    </div>
                  </div>

                  {/* CAMBIO DE TEXT INPUT A SELECT DINÁMICO */}
                  <div>
                    <label className="text-[10px] font-mono tracking-widest uppercase block mb-2 text-zinc-500">Country Location</label>
                    <div className="relative flex items-center bg-zinc-950/60 rounded-xl px-4 border border-zinc-900 focus-within:border-[#ff8c42]/50 transition-colors">
                      <FiGlobe size={14} className="text-zinc-600" />
                      <select 
                        {...register("country")} 
                        className="w-full bg-transparent px-3 py-3.5 text-sm text-white outline-none cyber-select cursor-pointer"
                      >
                        <option value="">-- Select Availability Zone --</option>
                        {AVAILABILITY_ZONES.map((zone) => (
                          <option key={zone.value} value={zone.value}>
                            {zone.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <label className="text-[10px] font-mono tracking-widest uppercase block mb-2 text-zinc-500">Biography</label>
                    <textarea {...register("bio")} rows={3} className="w-full bg-zinc-950/60 border border-zinc-900 focus-within:border-[#ff6b4a]/50 rounded-xl p-4 text-sm text-white outline-none resize-none" />
                  </div>

                  <div className="md:col-span-3 bg-zinc-950/40 p-4 rounded-xl border border-zinc-900/80 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                      { field: "is_private",      label: "Private Profile",   icon: FiShield },
                      { field: "hide_watchlist",  label: "Hide Watchlist",     icon: FiLock   },
                      { field: "hide_favorites",  label: "Hide Favourites",    icon: FiLock   },
                    ].map(({ field, label, icon: Icon }) => (
                      <label key={field} className="flex items-center gap-4 cursor-pointer select-none">
                        <div className="relative">
                          <input {...register(field)} type="checkbox" className="sr-only peer" />
                          <div className="w-10 h-5 rounded-full bg-zinc-900 border border-zinc-800 peer-checked:bg-gradient-to-r peer-checked:from-[#ff3f6c] peer-checked:to-[#ff8c42] transition-all" />
                          <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-zinc-600 peer-checked:bg-white transition-transform peer-checked:translate-x-5" />
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                          <Icon size={11} className="text-zinc-500" /> {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#ff3f6c] to-[#ff8c42] text-black font-mono text-xs uppercase tracking-widest font-black disabled:opacity-40 shadow-xl hover:brightness-110 transition-all duration-300"
                  >
                    {saving ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: .7, repeat: Infinity, ease: "linear" }} className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black" />
                    ) : (
                      <FiSave size={14} />
                    )}
                    {saving ? "Deploying Configuration..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          <div className="lg:col-span-4 flex flex-col gap-2.5 w-full">
            <div className="font-mono pl-1 mb-2">
              <span className="text-[9px] text-zinc-600 tracking-[0.3em] uppercase">// INDEX_NAVIGATOR</span>
            </div>
            {tabs.map((t) => (
              <StatCard 
                key={t.id} 
                icon={t.icon} 
                value={t.count} 
                label={t.label} 
                color={t.color} 
                active={activeTab === t.id}
                onClick={() => setActiveTab(t.id)}
              />
            ))}
          </div>

          <div 
            className="lg:col-span-8 awwwards-blur-card rounded-3xl p-6 sm:p-8 min-h-[550px] w-full transition-all duration-500"
            style={{ borderLeftColor: `${currentActiveTabObj?.color}30` }}
          >
            <div className="flex items-center justify-between border-b border-zinc-900/60 pb-4 mb-6 font-mono">
              <span className="text-xs uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: currentActiveTabObj?.color || 'white' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: currentActiveTabObj?.color || '#ff3f6c' }} />
                {activeTab.toUpperCase()}
              </span>
              <span className="text-xs text-zinc-600 font-mono">[ITEMS: {currentItems.length}]</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: .22 }}
              >
                {currentItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-28 border border-dashed border-zinc-900 rounded-2xl bg-zinc-950/10">
                    <FiActivity size={28} className="text-zinc-800 mb-3 animate-pulse" />
                    <p className="text-[10px] font-mono tracking-[0.25em] text-zinc-600 uppercase">// MATRIX_STREAM_EMPTY</p>
                  </div>
                ) : activeTab === "reviews" ? (
                  <div className="grid grid-cols-1 gap-4">
                    {reviews.map((rev) => (
                      <ReviewRow 
                        key={rev?.id || Math.random()} 
                        rev={rev} 
                        onClick={() => navigate("/reviews", { state: { selectedReview: rev } })} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentItems.map((item, i) => {
                      const core = item?.movie || item?.series || item;
                      const isMovie = !!item?.movie || (!item?.series && !!item?.movie);
                      
                      const targetMediaId = (typeof core === "object" && core !== null) ? core.id : core;
                      const routeSegment = isMovie ? "movies" : "series";

                      return (
                        <MediaRow 
                          key={item?.id || i} 
                          item={item} 
                          onClick={() => {
                            if (targetMediaId) {
                              navigate(`/${routeSegment}/${targetMediaId}`);
                            } else {
                              toast.error("Content destination reference missing");
                            }
                          }} 
                        />
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}