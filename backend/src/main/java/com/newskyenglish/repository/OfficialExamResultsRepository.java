package com.newskyenglish.repository;

import com.newskyenglish.model.OfficialExamResults;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
// Repository truy vấn điểm thi chính thức theo học viên và khóa học.
public interface OfficialExamResultsRepository extends JpaRepository<OfficialExamResults, Long> {
    List<OfficialExamResults> findByUserIdOrderByExamDateDesc(Long userId);
    List<OfficialExamResults> findByUserIdAndCourseIdOrderByExamDateDesc(Long userId, Long courseId);
    Optional<OfficialExamResults> findFirstByUserIdAndCourseIdOrderByExamDateDesc(Long userId, Long courseId);
}
