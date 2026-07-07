package com.newskyenglish.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.newskyenglish.dto.tests.TestsDTO;
import com.newskyenglish.exception.BadRequestException;
import com.newskyenglish.exception.ForbiddenException;
import com.newskyenglish.exception.ResourceNotFoundException;
import com.newskyenglish.model.Classes;
import com.newskyenglish.model.Enrollments;
import com.newskyenglish.model.QuestionGroups;
import com.newskyenglish.model.Questions;
import com.newskyenglish.model.TestClasses;
import com.newskyenglish.model.TestSubmissions;
import com.newskyenglish.model.Tests;
import com.newskyenglish.repository.ClassesRepository;
import com.newskyenglish.repository.EnrollmentsRepository;
import com.newskyenglish.repository.QuestionGroupsRepository;
import com.newskyenglish.repository.QuestionsRepository;
import com.newskyenglish.repository.TestClassesRepository;
import com.newskyenglish.repository.TestSubmissionsRepository;
import com.newskyenglish.repository.TestsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
// Cung cấp nghiệp vụ cho bảng mock_tests, test_classes và mock_test_submissions.
public class TestsService {

    private final TestsRepository testsRepository;
    private final TestClassesRepository testClassesRepository;
    private final TestSubmissionsRepository testSubmissionsRepository;
    private final QuestionGroupsRepository questionGroupsRepository;
    private final QuestionsRepository questionsRepository;
    private final ClassesRepository classesRepository;
    private final EnrollmentsRepository enrollmentsRepository;
    private final CurrentUserService currentUserService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    // Lấy toàn bộ bài test full form trong hệ thống.
    public List<TestsDTO.Response> getAll() {
        return testsRepository.findAll().stream()
                .map(this::toTestResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy chi tiết một bài test theo id.
    public TestsDTO.Response getById(Long id) {
        Tests test = findTest(id);
        List<QuestionGroups> groups = getTestGroups(id);
        List<Questions> questions = getQuestionsByGroups(groups);
        return toTestResponse(test, groups, questions);
    }

    @Transactional(readOnly = true)
    // Lấy các bài test gắn với một lớp học cụ thể thông qua bảng test_classes.
    public List<TestsDTO.Response> getByClass(Long classId) {
        List<Long> testIds = testClassesRepository.findByClassId(classId).stream()
                .map(TestClasses::getMockTestId)
                .distinct()
                .toList();
        return getTestsByIds(testIds).stream()
                .map(this::toTestResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy lịch sử nộp của một bài test để chấm hoặc xem kết quả.
    public List<TestsDTO.SubmissionResponse> getSubmissions(Long testId) {
        return testSubmissionsRepository.findByMockTestId(testId).stream()
                .map(TestsDTO.SubmissionResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy full dữ liệu test cho admin/teacher quản lý hoặc học viên xem lại sau khi nộp.
    public TestsDTO.FullResponse getFullTest(Long testId, String authorizationHeader) {
        Tests test = findTest(testId);
        ensureFullTestAccess(test, authorizationHeader);
        List<QuestionGroups> groups = getTestGroups(testId);
        List<Questions> questions = getQuestionsByGroups(groups);

        return TestsDTO.FullResponse.builder()
                .test(toTestResponse(test, groups, questions))
                .groups(groups.stream().map(TestsDTO.GroupResponse::fromEntity).toList())
                .questions(questions.stream().map(TestsDTO.QuestionDetailResponse::fromEntity).toList())
                .build();
    }

    @Transactional(readOnly = true)
    // Lấy dữ liệu test dành riêng cho màn học viên làm bài.
    public TestsDTO.StudentTestResponse getStudentTest(Long testId, String authorizationHeader) {
        Tests test = findTest(testId);
        Long userId = currentUserService.extractUserId(authorizationHeader);
        ensureStudentHasTestAccess(test, userId);

        List<QuestionGroups> groups = getTestGroups(testId);
        List<Questions> questions = getQuestionsByGroups(groups);

        return TestsDTO.StudentTestResponse.builder()
                .test(toTestResponse(test, groups, questions))
                .groups(groups.stream().map(TestsDTO.GroupResponse::fromEntity).toList())
                .questions(questions.stream().map(TestsDTO.QuestionResponse::fromEntity).toList())
                .build();
    }

    @Transactional(readOnly = true)
    // Lấy danh sách test thuộc các lớp giáo viên hiện tại đang phụ trách.
    public List<TestsDTO.Response> getTeacherTests(String authorizationHeader) {
        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        List<Long> classIds = classesRepository.findByTeacherId(teacherId).stream()
                .map(Classes::getId)
                .toList();

        List<Long> testIds = testClassesRepository.findByClassIdIn(classIds).stream()
                .map(TestClasses::getMockTestId)
                .distinct()
                .toList();

        return getTestsByIds(testIds).stream()
                .map(this::toTestResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy bài làm test của học viên cho một bài test thuộc lớp giáo viên quản lý.
    public List<TestsDTO.SubmissionResponse> getTeacherTestSubmissions(Long testId, String authorizationHeader) {
        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        Tests test = findTest(testId);
        assertTeacherOwnsTest(teacherId, test);

        return testSubmissionsRepository.findByMockTestId(testId).stream()
                .map(TestsDTO.SubmissionResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy lịch sử làm test của một học viên cụ thể.
    public List<TestsDTO.SubmissionResponse> getUserSubmissions(Long userId, String authorizationHeader) {
        ensureSelfOrAdmin(userId, authorizationHeader);
        return testSubmissionsRepository.findByUserId(userId).stream()
                .map(TestsDTO.SubmissionResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    // Giáo viên xem bài thi thử mà một học viên đã nộp trong các lớp mình phụ trách.
    public List<TestsDTO.SubmissionResponse> getTeacherStudentSubmissions(Long userId, String authorizationHeader) {
        Set<Long> teacherClassIds = getTeacherManagedClassIds(authorizationHeader);
        if (teacherClassIds.isEmpty()) {
            return List.of();
        }

        Set<Long> teacherTestIds = testClassesRepository.findByClassIdIn(teacherClassIds).stream()
                .map(TestClasses::getMockTestId)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        return testSubmissionsRepository.findByUserId(userId).stream()
                .filter(submission -> teacherTestIds.contains(submission.getMockTestId()))
                .map(TestsDTO.SubmissionResponse::fromEntity)
                .toList();
    }

    @Transactional
    // Tạo mới một bài test full form từ request DTO.
    public TestsDTO.Response create(TestsDTO.CreateRequest request) {
        Tests test = Tests.builder()
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
                .status(request.getStatus() != null ? request.getStatus() : "active")
                .build();
        Tests savedTest = testsRepository.save(test);
        syncTestClasses(savedTest.getId(), resolveRequestedClassIds(request.getClassIds(), request.getClassId()));
        Map<String, Long> groupIdMap = createOrRefreshTestGroups(savedTest.getId(), request.getGroups(), false);
        createTestQuestions(request.getQuestions(), groupIdMap);

        List<QuestionGroups> groups = getTestGroups(savedTest.getId());
        List<Questions> questions = getQuestionsByGroups(groups);
        return toTestResponse(savedTest, groups, questions);
    }

    @Transactional
    // Cập nhật metadata của một bài test hiện có.
    public TestsDTO.Response update(Long id, TestsDTO.UpdateRequest request) {
        Tests test = findTest(id);

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
        Tests savedTest = testsRepository.save(test);

        if (request.getClassIds() != null || request.getClassId() != null) {
            syncTestClasses(savedTest.getId(), resolveRequestedClassIds(request.getClassIds(), request.getClassId()));
        }

        if (request.getGroups() != null || request.getQuestions() != null) {
            Map<String, Long> groupIdMap = createOrRefreshTestGroups(savedTest.getId(), request.getGroups(), true);
            createTestQuestions(request.getQuestions(), groupIdMap);
        }

        List<QuestionGroups> groups = getTestGroups(savedTest.getId());
        List<Questions> questions = getQuestionsByGroups(groups);
        return toTestResponse(savedTest, groups, questions);
    }

    @Transactional
    // Xóa một bài test khi không còn sử dụng.
    public void delete(Long id) {
        testsRepository.delete(findTest(id));
    }

    @Transactional
    // Học viên nộp bài test, hệ thống chấm phần auto-grade và lưu điểm tổng.
    public TestsDTO.SubmitResultResponse submitStudentTest(Long testId,
                                                           TestsDTO.SubmitRequest request,
                                                           String authorizationHeader) {
        Long userId = currentUserService.extractUserId(authorizationHeader);
        Tests test = findTest(testId);
        ensureStudentHasTestAccess(test, userId);

        List<TestSubmissions> previousSubmissions = testSubmissionsRepository
                .findByMockTestIdAndUserIdOrderByAttemptNumberDesc(testId, userId);
        int nextAttemptNumber = previousSubmissions.isEmpty() ? 1 : previousSubmissions.get(0).getAttemptNumber() + 1;
        if (test.getAttemptsAllowed() != null && nextAttemptNumber > test.getAttemptsAllowed()) {
            throw new BadRequestException("Bạn đã dùng hết số lần làm bài cho bài thi thử này");
        }

        Map<String, Object> submittedAnswers = request.getAnswers() != null ? request.getAnswers() : Map.of();
        List<Questions> questions = getQuestionsByGroups(getTestGroups(testId));
        int correctCount = 0;
        int autoGradableQuestionCount = 0;
        Map<String, Object> normalizedAnswers = new LinkedHashMap<>();

        for (Questions question : questions) {
            Object answer = submittedAnswers.get(String.valueOf(question.getId()));
            if (answer == null) {
                answer = submittedAnswers.get(question.getId());
            }
            String normalizedAnswer = answer != null ? answer.toString().trim() : "";
            normalizedAnswers.put(String.valueOf(question.getId()), normalizedAnswer);

            if ("writing".equalsIgnoreCase(question.getQuestionType())) {
                continue;
            }

            autoGradableQuestionCount++;
            String correctAnswer = question.getCorrectAnswer() != null ? question.getCorrectAnswer().trim() : "";
            if (normalizedAnswer.equalsIgnoreCase(correctAnswer)) {
                correctCount++;
            }
        }

        BigDecimal maxScore = test.getTotalScore() != null ? test.getTotalScore() : BigDecimal.valueOf(100);
        BigDecimal score = autoGradableQuestionCount > 0
                ? maxScore
                .multiply(BigDecimal.valueOf(correctCount))
                .divide(BigDecimal.valueOf(autoGradableQuestionCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        TestSubmissions submission = TestSubmissions.builder()
                .mockTestId(test.getId())
                .userId(userId)
                .answersJson(writeAnswersAsJson(normalizedAnswers))
                .startedAt(LocalDateTime.now().minusSeconds(request.getDurationSeconds() != null ? request.getDurationSeconds() : 0))
                .submittedAt(LocalDateTime.now())
                .durationSeconds(request.getDurationSeconds())
                .totalScore(score)
                .correctAnswers(correctCount)
                .totalQuestions(autoGradableQuestionCount)
                .attemptNumber(nextAttemptNumber)
                .status("submitted")
                .build();
        TestSubmissions savedSubmission = testSubmissionsRepository.save(submission);

        return TestsDTO.SubmitResultResponse.builder()
                .submissionId(savedSubmission.getId())
                .correct(correctCount)
                .total(autoGradableQuestionCount)
                .score(score)
                .build();
    }

    @Transactional
    // Giáo viên chấm hoặc sửa điểm cuối cùng cho bài làm test thuộc lớp mình.
    public TestsDTO.SubmissionResponse gradeTeacherSubmission(Long submissionId,
                                                              TestsDTO.GradeSubmissionRequest request,
                                                              String authorizationHeader) {
        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        TestSubmissions submission = testSubmissionsRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài làm test"));
        Tests test = findTest(submission.getMockTestId());
        assertTeacherOwnsTest(teacherId, test);

        submission.setTotalScore(request.getTotalScore());
        submission.setStatus("graded");
        return TestsDTO.SubmissionResponse.fromEntity(testSubmissionsRepository.save(submission));
    }

    // Map test entity sang response đồng nhất có kèm lớp học và thông tin thời gian.
    private TestsDTO.Response toTestResponse(Tests test) {
        List<QuestionGroups> groups = getTestGroups(test.getId());
        List<Questions> questions = getQuestionsByGroups(groups);
        return toTestResponse(test, groups, questions);
    }

    // Tái sử dụng dữ liệu đã load sẵn để tránh query lặp lại trong cùng request.
    private TestsDTO.Response toTestResponse(Tests test, List<QuestionGroups> groups, List<Questions> questions) {
        return TestsDTO.Response.fromEntity(test, getTestClassIds(test.getId()));
    }

    // Tìm test hoặc ném lỗi 404.
    private Tests findTest(Long id) {
        return testsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài test"));
    }

    // Lấy group của một mock test theo đúng thứ tự đã lưu.
    private List<QuestionGroups> getTestGroups(Long mockTestId) {
        return questionGroupsRepository.findByMockTestIdOrderByOrderNumAsc(mockTestId);
    }

    // Lấy câu hỏi theo group và sắp xếp theo block rồi đến thứ tự câu hỏi.
    private List<Questions> getQuestionsByGroups(List<QuestionGroups> groups) {
        if (groups.isEmpty()) {
            return List.of();
        }

        Map<Long, Integer> groupOrderMap = groups.stream()
                .collect(Collectors.toMap(
                        QuestionGroups::getId,
                        group -> group.getOrderNum() != null ? group.getOrderNum() : 1,
                        (left, right) -> left,
                        LinkedHashMap::new
                ));

        List<Questions> questions = new ArrayList<>(
                questionsRepository.findByGroupIdInOrderByOrderNumAsc(groupOrderMap.keySet())
        );
        questions.sort(Comparator
                .comparing((Questions question) -> groupOrderMap.getOrDefault(question.getGroupId(), Integer.MAX_VALUE))
                .thenComparing(question -> question.getOrderNum() != null ? question.getOrderNum() : Integer.MAX_VALUE)
                .thenComparing(Questions::getId));
        return questions;
    }

    // Ghi đè toàn bộ group của mock test và trả map clientKey -> groupId mới tạo.
    private Map<String, Long> createOrRefreshTestGroups(Long mockTestId,
                                                        List<TestsDTO.GroupRequest> groupRequests,
                                                        boolean replaceExisting) {
        if (replaceExisting) {
            questionGroupsRepository.deleteByMockTestId(mockTestId);
        }

        Map<String, Long> groupIdMap = new HashMap<>();
        if (groupRequests == null) {
            return groupIdMap;
        }

        for (TestsDTO.GroupRequest groupRequest : groupRequests) {
            QuestionGroups group = QuestionGroups.builder()
                    .quizId(null)
                    .assignId(null)
                    .title(groupRequest.getTitle())
                    .passageText(groupRequest.getPassageText())
                    .imageUrl(groupRequest.getImageUrl())
                    .audioUrl(groupRequest.getAudioUrl())
                    .instructions(groupRequest.getInstructions())
                    .orderNum(groupRequest.getOrderNum() != null ? groupRequest.getOrderNum() : 1)
                    .mockTestId(mockTestId)
                    .build();
            QuestionGroups savedGroup = questionGroupsRepository.save(group);
            if (groupRequest.getClientKey() != null && !groupRequest.getClientKey().isBlank()) {
                groupIdMap.put(groupRequest.getClientKey(), savedGroup.getId());
            }
        }

        return groupIdMap;
    }

    // Tạo lại toàn bộ câu hỏi của mock test sau khi group đã được lưu xong.
    private void createTestQuestions(List<TestsDTO.QuestionRequest> questionRequests,
                                     Map<String, Long> groupIdMap) {
        if (questionRequests == null) {
            return;
        }

        for (TestsDTO.QuestionRequest questionRequest : questionRequests) {
            Long resolvedGroupId = resolveGroupId(questionRequest.getGroupId(), questionRequest.getGroupKey(), groupIdMap);
            if (resolvedGroupId == null) {
                throw new BadRequestException("Mỗi câu hỏi của bài thi thử phải thuộc một nhóm câu hỏi hợp lệ");
            }

            Questions question = Questions.builder()
                    .groupId(resolvedGroupId)
                    .questionType(questionRequest.getQuestionType())
                    .content(questionRequest.getContent())
                    .imageUrl(questionRequest.getImageUrl())
                    .audioUrl(questionRequest.getAudioUrl())
                    .optionA(questionRequest.getOptionA())
                    .optionB(questionRequest.getOptionB())
                    .optionC(questionRequest.getOptionC())
                    .optionD(questionRequest.getOptionD())
                    .correctAnswer(questionRequest.getCorrectAnswer())
                    .explanation(questionRequest.getExplanation())
                    .orderNum(questionRequest.getOrderNum() != null ? questionRequest.getOrderNum() : 1)
                    .build();
            questionsRepository.save(question);
        }
    }

    // Đồng bộ toàn bộ liên kết mock test - lớp qua bảng test_classes.
    private void syncTestClasses(Long mockTestId, List<Long> classIds) {
        validateClassIds(classIds);
        testClassesRepository.deleteByMockTestId(mockTestId);
        if (classIds == null || classIds.isEmpty()) {
            return;
        }

        for (Long classId : classIds) {
            testClassesRepository.save(TestClasses.builder()
                    .mockTestId(mockTestId)
                    .classId(classId)
                    .build());
        }
    }

    // Gom payload mới/cũ về cùng một danh sách class id duy nhất, loại trùng nhưng giữ thứ tự chọn.
    private List<Long> resolveRequestedClassIds(List<Long> classIds, Long classId) {
        LinkedHashSet<Long> normalizedClassIds = new LinkedHashSet<>();
        if (classIds != null) {
            classIds.stream()
                    .filter(id -> id != null && id > 0)
                    .forEach(normalizedClassIds::add);
        }
        if (classId != null && classId > 0) {
            normalizedClassIds.add(classId);
        }
        return List.copyOf(normalizedClassIds);
    }

    // Chặn trường hợp payload gắn mock test tới lớp không tồn tại.
    private void validateClassIds(List<Long> classIds) {
        if (classIds == null || classIds.isEmpty()) {
            return;
        }

        long existingCount = classesRepository.findAllById(classIds).stream().count();
        if (existingCount != classIds.size()) {
            throw new BadRequestException("Có lớp học không tồn tại trong danh sách được gắn với bài thi thử");
        }
    }

    // Ưu tiên groupId thật, nếu chưa có thì resolve từ groupKey frontend gửi lên trong cùng request.
    private Long resolveGroupId(Long groupId, String groupKey, Map<String, Long> groupIdMap) {
        if (groupId != null) {
            return groupId;
        }
        if (groupKey == null || groupKey.isBlank()) {
            return null;
        }
        return groupIdMap.get(groupKey);
    }

    // Lưu đáp án dưới dạng JSON để phục vụ màn xem lại bài làm sau này.
    private String writeAnswersAsJson(Map<String, Object> answers) {
        try {
            return objectMapper.writeValueAsString(answers);
        } catch (JsonProcessingException exception) {
            throw new BadRequestException("Không thể lưu bài làm test");
        }
    }

    // Lấy danh sách lớp mà mock test hiện đang liên kết.
    private List<Long> getTestClassIds(Long mockTestId) {
        return testClassesRepository.findByMockTestId(mockTestId).stream()
                .map(TestClasses::getClassId)
                .distinct()
                .toList();
    }

    // Tải mock test theo danh sách id nhưng vẫn giữ thứ tự id đầu vào.
    private List<Tests> getTestsByIds(Collection<Long> testIds) {
        if (testIds == null || testIds.isEmpty()) {
            return List.of();
        }

        Map<Long, Tests> testMap = testsRepository.findAllById(testIds).stream()
                .collect(Collectors.toMap(Tests::getId, Function.identity()));

        return testIds.stream()
                .distinct()
                .map(testMap::get)
                .filter(test -> test != null)
                .toList();
    }

    // Đảm bảo giáo viên chỉ thao tác với bài test được gắn toàn bộ cho các lớp mình quản lý.
    private void assertTeacherOwnsTest(Long teacherId, Tests test) {
        List<Long> classIds = getTestClassIds(test.getId());
        if (classIds.isEmpty()) {
            throw new ForbiddenException("Bài thi thử chưa gắn với lớp học");
        }

        List<Classes> linkedClasses = classesRepository.findAllById(classIds);
        boolean ownsAllClasses = linkedClasses.size() == classIds.size()
                && linkedClasses.stream().allMatch(classEntity -> teacherId.equals(classEntity.getTeacherId()));
        if (!ownsAllClasses) {
            throw new ForbiddenException("Bạn không có quyền thao tác với bài thi thử này");
        }
    }

    // Lấy danh sách lớp mà giáo viên hiện tại đang phụ trách để dùng cho màn xem lịch sử học viên.
    private Set<Long> getTeacherManagedClassIds(String authorizationHeader) {
        Integer currentRoleId = currentUserService.extractRoleId(authorizationHeader);
        if (!Integer.valueOf(2).equals(currentRoleId)) {
            throw new ForbiddenException("Bạn không có quyền xem kết quả của học viên này");
        }

        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        return classesRepository.findByTeacherId(teacherId).stream()
                .map(Classes::getId)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    // Học viên chỉ được xem/làm test thuộc ít nhất một lớp mình đang hoặc đã học.
    private void ensureStudentHasTestAccess(Tests test, Long userId) {
        Set<Long> testClassIds = new LinkedHashSet<>(getTestClassIds(test.getId()));
        if (testClassIds.isEmpty()) {
            throw new ForbiddenException("Bài thi thử này chưa gắn với lớp học");
        }

        boolean hasAccess = enrollmentsRepository.findByUserId(userId).stream()
                .anyMatch(enrollment -> testClassIds.contains(enrollment.getClassId())
                        && (enrollment.getStatus() == Enrollments.Status.approved
                        || enrollment.getStatus() == Enrollments.Status.enrolled
                        || enrollment.getStatus() == Enrollments.Status.completed));
        if (!hasAccess) {
            throw new ForbiddenException("Bạn chưa được ghi danh vào lớp của bài thi thử này");
        }
    }

    // Full test chỉ cho admin, giáo viên sở hữu lớp hoặc học viên đã nộp bài xem lại.
    private void ensureFullTestAccess(Tests test, String authorizationHeader) {
        Integer currentRoleId = currentUserService.extractRoleId(authorizationHeader);
        Long currentUserId = currentUserService.extractUserId(authorizationHeader);

        if (Integer.valueOf(1).equals(currentRoleId)) {
            return;
        }

        if (Integer.valueOf(2).equals(currentRoleId)) {
            assertTeacherOwnsTest(currentUserId, test);
            return;
        }

        if (Integer.valueOf(3).equals(currentRoleId)) {
            ensureStudentHasTestAccess(test, currentUserId);
            boolean hasSubmitted = !testSubmissionsRepository
                    .findByMockTestIdAndUserIdOrderByAttemptNumberDesc(test.getId(), currentUserId)
                    .isEmpty();
            if (!hasSubmitted) {
                throw new ForbiddenException("Bạn chỉ có thể xem lại bài thi thử sau khi đã nộp bài");
            }
            return;
        }

        throw new ForbiddenException("Bạn không có quyền xem chi tiết bài thi thử này");
    }

    // Chỉ chính chủ hoặc admin mới được xem lịch sử làm test theo userId.
    private void ensureSelfOrAdmin(Long targetUserId, String authorizationHeader) {
        Long currentUserId = currentUserService.extractUserId(authorizationHeader);
        if (currentUserId.equals(targetUserId)) {
            return;
        }

        Integer currentRoleId = currentUserService.extractRoleId(authorizationHeader);
        if (Integer.valueOf(1).equals(currentRoleId)) {
            return;
        }

        throw new ForbiddenException("Bạn không có quyền xem kết quả của người dùng này");
    }
}
