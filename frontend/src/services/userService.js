import api from "../api/axios";
import { unwrapData } from "../utils/http";

export const userService = {
  getAll: () => api.get("/users").then(unwrapData),
  getById: (id) => api.get(`/users/${id}`).then(unwrapData),
  create: (data) => api.post("/users", data).then(unwrapData),
  update: (id, data) => api.put(`/users/${id}`, data).then(unwrapData),
  changePassword: (id, data) => api.put(`/users/${id}/change-password`, data).then(unwrapData),
  delete: (id) => api.delete(`/users/${id}`).then(unwrapData),
  getPendingTeachers: () => api.get("/admin/pending-teachers").then(unwrapData),
  approveTeacher: (id) => api.put(`/admin/users/${id}/approve`).then(unwrapData),
  rejectTeacher: (id) => api.delete(`/admin/users/${id}/reject`).then(unwrapData),
};
