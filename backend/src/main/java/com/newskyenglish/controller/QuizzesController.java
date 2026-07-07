package com.newskyenglish.controller;

import com.newskyenglish.dto.quizzes.QuizzesCreateRequest;
import com.newskyenglish.dto.quizzes.QuizzesDTO;
import com.newskyenglish.model.Quizzes;
import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.QuizzesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
// Expose API quản lý quiz, bộ câu hỏi và lịch sử nộp bài.
public class QuizzesController {

    private final QuizzesService quizService;

    // Lấy toàn bộ quiz để phục vụ màn quản trị hoặc thống kê.
    @GetMapping("/quizzes")
    public ResponseEntity<ApiResponse<List<QuizzesDTO.Response>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(quizService.getAll()));
    }

    // Lọc quiz theo lớp học để frontend lấy đúng bài kiểm tra của lớp đang chọn.
    @GetMapping("/quizzes/class/{classId}")
    public ResponseEntity<ApiResponse<List<QuizzesDTO.Response>>> getByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(ApiResponse.success(quizService.getByClass(classId)));
    }

    // Lọc quiz theo chứng chỉ như IELTS hoặc TOEIC.
    @GetMapping("/quizzes/type/{examType}")
    public ResponseEntity<ApiResponse<List<QuizzesDTO.Response>>> getByType(@PathVariable Quizzes.ExamType examType) {
        return ResponseEntity.ok(ApiResponse.success(quizService.getByType(examType)));
    }

    // Lấy full dữ liệu quiz để admin/teacher quản lý hoặc học viên xem lại sau khi nộp.
    @GetMapping("/quizzes/{id}/full")
    public ResponseEntity<ApiResponse<QuizzesDTO.FullResponse>> getFullQuiz(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                quizService.getFullQuiz(id, authorizationHeader)
        ));
    }

    // Lấy dữ liệu quiz dành riêng cho màn làm bài của học viên và không trả đáp án đúng.
    @GetMapping("/student/quiz/{quizId}")
    public ResponseEntity<ApiResponse<QuizzesDTO.StudentQuizResponse>> getStudentQuiz(
            @PathVariable Long quizId,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                quizService.getStudentQuiz(quizId, authorizationHeader)
        ));
    }

    // Tạo quiz mới kèm danh sách câu hỏi.
    @PostMapping("/quizzes")
    public ResponseEntity<ApiResponse<QuizzesDTO.Response>> create(@RequestBody @Valid QuizzesCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(quizService.create(request), "Tạo quiz thành công"));
    }

    // Cập nhật nội dung quiz và bộ câu hỏi liên quan.
    @PutMapping("/quizzes/{id}")
    public ResponseEntity<ApiResponse<QuizzesDTO.Response>> update(
            @PathVariable Long id,
            @RequestBody @Valid QuizzesCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(quizService.update(id, request), "Cập nhật quiz thành công"));
    }

    // Xóa quiz khỏi hệ thống.
    @DeleteMapping("/quizzes/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        quizService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Xóa quiz thành công"));
    }

    // Lấy toàn bộ lượt nộp của một quiz để giáo viên/admin theo dõi.
    @GetMapping("/quizzes/{id}/submissions")
    public ResponseEntity<ApiResponse<List<QuizzesDTO.SubmissionResponse>>> getQuizSubmissions(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(quizService.getQuizSubmissions(id)));
    }

    // Lấy các bài kiểm tra thuộc lớp mà giáo viên đang phụ trách.
    @GetMapping("/teacher/quizzes")
    public ResponseEntity<ApiResponse<List<QuizzesDTO.Response>>> getTeacherQuizzes(
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                quizService.getTeacherQuizzes(authorizationHeader)
        ));
    }

    // Lấy danh sách bài làm của học viên cho một bài kiểm tra thuộc lớp mình.
    @GetMapping("/teacher/quizzes/{quizId}/submissions")
    public ResponseEntity<ApiResponse<List<QuizzesDTO.SubmissionResponse>>> getTeacherQuizSubmissions(
            @PathVariable Long quizId,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                quizService.getTeacherQuizSubmissions(quizId, authorizationHeader)
        ));
    }

    // Lấy lịch sử nộp quiz của một học viên.
    @GetMapping("/quizzes/submissions/user/{userId}")
    public ResponseEntity<ApiResponse<List<QuizzesDTO.SubmissionResponse>>> getUserSubmissions(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                quizService.getUserSubmissions(userId, authorizationHeader)
        ));
    }

    // Giáo viên xem lịch sử làm quiz của một học viên thuộc lớp mình.
    @GetMapping("/teacher/students/{userId}/quizzes/submissions")
    public ResponseEntity<ApiResponse<List<QuizzesDTO.SubmissionResponse>>> getTeacherStudentSubmissions(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                quizService.getTeacherStudentSubmissions(userId, authorizationHeader)
        ));
    }

    // Nhận đáp án từ frontend, chấm tự động phần trắc nghiệm và lưu submission.
    @PostMapping("/student/quiz/{quizId}/submit")
    public ResponseEntity<ApiResponse<QuizzesDTO.SubmitResultResponse>> submitStudentQuiz(
            @PathVariable Long quizId,
            @RequestBody @Valid QuizzesDTO.SubmitRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                quizService.submitStudentQuiz(quizId, request, authorizationHeader),
                "Nộp quiz thành công"
        ));
    }

    // Chấm hoặc sửa điểm bài làm quiz cho học viên.
    @PutMapping("/teacher/quiz-submissions/{submissionId}/grade")
    public ResponseEntity<ApiResponse<QuizzesDTO.SubmissionResponse>> gradeTeacherSubmission(
            @PathVariable Long submissionId,
            @RequestBody @Valid QuizzesDTO.GradeSubmissionRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                quizService.gradeTeacherSubmission(submissionId, request, authorizationHeader),
                "Cập nhật điểm bài làm thành công"
        ));
    }
}

