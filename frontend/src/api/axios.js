import axios from "axios";

// Cho phép đổi nhanh API URL qua env, mặc định local khi phát triển.
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

// Tự động gắn token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tự động redirect nếu hết hạn token
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const hadToken = Boolean(localStorage.getItem("token"));
    if (err.response?.status === 401 && hadToken) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default api;
