package com.newskyenglish.service;

import com.newskyenglish.dto.enrollments.EnrollmentsDTO;
import com.newskyenglish.exception.BadRequestException;
import com.newskyenglish.exception.ForbiddenException;
import com.newskyenglish.exception.ResourceNotFoundException;
import com.newskyenglish.model.Classes;
import com.newskyenglish.model.Courses;
import com.newskyenglish.model.Enrollments;
import com.newskyenglish.model.Users;
import com.newskyenglish.repository.ClassesRepository;
import com.newskyenglish.repository.CoursesRepository;
import com.newskyenglish.repository.EnrollmentsRepository;
import com.newskyenglish.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
// Xử lý toàn bộ luồng đăng ký học theo entity enrollment thay vì tách theo role.
public class EnrollmentsService {

    private final EnrollmentsRepository enrollmentsRepository;
    private final ClassesRepository classesRepository;
    private final CoursesRepository coursesRepository;
    private final UsersRepository usersRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    // Lấy danh sách toàn bộ đăng ký học.
    public List<EnrollmentsDTO.Response> getAll() {
        List<Enrollments> enrollments = enrollmentsRepository.findAll();
        Map<Long, Classes> classesById = buildClassMap(enrollments.stream()
                .map(Enrollments::getClassId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        return enrollments.stream()
                .map(enrollment -> EnrollmentsDTO.Response.fromEntity(
                        enrollment,
                        resolveCourseId(enrollment.getClassId(), classesById)
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy danh sách đăng ký của một lớp học cụ thể.
    public List<EnrollmentsDTO.Response> getByClass(Long classId) {
        List<Enrollments> enrollments = enrollmentsRepository.findByClassId(classId);
        Map<Long, Classes> classesById = buildClassMap(enrollments.stream()
                .map(Enrollments::getClassId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        return enrollments.stream()
                .map(enrollment -> EnrollmentsDTO.Response.fromEntity(
                        enrollment,
                        resolveCourseId(enrollment.getClassId(), classesById)
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy danh sách các đăng ký đang chờ phê duyệt.
    public List<EnrollmentsDTO.Response> getPending() {
        List<Enrollments> enrollments = enrollmentsRepository.findByStatus(Enrollments.Status.pending);
        Map<Long, Classes> classesById = buildClassMap(enrollments.stream()
                .map(Enrollments::getClassId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        return enrollments.stream()
                .map(enrollment -> EnrollmentsDTO.Response.fromEntity(
                        enrollment,
                        resolveCourseId(enrollment.getClassId(), classesById)
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy danh sách enrollment đã enrich user, course và class cho admin.
    public List<EnrollmentsDTO.AdminDetailResponse> getAdminDetails() {
        List<Enrollments> enrollments = enrollmentsRepository.findAll();
        Map<Long, Classes> classesById = buildClassMap(enrollments.stream()
                .map(Enrollments::getClassId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        Map<Long, Users> usersById = buildUserMap(enrollments.stream()
                .map(Enrollments::getUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        Map<Long, Courses> coursesById = buildCourseMap(classesById.values().stream()
                .map(Classes::getCourseId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));

        return enrollments.stream()
                .map(enrollment -> {
                    Long courseId = resolveCourseId(enrollment.getClassId(), classesById);
                    return EnrollmentsDTO.AdminDetailResponse.fromEntity(
                        enrollment,
                        usersById.get(enrollment.getUserId()),
                        coursesById.get(courseId),
                        classesById.get(enrollment.getClassId())
                    );
                })
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy danh sách đăng ký của học viên hiện tại.
    public List<EnrollmentsDTO.StudentResponse> getStudentEnrollments(String authorizationHeader) {
        Long userId = currentUserService.extractUserId(authorizationHeader);
        List<Enrollments> enrollments = enrollmentsRepository.findByUserId(userId);
        Map<Long, Classes> classesById = buildClassMap(enrollments.stream()
                .map(Enrollments::getClassId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        Map<Long, Courses> coursesById = buildCourseMap(classesById.values().stream()
                .map(Classes::getCourseId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        Map<Long, Integer> currentStudentsByClassId = classesById.isEmpty()
                ? Map.of()
                : buildCurrentStudentMap(classesById.values().stream().toList());

        return enrollments.stream()
                .map(enrollment -> {
                    Long courseId = resolveCourseId(enrollment.getClassId(), classesById);
                    return EnrollmentsDTO.StudentResponse.fromEntity(
                        enrollment,
                        coursesById.get(courseId),
                        classesById.get(enrollment.getClassId()),
                        currentStudentsByClassId.getOrDefault(enrollment.getClassId(), 0)
                    );
                })
                .toList();
    }

    @Transactional
    // Tạo yêu cầu đăng ký học mới cho học viên hiện tại.
    public void createStudentEnrollment(EnrollmentsDTO.StudentEnrollRequest request, String authorizationHeader) {
        Long userId = currentUserService.extractUserId(authorizationHeader);
        Long courseId = request.getCourseId();
        Long classId = request.getClassId();
        boolean isPaid = Boolean.TRUE.equals(request.getPaid());

        if (classId == null) {
            throw new BadRequestException("Vui lòng chọn lớp học");
        }

        Courses course = coursesRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học"));
        Classes classRoom = classesRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học"));
        if (!Objects.equals(classRoom.getCourseId(), course.getId())) {
            throw new BadRequestException("Lớp học không thuộc khóa học đã chọn");
        }

        Map<Long, Classes> existingClassesById = buildClassMap(enrollmentsRepository.findByUserId(userId).stream()
                .map(Enrollments::getClassId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        boolean alreadyEnrolled = enrollmentsRepository.findByUserId(userId).stream()
                .anyMatch(enrollment -> Objects.equals(
                        resolveCourseId(enrollment.getClassId(), existingClassesById),
                        courseId
                )
                        && enrollment.getStatus() != Enrollments.Status.dropped
                        && enrollment.getStatus() != Enrollments.Status.rejected);
        if (alreadyEnrolled) {
            throw new BadRequestException("Bạn đã đăng ký khóa học này");
        }

        int currentStudents = resolveCurrentStudentCount(classId);
        if (classRoom.getMaxStudents() != null && currentStudents >= classRoom.getMaxStudents()) {
            throw new BadRequestException("Không có lớp đang tuyển");
        }

        Enrollments enrollment = Enrollments.builder()
                .userId(userId)
                .classId(classRoom.getId())
                .enrollDate(LocalDateTime.now())
                .status(isPaid ? Enrollments.Status.approved : Enrollments.Status.pending)
                .paid(isPaid)
                .build();
        enrollmentsRepository.save(enrollment);
    }

    @Transactional
    // Duyệt một yêu cầu ghi danh.
    public void approve(Long id) {
        Enrollments enrollment = findEnrollment(id);
        enrollment.setStatus(Enrollments.Status.approved);
        enrollment.setApprovedDate(LocalDateTime.now());
        enrollmentsRepository.save(enrollment);
    }

    @Transactional
    // Cập nhật trạng thái enrollment từ giao diện quản trị.
    public EnrollmentsDTO.Response updateStatus(Long id, EnrollmentsDTO.UpdateStatusRequest request) {
        Enrollments enrollment = findEnrollment(id);

        if (request.getStatus() != null) {
            try {
                enrollment.setStatus(Enrollments.Status.valueOf(request.getStatus()));
            } catch (IllegalArgumentException exception) {
                throw new BadRequestException("Trạng thái không hợp lệ");
            }
        }

        Enrollments savedEnrollment = enrollmentsRepository.save(enrollment);
        Map<Long, Classes> classesById = buildClassMap(
                savedEnrollment.getClassId() != null ? Set.of(savedEnrollment.getClassId()) : Set.of()
        );
        return EnrollmentsDTO.Response.fromEntity(
                savedEnrollment,
                resolveCourseId(savedEnrollment.getClassId(), classesById)
        );
    }

    @Transactional
    // Hủy một enrollment đang chờ duyệt.
    public EnrollmentsDTO.Response cancel(Long id, String authorizationHeader) {
        Enrollments enrollment = findEnrollment(id);
        Long currentUserId = currentUserService.extractUserId(authorizationHeader);
        Integer currentRoleId = currentUserService.extractRoleId(authorizationHeader);
        if (!currentUserId.equals(enrollment.getUserId()) && !Integer.valueOf(1).equals(currentRoleId)) {
            throw new ForbiddenException("Bạn không có quyền hủy đăng ký này");
        }
        if (enrollment.getStatus() != Enrollments.Status.pending) {
            throw new BadRequestException("Chỉ có thể hủy khi chưa được phê duyệt");
        }
        enrollment.setStatus(Enrollments.Status.dropped);
        Enrollments savedEnrollment = enrollmentsRepository.save(enrollment);
        Map<Long, Classes> classesById = buildClassMap(
                savedEnrollment.getClassId() != null ? Set.of(savedEnrollment.getClassId()) : Set.of()
        );
        return EnrollmentsDTO.Response.fromEntity(
                savedEnrollment,
                resolveCourseId(savedEnrollment.getClassId(), classesById)
        );
    }

    // Sinh thông báo sau khi học viên gửi đăng ký từ frontend.
    public String getEnrollmentSuccessMessage(boolean isPaid) {
        return isPaid
                ? "Đăng ký thành công! Thanh toán được xác nhận."
                : "Gửi yêu cầu thành công! Vui lòng chờ admin phê duyệt.";
    }

    // Helper preload map lớp học để suy ra courseId từ schema mới.
    private Map<Long, Classes> buildClassMap(Set<Long> classIds) {
        return classesRepository.findAllById(classIds).stream()
                .collect(Collectors.toMap(Classes::getId, Function.identity()));
    }

    // Helper preload map khóa học phục vụ response đã enrich.
    private Map<Long, Courses> buildCourseMap(Set<Long> courseIds) {
        return coursesRepository.findAllById(courseIds).stream()
                .collect(Collectors.toMap(Courses::getId, Function.identity()));
    }

    // Helper preload map user để admin xem chi tiết enrollment.
    private Map<Long, Users> buildUserMap(Set<Long> userIds) {
        return usersRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(Users::getId, Function.identity()));
    }

    // Suy ra courseId thực của enrollment thông qua class_id.
    private Long resolveCourseId(Long classId, Map<Long, Classes> classesById) {
        if (classId == null) {
            return null;
        }
        Classes classEntity = classesById.get(classId);
        return classEntity != null ? classEntity.getCourseId() : null;
    }

    // Tính sĩ số thực của lớp từ enrollment còn hiệu lực.
    private Map<Long, Integer> buildCurrentStudentMap(List<Classes> classes) {
        List<Long> classIds = classes.stream()
                .map(Classes::getId)
                .toList();

        return enrollmentsRepository.findByClassIdIn(classIds).stream()
                .filter(enrollment -> enrollment.getStatus() == Enrollments.Status.approved
                        || enrollment.getStatus() == Enrollments.Status.enrolled
                        || enrollment.getStatus() == Enrollments.Status.completed)
                .collect(Collectors.groupingBy(
                        Enrollments::getClassId,
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));
    }

    // Đếm nhanh sĩ số của một lớp để kiểm tra còn chỗ hay không.
    private int resolveCurrentStudentCount(Long classId) {
        return (int) enrollmentsRepository.findByClassId(classId).stream()
                .filter(enrollment -> enrollment.getStatus() == Enrollments.Status.approved
                        || enrollment.getStatus() == Enrollments.Status.enrolled
                        || enrollment.getStatus() == Enrollments.Status.completed)
                .count();
    }

    // Helper tìm enrollment theo id.
    private Enrollments findEnrollment(Long id) {
        return enrollmentsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đăng ký"));
    }
}
