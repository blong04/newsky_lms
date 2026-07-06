package com.newskyenglish.controller;

import com.newskyenglish.dto.classes.ClassesDTO;
import com.newskyenglish.dto.enrollments.EnrollmentsDTO;
import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.ClassesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
// Expose API lớp học theo đúng feature classes, dù endpoint vẫn giữ tương thích frontend cũ.
public class ClassesController {

    private final ClassesService classesService;

    // Public endpoint để frontend lấy danh sách lớp hiển thị cho học viên.
    @GetMapping("/classes")
    public ResponseEntity<ApiResponse<List<ClassesDTO.Response>>> getPublicClasses() {
        return ResponseEntity.ok(ApiResponse.success(classesService.getPublicClasses()));
    }

    // Lấy toàn bộ lớp học để admin quản lý và phân công giáo viên.
    @GetMapping("/admin/classes")
    public ResponseEntity<ApiResponse<List<ClassesDTO.Response>>> getAdminClasses() {
        return ResponseEntity.ok(ApiResponse.success(classesService.getAllForAdmin()));
    }

    // Tạo một lớp học mới từ dữ liệu admin nhập vào.
    @PostMapping("/admin/classes")
    public ResponseEntity<ApiResponse<ClassesDTO.Response>> create(
            @RequestBody @Valid ClassesDTO.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(classesService.create(request), "Tạo lớp học thành công"));
    }

    // Cập nhật thông tin lớp học đã tồn tại.
    @PutMapping("/admin/classes/{id}")
    public ResponseEntity<ApiResponse<ClassesDTO.Response>> update(
            @PathVariable Long id,
            @RequestBody @Valid ClassesDTO.UpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(classesService.update(id, request), "Cập nhật thành công"));
    }

    // Xóa một lớp học khỏi hệ thống.
    @DeleteMapping("/admin/classes/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        classesService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Đã xóa lớp học"));
    }

    // Gán giáo viên cho một lớp học cụ thể.
    @PutMapping("/admin/classes/{classId}/assign-teacher/{teacherId}")
    public ResponseEntity<ApiResponse<Void>> assignTeacher(@PathVariable Long classId,
                                                           @PathVariable Long teacherId) {
        classesService.assignTeacher(classId, teacherId);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Phân công giáo viên thành công"));
    }

    // Lấy danh sách lớp do giáo viên hiện tại phụ trách.
    @GetMapping("/teacher/classes")
    public ResponseEntity<ApiResponse<List<ClassesDTO.Response>>> getTeacherClasses(
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(classesService.getTeacherClasses(authorizationHeader)));
    }

    // Lấy học viên thuộc một lớp cụ thể để giáo viên theo dõi.
    @GetMapping("/teacher/classes/{classId}/students")
    public ResponseEntity<ApiResponse<List<EnrollmentsDTO.TeacherStudentResponse>>> getTeacherStudents(
            @PathVariable Long classId,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                classesService.getTeacherStudents(classId, authorizationHeader)
        ));
    }
}
