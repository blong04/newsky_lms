package com.newskyenglish.controller;

import com.newskyenglish.dto.dashboard.StudentDashboardDTO;
import com.newskyenglish.dto.enrollment.EnrollmentDTO;
import com.newskyenglish.dto.quiz.QuizDTO;
import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student")
@RequiredArgsConstructor
// Gom các API nghiệp vụ mà học viên trực tiếp sử dụng trên frontend.
public class StudentController {

    private final StudentService studentService;

    // Trả về số liệu tổng quan cho dashboard học viên.
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<StudentDashboardDTO.SummaryResponse>> getDashboardSummary(
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getDashboardSummary(authorizationHeader)));
    }

    // Lấy danh sách khóa/lớp học mà học viên đang hoặc đã đăng ký.
    @GetMapping("/enrollments")
    public ResponseEntity<ApiResponse<List<EnrollmentDTO.StudentResponse>>> getMyEnrollments(
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getMyEnrollments(authorizationHeader)));
    }

    // Tạo yêu cầu đăng ký học mới cho học viên hiện tại.
    @PostMapping("/enroll")
    public ResponseEntity<ApiResponse<Void>> enroll(@RequestBody @Valid EnrollmentDTO.StudentEnrollRequest request,
                                                    @RequestHeader("Authorization") String authorizationHeader) {
        studentService.enroll(request, authorizationHeader);
        boolean paid = Boolean.TRUE.equals(request.getPaid());
        return ResponseEntity.ok(ApiResponse.<Void>success(null, studentService.getEnrollmentSuccessMessage(paid)));
    }

    // Lấy đầy đủ thông tin quiz để học viên bắt đầu làm bài.
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<ApiResponse<QuizDTO.StudentQuizResponse>> getQuiz(@PathVariable Long quizId) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getQuiz(quizId)));
    }

    // Nhận đáp án từ frontend, chấm tự động phần trắc nghiệm và lưu submission.
    @PostMapping("/quiz/{quizId}/submit")
    public ResponseEntity<ApiResponse<QuizDTO.SubmitResultResponse>> submitQuiz(
            @PathVariable Long quizId,
            @RequestBody @Valid QuizDTO.SubmitRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                studentService.submitQuiz(quizId, request, authorizationHeader),
                "Nộp quiz thành công"
        ));
    }
}
