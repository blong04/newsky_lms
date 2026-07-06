package com.newskyenglish.service;

import com.newskyenglish.dto.classes.ClassesDTO;
import com.newskyenglish.dto.enrollments.EnrollmentsDTO;
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

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
// Quản lý nghiệp vụ lớp học cho public, admin và giáo viên theo cùng một service feature.
public class ClassesService {

    private final ClassesRepository classesRepository;
    private final CoursesRepository coursesRepository;
    private final UsersRepository usersRepository;
    private final EnrollmentsRepository enrollmentsRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    // Lấy toàn bộ lớp học cho màn quản trị.
    public List<ClassesDTO.Response> getAllForAdmin() {
        List<Classes> classes = classesRepository.findAll();
        Map<Long, String> teacherNamesById = buildUserNameMap(classes.stream()
                .map(Classes::getTeacherId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        Map<Long, Integer> currentStudentsByClassId = buildCurrentStudentMap(classes);

        return classes.stream()
                .map(item -> ClassesDTO.Response.fromEntity(
                        item,
                        currentStudentsByClassId.getOrDefault(item.getId(), 0),
                        teacherNamesById.get(item.getTeacherId())
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy danh sách lớp public cho landing page hoặc catalog.
    public List<ClassesDTO.Response> getPublicClasses() {
        List<Classes> classes = classesRepository.findAll();
        Map<Long, Integer> currentStudentsByClassId = buildCurrentStudentMap(classes);

        return classes.stream()
                .map(item -> ClassesDTO.Response.fromEntity(
                        item,
                        currentStudentsByClassId.getOrDefault(item.getId(), 0)
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy danh sách lớp do giáo viên hiện tại phụ trách.
    public List<ClassesDTO.Response> getTeacherClasses(String authorizationHeader) {
        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        List<Classes> assignedClasses = classesRepository.findByTeacherId(teacherId);
        Map<Long, Courses> coursesById = buildCourseMap(assignedClasses.stream()
                .map(Classes::getCourseId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        Map<Long, Integer> currentStudentsByClassId = buildCurrentStudentMap(assignedClasses);
        String teacherName = resolveTeacherName(teacherId);

        return assignedClasses.stream()
                .map(classRoom -> {
                    Courses course = coursesById.get(classRoom.getCourseId());
                    return ClassesDTO.Response.fromEntity(
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
    // Lấy danh sách học viên của một lớp do giáo viên hiện tại quản lý.
    public List<EnrollmentsDTO.TeacherStudentResponse> getTeacherStudents(Long classId, String authorizationHeader) {
        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        Classes classRoom = findClass(classId);

        if (!teacherId.equals(classRoom.getTeacherId())) {
            throw new ForbiddenException("Bạn không có quyền xem học viên của lớp này");
        }

        Courses course = classRoom.getCourseId() != null
                ? coursesRepository.findById(classRoom.getCourseId()).orElse(null)
                : null;
        List<Enrollments> enrollments = enrollmentsRepository.findByClassId(classId);
        Map<Long, Users> usersById = buildUserMap(enrollments.stream()
                .map(Enrollments::getUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));

        return enrollments.stream()
                .filter(enrollment -> enrollment.getStatus() == Enrollments.Status.approved
                        || enrollment.getStatus() == Enrollments.Status.enrolled
                        || enrollment.getStatus() == Enrollments.Status.completed)
                .map(enrollment -> EnrollmentsDTO.TeacherStudentResponse.fromEntity(
                        enrollment,
                        usersById.get(enrollment.getUserId()),
                        course,
                        classRoom
                ))
                .toList();
    }

    @Transactional
    // Tạo mới một lớp học từ dữ liệu admin nhập vào.
    public ClassesDTO.Response create(ClassesDTO.CreateRequest request) {
        Classes classRoom = Classes.builder()
                .courseId(request.getCourseId())
                .teacherId(request.getTeacherId())
                .name(request.getName())
                .description(request.getDescription())
                .maxStudents(request.getMaxStudents())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus() != null ? request.getStatus() : Classes.Status.active)
                .build();

        return ClassesDTO.Response.fromEntity(
                classesRepository.save(classRoom),
                0,
                resolveTeacherName(classRoom.getTeacherId())
        );
    }

    @Transactional
    // Cập nhật thông tin của một lớp học đã có.
    public ClassesDTO.Response update(Long id, ClassesDTO.UpdateRequest request) {
        Classes classRoom = findClass(id);

        if (request.getCourseId() != null) classRoom.setCourseId(request.getCourseId());
        if (request.getTeacherId() != null) classRoom.setTeacherId(request.getTeacherId());
        if (request.getName() != null) classRoom.setName(request.getName());
        if (request.getDescription() != null) classRoom.setDescription(request.getDescription());
        if (request.getMaxStudents() != null) classRoom.setMaxStudents(request.getMaxStudents());
        if (request.getStartDate() != null) classRoom.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) classRoom.setEndDate(request.getEndDate());
        if (request.getStatus() != null) classRoom.setStatus(request.getStatus());

        return ClassesDTO.Response.fromEntity(
                classesRepository.save(classRoom),
                resolveCurrentStudentCount(classRoom.getId()),
                resolveTeacherName(classRoom.getTeacherId())
        );
    }

    @Transactional
    // Xóa lớp học khỏi hệ thống.
    public void delete(Long id) {
        classesRepository.delete(findClass(id));
    }

    @Transactional
    // Gán giáo viên phụ trách cho lớp học.
    public void assignTeacher(Long classId, Long teacherId) {
        Classes classRoom = findClass(classId);
        classRoom.setTeacherId(teacherId);
        classesRepository.save(classRoom);
    }

    // Helper preload map người dùng để tránh gọi findById lặp lại.
    private Map<Long, Users> buildUserMap(Set<Long> userIds) {
        return usersRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(Users::getId, Function.identity()));
    }

    // Helper preload map tên giáo viên dùng cho response lớp học.
    private Map<Long, String> buildUserNameMap(Set<Long> userIds) {
        return buildUserMap(userIds).values().stream()
                .collect(Collectors.toMap(Users::getId, Users::getName));
    }

    // Helper preload map khóa học để enrich response giáo viên.
    private Map<Long, Courses> buildCourseMap(Set<Long> courseIds) {
        return coursesRepository.findAllById(courseIds).stream()
                .collect(Collectors.toMap(Courses::getId, Function.identity()));
    }

    // Tính sĩ số thực theo enrollment còn hiệu lực thay vì đọc cột lưu sẵn.
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

    // Đếm nhanh sĩ số của một lớp sau khi create/update.
    private Integer resolveCurrentStudentCount(Long classId) {
        return (int) enrollmentsRepository.findByClassId(classId).stream()
                .filter(enrollment -> enrollment.getStatus() == Enrollments.Status.approved
                        || enrollment.getStatus() == Enrollments.Status.enrolled
                        || enrollment.getStatus() == Enrollments.Status.completed)
                .count();
    }

    // Lấy tên giáo viên để hiển thị ở response đã enrich.
    private String resolveTeacherName(Long teacherId) {
        if (teacherId == null) {
            return null;
        }
        return usersRepository.findById(teacherId).map(Users::getName).orElse(null);
    }

    // Helper tìm lớp học theo id hoặc ném lỗi 404.
    private Classes findClass(Long id) {
        return classesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học"));
    }
}
