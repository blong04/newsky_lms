package com.newskyenglish.controller;

import com.newskyenglish.dto.officialexamresults.OfficialExamResultsDTO;
import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.OfficialExamResultsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
// Expose API cho điểm thi chính thức sau khóa học.
public class OfficialExamResultsController {

    private final OfficialExamResultsService officialExamResultsService;

    // Lấy lịch sử điểm thi chính thức của học viên hiện tại.
    @GetMapping("/student/official-exam-results")
    public ResponseEntity<ApiResponse<List<OfficialExamResultsDTO.Response>>> getCurrentStudentResults(
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                officialExamResultsService.getCurrentStudentResults(authorizationHeader)
        ));
    }

    // Học viên nhập điểm thi chính thức để nhận kết luận học tiếp hoặc học lại miễn phí.
    @PostMapping("/student/official-exam-results")
    public ResponseEntity<ApiResponse<OfficialExamResultsDTO.CreateResultResponse>> createCurrentStudentResult(
            @RequestBody @Valid OfficialExamResultsDTO.CreateRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                officialExamResultsService.createCurrentStudentResult(request, authorizationHeader),
                "Đã lưu kết quả thi chính thức"
        ));
    }
}
