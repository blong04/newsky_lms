package com.newskyenglish.service;

import com.newskyenglish.dto.classes.ClassesDTO;
import com.newskyenglish.dto.courses.CoursesDTO;
import com.newskyenglish.exception.ResourceNotFoundException;
import com.newskyenglish.model.Classes;
import com.newskyenglish.model.Courses;
import com.newskyenglish.model.Users;
import com.newskyenglish.repository.ClassesRepository;
import com.newskyenglish.repository.CoursesRepository;
import com.newskyenglish.repository.EnrollmentsRepository;
import com.newskyenglish.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
// Chứa các thao tác CRUD khóa học và truy vấn lớp học thuộc khóa học đó.
public class CoursesService {

    private final CoursesRepository courseRepository;
    private final ClassesRepository classesRepository;
    private final EnrollmentsRepository enrollmentRepository;
    private final UsersRepository usersRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    // Lấy danh sách khóa học theo bộ lọc tìm kiếm để frontend không phải tự lọc cục bộ.
    public List<CoursesDTO.Response> getAll(
            String keyword,
            Courses.ExamType examType,
            Courses.Level level,
            Courses.Status status) {
        String normalizedKeyword = normalizeKeyword(keyword);

        return courseRepository.findAll().stream()
                .filter(course -> matchesKeyword(course, normalizedKeyword))
                .filter(course -> examType == null || course.getExamType() == examType)
                .filter(course -> level == null || course.getLevel() == level)
                .filter(course -> status == null || course.getStatus() == status)
                .sorted((left, right) -> Integer.compare(
                        left.getLevelRank() != null ? left.getLevelRank() : Integer.MAX_VALUE,
                        right.getLevelRank() != null ? right.getLevelRank() : Integer.MAX_VALUE
                ))
                .map(CoursesDTO.Response::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    // Trả về danh sách khóa học gợi ý theo kết quả placement của học viên hiện tại.
    public CoursesDTO.RecommendationBundleResponse getRecommendedForCurrentStudent(String authorizationHeader) {
        Long userId = currentUserService.extractUserId(authorizationHeader);
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        return buildRecommendationBundle(user.getPlacementExamType(), user.getPlacementScore(), user.getPlacementCompletedAt() != null);
    }

    @Transactional(readOnly = true)
    // Dùng lại cho placement submit và màn kết quả thi chính thức khi cần gợi ý khóa tiếp theo.
    public CoursesDTO.RecommendationBundleResponse getRecommendationsForPlacement(Users.PlacementExamType examType,
                                                                                  BigDecimal placementScore) {
        return buildRecommendationBundle(examType, placementScore, placementScore != null);
    }

    @Transactional(readOnly = true)
    // Lấy chi tiết một khóa học theo id dưới dạng DTO.
    public CoursesDTO.Response getById(Long id) {
        return CoursesDTO.Response.fromEntity(findCourse(id));
    }

    @Transactional(readOnly = true)
    // Lấy danh sách lớp đang gắn với một khóa học.
    public List<ClassesDTO.Response> getCourseClasses(Long courseId) {
        List<Classes> classes = classesRepository.findByCourseId(courseId);
        Map<Long, Integer> currentStudentsByClassId = buildCurrentStudentMap(classes);

        return classes.stream()
                .map(classEntity -> ClassesDTO.Response.fromEntity(
                        classEntity,
                        currentStudentsByClassId.getOrDefault(classEntity.getId(), 0)
                ))
                .toList();
    }

    @Transactional
    // Tạo mới một khóa học từ request DTO.
    public CoursesDTO.Response create(CoursesDTO.CreateRequest request) {
        Courses course = Courses.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .level(request.getLevel())
                .examType(request.getExamType())
                .levelRank(request.getLevelRank() != null ? request.getLevelRank() : 1)
                .recommendedScoreMin(request.getRecommendedScoreMin())
                .recommendedScoreMax(request.getRecommendedScoreMax())
                .targetScore(request.getTargetScore())
                .freeRetakeMonths(request.getFreeRetakeMonths() != null ? request.getFreeRetakeMonths() : 6)
                .status(request.getStatus() != null ? request.getStatus() : Courses.Status.active)
                .build();

        return CoursesDTO.Response.fromEntity(courseRepository.save(course));
    }

    @Transactional
    // Cập nhật các thông tin mô tả, giá và trạng thái của khóa học.
    public CoursesDTO.Response update(Long id, CoursesDTO.UpdateRequest request) {
        Courses course = findCourse(id);

        if (request.getTitle() != null) course.setTitle(request.getTitle());
        if (request.getDescription() != null) course.setDescription(request.getDescription());
        if (request.getPrice() != null) course.setPrice(request.getPrice());
        if (request.getLevel() != null) course.setLevel(request.getLevel());
        if (request.getExamType() != null) course.setExamType(request.getExamType());
        if (request.getLevelRank() != null) course.setLevelRank(request.getLevelRank());
        if (request.getRecommendedScoreMin() != null) course.setRecommendedScoreMin(request.getRecommendedScoreMin());
        if (request.getRecommendedScoreMax() != null) course.setRecommendedScoreMax(request.getRecommendedScoreMax());
        if (request.getTargetScore() != null) course.setTargetScore(request.getTargetScore());
        if (request.getFreeRetakeMonths() != null) course.setFreeRetakeMonths(request.getFreeRetakeMonths());
        if (request.getStatus() != null) course.setStatus(request.getStatus());

        return CoursesDTO.Response.fromEntity(courseRepository.save(course));
    }

    @Transactional
    // Xóa khóa học theo id.
    public void delete(Long id) {
        Courses course = findCourse(id);
        courseRepository.delete(course);
    }

    // Helper tìm course hoặc ném lỗi nếu id không hợp lệ.
    private Courses findCourse(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học"));
    }

    // Đếm sĩ số thực tế theo lớp từ các enrollment còn hiệu lực.
    private Map<Long, Integer> buildCurrentStudentMap(List<Classes> classes) {
        List<Long> classIds = classes.stream()
                .map(Classes::getId)
                .toList();

        return enrollmentRepository.findByClassIdIn(classIds).stream()
                .filter(enrollment -> enrollment.getStatus() == com.newskyenglish.model.Enrollments.Status.approved
                        || enrollment.getStatus() == com.newskyenglish.model.Enrollments.Status.completed)
                .collect(Collectors.groupingBy(
                        enrollment -> enrollment.getClassId(),
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));
    }

    // Chuẩn hóa từ khóa để các phép so khớp tên/mô tả thống nhất hơn.
    private String normalizeKeyword(String keyword) {
        return keyword == null ? "" : keyword.trim().toLowerCase(Locale.ROOT);
    }

    // Kiểm tra một khóa học có khớp từ khóa theo tên hoặc mô tả hay không.
    private boolean matchesKeyword(Courses course, String normalizedKeyword) {
        if (normalizedKeyword.isBlank()) {
            return true;
        }

        String title = course.getTitle() == null ? "" : course.getTitle().toLowerCase(Locale.ROOT);
        String description = course.getDescription() == null ? "" : course.getDescription().toLowerCase(Locale.ROOT);
        return title.contains(normalizedKeyword) || description.contains(normalizedKeyword);
    }

    // Gom nhóm khóa phù hợp hiện tại và khóa cao hơn để FE hiển thị thành hai cụm rõ ràng.
    private CoursesDTO.RecommendationBundleResponse buildRecommendationBundle(Users.PlacementExamType examType,
                                                                              BigDecimal placementScore,
                                                                              boolean placementCompleted) {
        if (examType == null || placementScore == null) {
            return CoursesDTO.RecommendationBundleResponse.builder()
                    .placementExamType(examType)
                    .placementScore(placementScore)
                    .placementCompleted(placementCompleted)
                    .recommendedCourses(List.of())
                    .nextLevelCourses(List.of())
                    .build();
        }

        List<Courses> activeExamCourses = courseRepository.findByStatus(Courses.Status.active).stream()
                .filter(course -> matchesExamType(course, examType))
                .sorted((left, right) -> Integer.compare(
                        left.getLevelRank() != null ? left.getLevelRank() : Integer.MAX_VALUE,
                        right.getLevelRank() != null ? right.getLevelRank() : Integer.MAX_VALUE
                ))
                .toList();

        List<CoursesDTO.RecommendationItem> recommendedCourses = activeExamCourses.stream()
                .filter(course -> matchesRecommendedRange(course, placementScore))
                .map(course -> CoursesDTO.RecommendationItem.fromEntity(
                        course,
                        "Phù hợp với mức điểm đầu vào hiện tại"
                ))
                .toList();

        int highestRecommendedRank = recommendedCourses.stream()
                .map(CoursesDTO.RecommendationItem::getLevelRank)
                .filter(rank -> rank != null)
                .max(Integer::compareTo)
                .orElse(0);

        List<CoursesDTO.RecommendationItem> nextLevelCourses = activeExamCourses.stream()
                .filter(course -> !matchesRecommendedRange(course, placementScore))
                .filter(course -> (course.getLevelRank() != null ? course.getLevelRank() : 0) > highestRecommendedRank)
                .filter(course -> isHigherSuggestion(course, placementScore))
                .limit(3)
                .map(course -> CoursesDTO.RecommendationItem.fromEntity(
                        course,
                        "Có thể học tiếp khi bạn đạt mục tiêu của khóa hiện tại"
                ))
                .toList();

        return CoursesDTO.RecommendationBundleResponse.builder()
                .placementExamType(examType)
                .placementScore(placementScore)
                .placementCompleted(placementCompleted)
                .recommendedCourses(recommendedCourses)
                .nextLevelCourses(nextLevelCourses)
                .build();
    }

    // Chỉ gợi ý khóa cùng hệ chứng chỉ của bài placement.
    private boolean matchesExamType(Courses course, Users.PlacementExamType examType) {
        if (course.getExamType() == null || examType == null) {
            return false;
        }
        return course.getExamType().name().equalsIgnoreCase(examType.name());
    }

    // So khớp placement score với khoảng gợi ý đã cấu hình cho khóa học.
    private boolean matchesRecommendedRange(Courses course, BigDecimal score) {
        if (score == null) {
            return false;
        }

        BigDecimal minScore = course.getRecommendedScoreMin();
        BigDecimal maxScore = course.getRecommendedScoreMax();

        if (minScore != null && score.compareTo(minScore) < 0) {
            return false;
        }
        if (maxScore != null && score.compareTo(maxScore) > 0) {
            return false;
        }
        return minScore != null || maxScore != null;
    }

    // Khóa cao hơn được gợi ý khi điểm hiện tại chưa rơi vào range của khóa đó nhưng đã tiến gần ngưỡng vào.
    private boolean isHigherSuggestion(Courses course, BigDecimal score) {
        BigDecimal minScore = course.getRecommendedScoreMin();
        return minScore != null && score != null && score.compareTo(minScore) < 0;
    }
}

