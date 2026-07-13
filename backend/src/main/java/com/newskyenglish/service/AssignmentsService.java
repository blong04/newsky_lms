package com.newskyenglish.service;

import com.newskyenglish.dto.assignments.AssignmentsDTO;
import com.newskyenglish.dto.assignments.AssignmentSubmissionsDTO;
import com.newskyenglish.exception.ForbiddenException;
import com.newskyenglish.exception.ResourceNotFoundException;
import com.newskyenglish.model.Assignments;
import com.newskyenglish.model.AssignmentSubmissions;
import com.newskyenglish.model.Classes;
import com.newskyenglish.model.Enrollments;
import com.newskyenglish.repository.AssignmentsRepository;
import com.newskyenglish.repository.AssignmentSubmissionsRepository;
import com.newskyenglish.repository.ClassesRepository;
import com.newskyenglish.repository.EnrollmentsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
// Xử lý CRUD bài tập, bài nộp của học viên và thao tác chấm điểm.
public class AssignmentsService {

    // Repository chính cho bài tập và bài nộp tương ứng của học viên.
    private final AssignmentsRepository assignmentRepository;
    private final AssignmentSubmissionsRepository assignmentSubmitRepository;
    private final ClassesRepository classesRepository;
    private final EnrollmentsRepository enrollmentsRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    // Lấy toàn bộ bài tập trong hệ thống.
    public List<AssignmentsDTO.Response> getAll() {
        return assignmentRepository.findAll().stream()
                .map(AssignmentsDTO.Response::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy chi tiết một bài tập theo id.
    public AssignmentsDTO.Response getById(Long id) {
        return AssignmentsDTO.Response.fromEntity(findAssignment(id));
    }

    @Transactional(readOnly = true)
    // Lấy danh sách bài tập theo lớp học.
    public List<AssignmentsDTO.Response> getByClass(Long classId) {
        return assignmentRepository.findByClassId(classId).stream()
                .map(AssignmentsDTO.Response::fromEntity)
                .toList();
    }

    @Transactional
    // Tạo mới một assignment từ request DTO.
    public AssignmentsDTO.Response create(AssignmentsDTO.CreateRequest request) {
        Assignments assignment = Assignments.builder()
                .classId(request.getClassId())
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .deadline(request.getDeadline())
                .maxScore(request.getMaxScore())
                .status(request.getStatus() != null ? request.getStatus() : Assignments.Status.active)
                .build();

        return AssignmentsDTO.Response.fromEntity(assignmentRepository.save(assignment));
    }

    @Transactional(readOnly = true)
    // Lấy các bài tập thuộc những lớp mà giáo viên hiện tại đang phụ trách.
    public List<AssignmentsDTO.Response> getTeacherAssignments(String authorizationHeader) {
        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        List<Long> classIds = classesRepository.findByTeacherId(teacherId).stream()
                .map(Classes::getId)
                .toList();

        List<Assignments> assignments = classIds.stream()
                .flatMap(classId -> assignmentRepository.findByClassId(classId).stream())
                .collect(Collectors.collectingAndThen(
                        Collectors.toMap(Assignments::getId, assignment -> assignment, (left, right) -> left),
                        map -> map.values().stream().toList()
                ));
        return assignments.stream()
                .map(AssignmentsDTO.Response::fromEntity)
                .toList();
    }

    @Transactional
    // Tạo bài tập mới nhưng chỉ cho lớp mà giáo viên hiện tại thực sự sở hữu.
    public AssignmentsDTO.Response createForTeacher(AssignmentsDTO.CreateRequest request, String authorizationHeader) {
        Long teacherId = currentUserService.extractUserId(authorizationHeader);

        if (request.getClassId() != null) {
            boolean ownsClass = classesRepository.findByTeacherId(teacherId).stream()
                    .anyMatch(classEntity -> classEntity.getId().equals(request.getClassId()));
            if (!ownsClass) {
                throw new ForbiddenException("Bạn không có quyền tạo bài tập cho lớp này");
            }
        }

        return create(request);
    }

    @Transactional
    // Cập nhật metadata của bài tập từ màn teacher/admin.
    public AssignmentsDTO.Response update(Long id,
                                          AssignmentsDTO.UpdateRequest request,
                                          String authorizationHeader) {
        Assignments assignment = findAssignment(id);
        ensureTeacherOwnsAssignmentOrAdmin(assignment, authorizationHeader);

        if (request.getClassId() != null) assignment.setClassId(request.getClassId());
        if (request.getTitle() != null) assignment.setTitle(request.getTitle());
        if (request.getDescription() != null) assignment.setDescription(request.getDescription());
        if (request.getType() != null) assignment.setType(request.getType());
        if (request.getDeadline() != null) assignment.setDeadline(request.getDeadline());
        if (request.getMaxScore() != null) assignment.setMaxScore(request.getMaxScore());
        if (request.getStatus() != null) assignment.setStatus(request.getStatus());

        return AssignmentsDTO.Response.fromEntity(assignmentRepository.save(assignment));
    }

    @Transactional
    // Xóa một bài tập khỏi hệ thống.
    public void delete(Long id, String authorizationHeader) {
        Assignments assignment = findAssignment(id);
        ensureTeacherOwnsAssignmentOrAdmin(assignment, authorizationHeader);
        assignmentRepository.delete(assignment);
    }

    @Transactional(readOnly = true)
    // Lấy danh sách bài nộp của một assignment.
    public List<AssignmentSubmissionsDTO.Response> getSubmissions(Long assignmentId, String authorizationHeader) {
        ensureTeacherOwnsAssignmentOrAdmin(findAssignment(assignmentId), authorizationHeader);
        return assignmentSubmitRepository.findByAssignId(assignmentId).stream()
                .map(AssignmentSubmissionsDTO.Response::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy toàn bộ bài nộp của một học viên.
    public List<AssignmentSubmissionsDTO.Response> getSubmitsByUser(Long userId, String authorizationHeader) {
        ensureSelfOrAdmin(userId, authorizationHeader);
        return assignmentSubmitRepository.findByUserId(userId).stream()
                .map(AssignmentSubmissionsDTO.Response::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    // Giáo viên xem bài nộp của một học viên nhưng chỉ trong phạm vi các lớp mình phụ trách.
    public List<AssignmentSubmissionsDTO.Response> getTeacherStudentSubmissions(Long userId, String authorizationHeader) {
        Set<Long> teacherClassIds = getTeacherManagedClassIds(authorizationHeader);
        if (teacherClassIds.isEmpty()) {
            return List.of();
        }

        Set<Long> teacherAssignmentIds = teacherClassIds.stream()
                .flatMap(classId -> assignmentRepository.findByClassId(classId).stream())
                .map(Assignments::getId)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        return assignmentSubmitRepository.findByUserId(userId).stream()
                .filter(submission -> teacherAssignmentIds.contains(submission.getAssignId()))
                .map(AssignmentSubmissionsDTO.Response::fromEntity)
                .toList();
    }

    @Transactional
    // Tạo mới hoặc cập nhật lượt nộp bài của user hiện tại cho assignment.
    public AssignmentSubmissionsDTO.Response submit(Long assignmentId,
                                               AssignmentSubmissionsDTO.SubmitRequest request,
                                               String authorizationHeader) {
        Long userId = currentUserService.extractUserId(authorizationHeader);
        Assignments assignment = findAssignment(assignmentId);
        ensureStudentHasAssignmentAccess(userId, assignment);

        // Mỗi lượt nộp luôn gắn user hiện tại từ JWT để FE không phải tự truyền userId.
        AssignmentSubmissions submission = assignmentSubmitRepository
                .findByAssignIdAndUserId(assignmentId, userId).stream()
                .findFirst()
                .orElseGet(AssignmentSubmissions::new);
        submission.setAssignId(assignmentId);
        submission.setUserId(userId);
        submission.setContent(request.getContent() != null ? request.getContent() : "");
        submission.setAnswersJson(request.getAnswersJson());
        submission.setStatus(AssignmentSubmissions.Status.submitted);
        submission.setSubmittedAt(LocalDateTime.now());

        return AssignmentSubmissionsDTO.Response.fromEntity(assignmentSubmitRepository.save(submission));
    }

    @Transactional
    // Chấm điểm và lưu nhận xét cho một bài nộp cụ thể.
    public AssignmentSubmissionsDTO.Response grade(Long submitId,
                                                   AssignmentSubmissionsDTO.GradeRequest request,
                                                   String authorizationHeader) {
        AssignmentSubmissions submission = assignmentSubmitRepository.findById(submitId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài nộp"));
        Assignments assignment = findAssignment(submission.getAssignId());
        ensureTeacherOwnsAssignmentOrAdmin(assignment, authorizationHeader);

        if (request.getScore() != null) {
            submission.setScore(request.getScore());
        }
        if (request.getComment() != null) {
            submission.setComment(request.getComment());
        }
        submission.setStatus(AssignmentSubmissions.Status.graded);
        submission.setUpdatedAt(LocalDateTime.now());

        return AssignmentSubmissionsDTO.Response.fromEntity(assignmentSubmitRepository.save(submission));
    }

    // Helper tìm assignment hoặc ném lỗi 404.
    private Assignments findAssignment(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài tập"));
    }

    // Chỉ chính chủ hoặc admin mới xem được danh sách bài nộp theo userId.
    private void ensureSelfOrAdmin(Long targetUserId, String authorizationHeader) {
        Long currentUserId = currentUserService.extractUserId(authorizationHeader);
        if (currentUserId.equals(targetUserId)) {
            return;
        }

        Integer currentRoleId = currentUserService.extractRoleId(authorizationHeader);
        if (Integer.valueOf(1).equals(currentRoleId)) {
            return;
        }

        throw new ForbiddenException("Bạn không có quyền xem bài nộp của người dùng này");
    }

    // Lấy tập lớp mà giáo viên hiện tại đang phụ trách để tái sử dụng cho các màn teacher drill-down.
    private Set<Long> getTeacherManagedClassIds(String authorizationHeader) {
        Integer currentRoleId = currentUserService.extractRoleId(authorizationHeader);
        if (!Integer.valueOf(2).equals(currentRoleId)) {
            throw new ForbiddenException("Bạn không có quyền xem danh sách bài nộp này");
        }

        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        return classesRepository.findByTeacherId(teacherId).stream()
                .map(Classes::getId)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    // Giáo viên chỉ được sửa/xóa/chấm/xem submission của bài tập thuộc lớp mình phụ trách.
    private void ensureTeacherOwnsAssignmentOrAdmin(Assignments assignment, String authorizationHeader) {
        Integer currentRoleId = currentUserService.extractRoleId(authorizationHeader);
        if (Integer.valueOf(1).equals(currentRoleId)) {
            return;
        }

        if (!Integer.valueOf(2).equals(currentRoleId)) {
            throw new ForbiddenException("Bạn không có quyền thao tác với bài tập này");
        }

        Classes classEntity = assignment.getClassId() != null
                ? classesRepository.findById(assignment.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học"))
                : null;
        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        if (classEntity == null || !teacherId.equals(classEntity.getTeacherId())) {
            throw new ForbiddenException("Bạn không có quyền thao tác với bài tập này");
        }
    }

    // Học viên chỉ được nộp bài của lớp mình đã ghi danh và còn hiệu lực học tập.
    private void ensureStudentHasAssignmentAccess(Long userId, Assignments assignment) {
        if (assignment.getClassId() == null) {
            throw new ForbiddenException("Bài tập này chưa gắn với lớp học");
        }

        boolean hasAccess = enrollmentsRepository.findByUserId(userId).stream()
                .anyMatch(enrollment -> assignment.getClassId().equals(enrollment.getClassId())
                        && (enrollment.getStatus() == Enrollments.Status.approved
                        || enrollment.getStatus() == Enrollments.Status.completed));
        if (!hasAccess) {
            throw new ForbiddenException("Bạn chưa được ghi danh vào lớp của bài tập này");
        }
    }
}

