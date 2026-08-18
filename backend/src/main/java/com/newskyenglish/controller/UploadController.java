package com.newskyenglish.controller;

import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequiredArgsConstructor
// Nhận file từ FE để tải lên Cloudinary: ảnh/audio câu hỏi (admin) và chứng chỉ điểm thi (student).
public class UploadController {

    private final UploadService uploadService;

    // Route nằm dưới /admin/** nên đã được SecurityConfig giới hạn chỉ ROLE_ADMIN.
    @PostMapping("/admin/uploads/question-media")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadQuestionMedia(
            @RequestParam("file") MultipartFile file) {
        String url = uploadService.uploadQuestionMedia(file);
        return ResponseEntity.ok(ApiResponse.success(Map.of("url", url)));
    }

    // Route nằm dưới /student/** nên đã được SecurityConfig cho phép STUDENT (và ADMIN) gọi.
    @PostMapping("/student/uploads/certificate")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadCertificate(
            @RequestParam("file") MultipartFile file) {
        String url = uploadService.uploadCertificate(file);
        return ResponseEntity.ok(ApiResponse.success(Map.of("url", url)));
    }
}
