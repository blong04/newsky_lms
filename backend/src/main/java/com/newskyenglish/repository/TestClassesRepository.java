package com.newskyenglish.repository;

import com.newskyenglish.model.TestClasses;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
// Repository truy vấn liên kết mock test - lớp học trong schema mới.
public interface TestClassesRepository extends JpaRepository<TestClasses, Long> {
    List<TestClasses> findByMockTestId(Long mockTestId);
    List<TestClasses> findByClassId(Long classId);
    List<TestClasses> findByClassIdIn(Collection<Long> classIds);
    void deleteByMockTestId(Long mockTestId);
}
