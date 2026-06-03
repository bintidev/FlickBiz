import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FiStar, FiEdit, FiTrash2, FiHeart, FiSearch, FiX, 
  FiActivity, FiPlus, FiLayers, FiCornerDownRight, FiSliders
} from "react-icons/fi";
import { getReviews, deleteReview, likeReview } from "../services/reviewService";
import { useAuth } from "../context/AuthContext";
import ReviewFormModal from "../components/reviews/ReviewFormModal";
import toast from "react-hot-toast";

const LAYOUT_CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.05 }
  },
  exit: { opacity: 0, transition: { duration: 0.25 } }
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

function Stars({ n, size = 11 }) {
  return (
    <div className="flex gap-0.5 bg-zinc-950/60 px-2 py-0.5 rounded-full border border-zinc-800/40 backdrop-blur-md w-fit">
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar 
          key={i} 
          size={size}
          fill={i < n ? "#ffb834" : "none"}
          color={i < n ? "#ffb834" : "rgba(255, 255, 255, 0.15)"} 
        />
      ))}
    </div>
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
      glow1: "rgba(255, 63, 108, 0.08)",   
      glow2: "rgba(255, 140, 66, 0.06)",   
      lineRGB: "255, 140, 66",
      particles: ["#ff3f6c", "#ff8c42", "#ffb834", "#ff0055"]
    };

    const nodes = Array.from({ length: 35 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 2 + 1,
      angle: Math.random() * Math.PI * 2,
      speed: 0.003 + Math.random() * 0.008
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

      nodes.forEach((n, idx) => {
        n.angle += n.speed;
        n.x += n.vx + Math.cos(n.angle) * 0.1;
        n.y += n.vy + Math.sin(n.angle) * 0.1;

        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = config.particles[idx % config.particles.length];
        ctx.fill();
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

export default function ReviewsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const containerRef = useRef(null);

  const [search, setSearch] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [ordering, setOrdering] = useState("-published_at");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [formModal, setFormModal] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  const PAGE_SIZE = 12;

  const { data: queryData, isLoading: loading } = useQuery({
    queryKey: ["reviews", { ordering, page, search, filterUser }],
    queryFn: async () => {
      const params = { ordering, page, page_size: PAGE_SIZE };
      if (search) params.search = search;
      if (filterUser) params.user = filterUser;
      const res = await getReviews(params);
      return res.data;
    }
  });

  const reviews = queryData?.results || queryData || [];
  const total = queryData?.count || 0;

  useEffect(() => {
    const handleInitialSelection = () => {
      if (window.innerWidth >= 1024 && reviews.length > 0 && !selectedReviewId) {
        setSelectedReviewId(reviews[0].id);
      }
    };
    handleInitialSelection();
  }, [reviews, selectedReviewId]);

  useEffect(() => { setPage(1); }, [ordering, search, filterUser]);

  const selectedReview = reviews.find(r => r.id === selectedReviewId) || null;

  const likeMutation = useMutation({
    mutationFn: async (id) => await likeReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: () => { toast.error("Error on like"); }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await deleteReview(id),
    onSuccess: () => {
      toast.success("Deleted successfully");
      setSelectedReviewId(null); 
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: () => { toast.error("An error occurred"); }
  });

  const handleLikeSelected = (reviewToLike) => {
    const target = reviewToLike || selectedReview;
    if (!target) return;
    likeMutation.mutate(target.id);
  };

  const handleDelete = (revId) => {
    if (!window.confirm("Are you sure?")) return;
    deleteMutation.mutate(revId);
  };

  const handleSaved = () => {
    queryClient.invalidateQueries({ queryKey: ["reviews"] });
    setFormModal(null);
  };

  const resetAllFilters = () => {
    setSearch("");
    setOrdering("-published_at");
    setFilterUser("");
    setPage(1);
  };

  const handleCardClick = (id) => {
    if (window.innerWidth < 1024) {
      setSelectedReviewId(prev => prev === id ? null : id);
    } else {
      setSelectedReviewId(id);
    }
  };

  const hasActiveAdvancedFilters = ordering !== "-published_at" || filterUser !== "";

  return (
    <div ref={containerRef} className="relative min-h-screen px-4 sm:px-8 lg:px-16 py-16 bg-[#070205] text-white overflow-x-hidden antialiased font-sans">
      
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
        .dashboard-scroll::-webkit-scrollbar { width: 4px; }
        .dashboard-scroll::-webkit-scrollbar-thumb { background: rgba(255, 63, 108, 0.2); border-radius: 10px; }
        .thermal-select-premium {
          appearance: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ff8c42' stroke-width='3'><polyline points='6 9 12 15 18 9'></polyline></svg>");
          background-repeat: no-repeat;
          background-position: right 1rem center;
        }
        @keyframes mobileFadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-mobile-panel { animation: mobileFadeIn 0.25s forwards; }
      `}</style>

      <SolarFlareEngine />

      <div className="max-w-[1700px] mx-auto relative z-10">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-20 border-b border-zinc-900/60 pb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff3f6c] animate-pulse" />
              <p className="text-[11px] font-mono uppercase tracking-[0.4em] text-[#ff8c42]">SYSTEM v4.2 // MATRIX</p>
            </div>
            <h1 className="text-6xl sm:text-8xl font-black tracking-tighter leading-none uppercase select-none">
              Re<span className="text-stroke-thin text-zinc-100">v</span>iews
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="font-mono text-right hidden sm:block">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">// RECORDS_INDEXED</p>
              <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8c42] to-[#ff3f6c]">{total} NODES</p>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setFormModal("create")}
              className="px-6 py-3.5 rounded-full flex items-center gap-2 text-[10px] font-bold bg-gradient-to-r from-[#ff8c42] to-[#ff3f6c] text-black shadow-lg"
            >
              <FiPlus size={14} /> WRITE REVIEW
            </motion.button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="mb-14 grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-4 sticky top-4 sm:top-6 z-40">
          <div className="xl:col-span-5 flex gap-2 w-full">
            <div className="flex-1 awwwards-blur-card rounded-2xl p-2 flex items-center group focus-within:ring-1 focus-within:ring-[#ff8c42]/30 transition-all shadow-2xl">
              <div className="p-3 text-zinc-500 group-focus-within:text-[#ff8c42] transition-colors">
                <FiSearch size={18} className="text-[#ff8c42]" />
              </div>
              <input type="text" placeholder="Discover review logs..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-transparent pl-2 pr-4 py-2 text-sm font-medium placeholder-zinc-600 outline-none" />
              {search && <button onClick={() => setSearch("")} className="p-2 text-zinc-500 hover:text-white"><FiX size={14} /></button>}
            </div>

            <button onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className={`xl:hidden flex items-center justify-center gap-2 px-5 rounded-2xl border transition-all shadow-2xl text-[11px] font-mono uppercase h-full min-h-[54px] ${
                mobileFiltersOpen || hasActiveAdvancedFilters ? "bg-[#ff3f6c]/10 border-[#ff3f6c]/40 text-[#ff3f6c]" : "awwwards-blur-card text-zinc-400"
              }`}
            >
              <FiSliders size={14} />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          <div className={`${mobileFiltersOpen ? "grid animate-mobile-panel" : "hidden"} xl:grid xl:col-span-7 awwwards-blur-card rounded-2xl p-2 grid-cols-1 sm:grid-cols-2 gap-2 shadow-2xl`}>
            <div className="relative flex items-center bg-zinc-950/30 rounded-xl px-3 border border-zinc-900/50">
              <FiLayers className="text-[#00ffcc] shrink-0" size={13} />
              <select value={ordering} onChange={e => setOrdering(e.target.value)}
                className="w-full thermal-select-premium bg-transparent pl-3 pr-6 py-3 text-[11px] font-bold uppercase text-zinc-300 outline-none cursor-pointer">
                <option value="-published_at" className="bg-[#0c060a]">↓ Recent Streams</option>
                <option value="published_at" className="bg-[#0c060a]">↑ Oldest Archives</option>
                <option value="-rating" className="bg-[#0c060a]">★ Top Rated</option>
              </select>
            </div>
            <button onClick={() => setFilterUser(filterUser ? "" : user?.username)} disabled={!user}
              className={`py-3 px-4 rounded-xl text-[11px] font-bold uppercase border transition-all flex items-center justify-center gap-2 ${
                filterUser ? "bg-[#ff3f6c]/10 border-[#ff3f6c]/40 text-[#ff3f6c]" : "bg-zinc-950/30 border-zinc-900/50 text-zinc-400 hover:text-white"
              } disabled:opacity-20`}>
              My Private Stream
            </button>
          </div>

          {/* RESET BUTTON */}
          {(search || hasActiveAdvancedFilters) && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={resetAllFilters}
              className="absolute -bottom-10 right-4 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] uppercase tracking-widest"
            >
              <FiX size={10} className="inline mr-1" /> Reset Matrix
            </motion.button>
          )}
        </div>

        {/* RESPONSIVE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CINEMATIC FEED LIST */}
          <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto dashboard-scroll max-h-[80vh]">
            <AnimatePresence mode="popLayout">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="h-32 awwwards-blur-card rounded-2xl animate-pulse" />)
              ) : (
                reviews.map((rev) => {
                  const isSel = selectedReviewId === rev.id;
                  return (
                    <motion.div 
                      key={rev.id} 
                      variants={ITEM_VARIANTS} 
                      initial="hidden" 
                      animate="visible" 
                      layout // Smooth layout resizing transitions
                      transition={{
                        type: "spring",
                        stiffness: 220,
                        damping: 26,
                        layout: { duration: 0.4 }
                      }}
                      onClick={() => handleCardClick(rev.id)}
                      className={`p-4 rounded-2xl cursor-pointer border relative overflow-hidden group transition-colors duration-300 ${
                        isSel ? "bg-[#ff3f6c]/5 border-[#ff3f6c]/40 shadow-xl" : "awwwards-blur-card border-zinc-800/80 hover:border-zinc-700"
                      }`}
                    >
                      {/* layout="position" prevents text/image warping during container expansion */}
                      <motion.div layout="position" className="flex gap-4">
                        {rev.media_poster && (
                          <div className="w-16 h-24 sm:w-20 sm:h-28 shrink-0 rounded-lg overflow-hidden border border-white/5 shadow-2xl">
                            <img src={rev.media_poster} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <h3 className={`text-sm sm:text-base font-bold truncate transition-colors ${isSel ? "text-[#ff3f6c]" : "text-white"}`}>{rev.title}</h3>
                              <Stars n={rev.rating} size={9} />
                            </div>
                            <p className="text-[10px] font-mono text-[#ff8c42] uppercase mb-2 truncate">{rev.media_title}</p>
                            
                            <motion.p 
                              layout="position"
                              className={`lg:hidden text-xs text-zinc-400 leading-relaxed mb-3 ${isSel ? "" : "line-clamp-2"}`}
                            >
                              {rev.preview || rev.body || rev.content}
                            </motion.p>
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-900/40">
                             <div className="flex items-center gap-2">
                               <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#ff3f6c] to-[#ff8c42] flex items-center justify-center text-[8px] font-black">{rev.user?.username?.[0].toUpperCase()}</div>
                               <span className="text-[9px] font-mono text-zinc-500">@{rev.user?.username}</span>
                             </div>
                             <div className="lg:hidden flex gap-2">
                               <button onClick={(e) => { e.stopPropagation(); handleLikeSelected(rev); }} className="text-zinc-500 hover:text-[#ff3f6c] p-1"><FiHeart size={14} /></button>
                               {user?.username === rev.user?.username && (
                                 <>
                                   <button onClick={(e) => { e.stopPropagation(); setFormModal(rev); }} className="text-zinc-500 hover:text-[#ff8c42] p-1"><FiEdit size={14} /></button>
                                   <button onClick={(e) => { e.stopPropagation(); handleDelete(rev.id); }} className="text-zinc-500 hover:text-red-500 p-1"><FiTrash2 size={14} /></button>
                                 </>
                               )}
                             </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Smooth unmount animation for the mobile details drawer */}
                      <AnimatePresence>
                        {isSel && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: "auto" }} 
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="lg:hidden mt-4 pt-4 border-t border-zinc-900/60 text-[11px] font-mono text-zinc-500 space-y-1"
                          >
                            <p>PUBLISHED ON: {new Date(rev.published_at).toLocaleDateString()}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {isSel && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#ff3f6c]" />}
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* DESKTOP DETAIL MODULE */}
          <div className="hidden lg:flex lg:col-span-8 awwwards-blur-card rounded-3xl p-8 flex-col sticky top-24 h-[75vh] overflow-y-auto dashboard-scroll">
            <AnimatePresence mode="wait">
              {selectedReview ? (
                <motion.div key={selectedReview.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex flex-col justify-between">
                  <div>
                    <div className="flex gap-6 items-start border-b border-zinc-900 pb-8 mb-8">
                      {selectedReview.media_poster && <img src={selectedReview.media_poster} alt="" className="w-24 h-36 object-cover rounded-xl border border-white/5 shadow-2xl" />}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-3xl font-black tracking-tight mb-2 uppercase break-words">{selectedReview.title}</h2>
                        <div className="flex items-center gap-4 mb-4">
                           <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ff8c42]/10 border border-[#ff8c42]/20 text-[#ff8c42] uppercase">{selectedReview.media_title}</span>
                           <Stars n={selectedReview.rating} size={14} />
                        </div>
                        <p className="text-xs text-zinc-500 font-mono italic">Log published on {new Date(selectedReview.published_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="bg-zinc-950/20 p-6 rounded-2xl border border-zinc-900/40">
                      <p className="text-[#ff3f6c] mb-4 font-mono text-[10px] tracking-widest uppercase flex items-center gap-2"><FiCornerDownRight /> Critique Stream</p>
                      <p className="text-zinc-300 leading-relaxed whitespace-pre-line text-sm">{selectedReview.preview || selectedReview.body || selectedReview.content}</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-zinc-900/60 flex justify-between items-center">
                    <button onClick={() => handleLikeSelected()} 
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all text-xs font-bold ${selectedReview.liked_by_user || selectedReview.is_liked ? "bg-[#ff3f6c]/10 border-[#ff3f6c]/40 text-[#ff3f6c]" : "bg-zinc-950 border-zinc-800 text-zinc-400"}`}>
                      <FiHeart size={14} fill={selectedReview.liked_by_user || selectedReview.is_liked ? "#ff3f6c" : "none"} className={selectedReview.liked_by_user || selectedReview.is_liked ? "animate-pulse" : ""} />
                      {selectedReview.likes_count || 0} VOTES
                    </button>
                    {user?.username === selectedReview.user?.username && (
                      <div className="flex gap-3">
                        <button onClick={() => setFormModal(selectedReview)} className="px-4 py-2 rounded-xl bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400 hover:text-[#ff8c42] transition-colors flex items-center gap-2"><FiEdit size={12}/> MODIFY</button>
                        <button onClick={() => handleDelete(selectedReview.id)} className="px-4 py-2 rounded-xl bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-2"><FiTrash2 size={12}/> PURGE</button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-700 font-mono text-xs tracking-widest"><FiActivity size={32} className="mb-4 animate-pulse opacity-20"/> SELECT_NODE_TO_INITIALIZE</div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {formModal && (
          <ReviewFormModal 
            review={formModal === "create" ? null : formModal} 
            onClose={() => setFormModal(null)} 
            onSaved={handleSaved} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}