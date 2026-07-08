import api from "../api/axios";
import { unwrapData, unwrapResponse } from "../utils/http";

export const authService = {
  login: (email, password) => api.post("/auth/login", { email, password }).then(unwrapData),
  checkEmailAvailability: (email) => api.get("/auth/check-email", { params: { email } }).then(unwrapData),
  requestRegisterOtp: (data) => api.post("/auth/register/request-otp", data).then(unwrapResponse),
  verifyRegisterOtp: (data) => api.post("/auth/register/verify-otp", data).then(unwrapResponse),
};
