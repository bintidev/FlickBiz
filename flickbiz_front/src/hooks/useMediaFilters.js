import { useState, useCallback } from "react";

export function useMediaFilters(defaults = {}) {
  const [filters, setFilters] = useState({
    search: "",
    genre: "",
    year_min: "",
    year_max: "",
    language: "",
    ordering: "-release_date",
    ...defaults,
  });

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ search: "", genre: "", year_min: "", year_max: "", language: "", ordering: "-release_date", ...defaults });
  }, []);

  // Build clean params object — remove empty strings
  const params = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== "")
  );

  return { filters, setFilter, resetFilters, params };
}