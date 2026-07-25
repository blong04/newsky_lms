import api from "../api/axios";
import { unwrapData } from "../utils/http";

export const classService = {
  getPublicClasses: () => api.get("/classes").then(unwrapData),
  getAdminClasses: (params = {}) => api.get("/admin/classes", { params }).then(unwrapData),
  createAdminClass: (payload) => api.post("/admin/classes", payload).then(unwrapData),
  updateAdminClass: (id, payload) => api.put(`/admin/classes/${id}`, payload).then(unwrapData),
  deleteAdminClass: (id) => api.delete(`/admin/classes/${id}`).then(unwrapData),
  getTeacherClasses: (params = {}) => api.get("/teacher/classes", { params }).then(unwrapData),
  getTeacherClassStudents: (classId) => api.get(`/teacher/classes/${classId}/students`).then(unwrapData),
};
