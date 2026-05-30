package com.newskyenglish.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.newskyenglish.dto.dashboard.StudentDashboardDTO;
import com.newskyenglish.dto.enrollment.EnrollmentDTO;
import com.newskyenglish.dto.quiz.QuizDTO;
import com.newskyenglish.exception.BadRequestException;
import com.newskyenglish.exception.ResourceNotFoundException;
import com.newskyenglish.model.ClassRoom;
import com.newskyenglish.model.Course;
import com.newskyenglish.model.Enrollment;
import com.newskyenglish.model.Question;
import com.newskyenglish.model.QuestionGroup;
import com.newskyenglish.model.Quiz;
import com.newskyenglish.model.Submission;
import com.newskyenglish.repository.ClassRoomRepository;
import com.newskyenglish.repository.CourseRepository;
import com.newskyenglish.repository.EnrollmentRepository;
import com.newskyenglish.repository.QuestionGroupRepository;
import com.newskyenglish.repository.QuestionRepository;
import com.newskyenglish.repository.QuizRepository;
import com.newskyenglish.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
// Chứa nghiệp vụ cho học viên: dashboard, đăng ký lớp, làm quiz và xem enrollment của mình.
public class StudentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final ClassRoomRepository classRoomRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuestionGroupRepository questionGroupRepository;
    private final SubmissionRepository submissionRepository;
    private final CurrentUserService currentUserService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    // Tổng hợp số liệu dashboard học viên từ enrollment và lịch sử làm quiz.
    public StudentDashboardDTO.SummaryResponse getDashboardSummary(String authorizationHeader) {
        Long userId = currentUserService.extractUserId(authorizationHeader);
        List<Enrollment> enrollments = enrollmentRepository.findByUserId(userId);

        long activeEnrollmentCount = enrollments.stream()
                .filter(enrollment -> enrollment.getStatus() == Enrollment.Status.approved
                        || enrollment.getStatus() == Enrollment.Status.enrolled)
                .count();
        long completedEnrollmentCount = enrollments.stream()
                .filter(enrollment -> enrollment.getStatus() == Enrollment.Status.completed)
                .count();
        long pendingEnrollmentCount = enrollments.stream()
                .filter(enrollment -> enrollment.getStatus() == Enrollment.Status.pending)
                .count();
        long quizSubmissionCount = submissionRepository.findByUserId(userId).size();

        return StudentDashboardDTO.SummaryResponse.builder()
                .activeEnrollmentCount(activeEnrollmentCount)
                .completedEnrollmentCount(completedEnrollmentCount)
                .pendingEnrollmentCount(pendingEnrollmentCount)
                .quizSubmissionCount(quizSubmissionCount)
                .build();
    }

    @Transactional(readOnly = true)
    // Trả về danh sách enrollment của học viên kèm tên lớp và khóa học.
    public List<EnrollmentDTO.StudentResponse> getMyEnrollments(String authorizationHeader) {
        Long userId = currentUserService.extractUserId(authorizationHeader);
        List<Enrollment> myEnrollments = enrollmentRepository.findByUserId(userId);
        Map<Long, Course> coursesById = buildCourseMap(myEnrollments.stream()
                .map(Enrollment::getCourseId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        Map<Long, ClassRoom> classesById = buildClassRoomMap(myEnrollments.stream()
                .map(Enrollment::getClassId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        Map<Long, Integer> currentStudentsByClassId = classesById.isEmpty()
                ? Map.of()
                : buildCurrentStudentMap(classesById.values().stream().toList());

        return myEnrollments.stream()
                .map(enrollment -> EnrollmentDTO.StudentResponse.fromEntity(
                        enrollment,
                        coursesById.get(enrollment.getCourseId()),
                        classesById.get(enrollment.getClassId()),
                        currentStudentsByClassId.getOrDefault(enrollment.getClassId(), 0)
                ))
                .toList();
    }

    @Transactional
    // Tạo enrollment mới cho học viên vào lớp đã chọn.
    public void enroll(EnrollmentDTO.StudentEnrollRequest request, String authorizationHeader) {
        Long userId = currentUserService.extractUserId(authorizationHeader);
        Long courseId = request.getCourseId();
        Long classId = request.getClassId();
        boolean isPaid = Boolean.TRUE.equals(request.getPaid());

        if (classId == null) {
            throw new BadRequestException("Vui lòng chọn lớp học");
        }
        boolean alreadyEnrolled = enrollmentRepository.findByUserIdAndCourseId(userId, courseId).stream()
                .anyMatch(enrollment -> enrollment.getStatus() != Enrollment.Status.dropped
                        && enrollment.getStatus() != Enrollment.Status.rejected);
        if (alreadyEnrolled) {
            throw new BadRequestException("Bạn đã đăng ký khóa học này");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học"));
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học"));
        int currentStudents = resolveCurrentStudentCount(classId);
        if (classRoom.getMaxStudents() != null && currentStudents >= classRoom.getMaxStudents()) {
            throw new BadRequestException("Không có lớp đang tuyển");
        }

        Enrollment enrollment = Enrollment.builder()
                .userId(userId)
                .courseId(course.getId())
                .classId(classRoom.getId())
                .enrollDate(LocalDateTime.now())
                .status(isPaid ? Enrollment.Status.approved : Enrollment.Status.pending)
                .paid(isPaid)
                .build();

        enrollmentRepository.save(enrollment);
    }

    // Sinh thông báo trả về sau khi học viên đăng ký thành công.
    public String getEnrollmentSuccessMessage(boolean isPaid) {
        return isPaid
                ? "Đăng ký thành công! Thanh toán được xác nhận."
                : "Gửi yêu cầu thành công! Vui lòng chờ admin phê duyệt.";
    }

    @Transactional(readOnly = true)
    // Lấy dữ liệu quiz để học viên làm bài, đồng thời ẩn đáp án đúng.
    public QuizDTO.StudentQuizResponse getQuiz(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài quiz"));

        List<QuestionGroup> groups = questionGroupRepository.findByQuizIdOrderByOrderNumAsc(quizId);
        List<Question> questions = questionRepository.findByQuizIdOrderByOrderNumAsc(quizId);

        return QuizDTO.StudentQuizResponse.builder()
                .quiz(QuizDTO.Response.fromEntity(quiz, (long) questions.size()))
                .groups(groups.stream().map(QuizDTO.GroupResponse::fromEntity).toList())
                .questions(questions.stream().map(QuizDTO.QuestionResponse::fromEntity).toList())
                .build();
    }

    @Transactional
    // Lưu bài làm quiz của học viên và chấm phần có thể auto-grade.
    public QuizDTO.SubmitResultResponse submitQuiz(Long quizId,
                                                   QuizDTO.SubmitRequest request,
                                                   String authorizationHeader) {
        Long userId = currentUserService.extractUserId(authorizationHeader);
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài quiz"));

        Map<String, Object> submittedAnswers = request.getAnswers() != null ? request.getAnswers() : Map.of();

        List<Question> questions = questionRepository.findByQuizIdOrderByOrderNumAsc(quizId);
        int correctCount = 0;
        int autoGradableQuestionCount = 0;
        Map<String, Object> normalizedAnswers = new LinkedHashMap<>();

        for (Question question : questions) {
            Object answer = submittedAnswers.get(String.valueOf(question.getId()));
            if (answer == null) {
                answer = submittedAnswers.get(question.getId());
            }
            String normalizedAnswer = answer != null ? answer.toString().trim() : "";
            normalizedAnswers.put(String.valueOf(question.getId()), normalizedAnswer);

            // Câu tự luận chưa auto-grade nên bỏ qua khi tính score tự động.
            if ("writing".equalsIgnoreCase(question.getQuestionType())) {
                continue;
            }

            autoGradableQuestionCount++;
            String correctAnswer = question.getCorrectAnswer() != null
                    ? question.getCorrectAnswer().trim()
                    : "";
            if (normalizedAnswer.equalsIgnoreCase(correctAnswer)) {
                correctCount++;
            }
        }

        int score = autoGradableQuestionCount > 0
                ? Math.round((correctCount * 100f) / autoGradableQuestionCount)
                : 0;
        Integer timeSpent = request.getTimeSpent();

        // Cho phép học viên nộp lại thì ghi đè lên submission gần nhất cùng quiz.
        Submission submission = submissionRepository.findFirstByQuizIdAndUserId(quizId, userId)
                .orElseGet(Submission::new);
        submission.setQuizId(quiz.getId());
        submission.setUserId(userId);
        submission.setAnswers(writeAnswersAsJson(normalizedAnswers));
        submission.setScore((float) score);
        submission.setTimeSpent(timeSpent);
        submission.setSubmittedAt(LocalDateTime.now());
        submissionRepository.save(submission);

        return QuizDTO.SubmitResultResponse.builder()
                .submissionId(submission.getId())
                .correct(correctCount)
                .total(autoGradableQuestionCount)
                .score(score)
                .build();
    }

    // Helper preload course map để enrich enrollment mà không query lặp.
    private Map<Long, Course> buildCourseMap(Set<Long> courseIds) {
        return courseRepository.findAllById(courseIds).stream()
                .collect(Collectors.toMap(Course::getId, Function.identity()));
    }

    // Helper preload classRoom map để gắn thông tin lớp cho enrollment.
    private Map<Long, ClassRoom> buildClassRoomMap(Set<Long> classIds) {
        return classRoomRepository.findAllById(classIds).stream()
                .collect(Collectors.toMap(ClassRoom::getId, Function.identity()));
    }

    // Tính sĩ số thực tế theo lớp từ enrollment còn hiệu lực.
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

    // Đếm số học viên hiện có của một lớp để kiểm tra còn chỗ đăng ký hay không.
    private int resolveCurrentStudentCount(Long classId) {
        return (int) enrollmentRepository.findByClassId(classId).stream()
                .filter(enrollment -> enrollment.getStatus() == Enrollment.Status.approved
                        || enrollment.getStatus() == Enrollment.Status.enrolled
                        || enrollment.getStatus() == Enrollment.Status.completed)
                .count();
    }

    // Lưu đáp án theo JSON để frontend dễ parse lại khi xem kết quả.
    private String writeAnswersAsJson(Map<String, Object> answers) {
        try {
            return objectMapper.writeValueAsString(answers);
        } catch (JsonProcessingException exception) {
            throw new BadRequestException("Không thể lưu bài làm quiz");
        }
    }
}
