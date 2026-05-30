package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "schedules")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
// Entity lưu một buổi học hoặc lịch hẹn cụ thể của lớp.
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ScheduleID")
    private Long id;

    @Column(name = "ClassID")
    private Long classId;

    @Column(name = "TieuDe", length = 255)
    private String title;

    @Column(name = "MoTa", columnDefinition = "TEXT")
    private String description;

    @Column(name = "NgayHoc")
    private LocalDate date;

    @Column(name = "GioBatDau")
    private LocalTime startTime;

    @Column(name = "GioKetThuc")
    private LocalTime endTime;

    @Column(name = "DiaDiem", length = 255)
    private String location;

}
