import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiZap } from "react-icons/fi";
import { getMovies, getSeries } from "../../services/mediaService";
import SectionHeader from "./SectionHeader";
import MediaCard from "./MediaCard";

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 rounded-2xl overflow-hidden animate-pulse"
      style={{ width:150, aspectRatio:"2/3", background:"linear-gradient(135deg,#1a1a26,#13131e)" }} />
  );
}

export default function NewContentSection({ userCountry }) {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [movRes, serRes] = await Promise.all([
          getMovies({ ordering:"-release_date", page_size:6 }),
          getSeries({ ordering:"-release_date", page_size:6 }),
        ]);
        const combined = [
          ...(movRes.data.results || []).map((m) => ({ ...m, _type:"movie" })),
          ...(serRes.data.results || []).map((s) => ({ ...s, _type:"series" })),
        ].sort((a,b) => new Date(b.release_date) - new Date(a.release_date)).slice(0,10);
        setItems(combined);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [userCountry]);

  return (
    <div className="rounded-3xl p-6 relative overflow-hidden"
      style={{ background:"#0d0d16", border:"1px solid rgba(255,255,255,0.07)" }}>

      <motion.div animate={{ opacity:[0.04,0.08,0.04] }} transition={{ duration:5, repeat:Infinity }}
        className="absolute -bottom-16 -left-16 rounded-full pointer-events-none"
        style={{ width:200, height:200, background:"#a78bfa", filter:"blur(60px)" }} />

      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage:"repeating-linear-gradient(-45deg,#a78bfa 0,#a78bfa 1px,transparent 0,transparent 50%)", backgroundSize:"28px 28px" }} />

      <div className="relative z-10">
        <SectionHeader title="New &amp; available" subtitle={userCountry ? "Fresh titles in your country" : "Latest releases"}
          linkTo="/movies" linkLabel="Browse all" icon={FiZap} color="#a78bfa" />

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length:6 }).map((_,i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth:"thin" }}>
            {items.map((item,i) => (
              <motion.div key={item.id+item._type} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}>
                <MediaCard item={item} type={item._type} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}