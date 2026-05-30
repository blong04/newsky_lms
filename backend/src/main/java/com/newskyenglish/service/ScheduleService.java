package com.newskyenglish.service;

import com.newskyenglish.dto.schedule.ScheduleDTO;
import com.newskyenglish.exception.ResourceNotFoundException;
import com.newskyenglish.model.Schedule;
import com.newskyenglish.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
// Quản lý lịch học theo lớp, bao gồm tạo mới và cập nhật từng buổi học.
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;

    @Transactional(readOnly = true)
    // Lấy toàn bộ lịch học trong hệ thống.
    public List<ScheduleDTO.Response> getAll() {
        return scheduleRepository.findAll().stream()
                .map(ScheduleDTO.Response::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy lịch học theo lớp để hiển thị cho giáo viên và học viên.
    public List<ScheduleDTO.Response> getByClass(Long classId) {
        return scheduleRepository.findByClassIdOrderByDateAsc(classId).stream()
                .map(ScheduleDTO.Response::fromEntity)
                .toList();
    }

    @Transactional
    // Tạo mới một lịch học hoặc buổi học.
    public ScheduleDTO.Response create(ScheduleDTO.CreateRequest request) {
        Schedule schedule = Schedule.builder()
                .classId(request.getClassId())
                .title(request.getTitle())
                .description(request.getDescription())
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .location(request.getLocation())
                .build();

        return ScheduleDTO.Response.fromEntity(scheduleRepository.save(schedule));
    }

    @Transactional
    // Cập nhật thông tin buổi học hiện có.
    public ScheduleDTO.Response update(Long id, ScheduleDTO.UpdateRequest request) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch học"));

        if (request.getClassId() != null) schedule.setClassId(request.getClassId());
        if (request.getTitle() != null) schedule.setTitle(request.getTitle());
        if (request.getDescription() != null) schedule.setDescription(request.getDescription());
        if (request.getDate() != null) schedule.setDate(request.getDate());
        if (request.getStartTime() != null) schedule.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) schedule.setEndTime(request.getEndTime());
        if (request.getLocation() != null) schedule.setLocation(request.getLocation());

        return ScheduleDTO.Response.fromEntity(scheduleRepository.save(schedule));
    }
}
