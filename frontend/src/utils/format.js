// Định dạng học phí theo chuẩn tiền tệ giao diện đang dùng.
export const formatCoursePrice = (value) => {
  const amount = Number(value || 0);
  return amount > 0 ? `${amount.toLocaleString("vi-VN")}đ` : "Miễn phí";
};

// Định dạng bộ đếm ngược dạng mm:ss cho màn làm bài.
export const formatCountdown = (seconds) => (
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
);
