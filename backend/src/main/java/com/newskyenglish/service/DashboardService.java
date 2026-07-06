package com.newskyenglish.service;

import com.newskyenglish.dto.dashboard.DashboardDTO;
import com.newskyenglish.model.Assignments;
import com.newskyenglish.model.AssignmentSubmissions;
import com.newskyenglish.model.Classes;
import com.newskyenglish.model.Enrollments;
import com.newskyenglish.model.Users;
import com.newskyenglish.repository.AssignmentsRepository;
import com.newskyenglish.repository.AssignmentSubmissionsRepository;
import com.newskyenglish.repository.ClassesRepository;
import com.newskyenglish.repository.CoursesRepository;
import com.newskyenglish.repository.EnrollmentsRepository;
import com.newskyenglish.repository.QuizSubmissionsRepository;
import com.newskyenglish.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
// Gom các số liệu dashboard theo từng nhóm người dùng nhưng tách khỏi service theo role.
public class DashboardService {

    private final UsersRepository usersRepository;
    private final CoursesRepository coursesRepository;
    private final ClassesRepository classesRepository;
    private final EnrollmentsRepository enrollmentsRepository;
    private final AssignmentsRepository assignmentsRepository;
    private final AssignmentSubmissionsRepository assignmentSubmissionsRepository;
    private final QuizSubmissionsRepository quizSubmissionsRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    // Tổng hợp số liệu chính cho dashboard quản trị.
    public DashboardDTO.AdminStatsResponse getAdminStats() {
        List<Users> allUsers = usersRepository.findAll();
        long totalStudents = allUsers.stream().filter(user -> user.getRoleId() == 3).count();
        long totalTeachers = allUsers.stream().filter(user -> user.getRoleId() == 2).count();
        long pendingTeachers = allUsers.stream()
                .filter(user -> user.getRoleId() == 2 && !Boolean.TRUE.equals(user.getApproved()))
                .count();

        return DashboardDTO.AdminStatsResponse.builder()
                .totalUsers((long) allUsers.size())
                .totalStudents(totalStudents)
                .totalTeachers(totalTeachers)
                .pendingTeachers(pendingTeachers)
                .totalCourses(coursesRepository.count())
                .totalClasses(classesRepository.count())
                .activeClasses((long) classesRepository.findByStatus(Classes.Status.active).size())
                .pendingEnrollments((long) enrollmentsRepository.findByStatus(Enrollments.Status.pending).size())
                .build();
    }

    @Transactional(readOnly = true)
    // Tổng hợp số liệu dashboard học viên từ enrollment và lịch sử làm quiz.
    public DashboardDTO.StudentSummaryResponse getStudentSummary(String authorizationHeader) {
        Long userId = currentUserService.extractUserId(authorizationHeader);
        List<Enrollments> enrollments = enrollmentsRepository.findByUserId(userId);

        long activeEnrollmentCount = enrollments.stream()
                .filter(enrollment -> enrollment.getStatus() == Enrollments.Status.approved
                        || enrollment.getStatus() == Enrollments.Status.enrolled)
                .count();
        long completedEnrollmentCount = enrollments.stream()
                .filter(enrollment -> enrollment.getStatus() == Enrollments.Status.completed)
                .count();
        long pendingEnrollmentCount = enrollments.stream()
                .filter(enrollment -> enrollment.getStatus() == Enrollments.Status.pending)
                .count();
        long quizSubmissionCount = quizSubmissionsRepository.findByUserId(userId).size();

        return DashboardDTO.StudentSummaryResponse.builder()
                .activeEnrollmentCount(activeEnrollmentCount)
                .completedEnrollmentCount(completedEnrollmentCount)
                .pendingEnrollmentCount(pendingEnrollmentCount)
                .quizSubmissionCount(quizSubmissionCount)
                .build();
    }

    @Transactional(readOnly = true)
    // Tổng hợp số liệu công việc chính của giáo viên hiện tại.
    public DashboardDTO.TeacherSummaryResponse getTeacherSummary(String authorizationHeader) {
        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        List<Classes> assignedClasses = classesRepository.findByTeacherId(teacherId);
        List<Long> assignedClassIds = assignedClasses.stream()
                .map(Classes::getId)
                .toList();

        List<Assignments> assignments = collectAssignmentsByClassIds(assignedClassIds);
        List<Long> assignmentIds = assignments.stream()
                .map(Assignments::getId)
                .distinct()
                .toList();

        long pendingSubmissionCount = 0;
        for (Long assignmentId : assignmentIds) {
            pendingSubmissionCount += assignmentSubmissionsRepository.findByAssignId(assignmentId).stream()
                    .filter(submission -> submission.getStatus() != AssignmentSubmissions.Status.graded)
                    .count();
        }

        return DashboardDTO.TeacherSummaryResponse.builder()
                .classCount((long) assignedClasses.size())
                .assignmentCount((long) assignmentIds.size())
                .pendingCount(pendingSubmissionCount)
                .build();
    }

    // Gom toàn bộ assignment thuộc các lớp giáo viên đang phụ trách.
    private List<Assignments> collectAssignmentsByClassIds(List<Long> classIds) {
        List<Assignments> assignments = new ArrayList<>();
        for (Long classId : classIds) {
            assignments.addAll(assignmentsRepository.findByClassId(classId));
        }
        return assignments;
    }
}
