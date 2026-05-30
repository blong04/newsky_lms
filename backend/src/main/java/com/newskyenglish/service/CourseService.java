package com.newskyenglish.service;

import com.newskyenglish.dto.classroom.ClassRoomDTO;
import com.newskyenglish.dto.course.CourseDTO;
import com.newskyenglish.exception.ResourceNotFoundException;
import com.newskyenglish.model.ClassRoom;
import com.newskyenglish.model.Course;
import com.newskyenglish.repository.ClassRoomRepository;
import com.newskyenglish.repository.CourseRepository;
import com.newskyenglish.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
// Chứa các thao tác CRUD khóa học và truy vấn lớp học thuộc khóa học đó.
public class CourseService {

    private final CourseRepository courseRepository;
    private final ClassRoomRepository classRoomRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional(readOnly = true)
    // Lấy toàn bộ khóa học và chuyển sang response DTO thống nhất cho API.
    public List<CourseDTO.Response> getAll() {
        return courseRepository.findAll().stream()
                .map(CourseDTO.Response::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy chi tiết một khóa học theo id dưới dạng DTO.
    public CourseDTO.Response getById(Long id) {
        return CourseDTO.Response.fromEntity(findCourse(id));
    }

    @Transactional(readOnly = true)
    // Lấy danh sách lớp đang gắn với một khóa học.
    public List<ClassRoomDTO.Response> getCourseClasses(Long courseId) {
        List<ClassRoom> classRooms = classRoomRepository.findByCourseId(courseId);
        Map<Long, Integer> currentStudentsByClassId = buildCurrentStudentMap(classRooms);

        return classRooms.stream()
                .map(classRoom -> ClassRoomDTO.Response.fromEntity(
                        classRoom,
                        currentStudentsByClassId.getOrDefault(classRoom.getId(), 0)
                ))
                .toList();
    }

    @Transactional
    // Tạo mới một khóa học từ request DTO.
    public CourseDTO.Response create(CourseDTO.CreateRequest request) {
        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .level(request.getLevel())
                .examType(request.getExamType())
                .status(request.getStatus() != null ? request.getStatus() : Course.Status.active)
                .build();

        return CourseDTO.Response.fromEntity(courseRepository.save(course));
    }

    @Transactional
    // Cập nhật các thông tin mô tả, giá và trạng thái của khóa học.
    public CourseDTO.Response update(Long id, CourseDTO.UpdateRequest request) {
        Course course = findCourse(id);

        if (request.getTitle() != null) course.setTitle(request.getTitle());
        if (request.getDescription() != null) course.setDescription(request.getDescription());
        if (request.getPrice() != null) course.setPrice(request.getPrice());
        if (request.getLevel() != null) course.setLevel(request.getLevel());
        if (request.getExamType() != null) course.setExamType(request.getExamType());
        if (request.getStatus() != null) course.setStatus(request.getStatus());

        return CourseDTO.Response.fromEntity(courseRepository.save(course));
    }

    @Transactional
    // Xóa khóa học theo id.
    public void delete(Long id) {
        Course course = findCourse(id);
        courseRepository.delete(course);
    }

    // Helper tìm course hoặc ném lỗi nếu id không hợp lệ.
    private Course findCourse(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học"));
    }

    // Đếm sĩ số thực tế theo lớp từ các enrollment còn hiệu lực.
    private Map<Long, Integer> buildCurrentStudentMap(List<ClassRoom> classRooms) {
        List<Long> classIds = classRooms.stream()
                .map(ClassRoom::getId)
                .toList();

        return enrollmentRepository.findByClassIdIn(classIds).stream()
                .filter(enrollment -> enrollment.getStatus() == com.newskyenglish.model.Enrollment.Status.approved
                        || enrollment.getStatus() == com.newskyenglish.model.Enrollment.Status.enrolled
                        || enrollment.getStatus() == com.newskyenglish.model.Enrollment.Status.completed)
                .collect(Collectors.groupingBy(
                        enrollment -> enrollment.getClassId(),
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));
    }
}
