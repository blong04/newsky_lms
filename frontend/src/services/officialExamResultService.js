import api from "../api/axios";
import { unwrapData } from "../utils/http";

export const officialExamResultService = {
  getMine: () => api.get("/student/official-exam-results").then(unwrapData),
  create: (payload) => api.post("/student/official-exam-results", payload).then(unwrapData),
};
