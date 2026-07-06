package com.newskyenglish.service;

import com.newskyenglish.dto.tests.TestsDTO;
import com.newskyenglish.exception.ResourceNotFoundException;
import com.newskyenglish.model.TestSubmissions;
import com.newskyenglish.model.Tests;
import com.newskyenglish.repository.TestSubmissionsRepository;
import com.newskyenglish.repository.TestsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
// Cung cấp nghiệp vụ cơ bản cho bảng tests và test_submissions.
public class TestsService {

    private final TestsRepository testsRepository;
    private final TestSubmissionsRepository testSubmissionsRepository;

    @Transactional(readOnly = true)
    // Lấy toàn bộ bài test full form trong hệ thống.
    public List<TestsDTO.Response> getAll() {
        return testsRepository.findAll().stream()
                .map(TestsDTO.Response::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy chi tiết một bài test theo id.
    public TestsDTO.Response getById(Long id) {
        return TestsDTO.Response.fromEntity(findTest(id));
    }

    @Transactional(readOnly = true)
    // Lấy các bài test gắn với một lớp học cụ thể.
    public List<TestsDTO.Response> getByClass(Long classId) {
        return testsRepository.findByClassId(classId).stream()
                .map(TestsDTO.Response::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy lịch sử nộp của một bài test để chấm hoặc xem kết quả.
    public List<TestsDTO.SubmissionResponse> getSubmissions(Long testId) {
        return testSubmissionsRepository.findByTestId(testId).stream()
                .map(TestsDTO.SubmissionResponse::fromEntity)
                .toList();
    }

    @Transactional
    // Tạo mới một bài test full form từ request DTO.
    public TestsDTO.Response create(TestsDTO.CreateRequest request) {
        Tests test = Tests.builder()
                .classId(request.getClassId())
                .title(request.getTitle())
                .description(request.getDescription())
                .testType(request.getTestType())
                .examType(request.getExamType())
                .examPart(request.getExamPart())
                .skillType(request.getSkillType())
                .durationMinutes(request.getDurationMinutes())
                .totalScore(request.getTotalScore())
                .attemptsAllowed(request.getAttemptsAllowed())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(request.getStatus())
                .build();
        return TestsDTO.Response.fromEntity(testsRepository.save(test));
    }

    @Transactional
    // Cập nhật metadata của một bài test hiện có.
    public TestsDTO.Response update(Long id, TestsDTO.UpdateRequest request) {
        Tests test = findTest(id);

        if (request.getClassId() != null) test.setClassId(request.getClassId());
        if (request.getTitle() != null) test.setTitle(request.getTitle());
        if (request.getDescription() != null) test.setDescription(request.getDescription());
        if (request.getTestType() != null) test.setTestType(request.getTestType());
        if (request.getExamType() != null) test.setExamType(request.getExamType());
        if (request.getExamPart() != null) test.setExamPart(request.getExamPart());
        if (request.getSkillType() != null) test.setSkillType(request.getSkillType());
        if (request.getDurationMinutes() != null) test.setDurationMinutes(request.getDurationMinutes());
        if (request.getTotalScore() != null) test.setTotalScore(request.getTotalScore());
        if (request.getAttemptsAllowed() != null) test.setAttemptsAllowed(request.getAttemptsAllowed());
        if (request.getStartTime() != null) test.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) test.setEndTime(request.getEndTime());
        if (request.getStatus() != null) test.setStatus(request.getStatus());

        return TestsDTO.Response.fromEntity(testsRepository.save(test));
    }

    @Transactional
    // Xóa một bài test khi không còn sử dụng.
    public void delete(Long id) {
        testsRepository.delete(findTest(id));
    }

    // Helper tìm test hoặc ném lỗi 404.
    private Tests findTest(Long id) {
        return testsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài test"));
    }
}
