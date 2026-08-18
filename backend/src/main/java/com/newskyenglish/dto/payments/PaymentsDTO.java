package com.newskyenglish.dto.payments;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

// Gom request/response cho bước xem trước thanh toán, render QR và thống kê doanh thu.
public class PaymentsDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PreviewRequest {
        @NotNull(message = "Thiếu courseId")
        private Long courseId;

        @NotNull(message = "Thiếu classId")
        private Long classId;

        @NotBlank(message = "Thiếu phương thức thanh toán")
        private String paymentMethod;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PreviewResponse {
        private String paymentMethod;
        private String providerName;
        private BigDecimal amount;
        private String qrImageUrl;
        private String paymentCode;
        private String transferContent;
        private String accountName;
        private String accountNumber;
        private String bankName;
        private String bankBin;
        private String walletId;
        private Boolean manualReviewRequired;
        private Boolean mockMode;
        private String note;
        private String instruction;
        private String actionLabel;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    // Dùng cho màn quản trị liệt kê từng giao dịch đã join sẵn thông tin học viên/khóa học.
    public static class AdminResponse {
        private Long id;
        private Long enrollmentId;
        private Long userId;
        private String userName;
        private String userEmail;
        private Long courseId;
        private String courseName;
        private Long classId;
        private String className;
        private BigDecimal amount;
        private String paymentMethod;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime paidAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    // Một dòng doanh thu theo khóa học hoặc theo phương thức thanh toán.
    public static class RevenueBreakdownItem {
        private String label;
        private BigDecimal amount;
        private Long count;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    // Doanh thu gộp theo tháng để vẽ biểu đồ xu hướng.
    public static class MonthlyRevenueItem {
        private String month;
        private BigDecimal amount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatsResponse {
        private BigDecimal totalRevenue;
        private BigDecimal pendingAmount;
        private Long paidCount;
        private Long pendingCount;
        private List<RevenueBreakdownItem> revenueByMethod;
        private List<RevenueBreakdownItem> revenueByCourse;
        private List<MonthlyRevenueItem> monthlyRevenue;
    }
}
