package com.newskyenglish.dto.payments;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

// Gom request/response cho bước xem trước thanh toán và render QR.
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
}
