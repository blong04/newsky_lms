package com.newskyenglish.service;

import com.newskyenglish.dto.payments.PaymentsDTO;
import com.newskyenglish.exception.BadRequestException;
import com.newskyenglish.exception.ResourceNotFoundException;
import com.newskyenglish.model.Classes;
import com.newskyenglish.model.Courses;
import com.newskyenglish.repository.ClassesRepository;
import com.newskyenglish.repository.CoursesRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentsServiceTest {

    @Mock
    private CoursesRepository coursesRepository;
    @Mock
    private ClassesRepository classesRepository;
    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private PaymentsService paymentsService;

    private static final String AUTH_HEADER = "Bearer fake-token";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(paymentsService, "bankName", "MB Bank");
        ReflectionTestUtils.setField(paymentsService, "bankBin", "970422");
        ReflectionTestUtils.setField(paymentsService, "bankAccountNumber", "0123456789");
        ReflectionTestUtils.setField(paymentsService, "bankAccountName", "NEW SKY ENGLISH");
    }

    @Test
    void normalizePaymentMethod_withLowercaseInput_returnsUppercase() {
        assertThat(paymentsService.normalizePaymentMethod("bank_transfer")).isEqualTo("BANK_TRANSFER");
    }

    @Test
    void normalizePaymentMethod_withBlankInput_throwsBadRequestException() {
        assertThatThrownBy(() -> paymentsService.normalizePaymentMethod(" "))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Thiếu phương thức thanh toán");
    }

    @Test
    void normalizePaymentMethod_withUnknownMethod_throwsBadRequestException() {
        assertThatThrownBy(() -> paymentsService.normalizePaymentMethod("PAYPAL"))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Phương thức thanh toán không hợp lệ");
    }

    @Test
    void supportsInstantConfirmation_forVnpayAndMomo_returnsTrue() {
        assertThat(paymentsService.supportsInstantConfirmation("VNPAY")).isTrue();
        assertThat(paymentsService.supportsInstantConfirmation("MOMO")).isTrue();
        assertThat(paymentsService.supportsInstantConfirmation("BANK_TRANSFER")).isFalse();
    }

    @Test
    void requiresManualReview_forBankTransferAndDeferred_returnsTrue() {
        assertThat(paymentsService.requiresManualReview("BANK_TRANSFER")).isTrue();
        assertThat(paymentsService.requiresManualReview("DEFERRED")).isTrue();
        assertThat(paymentsService.requiresManualReview("VNPAY")).isFalse();
    }

    @Test
    void previewStudentPayment_forFreeCourse_returnsFreePreviewWithoutQr() {
        Courses freeCourse = Courses.builder().id(1L).title("Free Trial").price(BigDecimal.ZERO).build();
        Classes matchingClass = Classes.builder().id(10L).courseId(1L).build();
        PaymentsDTO.PreviewRequest request = PaymentsDTO.PreviewRequest.builder()
                .courseId(1L).classId(10L).paymentMethod("BANK_TRANSFER").build();

        when(currentUserService.extractUserId(AUTH_HEADER)).thenReturn(99L);
        when(coursesRepository.findById(1L)).thenReturn(Optional.of(freeCourse));
        when(classesRepository.findById(10L)).thenReturn(Optional.of(matchingClass));

        PaymentsDTO.PreviewResponse response = paymentsService.previewStudentPayment(request, AUTH_HEADER);

        assertThat(response.getAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(response.getManualReviewRequired()).isFalse();
        assertThat(response.getQrImageUrl()).isNull();
    }

    @Test
    void previewStudentPayment_forBankTransfer_returnsQrPreviewWithManualReview() {
        Courses course = Courses.builder().id(1L).title("IELTS 6.5").price(new BigDecimal("1000000")).build();
        Classes matchingClass = Classes.builder().id(10L).courseId(1L).build();
        PaymentsDTO.PreviewRequest request = PaymentsDTO.PreviewRequest.builder()
                .courseId(1L).classId(10L).paymentMethod("bank_transfer").build();

        when(currentUserService.extractUserId(AUTH_HEADER)).thenReturn(99L);
        when(coursesRepository.findById(1L)).thenReturn(Optional.of(course));
        when(classesRepository.findById(10L)).thenReturn(Optional.of(matchingClass));

        PaymentsDTO.PreviewResponse response = paymentsService.previewStudentPayment(request, AUTH_HEADER);

        assertThat(response.getPaymentMethod()).isEqualTo("BANK_TRANSFER");
        assertThat(response.getAmount()).isEqualByComparingTo(new BigDecimal("1000000"));
        assertThat(response.getManualReviewRequired()).isTrue();
        assertThat(response.getQrImageUrl()).startsWith("https://img.vietqr.io/image/970422-0123456789-compact2.png");
    }

    @Test
    void previewStudentPayment_whenClassDoesNotBelongToCourse_throwsBadRequestException() {
        Courses course = Courses.builder().id(1L).title("IELTS 6.5").price(new BigDecimal("1000000")).build();
        Classes otherClass = Classes.builder().id(10L).courseId(2L).build();
        PaymentsDTO.PreviewRequest request = PaymentsDTO.PreviewRequest.builder()
                .courseId(1L).classId(10L).paymentMethod("VNPAY").build();

        when(currentUserService.extractUserId(AUTH_HEADER)).thenReturn(99L);
        when(coursesRepository.findById(1L)).thenReturn(Optional.of(course));
        when(classesRepository.findById(10L)).thenReturn(Optional.of(otherClass));

        assertThatThrownBy(() -> paymentsService.previewStudentPayment(request, AUTH_HEADER))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Lớp học không thuộc khóa học đã chọn");
    }

    @Test
    void previewStudentPayment_whenCourseNotFound_throwsResourceNotFoundException() {
        PaymentsDTO.PreviewRequest request = PaymentsDTO.PreviewRequest.builder()
                .courseId(404L).classId(10L).paymentMethod("VNPAY").build();

        when(currentUserService.extractUserId(AUTH_HEADER)).thenReturn(99L);
        when(coursesRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentsService.previewStudentPayment(request, AUTH_HEADER))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Không tìm thấy khóa học");
    }
}
