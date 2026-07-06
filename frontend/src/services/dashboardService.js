import api from "../api/axios";
import { unwrapData } from "../utils/http";

export const dashboardService = {
  getAdminStats: () => api.get("/admin/stats").then(unwrapData),
  getStudentDashboard: () => api.get("/student/dashboard").then(unwrapData),
  getTeacherDashboard: () => api.get("/teacher/dashboard").then(unwrapData),
};
