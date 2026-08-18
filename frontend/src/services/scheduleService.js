import api from "../api/axios";
import { unwrapData } from "../utils/http";

export const scheduleService = {
  getAll: () => api.get("/schedules").then(unwrapData),
  getByClass: (classId) => api.get(`/schedules/class/${classId}`).then(unwrapData),
  create: (payload) => api.post("/schedules", payload).then(unwrapData),
  update: (id, payload) => api.put(`/schedules/${id}`, payload).then(unwrapData),
  delete: (id) => api.delete(`/schedules/${id}`).then(unwrapData),
};
