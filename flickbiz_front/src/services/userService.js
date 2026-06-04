import api from "./api";

export const getProfile       = ()           => api.get("/auth/profile/");
export const updateProfile    = (data)       => api.patch("/auth/profile/", data, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const getPublicProfile = (username)   => api.get(`/auth/profile/${username}/`);
export const getUserStatuses  = (params)     => api.get("/media/status/", { params });
export const getUserFavorites = ()           => api.get("/media/favorites/");
export const getUserReviews   = (username)   => api.get("/reviews/", { params: { user: username } });