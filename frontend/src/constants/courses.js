// Cấp độ khóa học hiển thị ở catalog và trang quản trị.
export const LEVEL_LABELS = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

export const COURSE_STATUS_LABELS = {
  active: "Đang mở",
  inactive: "Tạm ẩn",
};

export const EXAM_BADGES = {
  IELTS: "badge-blue",
  TOEIC: "badge-green",
  OTHER: "badge-gray",
};

export const getExamBadgeClass = (examType) => EXAM_BADGES[examType] || "badge-gray";
