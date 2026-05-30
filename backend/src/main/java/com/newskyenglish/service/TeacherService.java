package com.newskyenglish.service;

import com.newskyenglish.dto.assignment.AssignmentDTO;
import com.newskyenglish.dto.dashboard.TeacherDashboardDTO;
import com.newskyenglish.dto.classroom.ClassRoomDTO;
import com.newskyenglish.dto.enrollment.EnrollmentDTO;
import com.newskyenglish.dto.notification.NotificationDTO;
import com.newskyenglish.dto.quiz.QuizDTO;
import com.newskyenglish.exception.ForbiddenException;
import com.newskyenglish.exception.ResourceNotFoundException;
import com.newskyenglish.model.Assignment;
import com.newskyenglish.model.AssignmentSubmit;
import com.newskyenglish.model.ClassRoom;
import com.newskyenglish.model.Course;
import com.newskyenglish.model.Enrollment;
import com.newskyenglish.model.Quiz;
import com.newskyenglish.model.Submission;
import com.newskyenglish.model.User;
import com.newskyenglish.model.UserNotification;
import com.newskyenglish.repository.AssignmentSubmitRepository;
import com.newskyenglish.repository.AssignmentRepository;
import com.newskyenglish.repository.ClassRoomRepository;
import com.newskyenglish.repository.CourseRepository;
import com.newskyenglish.repository.EnrollmentRepository;
import com.newskyenglish.repository.QuestionRepository;
import com.newskyenglish.repository.QuizRepository;
import com.newskyenglish.repository.SubmissionRepository;
import com.newskyenglish.repository.UserNotificationRepository;
import com.newskyenglish.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
// Chứa nghiệp vụ dành cho giáo viên: dashboard, lớp học, bài tập và thông báo.
public class TeacherService {

    // Tập repository cần cho nghiệp vụ teacher theo lớp mình phụ trách.
    private final ClassRoomRepository classRoomRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmitRepository assignmentSubmitRepository;
    private final CourseRepository courseRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final UserNotificationRepository userNotificationRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    // Tổng hợp số liệu dashboard để giáo viên thấy nhanh khối lượng công việc hiện tại.
    public TeacherDashboardDTO.SummaryResponse getDashboardSummary(String authorizationHeader) {
        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        List<ClassRoom> assignedClasses = classRoomRepository.findByTeacherId(teacherId);
        List<Long> assignedClassIds = assignedClasses.stream()
                .map(ClassRoom::getId)
                .toList();

        List<Assignment> assignments = collectAssignmentsByClassIds(assignedClassIds);
        List<Long> assignmentIds = assignments.stream()
                .map(Assignment::getId)
                .distinct()
                .toList();

        long pendingSubmissionCount = 0;
        for (Long assignmentId : assignmentIds) {
            pendingSubmissionCount += assignmentSubmitRepository.findByAssignId(assignmentId).stream()
                    .filter(submit -> submit.getStatus() != AssignmentSubmit.Status.graded)
                    .count();
        }

        return TeacherDashboardDTO.SummaryResponse.builder()
                .classCount((long) assignedClasses.size())
                .assignmentCount((long) assignmentIds.size())
                .pendingCount(pendingSubmissionCount)
                .build();
    }

