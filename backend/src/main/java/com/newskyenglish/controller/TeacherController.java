package com.newskyenglish.controller;

import com.newskyenglish.dto.assignment.AssignmentDTO;
import com.newskyenglish.dto.classroom.ClassRoomDTO;
import com.newskyenglish.dto.dashboard.TeacherDashboardDTO;
import com.newskyenglish.dto.enrollment.EnrollmentDTO;
import com.newskyenglish.dto.notification.NotificationDTO;
import com.newskyenglish.dto.quiz.QuizDTO;
import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.TeacherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teacher")
@RequiredArgsConstructor
// Gom các API nghiệp vụ cho giáo viên như dashboard, lớp học và thông báo.
public class TeacherController {

    private final TeacherService teacherService;

    // Trả về số liệu tổng quan cho dashboard giáo viên.
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<TeacherDashboardDTO.SummaryResponse>> getDashboardSummary(
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.getDashboardSummary(authorizationHeader)));
    }

    // Lấy danh sách lớp do giáo viên hiện tại phụ trách.
    @GetMapping("/classes")
    public ResponseEntity<ApiResponse<List<ClassRoomDTO.Response>>> getMyClasses(
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.getMyClasses(authorizationHeader)));
    }

    // Lấy học viên thuộc một lớp cụ thể để điểm danh hoặc theo dõi.
    @GetMapping("/classes/{classId}/students")
    public ResponseEntity<ApiResponse<List<EnrollmentDTO.TeacherStudentResponse>>> getStudents(
            @PathVariable Long classId,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.getStudents(classId, authorizationHeader)));
    }

    // Lấy các bài tập mà giáo viên hiện tại đã tạo hoặc đang quản lý.
    @GetMapping("/assignments")
    public ResponseEntity<ApiResponse<List<AssignmentDTO.Response>>> getMyAssignments(
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.getMyAssignments(authorizationHeader)));
    }

    // Lấy các bài kiểm tra thuộc lớp mà giáo viên đang phụ trách.
    @GetMapping("/quizzes")
    public ResponseEntity<ApiResponse<List<QuizDTO.Response>>> getMyQuizzes(
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.getMyQuizzes(authorizationHeader)));
    }

    // Lấy danh sách bài làm của học viên cho một bài kiểm tra thuộc lớp mình.
    @GetMapping("/quizzes/{quizId}/submissions")
    public ResponseEntity<ApiResponse<List<QuizDTO.SubmissionResponse>>> getQuizSubmissions(
            @PathVariable Long quizId,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                teacherService.getQuizSubmissions(quizId, authorizationHeader)
        ));
    }

    // Chấm hoặc sửa điểm bài làm quiz cho học viên.
    @PutMapping("/quiz-submissions/{submissionId}/grade")
    public ResponseEntity<ApiResponse<QuizDTO.SubmissionResponse>> gradeQuizSubmission(
            @PathVariable Long submissionId,
            @RequestBody @Valid QuizDTO.GradeSubmissionRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                teacherService.gradeQuizSubmission(submissionId, request, authorizationHeader),
                "Cập nhật điểm bài làm thành công"
        ));
    }

    // Tạo bài tập mới cho một lớp do giáo viên phụ trách.
    @PostMapping("/assignments")
    public ResponseEntity<ApiResponse<AssignmentDTO.Response>> createAssignment(
            @RequestBody @Valid AssignmentDTO.CreateRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        teacherService.createAssignment(request, authorizationHeader),
                        "Tạo bài tập thành công"
                ));
    }

    // Gửi thông báo từ giáo viên đến học viên trong các lớp mình quản lý.
    @PostMapping("/notifications/send")
    public ResponseEntity<ApiResponse<NotificationDTO.SendResult>> sendNotification(
            @RequestBody @Valid NotificationDTO.BroadcastRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
        NotificationDTO.SendResult result = teacherService.sendNotification(request, authorizationHeader);
        return ResponseEntity.ok(ApiResponse.success(
                result,
                "Đã gửi thông báo đến " + result.getSent() + " học viên"
        ));
    }
}
