package com.newskyenglish.service;

import com.newskyenglish.dto.payments.PaymentsDTO;
import com.newskyenglish.exception.BadRequestException;
import com.newskyenglish.exception.ResourceNotFoundException;
import com.newskyenglish.model.Classes;
import com.newskyenglish.model.Courses;
import com.newskyenglish.repository.ClassesRepository;
import com.newskyenglish.repository.CoursesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Objects;

@Service
@RequiredArgsConstructor
// Sinh metadata checkout và QR preview cho từng phương thức thanh toán.
public class PaymentsService {

    private static final String METHOD_BANK_TRANSFER = "BANK_TRANSFER";
    private static final String METHOD_VNPAY = "VNPAY";
    private static final String METHOD_MOMO = "MOMO";
    private static final String METHOD_DEFERRED = "DEFERRED";

    private final CoursesRepository coursesRepository;
    private final ClassesRepository classesRepository;
    private final CurrentUserService currentUserService;

    @Value("${app.payment.bank.bank-name:MB Bank}")
    private String bankName;

    @Value("${app.payment.bank.bank-bin:970422}")
    private String bankBin;

    @Value("${app.payment.bank.account-number:0123456789}")
    private String bankAccountNumber;

    @Value("${app.payment.bank.account-name:NEW SKY ENGLISH}")
    private String bankAccountName;

    @Value("${app.payment.vnpay.display-name:VNPAY Demo}")
    private String vnpayDisplayName;

    @Value("${app.payment.momo.display-name:MoMo Demo}")
    private String momoDisplayName;

    @Value("${app.payment.momo.wallet-id:0900000000}")
    private String momoWalletId;

    @Transactional(readOnly = true)
    // Tạo dữ liệu xem trước thanh toán để FE hiển thị QR và hướng dẫn phù hợp.
    public PaymentsDTO.PreviewResponse previewStudentPayment(PaymentsDTO.PreviewRequest request,
                                                             String authorizationHeader) {
        Long userId = currentUserService.extractUserId(authorizationHeader);
        String paymentMethod = normalizePaymentMethod(request.getPaymentMethod());
        Courses course = findCourse(request.getCourseId());
        Classes classEntity = findClass(request.getClassId());

        if (!Objects.equals(classEntity.getCourseId(), course.getId())) {
            throw new BadRequestException("Lớp học không thuộc khóa học đã chọn");
        }

        BigDecimal amount = course.getPrice() != null ? course.getPrice() : BigDecimal.ZERO;
        String paymentCode = buildPaymentCode(userId, request.getCourseId(), request.getClassId(), paymentMethod);
        String transferContent = buildTransferContent(paymentCode, course.getTitle());

        if (amount.signum() <= 0) {
            return PaymentsDTO.PreviewResponse.builder()
                    .paymentMethod(paymentMethod)
                    .providerName("Miễn phí")
                    .amount(amount)
                    .paymentCode(paymentCode)
                    .transferContent(transferContent)
                    .manualReviewRequired(false)
                    .mockMode(false)
                    .note("Khóa học này không phát sinh học phí.")
                    .instruction("Bạn có thể tiếp tục đăng ký mà không cần thanh toán.")
                    .actionLabel("Đăng ký miễn phí")
                    .build();
        }

        return switch (paymentMethod) {
            case METHOD_BANK_TRANSFER -> buildBankTransferPreview(amount, paymentCode, transferContent);
            case METHOD_VNPAY -> buildVnpayPreview(amount, paymentCode, transferContent);
            case METHOD_MOMO -> buildMomoPreview(amount, paymentCode, transferContent);
            case METHOD_DEFERRED -> buildDeferredPreview(amount, paymentCode, transferContent);
            default -> throw new BadRequestException("Phương thức thanh toán không hợp lệ");
        };
    }

    // Chuẩn hóa method để backend và frontend cùng dùng một bộ giá trị.
    public String normalizePaymentMethod(String rawPaymentMethod) {
        if (rawPaymentMethod == null || rawPaymentMethod.isBlank()) {
            throw new BadRequestException("Thiếu phương thức thanh toán");
        }

        String normalized = rawPaymentMethod.trim().toUpperCase(Locale.ROOT);
        if (!METHOD_BANK_TRANSFER.equals(normalized)
                && !METHOD_VNPAY.equals(normalized)
                && !METHOD_MOMO.equals(normalized)
                && !METHOD_DEFERRED.equals(normalized)) {
            throw new BadRequestException("Phương thức thanh toán không hợp lệ");
        }
        return normalized;
    }

    // Chỉ VNPAY và MoMo demo mới được xem như thanh toán thành công ngay.
    public boolean supportsInstantConfirmation(String paymentMethod) {
        String normalized = normalizePaymentMethod(paymentMethod);
        return METHOD_VNPAY.equals(normalized) || METHOD_MOMO.equals(normalized);
    }

    // Nhận diện phương thức đòi admin kiểm tra thủ công.
    public boolean requiresManualReview(String paymentMethod) {
        String normalized = normalizePaymentMethod(paymentMethod);
        return METHOD_BANK_TRANSFER.equals(normalized) || METHOD_DEFERRED.equals(normalized);
    }

