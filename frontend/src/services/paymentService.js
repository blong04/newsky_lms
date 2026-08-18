import api from "../api/axios";
import { unwrapData } from "../utils/http";

export const paymentService = {
  previewStudentPayment: (payload) => api.post("/student/payments/preview", payload).then(unwrapData),
  getAdminPayments: (params = {}) => api.get("/admin/payments", { params }).then(unwrapData),
  getStats: () => api.get("/admin/payments/stats").then(unwrapData),
};
