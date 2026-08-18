package com.newskyenglish.controller;

import com.newskyenglish.dto.payments.PaymentsDTO;
import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.PaymentsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
// Expose API payment preview để FE render QR, và danh sách/thống kê giao dịch cho admin.
public class PaymentsController {

    private final PaymentsService paymentsService;

    // Trả về dữ liệu xem trước thanh toán theo lớp, khóa học và phương thức được chọn.
    @PostMapping("/student/payments/preview")
    public ResponseEntity<ApiResponse<PaymentsDTO.PreviewResponse>> previewStudentPayment(
            @RequestBody @Valid PaymentsDTO.PreviewRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentsService.previewStudentPayment(request, authorizationHeader)
        ));
    }

    // Liệt kê toàn bộ giao dịch thanh toán cho màn quản trị.
    @GetMapping("/admin/payments")
    public ResponseEntity<ApiResponse<List<PaymentsDTO.AdminResponse>>> getAdminPayments(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(paymentsService.getAdminPayments(keyword, status)));
    }

    // Trả về số liệu tổng hợp doanh thu cho dashboard quản trị.
    @GetMapping("/admin/payments/stats")
    public ResponseEntity<ApiResponse<PaymentsDTO.StatsResponse>> getPaymentStats() {
        return ResponseEntity.ok(ApiResponse.success(paymentsService.getPaymentStats()));
    }
}