    private PaymentsDTO.PreviewResponse buildBankTransferPreview(BigDecimal amount,
                                                                 String paymentCode,
                                                                 String transferContent) {
        String qrImageUrl = "https://img.vietqr.io/image/"
                + bankBin + "-" + bankAccountNumber + "-compact2.png"
                + "?amount=" + urlEncode(amount.toPlainString())
                + "&addInfo=" + urlEncode(transferContent)
                + "&accountName=" + urlEncode(bankAccountName);

        return PaymentsDTO.PreviewResponse.builder()
                .paymentMethod(METHOD_BANK_TRANSFER)
                .providerName("Chuyển khoản ngân hàng")
                .amount(amount)
                .qrImageUrl(qrImageUrl)
                .paymentCode(paymentCode)
                .transferContent(transferContent)
                .accountName(bankAccountName)
                .accountNumber(bankAccountNumber)
                .bankName(bankName)
                .bankBin(bankBin)
                .manualReviewRequired(true)
                .mockMode(false)
                .note("Sau khi chuyển khoản, admin sẽ kiểm tra và phê duyệt để bạn tham gia lớp.")
                .instruction("Quét QR hoặc chuyển khoản đúng số tiền và nội dung bên dưới.")
                .actionLabel("Tôi đã gửi chuyển khoản")
                .build();
    }

    private PaymentsDTO.PreviewResponse buildVnpayPreview(BigDecimal amount,
                                                          String paymentCode,
                                                          String transferContent) {
        String qrPayload = "VNPAY-DEMO|amount=" + amount.toPlainString()
                + "|order=" + paymentCode
                + "|content=" + transferContent;

        return PaymentsDTO.PreviewResponse.builder()
                .paymentMethod(METHOD_VNPAY)
                .providerName(vnpayDisplayName)
                .amount(amount)
                .qrImageUrl(buildGenericQrUrl(qrPayload))
                .paymentCode(paymentCode)
                .transferContent(transferContent)
                .manualReviewRequired(false)
                .mockMode(true)
                .note("Đây là QR demo cho VNPAY. Khi có merchant thật, bước này sẽ đổi sang link/callback thật.")
                .instruction("Hiện tại bạn có thể dùng nút mô phỏng để test luồng thanh toán thành công.")
                .actionLabel("Mô phỏng thanh toán VNPAY thành công")
                .build();
    }

    private PaymentsDTO.PreviewResponse buildMomoPreview(BigDecimal amount,
                                                         String paymentCode,
                                                         String transferContent) {
        String qrPayload = "MOMO-DEMO|wallet=" + momoWalletId
                + "|amount=" + amount.toPlainString()
                + "|order=" + paymentCode
                + "|content=" + transferContent;

        return PaymentsDTO.PreviewResponse.builder()
                .paymentMethod(METHOD_MOMO)
                .providerName(momoDisplayName)
                .amount(amount)
                .qrImageUrl(buildGenericQrUrl(qrPayload))
                .paymentCode(paymentCode)
                .transferContent(transferContent)
                .walletId(momoWalletId)
                .manualReviewRequired(false)
                .mockMode(true)
                .note("Đây là QR demo cho MoMo. Khi có merchant thật, bước này sẽ đổi sang link/callback thật.")
                .instruction("Hiện tại bạn có thể dùng nút mô phỏng để test luồng thanh toán thành công.")
                .actionLabel("Mô phỏng thanh toán MoMo thành công")
                .build();
    }

    private PaymentsDTO.PreviewResponse buildDeferredPreview(BigDecimal amount,
                                                             String paymentCode,
                                                             String transferContent) {
        return PaymentsDTO.PreviewResponse.builder()
                .paymentMethod(METHOD_DEFERRED)
                .providerName("Nợ học phí")
                .amount(amount)
                .paymentCode(paymentCode)
                .transferContent(transferContent)
                .manualReviewRequired(true)
                .mockMode(false)
                .note("Bạn sẽ gửi yêu cầu ghi danh trước. Chỉ khi admin phê duyệt thì mới được tham gia lớp học.")
                .instruction("Hệ thống sẽ ghi nhận đây là khoản nợ học phí chờ xử lý.")
                .actionLabel("Gửi yêu cầu nợ học phí")
                .build();
    }

    private String buildGenericQrUrl(String payload) {
        return "https://quickchart.io/qr?text=" + urlEncode(payload) + "&size=280";
    }

    private String buildPaymentCode(Long userId, Long courseId, Long classId, String paymentMethod) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String methodPrefix = paymentMethod.length() >= 3 ? paymentMethod.substring(0, 3) : paymentMethod;
        return methodPrefix + "-U" + userId + "-C" + courseId + "-L" + classId + "-" + timestamp;
    }

    private String buildTransferContent(String paymentCode, String courseTitle) {
        String shortTitle = courseTitle == null ? "KHOA_HOC" : courseTitle.trim().replaceAll("\\s+", "_");
        if (shortTitle.length() > 20) {
            shortTitle = shortTitle.substring(0, 20);
        }
        return "NEWSKY " + shortTitle + " " + paymentCode;
    }

    private Courses findCourse(Long courseId) {
        return coursesRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học"));
    }

    private Classes findClass(Long classId) {
        return classesRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học"));
    }

    private String urlEncode(String rawValue) {
        return URLEncoder.encode(rawValue, StandardCharsets.UTF_8);
    }
}
