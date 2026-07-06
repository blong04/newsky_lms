import api from "../api/axios";
import { unwrapData } from "../utils/http";

export const notificationService = {
  getMine: () => api.get("/notifications/my").then(unwrapData),
  markRead: (id) => api.put(`/notifications/${id}/read`).then(unwrapData),
  markAllRead: () => api.put("/notifications/read-all").then(unwrapData),
  sendAdmin: (payload) => api.post("/admin/notifications/send", payload).then(unwrapData),
  sendTeacher: (payload) => api.post("/teacher/notifications/send", payload).then(unwrapData),
};
