import api from "../api/axios";
import { unwrapData, unwrapResponse } from "../utils/http";

export const authService = {
  login: (email, password) => api.post("/auth/login", { email, password }).then(unwrapData),
  register: (data) => api.post("/auth/register", data).then(unwrapResponse),
};
