import api from "../api/axios";

export const userService = {
  getAll: () => api.get("/users").then((res) => res.data),
  getById: (id) => api.get(`/users/${id}`).then((res) => res.data),
  create: (data) => api.post("/users", data).then((res) => res.data),
  update: (id, data) =>
    api.put(`/users/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/users/${id}`).then((res) => res.data),
};
