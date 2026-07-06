// Icon hiển thị theo loại thông báo trong inbox các vai trò.
export const NOTIFICATION_TYPE_ICONS = {
  course: "📚",
  schedule: "📅",
  assignment: "📋",
  system: "⚙️",
  announcement: "📣",
};

// Danh sách loại thông báo admin có thể chọn khi broadcast.
export const ADMIN_NOTIFICATION_TYPE_OPTIONS = [
  { value: "announcement", label: "📣 Thông báo chung" },
  { value: "system", label: "⚙️ Hệ thống" },
  { value: "course", label: "📚 Khóa học" },
  { value: "schedule", label: "📅 Lịch học" },
];

// Danh sách loại thông báo giáo viên dùng nhiều nhất.
export const TEACHER_NOTIFICATION_TYPE_OPTIONS = [
  { value: "course", label: "📚 Về khóa học" },
  { value: "schedule", label: "📅 Về lịch học" },
  { value: "assignment", label: "📋 Về bài tập" },
  { value: "announcement", label: "📣 Thông báo chung" },
];
