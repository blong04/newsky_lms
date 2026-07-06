// Các trạng thái enrollment được xem là đang có quyền học hoặc làm bài.
export const ACTIVE_ENROLLMENT_STATUSES = ["approved", "enrolled", "completed"];

// Meta hiển thị cho bảng và card liên quan tới ghi danh khóa học.
export const ENROLLMENT_STATUS_META = {
  pending: { label: "⏳ Chờ duyệt", badge: "badge-yellow" },
  approved: { label: "✅ Đã duyệt", badge: "badge-blue" },
  enrolled: { label: "📚 Đang học", badge: "badge-green" },
  completed: { label: "🎓 Hoàn thành", badge: "badge-gray" },
  rejected: { label: "❌ Từ chối", badge: "badge-red" },
  dropped: { label: "❌ Đã hủy", badge: "badge-red" },
};

export const ENROLLMENT_STATUS_LABELS = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  enrolled: "Đang học",
  completed: "Hoàn thành",
  rejected: "Từ chối",
  dropped: "Đã hủy",
};

export const ENROLLMENT_STATUS_BADGES = Object.fromEntries(
  Object.entries(ENROLLMENT_STATUS_META).map(([key, value]) => [key, value.badge])
);
