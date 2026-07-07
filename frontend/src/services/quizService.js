import api from "../api/axios";
import { unwrapData } from "../utils/http";

export const quizService = {
  getAll: () => api.get("/quizzes").then(unwrapData),
  getByClass: (classId) => api.get(`/quizzes/class/${classId}`).then(unwrapData),
  getFullQuiz: (quizId) => api.get(`/quizzes/${quizId}/full`).then(unwrapData),
  getTeacherQuizzes: () => api.get("/teacher/quizzes").then(unwrapData),
  getTeacherQuizSubmissions: (quizId) => api.get(`/teacher/quizzes/${quizId}/submissions`).then(unwrapData),
  getUserSubmissions: (userId) => api.get(`/quizzes/submissions/user/${userId}`).then(unwrapData),
  getTeacherStudentSubmissions: (userId) => api.get(`/teacher/students/${userId}/quizzes/submissions`).then(unwrapData),
  getStudentQuiz: (quizId) => api.get(`/student/quiz/${quizId}`).then(unwrapData),
  submitStudentQuiz: (quizId, payload) => api.post(`/student/quiz/${quizId}/submit`, payload).then(unwrapData),
  create: (payload) => api.post("/quizzes", payload).then(unwrapData),
  update: (id, payload) => api.put(`/quizzes/${id}`, payload).then(unwrapData),
  delete: (id) => api.delete(`/quizzes/${id}`).then(unwrapData),
  gradeTeacherSubmission: (submissionId, payload) => api.put(`/teacher/quiz-submissions/${submissionId}/grade`, payload).then(unwrapData),
};
