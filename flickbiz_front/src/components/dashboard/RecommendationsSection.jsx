import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiShuffle, FiRefreshCw } from "react-icons/fi";
import { getDiscover } from "../../services/mediaService";
import MediaCard from "./MediaCard";

export default function RecommendationsSection() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);

  const fetch = async () => {
    setLoading(true); setSpinning(true);
    try {
      const res = await getDiscover();
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setTimeout(() => setSpinning(false), 600); }
  };

  useEffect(() => { fetch(); }, []);

  return (
    <div className="rounded-3xl p-6 h-full relative overflow-hidden"
      style={{ background:"#0d0d16", border:"1px solid rgba(255,255,255,0.07)" }}>

      <motion.div animate={{ scale:[1,1.3,1], opacity:[0.05,0.12,0.05] }} transition={{ duration:5, repeat:Infinity }}
        className="absolute -top-10 -right-10 rounded-full pointer-events-none"
        style={{ width:160, height:160, background:"#f472b6", filter:"blur(50px)" }} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background:"rgba(244,114,182,0.15)", border:"1px solid rgba(244,114,182,0.25)" }}>
              <FiShuffle size={17} style={{ color:"#f472b6" }} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ fontFamily:"var(--font-display)" }}>For you</h2>
              <p className="text-xs mt-0.5" style={{ color:"#8888aa" }}>Based on your taste</p>
            </div>
          </div>
          <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
            animate={{ rotate: spinning ? 360 : 0 }}
            transition={{ duration:0.6, ease:"easeInOut" }}
            onClick={fetch}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background:"rgba(244,114,182,0.1)", color:"#f472b6", cursor:"none", border:"1px solid rgba(244,114,182,0.2)" }}
            data-cursor>
            <FiRefreshCw size={16} />
          </motion.button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2].map((i) => (
              <div key={i} className="rounded-2xl animate-pulse h-24" style={{ background:"#1a1a26" }} />
            ))}
          </div>
        ) : !data?.movie && !data?.series ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <motion.div animate={{ rotate:[0,10,-10,0] }} transition={{ duration:2, repeat:Infinity }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
              style={{ background:"rgba(244,114,182,0.1)" }}>
              <FiShuffle size={22} style={{ color:"#f472b6" }} />
            </motion.div>
            <p className="text-xs" style={{ color:"#8888aa" }}>
              Set preferred genres in your profile to get picks.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={data?.movie?.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-10 }} className="space-y-4">
              {data?.movie && (
                <div>
                  <p className="text-xs font-bold tracking-[0.25em] uppercase mb-2"
                    style={{ color:"#8888aa", fontFamily:"var(--font-display)" }}>Movie pick</p>
                  <MediaCard item={data.movie} type="movie" />
                </div>
              )}
              {data?.series && (
                <div>
                  <p className="text-xs font-bold tracking-[0.25em] uppercase mb-2"
                    style={{ color:"#8888aa", fontFamily:"var(--font-display)" }}>Series pick</p>
                  <MediaCard item={data.series} type="series" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}