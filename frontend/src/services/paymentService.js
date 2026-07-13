import api from "../api/axios";
import { unwrapData } from "../utils/http";

export const paymentService = {
  previewStudentPayment: (payload) => api.post("/student/payments/preview", payload).then(unwrapData),
};
