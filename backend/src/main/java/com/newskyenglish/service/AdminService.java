package com.newskyenglish.service;

import com.newskyenglish.dto.admin.AdminStatsDTO;
import com.newskyenglish.dto.classroom.ClassRoomDTO;
import com.newskyenglish.dto.enrollment.EnrollmentDTO;
import com.newskyenglish.dto.notification.NotificationDTO;
import com.newskyenglish.dto.user.UserDTO;
import com.newskyenglish.exception.BadRequestException;
import com.newskyenglish.exception.ResourceNotFoundException;
import com.newskyenglish.model.ClassRoom;
import com.newskyenglish.model.Course;
import com.newskyenglish.model.Enrollment;
import com.newskyenglish.model.User;
import com.newskyenglish.model.UserNotification;
import com.newskyenglish.repository.ClassRoomRepository;
import com.newskyenglish.repository.CourseRepository;
import com.newskyenglish.repository.EnrollmentRepository;
import com.newskyenglish.repository.UserNotificationRepository;
import com.newskyenglish.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
// Chứa các nghiệp vụ quản trị: dashboard, lớp học, duyệt đăng ký và thông báo hàng loạt.
public class AdminService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ClassRoomRepository classRoomRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserNotificationRepository userNotificationRepository;

    @Transactional(readOnly = true)
    // Tổng hợp các chỉ số chính cho dashboard admin.
    public AdminStatsDTO.Response getStats() {
        List<User> allUsers = userRepository.findAll();
        long totalStudents = allUsers.stream().filter(user -> user.getRoleId() == 3).count();
        long totalTeachers = allUsers.stream().filter(user -> user.getRoleId() == 2).count();
        long pendingTeachers = allUsers.stream()
                .filter(user -> user.getRoleId() == 2 && !Boolean.TRUE.equals(user.getApproved()))
                .count();

        return AdminStatsDTO.Response.builder()
                .totalUsers((long) allUsers.size())
                .totalStudents(totalStudents)
                .totalTeachers(totalTeachers)
                .pendingTeachers(pendingTeachers)
                .totalCourses(courseRepository.count())
                .totalClasses(classRoomRepository.count())
                .activeClasses((long) classRoomRepository.findByStatus(ClassRoom.Status.active).size())
                .pendingEnrollments((long) enrollmentRepository.findByStatus(Enrollment.Status.pending).size())
                .build();
    }

    @Transactional(readOnly = true)
    // Trả về danh sách lớp học kèm tên giáo viên để frontend đỡ phải join thêm.
    public List<ClassRoomDTO.Response> getAllClasses() {
        List<ClassRoom> allClasses = classRoomRepository.findAll();
        Map<Long, String> teacherNamesById = buildUserNameMap(allClasses.stream()
                .map(ClassRoom::getTeacherId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        Map<Long, Integer> currentStudentsByClassId = buildCurrentStudentMap(allClasses);

        return allClasses.stream()
                .map(classRoom -> ClassRoomDTO.Response.fromEntity(
                        classRoom,
                        currentStudentsByClassId.getOrDefault(classRoom.getId(), 0),
                        teacherNamesById.get(classRoom.getTeacherId())
                ))
                .toList();
    }

    @Transactional
    // Tạo mới một lớp học từ request DTO.
    public ClassRoomDTO.Response createClass(ClassRoomDTO.CreateRequest request) {
        ClassRoom classRoom = ClassRoom.builder()
                .courseId(request.getCourseId())
                .teacherId(request.getTeacherId())
                .name(request.getName())
                .description(request.getDescription())
                .maxStudents(request.getMaxStudents())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus() != null ? request.getStatus() : ClassRoom.Status.active)
                .build();

        return ClassRoomDTO.Response.fromEntity(
                classRoomRepository.save(classRoom),
                0,
                resolveTeacherName(classRoom.getTeacherId())
        );
    }

    @Transactional
    // Cập nhật thông tin lớp học từ màn admin classes.
    public ClassRoomDTO.Response updateClass(Long id, ClassRoomDTO.UpdateRequest request) {
        ClassRoom classRoom = findClassRoom(id);

        if (request.getCourseId() != null) classRoom.setCourseId(request.getCourseId());
        if (request.getTeacherId() != null) classRoom.setTeacherId(request.getTeacherId());
        if (request.getName() != null) classRoom.setName(request.getName());
        if (request.getDescription() != null) classRoom.setDescription(request.getDescription());
        if (request.getMaxStudents() != null) classRoom.setMaxStudents(request.getMaxStudents());
        if (request.getStartDate() != null) classRoom.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) classRoom.setEndDate(request.getEndDate());
        if (request.getStatus() != null) classRoom.setStatus(request.getStatus());

        return ClassRoomDTO.Response.fromEntity(
                classRoomRepository.save(classRoom),
                resolveCurrentStudentCount(classRoom.getId()),
                resolveTeacherName(classRoom.getTeacherId())
        );
    }

    @Transactional
    // Xóa một lớp học khỏi hệ thống.
    public void deleteClass(Long id) {
        classRoomRepository.delete(findClassRoom(id));
    }

    @Transactional
    // Gán giáo viên phụ trách cho một lớp cụ thể.
    public void assignTeacher(Long classId, Long teacherId) {
        ClassRoom classRoom = findClassRoom(classId);
        classRoom.setTeacherId(teacherId);
        classRoomRepository.save(classRoom);
    }

    @Transactional(readOnly = true)
    // Lấy toàn bộ đăng ký học trong hệ thống.
    public List<EnrollmentDTO.Response> getAllEnrollments() {
        return enrollmentRepository.findAll().stream()
                .map(EnrollmentDTO.Response::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy danh sách đăng ký theo từng lớp học.
    public List<EnrollmentDTO.Response> getEnrollmentsByClass(Long classId) {
        return enrollmentRepository.findByClassId(classId).stream()
                .map(EnrollmentDTO.Response::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    // Trả về các đăng ký đang chờ admin duyệt.
    public List<EnrollmentDTO.Response> getPendingEnrollments() {
        return enrollmentRepository.findByStatus(Enrollment.Status.pending).stream()
                .map(EnrollmentDTO.Response::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    // Trả về enrollment đã enrich tên user, course và class cho frontend quản trị.
    public List<EnrollmentDTO.AdminDetailResponse> getEnrollmentDetails() {
        List<Enrollment> enrollments = enrollmentRepository.findAll();
        Map<Long, User> usersById = buildUserMap(enrollments.stream()
                .map(Enrollment::getUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        Map<Long, Course> coursesById = buildCourseMap(enrollments.stream()
                .map(Enrollment::getCourseId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        Map<Long, ClassRoom> classesById = buildClassRoomMap(enrollments.stream()
                .map(Enrollment::getClassId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));

        return enrollments.stream()
                .map(enrollment -> EnrollmentDTO.AdminDetailResponse.fromEntity(
                        enrollment,
                        usersById.get(enrollment.getUserId()),
                        coursesById.get(enrollment.getCourseId()),
                        classesById.get(enrollment.getClassId())
                ))
                .toList();
    }

    @Transactional
    // Duyệt đăng ký học và tăng sĩ số lớp nếu cần.
    public void approveEnrollment(Long id) {
        Enrollment enrollment = findEnrollment(id);
        enrollment.setStatus(Enrollment.Status.approved);
        enrollment.setApprovedDate(LocalDateTime.now());
        enrollmentRepository.save(enrollment);
    }

    @Transactional
    // Cập nhật trạng thái enrollment từ các action quản trị.
    public EnrollmentDTO.Response updateEnrollment(Long id, EnrollmentDTO.UpdateStatusRequest request) {
        Enrollment enrollment = findEnrollment(id);

        if (request.getStatus() != null) {
            try {
                enrollment.setStatus(Enrollment.Status.valueOf(request.getStatus()));
            } catch (IllegalArgumentException ex) {
                throw new BadRequestException("Trạng thái không hợp lệ");
            }
        }

        return EnrollmentDTO.Response.fromEntity(enrollmentRepository.save(enrollment));
    }

    @Transactional
    // Cho phép hủy enrollment khi vẫn đang ở trạng thái chờ duyệt.
    public EnrollmentDTO.Response cancelEnrollment(Long id) {
        Enrollment enrollment = findEnrollment(id);
        if (enrollment.getStatus() != Enrollment.Status.pending) {
            throw new BadRequestException("Chỉ có thể hủy khi chưa được phê duyệt");
        }
        enrollment.setStatus(Enrollment.Status.dropped);
        return EnrollmentDTO.Response.fromEntity(enrollmentRepository.save(enrollment));
    }

    @Transactional(readOnly = true)
    // Lấy danh sách giáo viên vừa đăng ký nhưng chưa được phê duyệt.
    public List<UserDTO.Response> getPendingTeachers() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRoleId() == 2 && !Boolean.TRUE.equals(user.getApproved()))
                .map(UserDTO.Response::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    // Đánh dấu giáo viên đã được admin duyệt.
    public void approveTeacher(Long id) {
        User user = findUser(id);
        user.setApproved(true);
        userRepository.save(user);
    }

    @Transactional
    // Từ chối hồ sơ giáo viên bằng cách xóa tài khoản khỏi hệ thống.
    public void rejectTeacher(Long id) {
        userRepository.delete(findUser(id));
    }

    @Transactional
    // Gửi thông báo hàng loạt theo role hoặc tới một người dùng cụ thể.
    public NotificationDTO.SendResult sendNotification(NotificationDTO.BroadcastRequest request) {
        String title = request.getTitle();
        String content = request.getContent();
        String type = request.getType() != null ? request.getType() : "announcement";

        if (title == null || content == null) {
            throw new BadRequestException("Thiếu tiêu đề hoặc nội dung");
        }

        List<User> targetUsers = resolveTargets(request);
        List<UserNotification> notifications = new ArrayList<>();

        for (User targetUser : targetUsers) {
            notifications.add(UserNotification.builder()
                    .userId(targetUser.getId())
                    .title(title)
                    .content(content)
                    .type(type)
                    .read(false)
                    .build());
        }

        userNotificationRepository.saveAll(notifications);
        return NotificationDTO.SendResult.fromCount(notifications.size());
    }

    @Transactional(readOnly = true)
    // Trả về danh sách lớp public cho các màn frontend không cần metadata admin sâu.
    public List<ClassRoomDTO.Response> getClassesPublic() {
        List<ClassRoom> allClasses = classRoomRepository.findAll();
        Map<Long, Integer> currentStudentsByClassId = buildCurrentStudentMap(allClasses);

        return allClasses.stream()
                .map(classRoom -> ClassRoomDTO.Response.fromEntity(
                        classRoom,
                        currentStudentsByClassId.getOrDefault(classRoom.getId(), 0)
                ))
                .toList();
    }

    // Xác định tập người nhận cho thông báo admin.
    private List<User> resolveTargets(NotificationDTO.BroadcastRequest request) {
        Long targetUser = request.getTargetUserId();
        Integer targetRole = request.getTargetRole();

        if (targetUser != null) {
            Long userId = targetUser;
            return List.of(findUser(userId));
        }
        if (targetRole != null) {
            int roleId = targetRole;
            return userRepository.findAll().stream()
                    .filter(user -> user.getRoleId() == roleId)
                    .toList();
        }
        return userRepository.findAll();
    }

    // Helper lấy tên giáo viên hiển thị cho bảng lớp.
    private String resolveTeacherName(Long teacherId) {
        if (teacherId == null) {
            return null;
        }
        return userRepository.findById(teacherId).map(User::getName).orElse(null);
    }

    // Helper preload map user để tránh findById lặp trong vòng lặp mapping.
    private Map<Long, User> buildUserMap(Set<Long> userIds) {
        return userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
    }

    // Helper preload map tên người dùng khi chỉ cần hiển thị label gọn.
    private Map<Long, String> buildUserNameMap(Set<Long> userIds) {
        return buildUserMap(userIds).values().stream()
                .collect(Collectors.toMap(User::getId, User::getName));
    }

    // Helper preload map course phục vụ enrich enrollment hoặc lớp học.
    private Map<Long, Course> buildCourseMap(Set<Long> courseIds) {
        return courseRepository.findAllById(courseIds).stream()
                .collect(Collectors.toMap(Course::getId, Function.identity()));
    }

    // Helper preload map classRoom để tái sử dụng cho các response cần join tên lớp.
    private Map<Long, ClassRoom> buildClassRoomMap(Set<Long> classIds) {
        return classRoomRepository.findAllById(classIds).stream()
                .collect(Collectors.toMap(ClassRoom::getId, Function.identity()));
    }

    // Tính sĩ số thực tế từ enrollment còn hiệu lực thay vì đọc từ cột đã bị xóa.
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

    // Lấy nhanh sĩ số của một lớp để trả về sau khi create/update.
    private Integer resolveCurrentStudentCount(Long classId) {
        return (int) enrollmentRepository.findByClassId(classId).stream()
                .filter(enrollment -> enrollment.getStatus() == Enrollment.Status.approved
                        || enrollment.getStatus() == Enrollment.Status.enrolled
                        || enrollment.getStatus() == Enrollment.Status.completed)
                .count();
    }

    // Helper tìm user hoặc ném lỗi nếu không tồn tại.
    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
    }

    // Helper tìm lớp học theo id.
    private ClassRoom findClassRoom(Long id) {
        return classRoomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học"));
    }

    // Helper tìm enrollment theo id.
    private Enrollment findEnrollment(Long id) {
        return enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đăng ký"));
    }

}
