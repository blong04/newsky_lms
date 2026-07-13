// Danh sách phương thức thanh toán ở màn đăng ký khóa học.
export const PAYMENT_METHOD_OPTIONS = [
  {
    value: "BANK_TRANSFER",
    label: "Tài khoản ngân hàng",
    icon: "🏦",
    description: "Quét QR hoặc chuyển khoản đúng số tiền, admin sẽ kiểm tra rồi phê duyệt.",
  },
  {
    value: "VNPAY",
    label: "VNPAY",
    icon: "💠",
    description: "Đang chạy ở chế độ demo QR để test luồng thanh toán thành công.",
  },
  {
    value: "MOMO",
    label: "MoMo",
    icon: "🟣",
    description: "Đang chạy ở chế độ demo QR để test luồng thanh toán thành công.",
  },
  {
    value: "DEFERRED",
    label: "Bỏ qua thanh toán",
    icon: "🕒",
    description: "Gửi yêu cầu nợ học phí để admin phê duyệt rồi mới được vào lớp.",
  },
];

// Label nhanh để hiển thị trong bảng và modal chi tiết.
export const PAYMENT_METHOD_LABELS = Object.fromEntries(
  PAYMENT_METHOD_OPTIONS.map((option) => [option.value, option.label])
);

// Các phương thức hiện được mô phỏng như thanh toán thành công ngay.
export const INSTANT_PAYMENT_METHODS = ["VNPAY", "MOMO"];
