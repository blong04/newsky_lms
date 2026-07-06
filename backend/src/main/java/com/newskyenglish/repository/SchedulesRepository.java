package com.newskyenglish.repository;

import com.newskyenglish.model.Schedules;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
// Repository truy vấn lịch học theo lớp và thời gian.
public interface SchedulesRepository extends JpaRepository<Schedules, Long> {
    List<Schedules> findByClassId(Long classId);
    List<Schedules> findByClassIdOrderByDateAsc(Long classId);
}

