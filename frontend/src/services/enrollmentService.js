import api from "../api/axios";
import { unwrapData } from "../utils/http";

export const enrollmentService = {
  getAll: () => api.get("/enrollments").then(unwrapData),
  getAdminDetails: (params = {}) => api.get("/admin/enrollments/details", { params }).then(unwrapData),
  getTeacherStudentsOverview: (params = {}) => api.get("/teacher/students", { params }).then(unwrapData),
  getStudentEnrollments: () => api.get("/student/enrollments").then(unwrapData),
  createStudentEnrollment: (payload) => api.post("/student/enroll", payload).then(unwrapData),
  requestFreeRetake: (sourceEnrollmentId, payload) =>
    api.post(`/student/enrollments/${sourceEnrollmentId}/request-free-retake`, payload).then(unwrapData),
  approve: (id) => api.put(`/admin/enrollments/${id}/approve`).then(unwrapData),
  updateStatus: (id, payload) => api.put(`/enrollments/${id}`, payload).then(unwrapData),
  cancel: (id) => api.put(`/enrollments/${id}/cancel`).then(unwrapData),
};
