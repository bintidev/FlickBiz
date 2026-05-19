import api from "./api";

export const getMovies = (params) => api.get("/media/movies/", { params });
export const getSeries = (params) => api.get("/media/series/", { params });
export const getMovieDetail = (id) => api.get(`/media/movies/${id}/`);
export const getSeriesDetail = (id) => api.get(`/media/series/${id}/`);
export const getTrending = () => api.get("/media/trending/");
export const getDiscover = () => api.get("/media/discover/");
export const getGenres = () => api.get("/media/genres/");
export const getFavorites = () => api.get("/media/favorites/");
export const toggleFavorite = (data) => api.post("/media/favorites/", data);
export const removeFavorite = (data) => api.delete("/media/favorites/", { data });
export const getStatuses = () => api.get("/media/status/");
export const setStatus = (data) => api.post("/media/status/", data);
export const removeStatus = (data) => api.delete("/media/status/", { data });