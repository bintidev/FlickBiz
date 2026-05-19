import api from "./api";

export const getNotifications = () => api.get("/notifications/");
export const markRead = (id) => api.post(`/notifications/${id}/`);
export const markAllRead = () => api.post("/notifications/read-all/");
export const deleteNotification = (id) => api.delete(`/notifications/${id}/`);