    @Transactional(readOnly = true)
    // Lấy danh sách lớp mà giáo viên hiện tại đang phụ trách.
    public List<ClassRoomDTO.Response> getMyClasses(String authorizationHeader) {
        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        List<ClassRoom> assignedClasses = classRoomRepository.findByTeacherId(teacherId);
        Map<Long, Course> coursesById = buildCourseMap(assignedClasses.stream()
                .map(ClassRoom::getCourseId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        Map<Long, Integer> currentStudentsByClassId = buildCurrentStudentMap(assignedClasses);
        String teacherName = resolveTeacherName(teacherId);

        return assignedClasses.stream()
                .map(classRoom -> {
                    Course course = coursesById.get(classRoom.getCourseId());
                    return ClassRoomDTO.Response.fromEntity(
                            classRoom,
                            currentStudentsByClassId.getOrDefault(classRoom.getId(), 0),
                            teacherName,
                            course != null ? course.getTitle() : null,
                            course != null ? course.getExamType() : null
                    );
                })
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy danh sách học viên đăng ký trong một lớp.
    public List<EnrollmentDTO.TeacherStudentResponse> getStudents(Long classId, String authorizationHeader) {
        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học"));

        if (!teacherId.equals(classRoom.getTeacherId())) {
            throw new ForbiddenException("Bạn không có quyền xem học viên của lớp này");
        }

        Course course = classRoom.getCourseId() != null
                ? courseRepository.findById(classRoom.getCourseId()).orElse(null)
                : null;
        List<Enrollment> enrollments = enrollmentRepository.findByClassId(classId);
        Map<Long, User> usersById = buildUserMap(enrollments.stream()
                .map(Enrollment::getUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));

        return enrollments.stream()
                .filter(enrollment -> enrollment.getStatus() == Enrollment.Status.approved
                        || enrollment.getStatus() == Enrollment.Status.enrolled
                        || enrollment.getStatus() == Enrollment.Status.completed)
                .map(enrollment -> EnrollmentDTO.TeacherStudentResponse.fromEntity(
                        enrollment,
                        usersById.get(enrollment.getUserId()),
                        course,
                        classRoom
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy toàn bộ assignment thuộc các lớp của giáo viên hiện tại.
    public List<AssignmentDTO.Response> getMyAssignments(String authorizationHeader) {
        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        List<Long> classIds = classRoomRepository.findByTeacherId(teacherId).stream()
                .map(ClassRoom::getId)
                .toList();

        return collectAssignmentsByClassIds(classIds).stream()
                .collect(Collectors.collectingAndThen(
                        Collectors.toMap(Assignment::getId, assignment -> assignment, (left, right) -> left),
                        map -> new ArrayList<>(map.values())
                ))
                .stream()
                .map(AssignmentDTO.Response::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy danh sách quiz thuộc các lớp mà giáo viên đang phụ trách.
    public List<QuizDTO.Response> getMyQuizzes(String authorizationHeader) {
        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        List<Long> classIds = classRoomRepository.findByTeacherId(teacherId).stream()
                .map(ClassRoom::getId)
                .toList();

        return quizRepository.findByClassIdIn(classIds).stream()
                .map(quiz -> QuizDTO.Response.fromEntity(quiz, questionRepository.countByQuizId(quiz.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy kết quả nộp bài của một quiz nếu quiz đó thuộc lớp giáo viên đang quản lý.
    public List<QuizDTO.SubmissionResponse> getQuizSubmissions(Long quizId, String authorizationHeader) {
        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài kiểm tra"));
        assertTeacherOwnsQuiz(teacherId, quiz);

        return submissionRepository.findByQuizId(quizId).stream()
                .map(QuizDTO.SubmissionResponse::fromEntity)
                .toList();
    }

    @Transactional
    // Giáo viên có thể chấm lại điểm cuối cùng cho bài làm quiz của lớp mình.
    public QuizDTO.SubmissionResponse gradeQuizSubmission(Long submissionId,
                                                          QuizDTO.GradeSubmissionRequest request,
                                                          String authorizationHeader) {
        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài làm quiz"));
        Quiz quiz = quizRepository.findById(submission.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài kiểm tra"));
        assertTeacherOwnsQuiz(teacherId, quiz);

        submission.setScore(request.getScore());
        return QuizDTO.SubmissionResponse.fromEntity(submissionRepository.save(submission));
    }

    @Transactional
    // Tạo assignment mới nhưng chỉ cho phép trên lớp giáo viên sở hữu.
    public AssignmentDTO.Response createAssignment(AssignmentDTO.CreateRequest request, String authorizationHeader) {
        Long teacherId = currentUserService.extractUserId(authorizationHeader);

        if (request.getClassId() != null) {
            boolean ownsClass = classRoomRepository.findByTeacherId(teacherId).stream()
                    .anyMatch(classRoom -> classRoom.getId().equals(request.getClassId()));
            if (!ownsClass) {
                throw new ForbiddenException("Bạn không có quyền tạo bài tập cho lớp này");
            }
        }

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
    // Gửi thông báo tới học viên trong lớp mà giáo viên đang phụ trách.
    public NotificationDTO.SendResult sendNotification(NotificationDTO.BroadcastRequest request, String authorizationHeader) {
        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        String title = request.getTitle();
        String content = request.getContent();
        String type = request.getType() != null ? request.getType() : "course";

        if (title == null || title.isBlank() || content == null || content.isBlank()) {
            throw new ForbiddenException("Thiếu tiêu đề hoặc nội dung thông báo");
        }

        List<Long> ownedClassIds = classRoomRepository.findByTeacherId(teacherId).stream()
                .map(ClassRoom::getId)
                .toList();

        List<User> targetUsers = resolveTeacherTargets(request, ownedClassIds);
        List<UserNotification> notifications = targetUsers.stream()
                .map(user -> UserNotification.builder()
                        .userId(user.getId())
                        .title(title)
                        .content(content)
                        .type(type)
                        .read(false)
                        .build())
                .toList();

        userNotificationRepository.saveAll(notifications);
        return NotificationDTO.SendResult.fromCount(notifications.size());
    }

    // Xác định đúng tập học viên mà giáo viên được phép gửi thông báo tới.
    private List<User> resolveTeacherTargets(NotificationDTO.BroadcastRequest request, List<Long> ownedClassIds) {
        Long targetUserId = request.getTargetUserId();
        Long targetClassId = request.getTargetClassId();

        if (targetUserId != null) {
            Long userId = targetUserId;
            boolean belongsToTeacher = ownedClassIds.stream().anyMatch(classId ->
                    enrollmentRepository.findByClassId(classId).stream()
                            .anyMatch(enrollment -> enrollment.getUserId().equals(userId))
            );
            if (!belongsToTeacher) {
                throw new ForbiddenException("Bạn chỉ có thể gửi cho học viên thuộc lớp của mình");
            }
            return List.of(userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học viên")));
        }

        if (targetClassId != null) {
            Long classId = targetClassId;
            if (!ownedClassIds.contains(classId)) {
                throw new ForbiddenException("Bạn không có quyền gửi cho lớp này");
            }
            List<Enrollment> enrollments = enrollmentRepository.findByClassId(classId);
            Map<Long, User> usersById = buildUserMap(enrollments.stream()
                    .map(Enrollment::getUserId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet()));
            return enrollments.stream()
                    .map(enrollment -> usersById.get(enrollment.getUserId()))
                    .filter(user -> user != null && user.getRoleId() == 3)
                    .distinct()
                    .toList();
        }

        throw new ForbiddenException("Vui lòng chọn lớp hoặc học viên nhận thông báo");
    }

    // Helper gom tất cả assignment thuộc danh sách lớp của giáo viên.
    private List<Assignment> collectAssignmentsByClassIds(List<Long> classIds) {
        List<Assignment> assignments = new ArrayList<>();
        for (Long classId : classIds) {
            assignments.addAll(assignmentRepository.findByClassId(classId));
        }
        return assignments;
    }

    // Helper lấy tên giáo viên khi cần enrich response lớp học.
    private String resolveTeacherName(Long teacherId) {
        if (teacherId == null) {
            return null;
        }
        return userRepository.findById(teacherId).map(User::getName).orElse(null);
    }

    // Helper preload user map để tái sử dụng cho danh sách học viên/thông báo.
    private Map<Long, User> buildUserMap(Set<Long> userIds) {
        return userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
    }

    // Helper preload course map cho response lớp học đã enrich.
    private Map<Long, Course> buildCourseMap(Set<Long> courseIds) {
        return courseRepository.findAllById(courseIds).stream()
                .collect(Collectors.toMap(Course::getId, Function.identity()));
    }

    // Tính sĩ số thực của từng lớp từ enrollment còn hiệu lực.
    private Map<Long, Integer> buildCurrentStudentMap(List<ClassRoom> classRooms) {
        List<Long> classIds = classRooms.stream()
                .map(ClassRoom::getId)
                .toList();

        return enrollmentRepository.findByClassIdIn(classIds).stream()
                .filter(enrollment -> enrollment.getStatus() == Enrollment.Status.approved
                        || enrollment.getStatus() == Enrollment.Status.enrolled
                        || enrollment.getStatus() == Enrollment.Status.completed)
                .collect(Collectors.groupingBy(
                        Enrollment::getClassId,
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));
    }

    // Đảm bảo giáo viên chỉ thao tác được với quiz thuộc lớp mình phụ trách.
    private void assertTeacherOwnsQuiz(Long teacherId, Quiz quiz) {
        if (quiz.getClassId() == null) {
            throw new ForbiddenException("Bài kiểm tra chưa gắn với lớp học");
        }

        ClassRoom classRoom = classRoomRepository.findById(quiz.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học"));
        if (!teacherId.equals(classRoom.getTeacherId())) {
            throw new ForbiddenException("Bạn không có quyền thao tác với bài kiểm tra này");
        }
    }
}
