import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiStar, FiHeart } from "react-icons/fi";
import { likeReview } from "../../services/reviewService";
import SectionHeader from "./SectionHeader";
import toast from "react-hot-toast";

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length:5 }).map((_,i) => (
        <FiStar key={i} size={11}
          fill={i < rating ? "#ff8c42" : "none"}
          color={i < rating ? "#ff8c42" : "#555566"} />
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(review.likes_count || 0);

  const handleLike = async () => {
    try {
      const res = await likeReview(review.id);
      setLiked(res.data.liked);
      setCount((c) => res.data.liked ? c+1 : c-1);
    } catch { toast.error("Could not like review."); }
  };

  return (
    <motion.div
      whileHover={{ y:-3, borderColor:"rgba(255,63,108,0.28)", boxShadow:"0 8px 30px rgba(255,63,108,0.06)" }}
      className="rounded-2xl p-5 flex gap-4 transition-all relative overflow-hidden"
      style={{ background:"#13131e", border:"1px solid rgba(255,255,255,0.06)" }}>

      {/* Accent line */}
      <motion.div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-2xl"
        style={{ background:"linear-gradient(to bottom,#ff3f6c,#ff8c42)", opacity:0.6 }} />

      {review.media_poster && (
        <img src={review.media_poster} alt="" className="w-12 h-16 rounded-xl object-cover flex-shrink-0"
          style={{ filter:"brightness(0.82)" }} />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <p className="font-bold text-sm truncate" style={{ fontFamily:"var(--font-display)" }}>{review.title}</p>
          <StarRating rating={review.rating} />
        </div>
        {review.media_title && (
          <p className="text-xs mb-1 font-medium" style={{ color:"#ff8c42" }}>{review.media_title}</p>
        )}
        <p className="text-xs mb-3 line-clamp-2" style={{ color:"#8888aa", lineHeight:1.6 }}>{review.preview}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background:"linear-gradient(135deg,#ff3f6c,#ff8c42)", color:"white", fontFamily:"var(--font-display)" }}>
              {review.user?.username?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs" style={{ color:"#8888aa" }}>{review.user?.username}</span>
          </div>
          <motion.button whileHover={{ scale:1.15 }} whileTap={{ scale:0.85 }}
            onClick={handleLike}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
            style={{ color: liked ? "#ff3f6c":"#8888aa", background: liked ? "rgba(255,63,108,0.1)":"transparent", cursor:"none" }}
            data-cursor>
            <FiHeart size={12} fill={liked ? "#ff3f6c":"none"} />
            {count}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function PopularReviewsSection({ reviews, loading }) {
  const items = Array.isArray(reviews) ? reviews.slice(0,6) : [];

  return (
    <div className="rounded-3xl p-6 relative overflow-hidden"
      style={{ background:"#0d0d16", border:"1px solid rgba(255,255,255,0.07)" }}>

      <motion.div animate={{ x:[0,20,0], opacity:[0.04,0.08,0.04] }} transition={{ duration:6, repeat:Infinity }}
        className="absolute -bottom-16 -right-16 rounded-full pointer-events-none"
        style={{ width:200, height:200, background:"#60a5fa", filter:"blur(60px)" }} />

      <div className="relative z-10">
        <SectionHeader title="Popular reviews" subtitle="Most liked by the community"
          linkTo="/reviews" linkLabel="All reviews" icon={FiStar} color="#ff8c42" />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length:6 }).map((_,i) => (
              <div key={i} className="rounded-2xl animate-pulse h-32" style={{ background:"#1a1a26" }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FiStar size={36} style={{ color:"#8888aa" }} />
            <p className="text-sm mt-3" style={{ color:"#8888aa" }}>No reviews yet. Be the first to write one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((review,i) => (
              <motion.div key={review.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}>
                <ReviewCard review={review} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}