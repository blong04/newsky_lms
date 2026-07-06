// Tính trạng thái lớp học dựa trên mốc bắt đầu và kết thúc thực tế.
export const getClassLifecycle = (startDate, endDate) => {
  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start && now < start) {
    return "pending";
  }
  if (end && now > end) {
    return "completed";
  }
  return "active";
};

// Tính trạng thái buổi học theo ngày và khung giờ hiện tại.
export const getScheduleLifecycle = (dateValue, startTimeValue, endTimeValue) => {
  if (!dateValue) {
    return "scheduled";
  }

  const baseDate = new Date(dateValue);
  const start = new Date(baseDate);
  const end = new Date(baseDate);
  const [startHour = 0, startMinute = 0] = String(startTimeValue || "00:00").split(":").map(Number);
  const [endHour = 23, endMinute = 59] = String(endTimeValue || "23:59").split(":").map(Number);
  start.setHours(startHour, startMinute, 0, 0);
  end.setHours(endHour, endMinute, 0, 0);

  const now = new Date();
  if (now < start) {
    return "scheduled";
  }
  if (now > end) {
    return "completed";
  }
  return "ongoing";
};

// Kiểm tra deadline đã hết hạn hay chưa.
export const isDeadlineExpired = (deadline) => deadline && new Date(deadline) < new Date();

// Cảnh báo deadline sắp đến trong vòng 48 giờ.
export const isDeadlineNear = (deadline) => {
  if (!deadline) {
    return false;
  }

  const diff = new Date(deadline) - new Date();
  return diff > 0 && diff < 48 * 60 * 60 * 1000;
};
