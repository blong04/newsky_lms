import api from "../api/axios";
import { unwrapData } from "../utils/http";

export const courseService = {
  getAll: (params = {}) => api.get("/courses", { params }).then(unwrapData),
  getById: (id) => api.get(`/courses/${id}`).then(unwrapData),
  getClasses: (id) => api.get(`/courses/${id}/classes`).then(unwrapData),
  create: (payload) => api.post("/courses", payload).then(unwrapData),
  update: (id, payload) => api.put(`/courses/${id}`, payload).then(unwrapData),
  delete: (id) => api.delete(`/courses/${id}`).then(unwrapData),
};
