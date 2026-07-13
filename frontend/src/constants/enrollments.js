// Các trạng thái enrollment được xem là đang có quyền học hoặc làm bài.
export const ACTIVE_ENROLLMENT_STATUSES = ["approved", "completed"];

// Meta hiển thị cho bảng và card liên quan tới ghi danh khóa học.
export const ENROLLMENT_STATUS_META = {
  pending: { label: "⏳ Chờ duyệt", badge: "badge-yellow" },
  approved: { label: "✅ Đã duyệt", badge: "badge-green" },
  completed: { label: "🎓 Hoàn thành", badge: "badge-gray" },
  rejected: { label: "❌ Từ chối", badge: "badge-red" },
  cancelled: { label: "❌ Đã hủy", badge: "badge-red" },
};

export const ENROLLMENT_STATUS_LABELS = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  completed: "Hoàn thành",
  rejected: "Từ chối",
  cancelled: "Đã hủy",
};

export const ENROLLMENT_STATUS_BADGES = Object.fromEntries(
  Object.entries(ENROLLMENT_STATUS_META).map(([key, value]) => [key, value.badge])
);
