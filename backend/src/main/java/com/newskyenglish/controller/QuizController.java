package com.newskyenglish.controller;

import com.newskyenglish.dto.quiz.QuizCreateRequest;
import com.newskyenglish.dto.quiz.QuizDTO;
import com.newskyenglish.model.Quiz;
import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quizzes")
@RequiredArgsConstructor
// Expose API quản lý quiz, bộ câu hỏi và lịch sử nộp bài.
public class QuizController {

    private final QuizService quizService;

    // Lấy toàn bộ quiz để phục vụ màn quản trị hoặc thống kê.
    @GetMapping
    public ResponseEntity<ApiResponse<List<QuizDTO.Response>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(quizService.getAll()));
    }

    // Lọc quiz theo lớp học để frontend lấy đúng bài kiểm tra của lớp đang chọn.
    @GetMapping("/class/{classId}")
    public ResponseEntity<ApiResponse<List<QuizDTO.Response>>> getByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(ApiResponse.success(quizService.getByClass(classId)));
    }

    // Lọc quiz theo chứng chỉ như IELTS hoặc TOEIC.
    @GetMapping("/type/{examType}")
    public ResponseEntity<ApiResponse<List<QuizDTO.Response>>> getByType(@PathVariable Quiz.ExamType examType) {
        return ResponseEntity.ok(ApiResponse.success(quizService.getByType(examType)));
    }

    // Lấy quiz kèm câu hỏi để frontend render màn làm bài.
    @GetMapping("/{id}/full")
    public ResponseEntity<ApiResponse<QuizDTO.FullResponse>> getFullQuiz(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(quizService.getFullQuiz(id)));
    }

    // Tạo quiz mới kèm danh sách câu hỏi.
    @PostMapping
    public ResponseEntity<ApiResponse<QuizDTO.Response>> create(@RequestBody @Valid QuizCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(quizService.create(request), "Tạo quiz thành công"));
    }

    // Cập nhật nội dung quiz và bộ câu hỏi liên quan.
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<QuizDTO.Response>> update(
            @PathVariable Long id,
            @RequestBody @Valid QuizCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(quizService.update(id, request), "Cập nhật quiz thành công"));
    }

    // Xóa quiz khỏi hệ thống.
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        quizService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Xóa quiz thành công"));
    }

    // Lấy toàn bộ lượt nộp của một quiz để giáo viên/admin theo dõi.
    @GetMapping("/{id}/submissions")
    public ResponseEntity<ApiResponse<List<QuizDTO.SubmissionResponse>>> getQuizSubmissions(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(quizService.getQuizSubmissions(id)));
    }

    // Lấy lịch sử nộp quiz của một học viên.
    @GetMapping("/submissions/user/{userId}")
    public ResponseEntity<ApiResponse<List<QuizDTO.SubmissionResponse>>> getUserSubmissions(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(quizService.getUserSubmissions(userId)));
    }
}
