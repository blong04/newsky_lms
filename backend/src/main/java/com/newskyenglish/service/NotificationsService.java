package com.newskyenglish.service;

import com.newskyenglish.dto.notifications.NotificationsDTO;
import com.newskyenglish.exception.ForbiddenException;
import com.newskyenglish.exception.ResourceNotFoundException;
import com.newskyenglish.model.Classes;
import com.newskyenglish.model.Enrollments;
import com.newskyenglish.model.Notifications;
import com.newskyenglish.model.NotificationReceivers;
import com.newskyenglish.model.Users;
import com.newskyenglish.repository.ClassesRepository;
import com.newskyenglish.repository.EnrollmentsRepository;
import com.newskyenglish.repository.NotificationsRepository;
import com.newskyenglish.repository.NotificationReceiversRepository;
import com.newskyenglish.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
// Cung cấp hộp thư thông báo cá nhân và thao tác đọc/gửi thông báo.
public class NotificationsService {

    private final NotificationReceiversRepository userNotificationRepository;
    private final NotificationsRepository notificationMessageRepository;
    private final UsersRepository usersRepository;
    private final ClassesRepository classesRepository;
    private final EnrollmentsRepository enrollmentsRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    // Lấy hộp thư thông báo của user hiện tại theo thời gian mới nhất.
    public List<NotificationsDTO.Response> getMyNotifications(String authorizationHeader) {
        Long userId = currentUserService.extractUserId(authorizationHeader);
        return userNotificationRepository.findByUserId(userId).stream()
                .sorted(Comparator.comparing(NotificationReceivers::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(NotificationsDTO.Response::fromEntity)
                .toList();
    }

    @Transactional
    // Đánh dấu một thông báo đã được đọc.
    public NotificationsDTO.Response markRead(Long id, String authorizationHeader) {
        NotificationReceivers notification = userNotificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo"));
        Long currentUserId = currentUserService.extractUserId(authorizationHeader);
        Integer currentRoleId = currentUserService.extractRoleId(authorizationHeader);
        if (!currentUserId.equals(notification.getUserId()) && !Integer.valueOf(1).equals(currentRoleId)) {
            throw new ForbiddenException("Bạn không có quyền cập nhật thông báo này");
        }
        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        return NotificationsDTO.Response.fromEntity(userNotificationRepository.save(notification));
    }

    @Transactional
    // Đánh dấu toàn bộ thông báo của user hiện tại là đã đọc.
    public void markAllRead(String authorizationHeader) {
        Long userId = currentUserService.extractUserId(authorizationHeader);
        List<NotificationReceivers> userNotifications = userNotificationRepository.findByUserId(userId);
        userNotifications.forEach(notification -> {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
        });
        userNotificationRepository.saveAll(userNotifications);
    }

    @Transactional
    // Tạo một bản ghi thông báo mới cho người dùng.
    public NotificationsDTO.Response send(NotificationsDTO.CreateRequest request) {
        Notifications notificationMessage = notificationMessageRepository.save(Notifications.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .type(request.getType() != null ? request.getType() : "announcement")
                .build());

        NotificationReceivers notification = NotificationReceivers.builder()
                .notificationId(notificationMessage.getId())
                .userId(request.getUserId())
                .read(false)
                .build();
        notification.setNotification(notificationMessage);
        return NotificationsDTO.Response.fromEntity(userNotificationRepository.save(notification));
    }

    @Transactional
    // Gửi thông báo diện rộng từ admin theo user hoặc theo role.
    public NotificationsDTO.SendResult sendAdminBroadcast(NotificationsDTO.BroadcastRequest request) {
        List<Users> targetUsers = resolveAdminTargets(request);
        Notifications notification = notificationMessageRepository.save(Notifications.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .type(request.getType() != null ? request.getType() : "announcement")
                .build());

        List<NotificationReceivers> receivers = targetUsers.stream()
                .map(user -> NotificationReceivers.builder()
                        .notificationId(notification.getId())
                        .userId(user.getId())
                        .read(false)
                        .build())
                .toList();

        userNotificationRepository.saveAll(receivers);
        return NotificationsDTO.SendResult.fromCount(receivers.size());
    }

    @Transactional
    // Gửi thông báo từ giáo viên tới học viên thuộc lớp mình phụ trách.
    public NotificationsDTO.SendResult sendTeacherBroadcast(NotificationsDTO.BroadcastRequest request,
                                                            String authorizationHeader) {
        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        List<Long> ownedClassIds = classesRepository.findByTeacherId(teacherId).stream()
                .map(Classes::getId)
                .toList();
        List<Users> targetUsers = resolveTeacherTargets(request, ownedClassIds);

        Notifications notification = notificationMessageRepository.save(Notifications.builder()
                .senderId(teacherId)
                .title(request.getTitle())
                .content(request.getContent())
                .type(request.getType() != null ? request.getType() : "course")
                .build());

        List<NotificationReceivers> receivers = targetUsers.stream()
                .map(user -> NotificationReceivers.builder()
                        .notificationId(notification.getId())
                        .userId(user.getId())
                        .read(false)
                        .build())
                .toList();

        userNotificationRepository.saveAll(receivers);
        return NotificationsDTO.SendResult.fromCount(receivers.size());
    }

    // Xác định người nhận của thông báo admin theo user, role hoặc toàn hệ thống.
    private List<Users> resolveAdminTargets(NotificationsDTO.BroadcastRequest request) {
        if (request.getTargetUserId() != null) {
            return List.of(findUser(request.getTargetUserId()));
        }
        if (request.getTargetRole() != null) {
            return usersRepository.findAll().stream()
                    .filter(user -> user.getRoleId() == request.getTargetRole())
                    .toList();
        }
        return usersRepository.findAll();
    }

    // Đảm bảo giáo viên chỉ gửi thông báo cho học viên thuộc lớp mình quản lý.
    private List<Users> resolveTeacherTargets(NotificationsDTO.BroadcastRequest request, List<Long> ownedClassIds) {
        Long targetUserId = request.getTargetUserId();
        Long targetClassId = request.getTargetClassId();

        if (targetUserId != null) {
            boolean belongsToTeacher = ownedClassIds.stream().anyMatch(classId ->
                    enrollmentsRepository.findByClassId(classId).stream()
                            .anyMatch(enrollment -> enrollment.getUserId().equals(targetUserId))
            );
            if (!belongsToTeacher) {
                throw new ForbiddenException("Bạn chỉ có thể gửi cho học viên thuộc lớp của mình");
            }
            return List.of(findUser(targetUserId));
        }

        if (targetClassId != null) {
            if (!ownedClassIds.contains(targetClassId)) {
                throw new ForbiddenException("Bạn không có quyền gửi cho lớp này");
            }

            List<Enrollments> enrollments = enrollmentsRepository.findByClassId(targetClassId);
            Map<Long, Users> usersById = buildUserMap(enrollments.stream()
                    .map(Enrollments::getUserId)
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

    // Helper preload user map để tránh query lặp khi resolve recipients.
    private Map<Long, Users> buildUserMap(Set<Long> userIds) {
        return usersRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(Users::getId, Function.identity()));
    }

    // Helper tìm người dùng hoặc ném lỗi nếu không tồn tại.
    private Users findUser(Long userId) {
        return usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
    }
}

