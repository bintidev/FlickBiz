import { motion } from "framer-motion";
import { FiTrendingUp } from "react-icons/fi";
import SectionHeader from "./SectionHeader";
import MediaCard from "./MediaCard";

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 rounded-2xl overflow-hidden animate-pulse"
      style={{ width:150, aspectRatio:"2/3", background:"linear-gradient(135deg,#1a1a26,#13131e)" }} />
  );
}

export default function TrendingSection({ trending, loading }) {
  const items = Array.isArray(trending) ? trending.slice(0, 10) : [];

  return (
    <div className="rounded-3xl p-6 relative overflow-hidden"
      style={{ background:"#0d0d16", border:"1px solid rgba(255,255,255,0.07)" }}>

      {/* Accent glow */}
      <motion.div animate={{ opacity:[0.04,0.09,0.04] }} transition={{ duration:4, repeat:Infinity }}
        className="absolute -top-16 -right-16 rounded-full pointer-events-none"
        style={{ width:200, height:200, background:"#ff3f6c", filter:"blur(60px)" }} />

      {/* Diagonal stripes */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage:"repeating-linear-gradient(45deg,#ff3f6c 0,#ff3f6c 1px,transparent 0,transparent 50%)", backgroundSize:"28px 28px" }} />

      <div className="relative z-10">
        <SectionHeader title="Trending this week" subtitle="Most popular right now"
          linkTo="/movies" linkLabel="See all" icon={FiTrendingUp} color="#ff3f6c" />

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length:6 }).map((_,i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FiTrendingUp size={36} style={{ color:"#8888aa" }} />
            <p className="text-sm mt-3 text-center" style={{ color:"#8888aa" }}>
              No trending data yet. Run <code className="px-1.5 py-0.5 rounded-lg text-xs" style={{ background:"#1a1a26", color:"#ff3f6c" }}>update_trends</code> to populate.
            </p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth:"thin" }}>
            {items.map((t, i) => (
              <motion.div key={i} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}>
                <MediaCard item={t.movie || t.series} type={t.movie ? "movie" : "series"} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}