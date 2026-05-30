package com.newskyenglish.service;

import com.newskyenglish.dto.assignment.AssignmentDTO;
import com.newskyenglish.dto.assignment.AssignmentSubmitDTO;
import com.newskyenglish.exception.ResourceNotFoundException;
import com.newskyenglish.model.Assignment;
import com.newskyenglish.model.AssignmentSubmit;
import com.newskyenglish.repository.AssignmentRepository;
import com.newskyenglish.repository.AssignmentSubmitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
// Xử lý CRUD bài tập, bài nộp của học viên và thao tác chấm điểm.
public class AssignmentService {

    // Repository chính cho bài tập và bài nộp tương ứng của học viên.
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmitRepository assignmentSubmitRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    // Lấy toàn bộ bài tập trong hệ thống.
    public List<AssignmentDTO.Response> getAll() {
        return assignmentRepository.findAll().stream()
                .map(AssignmentDTO.Response::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy chi tiết một bài tập theo id.
    public AssignmentDTO.Response getById(Long id) {
        return AssignmentDTO.Response.fromEntity(findAssignment(id));
    }

    @Transactional(readOnly = true)
    // Lấy danh sách bài tập theo lớp học.
    public List<AssignmentDTO.Response> getByClass(Long classId) {
        return assignmentRepository.findByClassId(classId).stream()
                .map(AssignmentDTO.Response::fromEntity)
                .toList();
    }

    @Transactional
    // Tạo mới một assignment từ request DTO.
    public AssignmentDTO.Response create(AssignmentDTO.CreateRequest request) {
        Assignment assignment = Assignment.builder()
                .classId(request.getClassId())
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .examType(request.getExamType())
                .examPart(request.getExamPart())
                .part(request.getPart())
                .deadline(request.getDeadline())
                .maxScore(request.getMaxScore())
                .status(request.getStatus() != null ? request.getStatus() : Assignment.Status.active)
                .build();

        return AssignmentDTO.Response.fromEntity(assignmentRepository.save(assignment));
    }

    @Transactional
    // Cập nhật metadata của bài tập từ màn teacher/admin.
    public AssignmentDTO.Response update(Long id, AssignmentDTO.UpdateRequest request) {
        Assignment assignment = findAssignment(id);

        if (request.getClassId() != null) assignment.setClassId(request.getClassId());
        if (request.getTitle() != null) assignment.setTitle(request.getTitle());
        if (request.getDescription() != null) assignment.setDescription(request.getDescription());
        if (request.getType() != null) assignment.setType(request.getType());
        if (request.getExamType() != null) assignment.setExamType(request.getExamType());
        if (request.getExamPart() != null) assignment.setExamPart(request.getExamPart());
        if (request.getPart() != null) assignment.setPart(request.getPart());
        if (request.getDeadline() != null) assignment.setDeadline(request.getDeadline());
        if (request.getMaxScore() != null) assignment.setMaxScore(request.getMaxScore());
        if (request.getStatus() != null) assignment.setStatus(request.getStatus());

        return AssignmentDTO.Response.fromEntity(assignmentRepository.save(assignment));
    }

    @Transactional
    // Xóa một bài tập khỏi hệ thống.
    public void delete(Long id) {
        assignmentRepository.delete(findAssignment(id));
    }

    @Transactional(readOnly = true)
    // Lấy danh sách bài nộp của một assignment.
    public List<AssignmentSubmitDTO.Response> getSubmissions(Long assignmentId) {
        return assignmentSubmitRepository.findByAssignId(assignmentId).stream()
                .map(AssignmentSubmitDTO.Response::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy toàn bộ bài nộp của một học viên.
    public List<AssignmentSubmitDTO.Response> getSubmitsByUser(Long userId) {
        return assignmentSubmitRepository.findByUserId(userId).stream()
                .map(AssignmentSubmitDTO.Response::fromEntity)
                .toList();
    }

    @Transactional
    // Tạo mới hoặc cập nhật lượt nộp bài của user hiện tại cho assignment.
    public AssignmentSubmitDTO.Response submit(Long assignmentId,
                                               AssignmentSubmitDTO.SubmitRequest request,
                                               String authorizationHeader) {
        findAssignment(assignmentId);
        Long userId = currentUserService.extractUserId(authorizationHeader);

        // Mỗi lượt nộp luôn gắn user hiện tại từ JWT để FE không phải tự truyền userId.
        AssignmentSubmit submission = assignmentSubmitRepository
                .findByAssignIdAndUserId(assignmentId, userId).stream()
                .findFirst()
                .orElseGet(AssignmentSubmit::new);
        submission.setAssignId(assignmentId);
        submission.setUserId(userId);
        submission.setContent(request.getContent() != null ? request.getContent() : "");
        submission.setStatus(AssignmentSubmit.Status.submitted);
        submission.setSubmittedAt(LocalDateTime.now());

        return AssignmentSubmitDTO.Response.fromEntity(assignmentSubmitRepository.save(submission));
    }

    @Transactional
    // Chấm điểm và lưu nhận xét cho một bài nộp cụ thể.
    public AssignmentSubmitDTO.Response grade(Long submitId, AssignmentSubmitDTO.GradeRequest request) {
        AssignmentSubmit submission = assignmentSubmitRepository.findById(submitId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài nộp"));

        if (request.getScore() != null) {
            submission.setScore(request.getScore());
        }
        if (request.getComment() != null) {
            submission.setComment(request.getComment());
        }
        submission.setStatus(AssignmentSubmit.Status.graded);
        submission.setUpdatedAt(LocalDateTime.now());

        return AssignmentSubmitDTO.Response.fromEntity(assignmentSubmitRepository.save(submission));
    }

    // Helper tìm assignment hoặc ném lỗi 404.
    private Assignment findAssignment(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài tập"));
    }
}
