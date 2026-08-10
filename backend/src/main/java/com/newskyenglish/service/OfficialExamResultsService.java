package com.newskyenglish.service;

import com.newskyenglish.dto.courses.CoursesDTO;
import com.newskyenglish.dto.officialexamresults.OfficialExamResultsDTO;
import com.newskyenglish.exception.BadRequestException;
import com.newskyenglish.exception.ResourceNotFoundException;
import com.newskyenglish.model.Classes;
import com.newskyenglish.model.Courses;
import com.newskyenglish.model.Enrollments;
import com.newskyenglish.model.OfficialExamResults;
import com.newskyenglish.model.Users;
import com.newskyenglish.repository.ClassesRepository;
import com.newskyenglish.repository.CoursesRepository;
import com.newskyenglish.repository.EnrollmentsRepository;
import com.newskyenglish.repository.OfficialExamResultsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
// Xử lý điểm thi chính thức sau khóa học để đánh giá học tiếp hoặc học lại miễn phí.
public class OfficialExamResultsService {

    private final OfficialExamResultsRepository officialExamResultsRepository;
    private final CoursesRepository coursesRepository;
    private final EnrollmentsRepository enrollmentsRepository;
    private final ClassesRepository classesRepository;
    private final CurrentUserService currentUserService;
    private final CoursesService coursesService;

    @Transactional(readOnly = true)
    // Lấy lịch sử điểm thi chính thức của học viên hiện tại.
    public List<OfficialExamResultsDTO.Response> getCurrentStudentResults(String authorizationHeader) {
        Long userId = currentUserService.extractUserId(authorizationHeader);
        List<OfficialExamResults> results = officialExamResultsRepository.findByUserIdOrderByExamDateDesc(userId);
        Map<Long, Courses> coursesById = coursesRepository.findAllById(results.stream()
                .map(OfficialExamResults::getCourseId)
                .distinct()
                .toList()).stream().collect(Collectors.toMap(Courses::getId, course -> course));

        return results.stream()
                .map(result -> OfficialExamResultsDTO.Response.fromEntity(result, coursesById.get(result.getCourseId())))
                .toList();
    }

    @Transactional
    // Lưu điểm thi chính thức và trả về kết luận học tiếp / học lại miễn phí cho học viên.
    public OfficialExamResultsDTO.CreateResultResponse createCurrentStudentResult(
            OfficialExamResultsDTO.CreateRequest request,
            String authorizationHeader) {
        Long userId = currentUserService.extractUserId(authorizationHeader);
        Courses course = coursesRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học"));

        Courses.ExamType examType = request.getExamType() != null ? request.getExamType() : course.getExamType();
        if (examType == null) {
            throw new BadRequestException("Khóa học chưa có loại chứng chỉ để đối chiếu");
        }

        OfficialExamResults savedResult = officialExamResultsRepository.save(
                OfficialExamResults.builder()
                        .userId(userId)
                        .courseId(course.getId())
                        .examType(examType)
                        .score(request.getScore())
                        .examDate(request.getExamDate())
                        .certificateUrl(request.getCertificateUrl())
                        .note(request.getNote())
                        .build()
        );

        Enrollments sourceEnrollment = findEligibleSourceEnrollment(userId, course.getId());
        boolean eligibleForFreeRetake = isEligibleForFreeRetake(course, sourceEnrollment, request.getScore(), request.getExamDate());

        List<CoursesDTO.RecommendationItem> nextCourseSuggestions = List.of();
        if (course.getTargetScore() != null
                && request.getScore().compareTo(course.getTargetScore()) >= 0
                && examType != Courses.ExamType.OTHER) {
            CoursesDTO.RecommendationBundleResponse recommendationBundle = coursesService.getRecommendationsForPlacement(
                    mapExamTypeToPlacementType(examType),
                    request.getScore()
            );
            int currentLevelRank = course.getLevelRank() != null ? course.getLevelRank() : 0;
            nextCourseSuggestions = recommendationBundle.getRecommendedCourses().stream()
                    .filter(item -> item.getId() != null && !item.getId().equals(course.getId()))
                    .filter(item -> item.getLevelRank() != null && item.getLevelRank() > currentLevelRank)
                    .toList();
            if (nextCourseSuggestions.isEmpty()) {
                nextCourseSuggestions = recommendationBundle.getNextLevelCourses().stream()
                        .filter(item -> item.getLevelRank() != null && item.getLevelRank() > currentLevelRank)
                        .toList();
            }
        }

        return OfficialExamResultsDTO.CreateResultResponse.builder()
                .result(OfficialExamResultsDTO.Response.fromEntity(savedResult, course))
                .eligibleForFreeRetake(eligibleForFreeRetake)
                .sourceEnrollmentId(sourceEnrollment != null ? sourceEnrollment.getId() : null)
                .nextCourseSuggestions(nextCourseSuggestions)
                .build();
    }

    // Tìm enrollment gốc gần nhất của khóa để đối chiếu với ngày thi chính thức.
    private Enrollments findEligibleSourceEnrollment(Long userId, Long courseId) {
        Map<Long, Classes> classesById = classesRepository.findAll().stream()
                .collect(Collectors.toMap(Classes::getId, classEntity -> classEntity));

        return enrollmentsRepository.findByUserId(userId).stream()
                .filter(enrollment -> enrollment.getSourceEnrollId() == null)
                .filter(enrollment -> enrollment.getStatus() == Enrollments.Status.completed
                        || enrollment.getStatus() == Enrollments.Status.approved)
                .filter(enrollment -> {
                    Classes classEntity = classesById.get(enrollment.getClassId());
                    return classEntity != null && courseId.equals(classEntity.getCourseId());
                })
                .max(Comparator.comparing(Enrollments::getEnrollDate, Comparator.nullsLast(Comparator.naturalOrder())))
                .orElse(null);
    }

    // Điều kiện học lại miễn phí: chưa đạt target và thi chính thức trong cửa sổ miễn phí của khóa.
    private boolean isEligibleForFreeRetake(Courses course,
                                            Enrollments sourceEnrollment,
                                            java.math.BigDecimal score,
                                            LocalDate examDate) {
        if (course.getTargetScore() == null || score == null || sourceEnrollment == null || examDate == null) {
            return false;
        }
        if (score.compareTo(course.getTargetScore()) >= 0) {
            return false;
        }

        Classes classEntity = sourceEnrollment.getClassId() != null
                ? classesRepository.findById(sourceEnrollment.getClassId()).orElse(null)
                : null;
        if (classEntity == null || classEntity.getEndDate() == null) {
            return false;
        }

        int graceMonths = course.getFreeRetakeMonths() != null ? course.getFreeRetakeMonths() : 6;
        LocalDate eligibleUntil = classEntity.getEndDate().plusMonths(graceMonths);
        return !examDate.isAfter(eligibleUntil);
    }

    // Chỉ map những loại thi có logic placement tương ứng để tái sử dụng engine gợi ý khóa học.
    private Users.PlacementExamType mapExamTypeToPlacementType(Courses.ExamType examType) {
        return switch (examType) {
            case IELTS -> Users.PlacementExamType.IELTS;
            case TOEIC -> Users.PlacementExamType.TOEIC;
            default -> throw new BadRequestException("Chưa hỗ trợ gợi ý nâng cao cho loại khóa học này");
        };
    }
}
