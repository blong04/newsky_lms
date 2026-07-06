import api from "../api/axios";
import { unwrapData } from "../utils/http";

export const scheduleService = {
  getByClass: (classId) => api.get(`/schedules/class/${classId}`).then(unwrapData),
};
