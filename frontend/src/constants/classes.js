// Trạng thái lớp học dùng cho các màn admin, teacher và student.
export const CLASS_STATUS_BADGES = {
  pending: "badge-yellow",
  active: "badge-green",
  completed: "badge-gray",
  cancelled: "badge-red",
};

export const CLASS_STATUS_LABELS = {
  pending: "Chờ khai giảng",
  active: "Đang học",
  completed: "Kết thúc",
  cancelled: "Đã hủy",
};

// Trạng thái lịch học được tính từ thời gian thực ở frontend.
export const SCHEDULE_STATUS_BADGES = {
  scheduled: "badge-blue",
  ongoing: "badge-green",
  completed: "badge-gray",
  cancelled: "badge-red",
};

export const SCHEDULE_STATUS_LABELS = {
  scheduled: "Sắp diễn ra",
  ongoing: "Đang diễn ra",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};
