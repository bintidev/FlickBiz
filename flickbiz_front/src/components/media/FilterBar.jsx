import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiFilter, FiX, FiChevronDown } from "react-icons/fi";

const ORDERINGS = [
  { value: "-release_date", label: "Newest first" },
  { value: "release_date",  label: "Oldest first" },
  { value: "-average_rating", label: "Top rated" },
  { value: "-popularity",  label: "Most popular" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
];

function FilterSelect({ label, value, onChange, options, color = "#ff3f6c" }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
        style={{
          background: value ? `${color}15` : "rgba(255,255,255,0.04)",
          border: `1px solid ${value ? color + "55" : "rgba(255,255,255,0.08)"}`,
          color: value ? color : "#c0c0d0",
          fontFamily: "var(--font-display)",
          cursor: "none",
        }}
      >
        <option value="" style={{ background: "#0a0a12" }}>{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "#0a0a12" }}>{o.label}</option>
        ))}
      </select>
      <FiChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: value ? color : "#8888aa" }} />
    </div>
  );
}

export default function FilterBar({ filters, setFilter, resetFilters, genres = [], showDirector = false }) {
  const [open, setOpen] = useState(false);
  const hasActive = filters.genre || filters.year_min || filters.year_max || filters.language || (showDirector && filters.director);

  const genreOptions = genres.map((g) => ({ value: g.name, label: g.name }));

  return (
    <div className="mb-8">
      {/* Top bar — search + filter toggle */}
      <div className="flex gap-3 flex-wrap items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#8888aa" }} />
          <motion.input
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder="Search titles..."
            whileFocus={{ borderColor: "#ff3f6c", boxShadow: "0 0 0 3px rgba(255,63,108,0.1)" }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#f0f0f5",
              fontFamily: "var(--font-body)",
            }}
          />
          {filters.search && (
            <button onClick={() => setFilter("search", "")} className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "#8888aa", cursor: "none" }}>
              <FiX size={14} />
            </button>
          )}
        </div>

        {/* Ordering */}
        <FilterSelect label="Sort by" value={filters.ordering} onChange={(v) => setFilter("ordering", v)}
          options={ORDERINGS} color="#ff8c42" />

        {/* Filter toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
          style={{
            background: open || hasActive ? "rgba(255,63,108,0.12)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${open || hasActive ? "rgba(255,63,108,0.4)" : "rgba(255,255,255,0.08)"}`,
            color: open || hasActive ? "#ff3f6c" : "#c0c0d0",
            fontFamily: "var(--font-display)",
            cursor: "none",
          }}
          data-cursor
        >
          <FiFilter size={14} />
          Filters
          {hasActive && (
            <span className="w-2 h-2 rounded-full" style={{ background: "#ff3f6c", boxShadow: "0 0 6px #ff3f6c" }} />
          )}
          <motion.span animate={{ rotate: open ? 180 : 0 }}>
            <FiChevronDown size={13} />
          </motion.span>
        </motion.button>

        {/* Reset */}
        {hasActive && (
          <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "rgba(255,63,108,0.08)", border: "1px solid rgba(255,63,108,0.25)", color: "#ff3f6c", fontFamily: "var(--font-display)", cursor: "none" }}
            data-cursor>
            <FiX size={13} /> Clear
          </motion.button>
        )}
      </div>

      {/* Expandable filters */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex gap-3 flex-wrap p-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <FilterSelect label="Genre" value={filters.genre} onChange={(v) => setFilter("genre", v)}
                options={genreOptions} color="#a78bfa" />
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Year from" value={filters.year_min}
                  onChange={(e) => setFilter("year_min", e.target.value)}
                  className="w-28 px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: filters.year_min ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${filters.year_min ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.08)"}`, color: filters.year_min ? "#34d399" : "#c0c0d0", fontFamily: "var(--font-body)" }} />
                <span style={{ color: "#8888aa" }}>–</span>
                <input type="number" placeholder="Year to" value={filters.year_max}
                  onChange={(e) => setFilter("year_max", e.target.value)}
                  className="w-28 px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: filters.year_max ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${filters.year_max ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.08)"}`, color: filters.year_max ? "#34d399" : "#c0c0d0", fontFamily: "var(--font-body)" }} />
              </div>
              <FilterSelect label="Language" value={filters.language} onChange={(v) => setFilter("language", v)}
                options={LANGUAGES} color="#60a5fa" />
              {showDirector && (
                <input placeholder="Director" value={filters.director || ""}
                  onChange={(e) => setFilter("director", e.target.value)}
                  className="px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: filters.director ? "rgba(255,140,66,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${filters.director ? "rgba(255,140,66,0.4)" : "rgba(255,255,255,0.08)"}`, color: filters.director ? "#ff8c42" : "#c0c0d0", fontFamily: "var(--font-body)", minWidth: 160 }} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}