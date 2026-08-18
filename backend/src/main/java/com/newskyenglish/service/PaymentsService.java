package com.newskyenglish.service;

import com.newskyenglish.dto.payments.PaymentsDTO;
import com.newskyenglish.exception.BadRequestException;
import com.newskyenglish.exception.ResourceNotFoundException;
import com.newskyenglish.model.Classes;
import com.newskyenglish.model.Courses;
import com.newskyenglish.model.Enrollments;
import com.newskyenglish.model.Payments;
import com.newskyenglish.model.Users;
import com.newskyenglish.repository.ClassesRepository;
import com.newskyenglish.repository.CoursesRepository;
import com.newskyenglish.repository.EnrollmentsRepository;
import com.newskyenglish.repository.PaymentsRepository;
import com.newskyenglish.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
// Sinh metadata checkout và QR preview cho từng phương thức thanh toán, và thống kê doanh thu cho admin.
public class PaymentsService {

    private static final String METHOD_BANK_TRANSFER = "BANK_TRANSFER";
    private static final String METHOD_VNPAY = "VNPAY";
    private static final String METHOD_MOMO = "MOMO";
    private static final String METHOD_DEFERRED = "DEFERRED";
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    private final CoursesRepository coursesRepository;
    private final ClassesRepository classesRepository;
    private final CurrentUserService currentUserService;
    private final PaymentsRepository paymentsRepository;
    private final EnrollmentsRepository enrollmentsRepository;
    private final UsersRepository usersRepository;

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
    // Liệt kê toàn bộ giao dịch thanh toán đã join sẵn học viên/khóa học cho màn quản trị.
    public List<PaymentsDTO.AdminResponse> getAdminPayments(String keyword, String status) {
        List<PaymentsDTO.AdminResponse> enriched = enrichPayments(paymentsRepository.findAll());
        String normalizedKeyword = normalizeKeyword(keyword);

        return enriched.stream()
                .filter(payment -> status == null || status.isBlank() || status.equalsIgnoreCase(payment.getStatus()))
                .filter(payment -> normalizedKeyword.isBlank()
                        || safeLower(payment.getUserName()).contains(normalizedKeyword)
                        || safeLower(payment.getUserEmail()).contains(normalizedKeyword)
                        || safeLower(payment.getCourseName()).contains(normalizedKeyword))
                .sorted(Comparator.comparing(
                        (PaymentsDTO.AdminResponse payment) -> payment.getCreatedAt() != null ? payment.getCreatedAt() : LocalDateTime.MIN
                ).reversed())
                .toList();
    }

    @Transactional(readOnly = true)
    // Tổng hợp doanh thu theo trạng thái, phương thức, khóa học và theo tháng.
    public PaymentsDTO.StatsResponse getPaymentStats() {
        List<PaymentsDTO.AdminResponse> enriched = enrichPayments(paymentsRepository.findAll());

        List<PaymentsDTO.AdminResponse> paid = enriched.stream()
                .filter(payment -> "paid".equalsIgnoreCase(payment.getStatus()))
                .toList();
        List<PaymentsDTO.AdminResponse> pending = enriched.stream()
                .filter(payment -> "pending".equalsIgnoreCase(payment.getStatus()))
                .toList();

        List<PaymentsDTO.RevenueBreakdownItem> revenueByMethod = paid.stream()
                .collect(Collectors.groupingBy(payment -> payment.getPaymentMethod() == null ? "Khác" : payment.getPaymentMethod()))
                .entrySet().stream()
                .map(entry -> PaymentsDTO.RevenueBreakdownItem.builder()
                        .label(entry.getKey())
                        .amount(sumAmount(entry.getValue()))
                        .count((long) entry.getValue().size())
                        .build())
                .sorted(Comparator.comparing(PaymentsDTO.RevenueBreakdownItem::getAmount).reversed())
                .toList();

        List<PaymentsDTO.RevenueBreakdownItem> revenueByCourse = paid.stream()
                .collect(Collectors.groupingBy(payment -> payment.getCourseName() == null ? "Không xác định" : payment.getCourseName()))
                .entrySet().stream()
                .map(entry -> PaymentsDTO.RevenueBreakdownItem.builder()
                        .label(entry.getKey())
                        .amount(sumAmount(entry.getValue()))
                        .count((long) entry.getValue().size())
                        .build())
                .sorted(Comparator.comparing(PaymentsDTO.RevenueBreakdownItem::getAmount).reversed())
                .toList();

        List<PaymentsDTO.MonthlyRevenueItem> monthlyRevenue = paid.stream()
                .filter(payment -> payment.getPaidAt() != null)
                .collect(Collectors.groupingBy(payment -> payment.getPaidAt().format(MONTH_FORMATTER)))
                .entrySet().stream()
                .map(entry -> PaymentsDTO.MonthlyRevenueItem.builder()
                        .month(entry.getKey())
                        .amount(sumAmount(entry.getValue()))
                        .build())
                .sorted(Comparator.comparing(PaymentsDTO.MonthlyRevenueItem::getMonth))
                .toList();

        return PaymentsDTO.StatsResponse.builder()
                .totalRevenue(sumAmount(paid))
                .pendingAmount(sumAmount(pending))
                .paidCount((long) paid.size())
                .pendingCount((long) pending.size())
                .revenueByMethod(revenueByMethod)
                .revenueByCourse(revenueByCourse)
                .monthlyRevenue(monthlyRevenue)
                .build();
    }

