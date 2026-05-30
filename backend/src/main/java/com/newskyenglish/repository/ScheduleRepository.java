package com.newskyenglish.repository;

import com.newskyenglish.model.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
// Repository truy vấn lịch học theo lớp và thời gian.
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByClassId(Long classId);
    List<Schedule> findByClassIdOrderByDateAsc(Long classId);
}
