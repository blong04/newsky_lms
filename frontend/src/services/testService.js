import api from "../api/axios";
import { unwrapData } from "../utils/http";

export const testService = {
  getAll: () => api.get("/tests").then(unwrapData),
  getByClass: (classId) => api.get(`/tests/class/${classId}`).then(unwrapData),
  getById: (testId) => api.get(`/tests/${testId}`).then(unwrapData),
  getFullTest: (testId) => api.get(`/tests/${testId}/full`).then(unwrapData),
  getStudentTest: (testId) => api.get(`/tests/student/${testId}`).then(unwrapData),
  submitStudentTest: (testId, payload) => api.post(`/tests/student/${testId}/submit`, payload).then(unwrapData),
  getTeacherTests: () => api.get("/tests/teacher").then(unwrapData),
  getTeacherTestSubmissions: (testId) => api.get(`/tests/teacher/${testId}/submissions`).then(unwrapData),
  getUserSubmissions: (userId) => api.get(`/tests/submissions/user/${userId}`).then(unwrapData),
  getTeacherStudentSubmissions: (userId) => api.get(`/tests/teacher/students/${userId}/submissions`).then(unwrapData),
  create: (payload) => api.post("/tests", payload).then(unwrapData),
  update: (testId, payload) => api.put(`/tests/${testId}`, payload).then(unwrapData),
  delete: (testId) => api.delete(`/tests/${testId}`).then(unwrapData),
  gradeTeacherSubmission: (submissionId, payload) => api.put(`/tests/teacher/submissions/${submissionId}/grade`, payload).then(unwrapData),
};