    // Join payment -> enrollment -> class -> course/user để trả dữ liệu đầy đủ cho admin.
    private List<PaymentsDTO.AdminResponse> enrichPayments(List<Payments> payments) {
        Map<Long, Enrollments> enrollmentsById = enrollmentsRepository.findAllById(payments.stream()
                        .map(Payments::getEnrollmentId)
                        .filter(Objects::nonNull)
                        .toList())
                .stream()
                .collect(Collectors.toMap(Enrollments::getId, Function.identity()));

        Map<Long, Classes> classesById = classesRepository.findAllById(enrollmentsById.values().stream()
                        .map(Enrollments::getClassId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(Classes::getId, Function.identity()));

        Map<Long, Courses> coursesById = coursesRepository.findAllById(classesById.values().stream()
                        .map(Classes::getCourseId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(Courses::getId, Function.identity()));

        Map<Long, Users> usersById = usersRepository.findAllById(enrollmentsById.values().stream()
                        .map(Enrollments::getUserId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(Users::getId, Function.identity()));

        return payments.stream()
                .map(payment -> {
                    Enrollments enrollment = enrollmentsById.get(payment.getEnrollmentId());
                    Classes classRoom = enrollment != null ? classesById.get(enrollment.getClassId()) : null;
                    Courses course = classRoom != null ? coursesById.get(classRoom.getCourseId()) : null;
                    Users student = enrollment != null ? usersById.get(enrollment.getUserId()) : null;

                    return PaymentsDTO.AdminResponse.builder()
                            .id(payment.getId())
                            .enrollmentId(payment.getEnrollmentId())
                            .userId(enrollment != null ? enrollment.getUserId() : null)
                            .userName(student != null ? student.getName() : null)
                            .userEmail(student != null ? student.getEmail() : null)
                            .courseId(course != null ? course.getId() : null)
                            .courseName(course != null ? course.getTitle() : null)
                            .classId(classRoom != null ? classRoom.getId() : null)
                            .className(classRoom != null ? classRoom.getName() : null)
                            .amount(payment.getAmount())
                            .paymentMethod(payment.getPaymentMethod())
                            .status(payment.getStatus())
                            .createdAt(payment.getCreatedAt())
                            .paidAt(payment.getPaidAt())
                            .build();
                })
                .toList();
    }

    private BigDecimal sumAmount(List<PaymentsDTO.AdminResponse> items) {
        return items.stream()
                .map(PaymentsDTO.AdminResponse::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String normalizeKeyword(String keyword) {
        return keyword == null ? "" : keyword.trim().toLowerCase(Locale.ROOT);
    }

    private String safeLower(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT);
    }

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

    // VNPAY, MoMo và chuyển khoản demo đều được xem như thanh toán thành công ngay;
    // chỉ DEFERRED (nợ học phí) mới cần admin duyệt tay.
    public boolean supportsInstantConfirmation(String paymentMethod) {
        String normalized = normalizePaymentMethod(paymentMethod);
        return METHOD_VNPAY.equals(normalized) || METHOD_MOMO.equals(normalized) || METHOD_BANK_TRANSFER.equals(normalized);
    }

    // Nhận diện phương thức đòi admin kiểm tra thủ công.
    public boolean requiresManualReview(String paymentMethod) {
        String normalized = normalizePaymentMethod(paymentMethod);
        return METHOD_DEFERRED.equals(normalized);
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
                .manualReviewRequired(false)
                .mockMode(true)
                .note("Đây là chuyển khoản demo. Sau khi xác nhận đã chuyển, hệ thống ghi nhận thanh toán và duyệt vào lớp ngay.")
                .instruction("Quét QR hoặc chuyển khoản đúng số tiền và nội dung bên dưới, sau đó bấm xác nhận.")
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
