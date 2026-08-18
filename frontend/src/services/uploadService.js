import api from "../api/axios";
import { unwrapData } from "../utils/http";

export const uploadService = {
  // Upload ảnh/audio của câu hỏi lên Cloudinary qua backend, trả về { url }.
  uploadQuestionMedia: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post("/admin/uploads/question-media", formData, {
        headers: { "Content-Type": undefined },
      })
      .then(unwrapData);
  },

  // Upload ảnh/PDF chứng chỉ điểm thi chính thức (học viên tự nộp), trả về { url }.
  uploadCertificate: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post("/student/uploads/certificate", formData, {
        headers: { "Content-Type": undefined },
      })
      .then(unwrapData);
  },
};
