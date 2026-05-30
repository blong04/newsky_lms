package com.newskyenglish.dto.schedule;

import com.newskyenglish.model.Schedule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

// Gom request/response cho lịch học và từng buổi học.
public class ScheduleDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long classId;
        private String title;
        private String description;
        private LocalDate date;
        private LocalTime startTime;
        private LocalTime endTime;
        private String location;
        private String status;

        // Dùng cho các màn hình lịch học ở admin, teacher và student.
        public static Response fromEntity(Schedule schedule) {
            String derivedStatus = "scheduled";
            LocalDate today = LocalDate.now();
            LocalTime now = LocalTime.now();

            if (schedule.getDate() != null) {
                if (schedule.getDate().isBefore(today)) {
                    derivedStatus = "completed";
                } else if (schedule.getDate().isEqual(today)
                        && schedule.getStartTime() != null
                        && schedule.getEndTime() != null) {
                    if (now.isBefore(schedule.getStartTime())) {
                        derivedStatus = "scheduled";
                    } else if (now.isAfter(schedule.getEndTime())) {
                        derivedStatus = "completed";
                    } else {
                        derivedStatus = "ongoing";
                    }
                }
            }

            return Response.builder()
                    .id(schedule.getId())
                    .classId(schedule.getClassId())
                    .title(schedule.getTitle())
                    .description(schedule.getDescription())
                    .date(schedule.getDate())
                    .startTime(schedule.getStartTime())
                    .endTime(schedule.getEndTime())
                    .location(schedule.getLocation())
                    .status(derivedStatus)
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        // classId xác định lịch học này thuộc lớp nào.
        private Long classId;
        // title là tiêu đề buổi học hiển thị ở lịch.
        private String title;
        // description là mô tả chi tiết nội dung buổi học.
        private String description;
        // date là ngày diễn ra buổi học.
        private LocalDate date;
        // startTime là giờ bắt đầu.
        private LocalTime startTime;
        // endTime là giờ kết thúc.
        private LocalTime endTime;
        // location là địa điểm học offline.
        private String location;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        // classId cho phép chuyển lịch sang lớp khác khi cần.
        private Long classId;
        // title là tiêu đề buổi học sau khi chỉnh sửa.
        private String title;
        // description là mô tả cập nhật của buổi học.
        private String description;
        // date là ngày học đã chỉnh sửa.
        private LocalDate date;
        // startTime là giờ bắt đầu mới.
        private LocalTime startTime;
        // endTime là giờ kết thúc mới.
        private LocalTime endTime;
        // location là địa điểm học cập nhật.
        private String location;
    }
}
