package com.newskyenglish.repository;

import com.newskyenglish.model.Enrollments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
// Repository truy vấn đăng ký học theo user, lớp và trạng thái.
public interface EnrollmentsRepository extends JpaRepository<Enrollments, Long> {
    List<Enrollments> findByUserId(Long userId);
    List<Enrollments> findByClassId(Long classId);
    List<Enrollments> findByClassIdIn(List<Long> classIds);
    List<Enrollments> findByStatus(Enrollments.Status status);
}

