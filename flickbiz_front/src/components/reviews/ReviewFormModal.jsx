import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiStar, FiSearch } from "react-icons/fi";
import { createReview, updateReview } from "../../services/reviewService";
import { getMovies, getSeries } from "../../services/mediaService";
import toast from "react-hot-toast";

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.button key={i} type="button"
          whileHover={{ scale: 1.2 }} whileTap={{ scale: .8 }}
          onMouseEnter={() => setHover(i + 1)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i + 1)}
          data-cursor style={{ cursor: "none" }}>
          <FiStar size={24}
            fill={(hover || value) > i ? "#ff8c42" : "none"}
            color={(hover || value) > i ? "#ff8c42" : "#44445a"} />
        </motion.button>
      ))}
    </div>
  );
}

export default function ReviewFormModal({ review, onClose, onSaved }) {
  const isEdit = !!review;
  const [rating, setRating]         = useState(review?.rating || 0);
  const [loading, setLoading]       = useState(false);
  const [mediaType, setMediaType]   = useState(review?.movie ? "movie" : "series");
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaResults, setMediaResults] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(
    review?.movie ? { id: review.movie, title: review.media_title, type: "movie" }
    : review?.series ? { id: review.series, title: review.media_title, type: "series" }
    : null
  );
  const [searching, setSearching] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { 
      title: review?.title || "", 
      body: review?.preview || review?.body || "" 
    },
  });

  useEffect(() => {
    if (review) {
      reset({
        title: review.title || "",
        body: review.preview || review.body || ""
      });
      setRating(review.rating || 0);
      setSelectedMedia(
        review.movie ? { id: review.movie, title: review.media_title, type: "movie" }
        : review.series ? { id: review.series, title: review.media_title, type: "series" }
        : null
      );
    }
  }, [review, reset]);

  useEffect(() => {
    if (!mediaSearch || mediaSearch.length < 2) { setMediaResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const fn = mediaType === "movie" ? getMovies : getSeries;
        const res = await fn({ search: mediaSearch, page_size: 5 });
        setMediaResults(res.data.results || []);
      } catch (e) { console.error(e); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [mediaSearch, mediaType]);

  const onSubmit = async (data) => {
    if (!rating) { toast.error("Please select a rating"); return; }
    if (!isEdit && !selectedMedia) { toast.error("Please select a movie or series"); return; }
    
    setLoading(true);
    
    try {
      const payload = {
        title: data.title,
        body: data.body, 
        rating,
      };

      if (isEdit) {
        if (review.movie) payload.movie = review.movie;
        if (review.series) payload.series = review.series;
      } else {
        if (selectedMedia?.type === "movie") payload.movie = selectedMedia.id;
        if (selectedMedia?.type === "series") payload.series = selectedMedia.id;
      }

      if (isEdit) {
        const res = await updateReview(review.id, payload);
        
        const updatedReviewForUI = {
          ...review, 
          ...res.data, 
          preview: res.data.body || data.body 
        };

        toast.success("Review updated successfully!");
        onSaved(updatedReviewForUI);
      } else {
        await createReview(payload);
        toast.success("Review published successfully!");
        onSaved();
      }
    } catch (e) {
      console.error("Error saving review:", e.response?.data);
      const msg = e.response?.data?.non_field_errors?.[0] || "Error saving changes";
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#f0f0f5",
    borderRadius: 12,
    outline: "none",
    fontFamily: "var(--font-body)",
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1, backdropFilter: "blur(12px)", backgroundColor: "rgba(0,0,0,0.85)" }}
      exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div onClick={e => e.stopPropagation()}
        initial={{ scale: .88, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: .88, opacity: 0, y: 40 }}
        className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: "#080812", border: "1px solid rgba(255,63,108,0.2)" }}>

        <div className="relative z-10 p-7">
          <button onClick={onClose} className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors">
            <FiX size={20} />
          </button>

          <h2 className="text-2xl font-black mb-1 uppercase tracking-tight text-white">
            {isEdit ? "Edit Review" : "Write a Review"}
          </h2>
          <p className="text-sm text-zinc-500 mb-6 font-mono">
            {isEdit ? "// MODIFYING_LOG_NODE" : "// INITIALIZING_NEW_LOG"}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {!isEdit && (
              <div>
                <div className="flex gap-2 mb-3">
                  {["movie", "series"].map(t => (
                    <button key={t} type="button"
                      onClick={() => { setMediaType(t); setSelectedMedia(null); setMediaSearch(""); setMediaResults([]); }}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${mediaType === t ? "bg-[#ff3f6c]/10 border-[#ff3f6c]/40 text-[#ff3f6c]" : "bg-white/5 border-white/10 text-zinc-500"}`}>
                      {t}
                    </button>
                  ))}
                </div>

                {selectedMedia ? (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#ff8c42]/10 border border-[#ff8c42]/20">
                    <p className="text-sm font-bold text-[#ff8c42] flex-1">{selectedMedia.title}</p>
                    <button type="button" onClick={() => setSelectedMedia(null)} className="text-zinc-500 hover:text-white">
                      <FiX size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input value={mediaSearch} onChange={e => setMediaSearch(e.target.value)}
                      placeholder={`Search ${mediaType === "movie" ? "movies" : "series"}...`}
                      className="w-full pl-10 pr-4 py-3 text-sm" style={inputStyle} />
                    <AnimatePresence>
                      {mediaResults.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                          className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-30 bg-[#0d0d18] border border-white/10 shadow-2xl">
                          {mediaResults.map(m => (
                            <button key={m.id} type="button" onClick={() => { setSelectedMedia({ id: m.id, title: m.title || m.name, type: mediaType }); setMediaSearch(""); setMediaResults([]); }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                              {m.poster && <img src={m.poster} alt="" className="w-8 h-10 rounded-lg object-cover" />}
                              <span className="font-bold text-zinc-300">{m.title || m.name}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Rating</label>
              <StarPicker value={rating} onChange={setRating} />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Review Title</label>
              <input {...register("title", { required: "Title is required" })} placeholder="Brief title..."
                className="w-full px-4 py-3 text-sm" style={inputStyle} />
              {errors.title && <p className="text-[9px] mt-1 text-[#ff3f6c] uppercase font-bold tracking-widest">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Review Content</label>
              <textarea {...register("body", { required: "Review body is required", minLength: { value: 20, message: "Minimum 20 characters required" } })}
                placeholder="Tell us your thoughts..." rows={5}
                className="w-full px-4 py-3 text-sm resize-none"
                style={{ ...inputStyle, borderRadius: 16 }} />
              {errors.body && <p className="text-[9px] mt-1 text-[#ff3f6c] uppercase font-bold tracking-widest">{errors.body.message}</p>}
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }}
              className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-black shadow-xl disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#ff3f6c,#ff8c42)" }}>
              {loading ? "Synchronizing..." : (isEdit ? "Save Changes" : "Publish Review")}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}