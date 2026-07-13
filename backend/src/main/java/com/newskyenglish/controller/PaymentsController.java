package com.newskyenglish.controller;

import com.newskyenglish.dto.payments.PaymentsDTO;
import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.PaymentsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
// Expose API payment preview để FE render QR trước khi gửi đăng ký thật.
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
}
