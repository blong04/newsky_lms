import api from "../api/axios";
import { unwrapData } from "../utils/http";

export const assignmentService = {
  getAll: () => api.get("/assignments").then(unwrapData),
  getTeacherAssignments: () => api.get("/teacher/assignments").then(unwrapData),
  getSubmissions: (assignmentId) => api.get(`/assignments/${assignmentId}/submissions`).then(unwrapData),
  getUserSubmissions: (userId) => api.get(`/assignments/submit/user/${userId}`).then(unwrapData),
  getTeacherStudentSubmissions: (userId) => api.get(`/teacher/students/${userId}/assignments/submissions`).then(unwrapData),
  submit: (assignmentId, payload) => api.post(`/assignments/${assignmentId}/submit`, payload).then(unwrapData),
  createTeacherAssignment: (payload) => api.post("/teacher/assignments", payload).then(unwrapData),
  update: (id, payload) => api.put(`/assignments/${id}`, payload).then(unwrapData),
  delete: (id) => api.delete(`/assignments/${id}`).then(unwrapData),
  gradeSubmission: (submissionId, payload) => api.put(`/assignments/submissions/${submissionId}/grade`, payload).then(unwrapData),
};
