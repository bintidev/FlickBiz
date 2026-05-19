import api from "./api";

export const getReviews = (params) => api.get("/reviews/", { params });
export const getPopularReviews = () => api.get("/reviews/popular/");
export const createReview = (data) => api.post("/reviews/create/", data);
export const updateReview = (id, data) => api.patch(`/reviews/${id}/`, data);
export const deleteReview = (id) => api.delete(`/reviews/${id}/`);
export const likeReview = (id) => api.post(`/reviews/${id}/like/`);