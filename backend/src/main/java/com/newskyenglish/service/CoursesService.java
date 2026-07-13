package com.newskyenglish.service;

import com.newskyenglish.dto.classes.ClassesDTO;
import com.newskyenglish.dto.courses.CoursesDTO;
import com.newskyenglish.exception.ResourceNotFoundException;
import com.newskyenglish.model.Classes;
import com.newskyenglish.model.Courses;
import com.newskyenglish.repository.ClassesRepository;
import com.newskyenglish.repository.CoursesRepository;
import com.newskyenglish.repository.EnrollmentsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
// Chứa các thao tác CRUD khóa học và truy vấn lớp học thuộc khóa học đó.
public class CoursesService {

    private final CoursesRepository courseRepository;
    private final ClassesRepository classesRepository;
    private final EnrollmentsRepository enrollmentRepository;

    @Transactional(readOnly = true)
    // Lấy toàn bộ khóa học và chuyển sang response DTO thống nhất cho API.
    public List<CoursesDTO.Response> getAll() {
        return courseRepository.findAll().stream()
                .map(CoursesDTO.Response::fromEntity)
                .toList();
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
}

