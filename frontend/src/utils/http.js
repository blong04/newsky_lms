// Lấy phần data chuẩn từ ApiResponse của backend để page không phải chạm trực tiếp vào axios response.
export const unwrapData = (response) => response.data?.data ?? response.data;

// Giữ lại toàn bộ payload khi frontend cần cả message lẫn data.
export const unwrapResponse = (response) => response.data;
