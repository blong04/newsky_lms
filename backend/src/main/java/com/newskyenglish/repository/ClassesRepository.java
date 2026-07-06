package com.newskyenglish.repository;

import com.newskyenglish.model.Classes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
// Repository truy vấn lớp học theo khóa học, giáo viên hoặc trạng thái.
public interface ClassesRepository extends JpaRepository<Classes, Long> {
    List<Classes> findByCourseId(Long courseId);
    List<Classes> findByStatus(Classes.Status status);
    List<Classes> findByTeacherId(Long teacherId);
}

