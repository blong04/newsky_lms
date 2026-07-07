-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3306
-- Thời gian đã tạo: Th7 07, 2026 lúc 02:36 PM
-- Phiên bản máy phục vụ: 9.1.0
-- Phiên bản PHP: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `defaultdb`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `assignments`
--

DROP TABLE IF EXISTS `assignments`;
CREATE TABLE IF NOT EXISTS `assignments` (
  `assign_id` int NOT NULL AUTO_INCREMENT,
  `class_id` int DEFAULT NULL,
  `title` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `assignment_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `max_score` decimal(5,2) DEFAULT '100.00',
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`assign_id`),
  KEY `fk_assignments_classes` (`class_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `assignments`
--

INSERT INTO `assignments` (`assign_id`, `class_id`, `title`, `description`, `assignment_type`, `due_date`, `max_score`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'IELTS Assignment 01', 'Bài tập thực hành cho lớp IELTS_FDN_01 theo nội dung tuần học hiện tại.', 'reading_practice', '2026-07-20 23:59:00', 10.00, 'active', '2026-07-09 09:00:00', '2026-07-09 09:00:00'),
(2, 2, 'IELTS Assignment 02', 'Bài tập thực hành cho lớp IELTS_PRE_01 theo nội dung tuần học hiện tại.', 'grammar', '2026-07-21 23:59:00', 10.00, 'active', '2026-07-10 09:00:00', '2026-07-10 09:00:00'),
(3, 3, 'IELTS Assignment 03', 'Bài tập thực hành cho lớp IELTS_READ_01 theo nội dung tuần học hiện tại.', 'speaking_notes', '2026-07-22 23:59:00', 10.00, 'active', '2026-07-11 09:00:00', '2026-07-11 09:00:00'),
(4, 4, 'IELTS Assignment 04', 'Bài tập thực hành cho lớp IELTS_LISTEN_01 theo nội dung tuần học hiện tại.', 'writing', '2026-07-24 23:59:00', 10.00, 'active', '2026-07-13 09:00:00', '2026-07-13 09:00:00'),
(5, 5, 'IELTS Assignment 05', 'Bài tập thực hành cho lớp IELTS_WRITE_01 theo nội dung tuần học hiện tại.', 'reading_practice', '2026-07-26 23:59:00', 10.00, 'active', '2026-07-15 09:00:00', '2026-07-15 09:00:00'),
(6, 6, 'IELTS Assignment 06', 'Bài tập thực hành cho lớp IELTS_SPEAK_01 theo nội dung tuần học hiện tại.', 'grammar', '2026-07-28 23:59:00', 10.00, 'active', '2026-07-17 09:00:00', '2026-07-17 09:00:00'),
(7, 7, 'IELTS Assignment 07', 'Bài tập thực hành cho lớp IELTS_MOCK_01 theo nội dung tuần học hiện tại.', 'speaking_notes', '2026-07-30 23:59:00', 10.00, 'active', '2026-07-19 09:00:00', '2026-07-19 09:00:00'),
(8, 8, 'IELTS Assignment 08', 'Bài tập thực hành cho lớp IELTS_65_01 theo nội dung tuần học hiện tại.', 'writing', '2026-08-01 23:59:00', 10.00, 'active', '2026-07-21 09:00:00', '2026-07-21 09:00:00'),
(9, 9, 'TOEIC Assignment 09', 'Bài tập thực hành cho lớp TOEIC_450_01 theo nội dung tuần học hiện tại.', 'reading_practice', '2026-09-13 23:59:00', 15.00, 'inactive', '2026-09-02 09:00:00', '2026-09-02 09:00:00'),
(10, 10, 'TOEIC Assignment 10', 'Bài tập thực hành cho lớp TOEIC_600_01 theo nội dung tuần học hiện tại.', 'grammar', '2026-09-15 23:59:00', 15.00, 'inactive', '2026-09-04 09:00:00', '2026-09-04 09:00:00'),
(11, 11, 'TOEIC Assignment 11', 'Bài tập thực hành cho lớp TOEIC_GR_01 theo nội dung tuần học hiện tại.', 'speaking_notes', '2026-09-17 23:59:00', 15.00, 'inactive', '2026-09-06 09:00:00', '2026-09-06 09:00:00'),
(12, 12, 'TOEIC Assignment 12', 'Bài tập thực hành cho lớp TOEIC_LIS_01 theo nội dung tuần học hiện tại.', 'writing', '2026-09-19 23:59:00', 15.00, 'inactive', '2026-09-08 09:00:00', '2026-09-08 09:00:00'),
(13, 13, 'TOEIC Assignment 13', 'Bài tập thực hành cho lớp TOEIC_READ_01 theo nội dung tuần học hiện tại.', 'reading_practice', '2026-09-21 23:59:00', 15.00, 'inactive', '2026-09-10 09:00:00', '2026-09-10 09:00:00'),
(14, 14, 'TOEIC Assignment 14', 'Bài tập thực hành cho lớp TOEIC_750_01 theo nội dung tuần học hiện tại.', 'grammar', '2026-09-23 23:59:00', 15.00, 'inactive', '2026-09-12 09:00:00', '2026-09-12 09:00:00'),
(15, 15, 'TOEIC Assignment 15', 'Bài tập thực hành cho lớp TOEIC_MOCK_00 theo nội dung tuần học hiện tại.', 'speaking_notes', '2026-04-17 23:59:00', 15.00, 'closed', '2026-04-06 09:00:00', '2026-04-06 09:00:00'),
(16, 16, 'TOEIC Assignment 16', 'Bài tập thực hành cho lớp TOEIC_900_00 theo nội dung tuần học hiện tại.', 'writing', '2026-04-22 23:59:00', 15.00, 'closed', '2026-04-11 09:00:00', '2026-04-11 09:00:00'),
(17, 17, 'English Assignment 17', 'Bài tập thực hành cho lớp ENG_COM_BASIC_00 theo nội dung tuần học hiện tại.', 'reading_practice', '2026-04-24 23:59:00', 8.00, 'closed', '2026-04-13 09:00:00', '2026-04-13 09:00:00'),
(18, 18, 'English Assignment 18', 'Bài tập thực hành cho lớp ENG_COM_INT_00 theo nội dung tuần học hiện tại.', 'grammar', '2026-04-27 23:59:00', 8.00, 'closed', '2026-04-16 09:00:00', '2026-04-16 09:00:00'),
(19, 19, 'English Assignment 19', 'Bài tập thực hành cho lớp BIZ_WRITE_00 theo nội dung tuần học hiện tại.', 'speaking_notes', '2026-04-30 23:59:00', 8.00, 'closed', '2026-04-19 09:00:00', '2026-04-19 09:00:00'),
(20, 20, 'English Assignment 20', 'Bài tập thực hành cho lớp PRONUN_00 theo nội dung tuần học hiện tại.', 'writing', '2026-05-02 23:59:00', 8.00, 'closed', '2026-04-21 09:00:00', '2026-04-21 09:00:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `assignment_submissions`
--

DROP TABLE IF EXISTS `assignment_submissions`;
CREATE TABLE IF NOT EXISTS `assignment_submissions` (
  `assign_submission_id` int NOT NULL AUTO_INCREMENT,
  `assign_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `answers_json` longtext COLLATE utf8mb4_general_ci,
  `score` decimal(5,2) DEFAULT NULL,
  `feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`assign_submission_id`),
  KEY `fk_assignmentsubmit_assignment` (`assign_id`),
  KEY `fk_assignmentsubmit_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `assignment_submissions`
--

INSERT INTO `assignment_submissions` (`assign_submission_id`, `assign_id`, `user_id`, `content`, `answers_json`, `score`, `feedback`, `status`, `submitted_at`, `updated_at`) VALUES
(1, 1, 1, 'Bài làm mẫu cho assignment 1 của học viên user_id=1.', NULL, 7.00, 'Nhận xét cho assignment 1: cần cải thiện phần diễn đạt.', 'graded', '2026-07-19 23:59:00', '2026-07-19 23:59:00'),
(2, 2, 1, 'Bài làm mẫu cho assignment 2 của học viên user_id=1.', NULL, 7.50, 'Nhận xét cho assignment 2: cần cải thiện phần diễn đạt.', 'graded', '2026-07-20 23:59:00', '2026-07-20 23:59:00'),
(3, 3, 1, 'Bài làm mẫu cho assignment 3 của học viên user_id=1.', NULL, 8.00, 'Nhận xét cho assignment 3: cần cải thiện phần diễn đạt.', 'graded', '2026-07-21 23:59:00', '2026-07-21 23:59:00'),
(4, 5, 1, 'Bài làm mẫu cho assignment 5 của học viên user_id=1.', NULL, 7.00, 'Nhận xét cho assignment 5: cần cải thiện phần diễn đạt.', 'graded', '2026-07-25 23:59:00', '2026-07-25 23:59:00'),
(5, 9, 1, 'Bài làm mẫu cho assignment 9 của học viên user_id=1.', NULL, 7.00, 'Nhận xét cho assignment 9: cần cải thiện phần diễn đạt.', 'graded', '2026-09-12 23:59:00', '2026-09-12 23:59:00'),
(6, 15, 1, 'Bài làm mẫu cho assignment 15 của học viên user_id=1.', NULL, NULL, NULL, 'submitted', '2026-04-16 23:59:00', '2026-04-16 23:59:00'),
(8, 1, 9, 'Bài làm mẫu cho assignment 1 của user 9.', NULL, 6.00, 'Nhận xét tự động mẫu cho user 9 ở assignment 1.', 'graded', '2026-07-19 23:59:00', '2026-07-19 23:59:00'),
(9, 3, 9, 'Bài làm mẫu cho assignment 3 của user 9.', NULL, 7.00, 'Nhận xét tự động mẫu cho user 9 ở assignment 3.', 'graded', '2026-07-21 23:59:00', '2026-07-21 23:59:00'),
(10, 4, 10, 'Bài làm mẫu cho assignment 4 của user 10.', NULL, 8.00, 'Nhận xét tự động mẫu cho user 10 ở assignment 4.', 'graded', '2026-07-22 23:59:00', '2026-07-22 23:59:00'),
(11, 6, 10, 'Bài làm mẫu cho assignment 6 của user 10.', NULL, 6.50, 'Nhận xét tự động mẫu cho user 10 ở assignment 6.', 'graded', '2026-07-26 23:59:00', '2026-07-26 23:59:00'),
(12, 7, 11, 'Bài làm mẫu cho assignment 7 của user 11.', NULL, 7.50, 'Nhận xét tự động mẫu cho user 11 ở assignment 7.', 'graded', '2026-07-27 23:59:00', '2026-07-27 23:59:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `classes`
--

DROP TABLE IF EXISTS `classes`;
CREATE TABLE IF NOT EXISTS `classes` (
  `class_id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `teacher_id` int DEFAULT NULL,
  `class_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `max_students` int DEFAULT '50',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`class_id`),
  KEY `idx_class_course` (`course_id`),
  KEY `fk_classes_teacher` (`teacher_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `classes`
--

INSERT INTO `classes` (`class_id`, `course_id`, `teacher_id`, `class_name`, `description`, `max_students`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 3, 'IELTS_FDN_01', 'Lớp nền tảng IELTS buổi sáng.', 20, '2026-07-08', '2026-09-05', 'active', '2026-07-01 10:00:00', '2026-07-01 10:00:00'),
(2, 2, 3, 'IELTS_PRE_01', 'Lớp Pre-Intermediate buổi tối.', 20, '2026-07-09', '2026-09-08', 'active', '2026-07-01 10:05:00', '2026-07-01 10:05:00'),
(3, 3, 3, 'IELTS_READ_01', 'Lớp chuyên Reading.', 18, '2026-07-10', '2026-08-30', 'active', '2026-07-01 10:10:00', '2026-07-01 10:10:00'),
(4, 4, 3, 'IELTS_LISTEN_01', 'Lớp chuyên Listening.', 18, '2026-07-12', '2026-09-01', 'active', '2026-07-01 10:15:00', '2026-07-01 10:15:00'),
(5, 5, 3, 'IELTS_WRITE_01', 'Lớp luyện Writing band 6.5.', 15, '2026-07-14', '2026-09-10', 'active', '2026-07-01 10:20:00', '2026-07-01 10:20:00'),
(6, 6, 3, 'IELTS_SPEAK_01', 'Lớp luyện Speaking theo chủ đề.', 15, '2026-07-16', '2026-09-12', 'active', '2026-07-01 10:25:00', '2026-07-01 10:25:00'),
(7, 7, 3, 'IELTS_MOCK_01', 'Lớp chữa đề IELTS mock test.', 16, '2026-07-18', '2026-09-15', 'active', '2026-07-01 10:30:00', '2026-07-01 10:30:00'),
(8, 8, 3, 'IELTS_65_01', 'Lớp mục tiêu band 6.5+.', 14, '2026-07-20', '2026-09-20', 'active', '2026-07-01 10:35:00', '2026-07-01 10:35:00'),
(9, 9, 3, 'TOEIC_450_01', 'Lớp TOEIC Starter chờ khai giảng.', 25, '2026-09-01', '2026-10-20', 'pending', '2026-07-01 10:40:00', '2026-07-01 10:40:00'),
(10, 10, 3, 'TOEIC_600_01', 'Lớp TOEIC 600+ chờ khai giảng.', 25, '2026-09-03', '2026-10-25', 'pending', '2026-07-01 10:45:00', '2026-07-01 10:45:00'),
(11, 11, 3, 'TOEIC_GR_01', 'Lớp ngữ pháp TOEIC Part 5-6.', 20, '2026-09-05', '2026-10-28', 'pending', '2026-07-01 10:50:00', '2026-07-01 10:50:00'),
(12, 12, 3, 'TOEIC_LIS_01', 'Lớp Listening TOEIC cuối tuần.', 20, '2026-09-07', '2026-10-30', 'pending', '2026-07-01 10:55:00', '2026-07-01 10:55:00'),
(13, 13, 3, 'TOEIC_READ_01', 'Lớp Reading Speed TOEIC.', 20, '2026-09-09', '2026-11-02', 'pending', '2026-07-01 11:00:00', '2026-07-01 11:00:00'),
(14, 14, 3, 'TOEIC_750_01', 'Lớp TOEIC 750+ buổi tối.', 18, '2026-09-11', '2026-11-05', 'pending', '2026-07-01 11:05:00', '2026-07-01 11:05:00'),
(15, 15, 3, 'TOEIC_MOCK_00', 'Lớp TOEIC mock test đã kết thúc.', 18, '2026-04-05', '2026-06-01', 'completed', '2026-07-01 11:10:00', '2026-07-01 11:10:00'),
(16, 16, 3, 'TOEIC_900_00', 'Lớp TOEIC 900 Sprint đã kết thúc.', 15, '2026-04-10', '2026-06-10', 'completed', '2026-07-01 11:15:00', '2026-07-01 11:15:00'),
(17, 17, 3, 'ENG_COM_BASIC_00', 'Lớp giao tiếp cơ bản đã kết thúc.', 22, '2026-04-12', '2026-06-12', 'completed', '2026-07-01 11:20:00', '2026-07-01 11:20:00'),
(18, 18, 3, 'ENG_COM_INT_00', 'Lớp giao tiếp trung cấp đã kết thúc.', 20, '2026-04-15', '2026-06-15', 'completed', '2026-07-01 11:25:00', '2026-07-01 11:25:00'),
(19, 19, 3, 'BIZ_WRITE_00', 'Lớp Business Writing đã kết thúc.', 18, '2026-04-18', '2026-06-20', 'completed', '2026-07-01 11:30:00', '2026-07-01 11:30:00'),
(20, 20, 3, 'PRONUN_00', 'Lớp phát âm đã kết thúc.', 18, '2026-04-20', '2026-06-18', 'completed', '2026-07-01 11:35:00', '2026-07-01 11:35:00'),
(21, 1, 3, 'IELTS_FDN_02', 'Lớp IELTS Foundation buổi tối.', 20, '2026-07-22', '2026-09-22', 'active', '2026-07-01 11:40:00', '2026-07-01 11:40:00'),
(22, 10, 3, 'TOEIC_600_02', 'Lớp TOEIC 600+ buổi sáng.', 24, '2026-07-24', '2026-09-24', 'active', '2026-07-01 11:45:00', '2026-07-01 11:45:00'),
(23, 5, 3, 'IELTS_WRITE_02', 'Lớp Writing tăng cường buổi tối.', 15, '2026-09-15', '2026-11-15', 'pending', '2026-07-01 11:50:00', '2026-07-01 11:50:00'),
(24, 17, 3, 'ENG_COM_BASIC_01', 'Lớp giao tiếp cơ bản cuối tuần.', 22, '2026-07-26', '2026-09-26', 'active', '2026-07-01 11:55:00', '2026-07-01 11:55:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `courses`
--

DROP TABLE IF EXISTS `courses`;
CREATE TABLE IF NOT EXISTS `courses` (
  `course_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `price` decimal(10,2) DEFAULT '0.00',
  `level` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `course_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`course_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `courses`
--

INSERT INTO `courses` (`course_id`, `title`, `description`, `price`, `level`, `course_type`, `status`, `created_at`, `updated_at`) VALUES
(1, 'IELTS Foundation', 'Khoá nền tảng IELTS cho người mới bắt đầu.', 2800000.00, 'beginner', 'IELTS', 'active', '2026-07-01 08:00:00', '2026-07-01 08:00:00'),
(2, 'IELTS Pre-Intermediate', 'Củng cố ngữ pháp và từ vựng để lên band 5.0.', 3000000.00, 'beginner', 'IELTS', 'active', '2026-07-01 08:05:00', '2026-07-01 08:05:00'),
(3, 'IELTS Reading Skills', 'Luyện scanning, skimming và các dạng câu hỏi đọc hiểu.', 3200000.00, 'intermediate', 'IELTS', 'active', '2026-07-01 08:10:00', '2026-07-01 08:10:00'),
(4, 'IELTS Listening Focus', 'Chuyên đề nghe IELTS theo section.', 3200000.00, 'intermediate', 'IELTS', 'active', '2026-07-01 08:15:00', '2026-07-01 08:15:00'),
(5, 'IELTS Writing Intensive', 'Luyện Task 1 va Task 2 theo tiêu chí band descriptor.', 3500000.00, 'advanced', 'IELTS', 'active', '2026-07-01 08:20:00', '2026-07-01 08:20:00'),
(6, 'IELTS Speaking Workshop', 'Rèn phản xạ và phát triển ý cho speaking.', 3300000.00, 'intermediate', 'IELTS', 'active', '2026-07-01 08:25:00', '2026-07-01 08:25:00'),
(7, 'IELTS Mock Test Bootcamp', 'Luyện đề mô phỏng toàn bộ bài thi IELTS.', 3600000.00, 'advanced', 'IELTS', 'active', '2026-07-01 08:30:00', '2026-07-01 08:30:00'),
(8, 'IELTS Band 6.5+', 'Khoá tăng tốc cho học viên mục tiêu band 6.5 trở lên.', 3900000.00, 'advanced', 'IELTS', 'active', '2026-07-01 08:35:00', '2026-07-01 08:35:00'),
(9, 'TOEIC Starter 450+', 'Khoá TOEIC cơ bản cho người mất gốc.', 2200000.00, 'beginner', 'TOEIC', 'active', '2026-07-01 08:40:00', '2026-07-01 08:40:00'),
(10, 'TOEIC 600+', 'Luyện TOEIC mốc 600 với ngữ pháp và từ vựng cốt lõi.', 2600000.00, 'intermediate', 'TOEIC', 'active', '2026-07-01 08:45:00', '2026-07-01 08:45:00'),
(11, 'TOEIC 650+ Grammar', 'Chuyên đề Part 5 va Part 6.', 2700000.00, 'intermediate', 'TOEIC', 'active', '2026-07-01 08:50:00', '2026-07-01 08:50:00'),
(12, 'TOEIC Listening Mastery', 'Chinh phục Part 1-4 với chiến lược nghe từ khóa.', 2900000.00, 'intermediate', 'TOEIC', 'active', '2026-07-01 08:55:00', '2026-07-01 08:55:00'),
(13, 'TOEIC Reading Speed', 'Luyện tăng tốc độ đọc Part 7.', 3000000.00, 'advanced', 'TOEIC', 'active', '2026-07-01 09:00:00', '2026-07-01 09:00:00'),
(14, 'TOEIC 750+', 'Khoá luyện điểm TOEIC 750+.', 3300000.00, 'advanced', 'TOEIC', 'active', '2026-07-01 09:05:00', '2026-07-01 09:05:00'),
(15, 'TOEIC Mock Test Lab', 'Làm đề TOEIC mô phỏng và chữa chi tiết.', 3400000.00, 'advanced', 'TOEIC', 'active', '2026-07-01 09:10:00', '2026-07-01 09:10:00'),
(16, 'TOEIC 900 Sprint', 'Khoá tăng tốc cho mục tiêu điểm cao TOEIC.', 3800000.00, 'advanced', 'TOEIC', 'active', '2026-07-01 09:15:00', '2026-07-01 09:15:00'),
(17, 'English Communication Basic', 'Giao tiếp hằng ngày cho người mới học.', 1800000.00, 'beginner', 'OTHER', 'active', '2026-07-01 09:20:00', '2026-07-01 09:20:00'),
(18, 'English Communication Intermediate', 'Giao tiếp tình huống thực tế cho người đi làm.', 2100000.00, 'intermediate', 'OTHER', 'active', '2026-07-01 09:25:00', '2026-07-01 09:25:00'),
(19, 'Business English Writing', 'Viết email, báo cáo và tin nhắn công việc bằng tiếng Anh.', 2600000.00, 'intermediate', 'OTHER', 'active', '2026-07-01 09:30:00', '2026-07-01 09:30:00'),
(20, 'Pronunciation Clinic', 'Cải thiện phát âm và trọng âm theo IPA.', 1900000.00, 'beginner', 'OTHER', 'active', '2026-07-01 09:35:00', '2026-07-01 09:35:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
CREATE TABLE IF NOT EXISTS `enrollments` (
  `enroll_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `class_id` int DEFAULT NULL,
  `enrolled_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `approved_at` datetime DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `payment_status` tinyint(1) DEFAULT '0',
  `approval_status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`enroll_id`),
  KEY `fk_enrollments_user` (`user_id`),
  KEY `fk_enrollments_class` (`class_id`),
  KEY `fk_enrollments_approver` (`approved_by`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `enrollments`
--

INSERT INTO `enrollments` (`enroll_id`, `user_id`, `class_id`, `enrolled_at`, `approved_at`, `approved_by`, `payment_status`, `approval_status`) VALUES
(1, 1, 1, '2026-06-11 08:00:00', '2026-06-11 10:00:00', 2, 1, 'approved'),
(2, 1, 2, '2026-06-12 08:00:00', '2026-06-12 10:00:00', 2, 1, 'enrolled'),
(3, 1, 3, '2026-06-13 08:00:00', '2026-06-13 10:00:00', 2, 1, 'approved'),
(4, 1, 5, '2026-06-15 08:00:00', '2026-06-15 10:00:00', 2, 1, 'approved'),
(5, 1, 7, '2026-06-17 08:00:00', '2026-06-17 10:00:00', 2, 1, 'approved'),
(6, 1, 8, '2026-06-18 08:00:00', '2026-06-18 10:00:00', 2, 1, 'enrolled'),
(7, 1, 15, '2026-06-25 08:00:00', '2026-06-25 10:00:00', 2, 1, 'completed'),
(8, 1, 24, '2026-07-04 08:00:00', '2026-07-04 10:00:00', 2, 1, 'enrolled'),
(16, 9, 1, '2026-06-15 08:30:00', '2026-06-15 10:15:00', 2, 1, 'approved'),
(17, 9, 2, '2026-06-16 08:30:00', '2026-06-16 10:15:00', 2, 1, 'approved'),
(18, 9, 3, '2026-06-17 08:30:00', '2026-06-17 10:15:00', 2, 0, 'enrolled'),
(19, 10, 4, '2026-06-19 08:30:00', '2026-06-19 10:15:00', 2, 1, 'approved'),
(20, 10, 5, '2026-06-20 08:30:00', '2026-06-20 10:15:00', 2, 1, 'enrolled'),
(21, 10, 6, '2026-06-21 08:30:00', '2026-06-21 10:15:00', 2, 0, 'approved'),
(22, 11, 7, '2026-06-23 08:30:00', '2026-06-23 10:15:00', 2, 1, 'enrolled'),
(23, 11, 8, '2026-06-24 08:30:00', '2026-06-24 10:15:00', 2, 1, 'approved'),
(24, 11, 9, '2026-06-25 08:30:00', NULL, NULL, 0, 'pending'),
(25, 12, 10, '2026-06-27 08:30:00', NULL, NULL, 0, 'pending'),
(26, 12, 11, '2026-06-28 08:30:00', NULL, NULL, 0, 'pending'),
(27, 12, 12, '2026-06-29 08:30:00', NULL, NULL, 0, 'pending'),
(28, 13, 13, '2026-07-01 08:30:00', NULL, NULL, 0, 'pending'),
(29, 13, 14, '2026-07-02 08:30:00', NULL, NULL, 0, 'pending'),
(30, 13, 15, '2026-07-03 08:30:00', '2026-07-03 10:15:00', 2, 0, 'completed'),
(31, 14, 16, '2026-07-05 08:30:00', '2026-07-05 10:15:00', 2, 1, 'completed'),
(32, 14, 17, '2026-07-06 08:30:00', '2026-07-06 10:15:00', 2, 1, 'completed'),
(33, 14, 18, '2026-07-07 08:30:00', '2026-07-07 10:15:00', 2, 0, 'completed'),
(34, 15, 19, '2026-07-09 08:30:00', '2026-07-09 10:15:00', 2, 1, 'completed'),
(35, 15, 20, '2026-07-10 08:30:00', '2026-07-10 10:15:00', 2, 1, 'completed'),
(36, 15, 21, '2026-07-11 08:30:00', '2026-07-11 10:15:00', 2, 0, 'enrolled'),
(37, 16, 22, '2026-07-13 08:30:00', '2026-07-13 10:15:00', 2, 1, 'approved'),
(38, 16, 23, '2026-07-14 08:30:00', NULL, NULL, 0, 'pending'),
(39, 16, 24, '2026-07-15 08:30:00', '2026-07-15 10:15:00', 2, 0, 'approved');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `mock_tests`
--

DROP TABLE IF EXISTS `mock_tests`;
CREATE TABLE IF NOT EXISTS `mock_tests` (
  `test_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `test_type` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `exam_type` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `exam_part` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `skill_type` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `duration_minutes` int DEFAULT NULL,
  `total_score` decimal(5,2) DEFAULT '100.00',
  `attempts_allowed` int DEFAULT '1',
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`test_id`),
  KEY `idx_tests_exam_type` (`exam_type`),
  KEY `idx_tests_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `mock_tests`
--

INSERT INTO `mock_tests` (`test_id`, `title`, `description`, `test_type`, `exam_type`, `exam_part`, `skill_type`, `duration_minutes`, `total_score`, `attempts_allowed`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
(1, 'IELTS Full Test 01', 'Bài thi thử tổng hợp cho lớp IELTS_FDN_01.', 'full_mock_test', 'IELTS', 'Full Test', 'full_test', 165, 9.00, 1, '2026-07-13 08:00:00', '2026-09-02 23:00:00', 'active', '2026-07-10 08:00:00', '2026-07-10 08:00:00'),
(2, 'IELTS Full Test 02', 'Bài thi thử tổng hợp cho lớp IELTS_PRE_01.', 'full_mock_test', 'IELTS', 'Full Test', 'full_test', 165, 9.00, 1, '2026-07-14 08:00:00', '2026-09-05 23:00:00', 'active', '2026-07-11 08:00:00', '2026-07-11 08:00:00'),
(3, 'IELTS Full Test 03', 'Bài thi thử tổng hợp cho lớp IELTS_READ_01.', 'full_mock_test', 'IELTS', 'Full Test', 'full_test', 165, 9.00, 1, '2026-07-15 08:00:00', '2026-08-27 23:00:00', 'active', '2026-07-12 08:00:00', '2026-07-12 08:00:00'),
(4, 'IELTS Full Test 04', 'Bài thi thử tổng hợp cho lớp IELTS_LISTEN_01.', 'full_mock_test', 'IELTS', 'Full Test', 'full_test', 165, 9.00, 2, '2026-07-17 08:00:00', '2026-08-29 23:00:00', 'active', '2026-07-14 08:00:00', '2026-07-14 08:00:00'),
(5, 'IELTS Full Test 05', 'Bài thi thử tổng hợp cho lớp IELTS_WRITE_01.', 'full_mock_test', 'IELTS', 'Full Test', 'full_test', 165, 9.00, 1, '2026-07-19 08:00:00', '2026-09-07 23:00:00', 'active', '2026-07-16 08:00:00', '2026-07-16 08:00:00'),
(6, 'IELTS Full Test 06', 'Bài thi thử tổng hợp cho lớp IELTS_SPEAK_01.', 'full_mock_test', 'IELTS', 'Full Test', 'full_test', 165, 9.00, 1, '2026-07-21 08:00:00', '2026-09-09 23:00:00', 'active', '2026-07-18 08:00:00', '2026-07-18 08:00:00'),
(7, 'IELTS Full Test 07', 'Bài thi thử tổng hợp cho lớp IELTS_MOCK_01.', 'full_mock_test', 'IELTS', 'Full Test', 'full_test', 165, 9.00, 1, '2026-07-23 08:00:00', '2026-09-12 23:00:00', 'active', '2026-07-20 08:00:00', '2026-07-20 08:00:00'),
(8, 'IELTS Full Test 08', 'Bài thi thử tổng hợp cho lớp IELTS_65_01.', 'full_mock_test', 'IELTS', 'Full Test', 'full_test', 165, 9.00, 2, '2026-07-25 08:00:00', '2026-09-17 23:00:00', 'active', '2026-07-22 08:00:00', '2026-07-22 08:00:00'),
(9, 'TOEIC Full Test 09', 'Bài thi thử tổng hợp cho lớp TOEIC_450_01.', 'full_mock_test', 'TOEIC', 'Full Test', 'full_test', 120, 990.00, 1, '2026-09-06 08:00:00', '2026-10-17 23:00:00', 'draft', '2026-09-03 08:00:00', '2026-09-03 08:00:00'),
(10, 'TOEIC Full Test 10', 'Bài thi thử tổng hợp cho lớp TOEIC_600_01.', 'full_mock_test', 'TOEIC', 'Full Test', 'full_test', 120, 990.00, 1, '2026-09-08 08:00:00', '2026-10-22 23:00:00', 'draft', '2026-09-05 08:00:00', '2026-09-05 08:00:00'),
(11, 'TOEIC Full Test 11', 'Bài thi thử tổng hợp cho lớp TOEIC_GR_01.', 'full_mock_test', 'TOEIC', 'Full Test', 'full_test', 120, 990.00, 1, '2026-09-10 08:00:00', '2026-10-25 23:00:00', 'draft', '2026-09-07 08:00:00', '2026-09-07 08:00:00'),
(12, 'TOEIC Full Test 12', 'Bài thi thử tổng hợp cho lớp TOEIC_LIS_01.', 'full_mock_test', 'TOEIC', 'Full Test', 'full_test', 120, 990.00, 2, '2026-09-12 08:00:00', '2026-10-27 23:00:00', 'draft', '2026-09-09 08:00:00', '2026-09-09 08:00:00'),
(13, 'TOEIC Full Test 13', 'Bài thi thử tổng hợp cho lớp TOEIC_READ_01.', 'full_mock_test', 'TOEIC', 'Full Test', 'full_test', 120, 990.00, 1, '2026-09-14 08:00:00', '2026-10-30 23:00:00', 'draft', '2026-09-11 08:00:00', '2026-09-11 08:00:00'),
(14, 'TOEIC Full Test 14', 'Bài thi thử tổng hợp cho lớp TOEIC_750_01.', 'full_mock_test', 'TOEIC', 'Full Test', 'full_test', 120, 990.00, 1, '2026-09-16 08:00:00', '2026-11-02 23:00:00', 'draft', '2026-09-13 08:00:00', '2026-09-13 08:00:00'),
(15, 'TOEIC Full Test 15', 'Bài thi thử tổng hợp cho lớp TOEIC_MOCK_00.', 'full_mock_test', 'TOEIC', 'Full Test', 'full_test', 120, 990.00, 1, '2026-04-10 08:00:00', '2026-05-29 23:00:00', 'closed', '2026-04-07 08:00:00', '2026-04-07 08:00:00'),
(16, 'TOEIC Full Test 16', 'Bài thi thử tổng hợp cho lớp TOEIC_900_00.', 'full_mock_test', 'TOEIC', 'Full Test', 'full_test', 120, 990.00, 2, '2026-04-15 08:00:00', '2026-06-07 23:00:00', 'closed', '2026-04-12 08:00:00', '2026-04-12 08:00:00'),
(17, 'OTHER Full Test 17', 'Bài thi thử tổng hợp cho lớp ENG_COM_BASIC_00.', 'practice_test', 'OTHER', 'Full Test', 'skill_practice', 60, 100.00, 1, '2026-04-17 08:00:00', '2026-06-09 23:00:00', 'closed', '2026-04-14 08:00:00', '2026-04-14 08:00:00'),
(18, 'OTHER Full Test 18', 'Bài thi thử tổng hợp cho lớp ENG_COM_INT_00.', 'practice_test', 'OTHER', 'Full Test', 'skill_practice', 60, 100.00, 1, '2026-04-20 08:00:00', '2026-06-12 23:00:00', 'closed', '2026-04-17 08:00:00', '2026-04-17 08:00:00'),
(19, 'OTHER Full Test 19', 'Bài thi thử tổng hợp cho lớp BIZ_WRITE_00.', 'practice_test', 'OTHER', 'Full Test', 'skill_practice', 60, 100.00, 1, '2026-04-23 08:00:00', '2026-06-17 23:00:00', 'closed', '2026-04-20 08:00:00', '2026-04-20 08:00:00'),
(20, 'OTHER Full Test 20', 'Bài thi thử tổng hợp cho lớp PRONUN_00.', 'practice_test', 'OTHER', 'Full Test', 'skill_practice', 60, 100.00, 2, '2026-04-25 08:00:00', '2026-06-15 23:00:00', 'closed', '2026-04-22 08:00:00', '2026-04-22 08:00:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `mock_test_submissions`
--

DROP TABLE IF EXISTS `mock_test_submissions`;
CREATE TABLE IF NOT EXISTS `mock_test_submissions` (
  `test_submission_id` int NOT NULL AUTO_INCREMENT,
  `mock_test_id` int NOT NULL,
  `user_id` int NOT NULL,
  `answers_json` longtext COLLATE utf8mb4_general_ci,
  `started_at` datetime DEFAULT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL,
  `total_score` decimal(5,2) DEFAULT '0.00',
  `correct_answers` int DEFAULT '0',
  `total_questions` int DEFAULT '0',
  `attempt_number` int DEFAULT '1',
  `status` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`test_submission_id`),
  KEY `fk_test_submissions_user` (`user_id`),
  KEY `fk_mock_test_submissions_test` (`mock_test_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `mock_test_submissions`
--

INSERT INTO `mock_test_submissions` (`test_submission_id`, `mock_test_id`, `user_id`, `answers_json`, `started_at`, `submitted_at`, `duration_seconds`, `total_score`, `correct_answers`, `total_questions`, `attempt_number`, `status`, `created_at`) VALUES
(1, 1, 1, NULL, '2026-07-13 08:00:00', '2026-07-13 09:15:00', 3645, 7.00, 1, 1, 1, 'submitted', '2026-07-13 09:15:00'),
(2, 2, 1, NULL, '2026-07-14 08:00:00', '2026-07-14 09:15:00', 3690, 7.50, 1, 1, 1, 'graded', '2026-07-14 09:15:00'),
(3, 3, 1, NULL, '2026-07-15 08:00:00', '2026-07-15 09:15:00', 3735, 6.50, 1, 1, 1, 'submitted', '2026-07-15 09:15:00'),
(4, 5, 1, NULL, '2026-07-17 08:00:00', '2026-07-17 09:15:00', 3825, 7.50, 1, 1, 1, 'submitted', '2026-07-17 09:15:00'),
(5, 8, 1, NULL, '2026-07-20 08:00:00', '2026-07-20 09:15:00', 3960, 7.50, 1, 1, 1, 'graded', '2026-07-20 09:15:00'),
(6, 10, 1, NULL, '2026-07-22 08:00:00', '2026-07-22 09:15:00', 4050, 650.00, 1, 1, 1, 'graded', '2026-07-22 09:15:00'),
(8, 1, 9, NULL, '2026-07-24 08:10:00', '2026-07-24 09:25:00', 3420, 7.00, 1, 1, 1, 'submitted', '2026-07-24 09:25:00'),
(9, 3, 9, NULL, '2026-07-26 08:10:00', '2026-07-26 09:25:00', 3480, 6.00, 1, 1, 1, 'graded', '2026-07-26 09:25:00'),
(10, 4, 10, NULL, '2026-07-28 08:10:00', '2026-07-28 09:25:00', 3520, 7.00, 1, 1, 1, 'submitted', '2026-07-28 09:25:00'),
(11, 6, 10, NULL, '2026-07-30 08:10:00', '2026-07-30 09:25:00', 3580, 6.00, 1, 1, 1, 'submitted', '2026-07-30 09:25:00'),
(12, 7, 11, NULL, '2026-08-01 08:10:00', '2026-08-01 09:25:00', 3620, 7.00, 1, 1, 1, 'graded', '2026-08-01 09:25:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `content` text COLLATE utf8mb4_general_ci NOT NULL,
  `notification_type` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `fk_notifications_sender` (`sender_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notification_receivers`
--

DROP TABLE IF EXISTS `notification_receivers`;
CREATE TABLE IF NOT EXISTS `notification_receivers` (
  `receiver_id` int NOT NULL AUTO_INCREMENT,
  `notification_id` int NOT NULL,
  `user_id` int NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `read_at` datetime DEFAULT NULL,
  PRIMARY KEY (`receiver_id`),
  UNIQUE KEY `notification_id` (`notification_id`,`user_id`),
  KEY `fk_notification_receivers_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `passages`
--

DROP TABLE IF EXISTS `passages`;
CREATE TABLE IF NOT EXISTS `passages` (
  `passage_id` int NOT NULL AUTO_INCREMENT,
  `quiz_id` int DEFAULT NULL,
  `assign_id` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `content` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `payment_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `order_num` int DEFAULT '1',
  `mock_test_id` int DEFAULT NULL,
  PRIMARY KEY (`passage_id`),
  KEY `fk_passages_assignment` (`assign_id`),
  KEY `fk_passages_quiz` (`quiz_id`),
  KEY `fk_passages_mock_test` (`mock_test_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payments`
--

DROP TABLE IF EXISTS `payments`;
CREATE TABLE IF NOT EXISTS `payments` (
  `pay_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `course_id` int DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `maid_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`pay_id`),
  KEY `fk_payments_user` (`user_id`),
  KEY `fk_payments_course` (`course_id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `payments`
--

INSERT INTO `payments` (`pay_id`, `user_id`, `course_id`, `amount`, `payment_method`, `maid_at`, `status`) VALUES
(1, 1, 1, 2800000.00, 'banking', '2026-06-21 09:15:00', 'paid'),
(2, 1, 5, 3500000.00, 'cash', '2026-06-25 09:15:00', 'paid'),
(3, 1, 10, 2600000.00, 'banking', '2026-06-30 09:15:00', 'paid'),
(4, 1, 17, 1800000.00, 'cash', '2026-07-07 09:15:00', 'paid'),
(8, 9, 1, 2800000.00, 'banking', '2026-07-05 09:20:00', 'failed'),
(9, 9, 2, 3000000.00, 'cash', '2026-07-06 09:20:00', 'paid'),
(10, 9, 3, 3200000.00, 'momo', '2026-07-07 09:20:00', 'paid'),
(11, 10, 4, 3200000.00, 'cash', '2026-07-09 09:20:00', 'paid'),
(12, 10, 5, 3500000.00, 'momo', '2026-07-10 09:20:00', 'failed'),
(13, 10, 6, 3300000.00, 'banking', '2026-07-11 09:20:00', 'paid'),
(14, 11, 7, 3600000.00, 'momo', '2026-07-13 09:20:00', 'paid'),
(15, 11, 8, 3900000.00, 'banking', '2026-07-14 09:20:00', 'paid'),
(16, 11, 9, 2200000.00, 'cash', '2026-07-15 09:20:00', 'pending'),
(17, 12, 10, 2600000.00, 'banking', '2026-07-17 09:20:00', 'pending'),
(18, 12, 11, 2700000.00, 'cash', '2026-07-18 09:20:00', 'pending'),
(19, 12, 12, 2900000.00, 'momo', '2026-07-19 09:20:00', 'pending'),
(20, 13, 13, 3000000.00, 'cash', '2026-07-21 09:20:00', 'pending'),
(21, 13, 14, 3300000.00, 'momo', '2026-07-22 09:20:00', 'pending'),
(22, 13, 15, 3400000.00, 'banking', '2026-07-23 09:20:00', 'paid'),
(23, 14, 16, 3800000.00, 'momo', '2026-07-25 09:20:00', 'paid'),
(24, 14, 17, 1800000.00, 'banking', '2026-07-26 09:20:00', 'paid'),
(25, 14, 18, 2100000.00, 'cash', '2026-07-27 09:20:00', 'paid'),
(26, 15, 1, 2800000.00, 'banking', '2026-07-11 09:20:00', 'paid'),
(27, 15, 19, 2600000.00, 'banking', '2026-07-29 09:20:00', 'paid'),
(28, 15, 20, 1900000.00, 'cash', '2026-07-30 09:20:00', 'paid'),
(29, 16, 5, 3500000.00, 'momo', '2026-07-16 09:20:00', 'pending'),
(30, 16, 10, 2600000.00, 'cash', '2026-07-21 09:20:00', 'paid'),
(31, 16, 17, 1800000.00, 'momo', '2026-07-28 09:20:00', 'paid');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `questions`
--

DROP TABLE IF EXISTS `questions`;
CREATE TABLE IF NOT EXISTS `questions` (
  `question_id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `question_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'mcq',
  `question_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `audio_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `order_num` int DEFAULT '1',
  `option_a` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `option_b` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `option_c` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `option_d` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `correct_answer` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `explanation` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`question_id`),
  KEY `fk_questions_group` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `question_groups`
--

DROP TABLE IF EXISTS `question_groups`;
CREATE TABLE IF NOT EXISTS `question_groups` (
  `group_id` int NOT NULL AUTO_INCREMENT,
  `quiz_id` int DEFAULT NULL,
  `assign_id` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `passage_text` longtext COLLATE utf8mb4_general_ci,
  `image_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `audio_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `instructions` text COLLATE utf8mb4_general_ci,
  `order_num` int DEFAULT '1',
  `mock_test_id` int DEFAULT NULL,
  PRIMARY KEY (`group_id`),
  KEY `QuizID` (`quiz_id`),
  KEY `fk_question_groups_assignment` (`assign_id`),
  KEY `fk_question_groups_mock_test` (`mock_test_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Bẫy `question_groups`
--
DROP TRIGGER IF EXISTS `trg_question_groups_single_owner_insert`;
DELIMITER $$
CREATE TRIGGER `trg_question_groups_single_owner_insert` BEFORE INSERT ON `question_groups` FOR EACH ROW BEGIN
  IF (
    (CASE WHEN NEW.`assign_id` IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN NEW.`quiz_id` IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN NEW.`mock_test_id` IS NOT NULL THEN 1 ELSE 0 END)
  ) <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'question_groups phai thuoc dung 1 owner: assignment, quiz hoac mock_test';
  END IF;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_question_groups_single_owner_update`;
DELIMITER $$
CREATE TRIGGER `trg_question_groups_single_owner_update` BEFORE UPDATE ON `question_groups` FOR EACH ROW BEGIN
  IF (
    (CASE WHEN NEW.`assign_id` IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN NEW.`quiz_id` IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN NEW.`mock_test_id` IS NOT NULL THEN 1 ELSE 0 END)
  ) <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'question_groups phai thuoc dung 1 owner: assignment, quiz hoac mock_test';
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `quizzes`
--

DROP TABLE IF EXISTS `quizzes`;
CREATE TABLE IF NOT EXISTS `quizzes` (
  `quiz_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `quiz_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `exam_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `exam_part` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `passage_text` longtext COLLATE utf8mb4_general_ci,
  `audio_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `instructions` text COLLATE utf8mb4_general_ci,
  `time_limit` int DEFAULT NULL,
  PRIMARY KEY (`quiz_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `quiz_classes`
--

DROP TABLE IF EXISTS `quiz_classes`;
CREATE TABLE IF NOT EXISTS `quiz_classes` (
  `quiz_class_id` int NOT NULL AUTO_INCREMENT,
  `quiz_id` int NOT NULL,
  `class_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`quiz_class_id`),
  UNIQUE KEY `uq_quiz_classes_quiz_class` (`quiz_id`,`class_id`),
  KEY `idx_quiz_classes_class` (`class_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `quiz_classes`
--

INSERT INTO `quiz_classes` (`quiz_class_id`, `quiz_id`, `class_id`, `created_at`) VALUES
(1, 1, 1, '2026-07-07 21:06:15'),
(2, 2, 2, '2026-07-07 21:06:15'),
(3, 3, 3, '2026-07-07 21:06:15'),
(4, 4, 4, '2026-07-07 21:06:15'),
(5, 5, 5, '2026-07-07 21:06:15'),
(6, 6, 6, '2026-07-07 21:06:15'),
(7, 7, 7, '2026-07-07 21:06:15'),
(8, 8, 8, '2026-07-07 21:06:15'),
(9, 9, 9, '2026-07-07 21:06:15'),
(10, 10, 10, '2026-07-07 21:06:15'),
(11, 11, 11, '2026-07-07 21:06:15'),
(12, 12, 12, '2026-07-07 21:06:15'),
(13, 13, 13, '2026-07-07 21:06:15'),
(14, 14, 14, '2026-07-07 21:06:15'),
(15, 15, 15, '2026-07-07 21:06:15'),
(16, 16, 16, '2026-07-07 21:06:15'),
(17, 17, 17, '2026-07-07 21:06:15'),
(18, 18, 18, '2026-07-07 21:06:15'),
(19, 19, 19, '2026-07-07 21:06:15'),
(20, 20, 20, '2026-07-07 21:06:15');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `quiz_submissions`
--

DROP TABLE IF EXISTS `quiz_submissions`;
CREATE TABLE IF NOT EXISTS `quiz_submissions` (
  `quiz_submission_id` int NOT NULL AUTO_INCREMENT,
  `quiz_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `answers_json` longtext COLLATE utf8mb4_general_ci,
  `score` float DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `submitted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`quiz_submission_id`),
  KEY `fk_quiz_submissions_user` (`user_id`),
  KEY `fk_quiz_submissions_quiz` (`quiz_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(1, 'Admin'),
(2, 'Giáo viên'),
(3, 'Học viên');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `schedules`
--

DROP TABLE IF EXISTS `schedules`;
CREATE TABLE IF NOT EXISTS `schedules` (
  `schedule_id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `study_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`schedule_id`),
  KEY `fk_schedules_class` (`class_id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `schedules`
--

INSERT INTO `schedules` (`schedule_id`, `class_id`, `title`, `description`, `study_date`, `start_time`, `end_time`, `location`) VALUES
(1, 12, 'Buổi 1 - Luyện TOEIC', 'Nội dung buổi 1 cho lớp TOEIC_LIS_01.', '2026-09-07', '18:00:00', '20:00:00', 'Phòng D12 - NewSkyEnglish'),
(2, 11, 'Buổi 1 - Luyện TOEIC', 'Nội dung buổi 1 cho lớp TOEIC_GR_01.', '2026-09-05', '08:00:00', '10:00:00', 'Phòng C11 - NewSkyEnglish'),
(3, 10, 'Buổi 1 - Luyện TOEIC', 'Nội dung buổi 1 cho lớp TOEIC_600_01.', '2026-09-03', '18:00:00', '20:00:00', 'Phòng B10 - NewSkyEnglish'),
(4, 9, 'Buổi 1 - Luyện TOEIC', 'Nội dung buổi 1 cho lớp TOEIC_450_01.', '2026-09-01', '08:00:00', '10:00:00', 'Phòng A9 - NewSkyEnglish'),
(5, 8, 'Buổi 1 - Kỹ năng IELTS', 'Nội dung buổi 1 cho lớp IELTS_65_01.', '2026-07-20', '18:00:00', '20:00:00', 'Phòng D8 - NewSkyEnglish'),
(6, 7, 'Buổi 1 - Kỹ năng IELTS', 'Nội dung buổi 1 cho lớp IELTS_MOCK_01.', '2026-07-18', '08:00:00', '10:00:00', 'Phòng C7 - NewSkyEnglish'),
(7, 6, 'Buổi 1 - Kỹ năng IELTS', 'Nội dung buổi 1 cho lớp IELTS_SPEAK_01.', '2026-07-16', '18:00:00', '20:00:00', 'Phòng B6 - NewSkyEnglish'),
(8, 5, 'Buổi 1 - Kỹ năng IELTS', 'Nội dung buổi 1 cho lớp IELTS_WRITE_01.', '2026-07-14', '08:00:00', '10:00:00', 'Phòng A5 - NewSkyEnglish'),
(9, 4, 'Buổi 1 - Kỹ năng IELTS', 'Nội dung buổi 1 cho lớp IELTS_LISTEN_01.', '2026-07-12', '18:00:00', '20:00:00', 'Phòng D4 - NewSkyEnglish'),
(10, 3, 'Buổi 1 - Kỹ năng IELTS', 'Nội dung buổi 1 cho lớp IELTS_READ_01.', '2026-07-10', '08:00:00', '10:00:00', 'Phòng C3 - NewSkyEnglish'),
(11, 2, 'Buổi 1 - Kỹ năng IELTS', 'Nội dung buổi 1 cho lớp IELTS_PRE_01.', '2026-07-09', '18:00:00', '20:00:00', 'Phòng B2 - NewSkyEnglish'),
(12, 1, 'Buổi 1 - Kỹ năng IELTS', 'Nội dung buổi 1 cho lớp IELTS_FDN_01.', '2026-07-08', '08:00:00', '10:00:00', 'Phòng A1 - NewSkyEnglish'),
(13, 12, 'Buổi 2 - Luyện TOEIC', 'Nội dung buổi 2 cho lớp TOEIC_LIS_01.', '2026-09-10', '18:00:00', '20:00:00', 'Phòng D12 - NewSkyEnglish'),
(14, 11, 'Buổi 2 - Luyện TOEIC', 'Nội dung buổi 2 cho lớp TOEIC_GR_01.', '2026-09-08', '08:00:00', '10:00:00', 'Phòng C11 - NewSkyEnglish'),
(15, 10, 'Buổi 2 - Luyện TOEIC', 'Nội dung buổi 2 cho lớp TOEIC_600_01.', '2026-09-06', '18:00:00', '20:00:00', 'Phòng B10 - NewSkyEnglish'),
(16, 9, 'Buổi 2 - Luyện TOEIC', 'Nội dung buổi 2 cho lớp TOEIC_450_01.', '2026-09-04', '08:00:00', '10:00:00', 'Phòng A9 - NewSkyEnglish'),
(17, 8, 'Buổi 2 - Kỹ năng IELTS', 'Nội dung buổi 2 cho lớp IELTS_65_01.', '2026-07-23', '18:00:00', '20:00:00', 'Phòng D8 - NewSkyEnglish'),
(18, 7, 'Buổi 2 - Kỹ năng IELTS', 'Nội dung buổi 2 cho lớp IELTS_MOCK_01.', '2026-07-21', '08:00:00', '10:00:00', 'Phòng C7 - NewSkyEnglish'),
(19, 6, 'Buổi 2 - Kỹ năng IELTS', 'Nội dung buổi 2 cho lớp IELTS_SPEAK_01.', '2026-07-19', '18:00:00', '20:00:00', 'Phòng B6 - NewSkyEnglish'),
(20, 5, 'Buổi 2 - Kỹ năng IELTS', 'Nội dung buổi 2 cho lớp IELTS_WRITE_01.', '2026-07-17', '08:00:00', '10:00:00', 'Phòng A5 - NewSkyEnglish'),
(21, 4, 'Buổi 2 - Kỹ năng IELTS', 'Nội dung buổi 2 cho lớp IELTS_LISTEN_01.', '2026-07-15', '18:00:00', '20:00:00', 'Phòng D4 - NewSkyEnglish'),
(22, 3, 'Buổi 2 - Kỹ năng IELTS', 'Nội dung buổi 2 cho lớp IELTS_READ_01.', '2026-07-13', '08:00:00', '10:00:00', 'Phòng C3 - NewSkyEnglish'),
(23, 2, 'Buổi 2 - Kỹ năng IELTS', 'Nội dung buổi 2 cho lớp IELTS_PRE_01.', '2026-07-12', '18:00:00', '20:00:00', 'Phòng B2 - NewSkyEnglish'),
(24, 1, 'Buổi 2 - Kỹ năng IELTS', 'Nội dung buổi 2 cho lớp IELTS_FDN_01.', '2026-07-11', '08:00:00', '10:00:00', 'Phòng A1 - NewSkyEnglish'),
(32, 13, 'Buổi 1 - Tổng quan khóa học', 'Buổi mở đầu cho lớp TOEIC_READ_01.', '2026-09-09', '08:30:00', '10:30:00', 'Phòng A13 - NewSkyEnglish'),
(33, 14, 'Buổi 1 - Tổng quan khóa học', 'Buổi mở đầu cho lớp TOEIC_750_01.', '2026-09-11', '18:30:00', '20:30:00', 'Phòng B14 - NewSkyEnglish'),
(34, 15, 'Buổi 1 - Tổng quan khóa học', 'Buổi mở đầu cho lớp TOEIC_MOCK_00.', '2026-04-05', '08:30:00', '10:30:00', 'Phòng C15 - NewSkyEnglish'),
(35, 16, 'Buổi 1 - Tổng quan khóa học', 'Buổi mở đầu cho lớp TOEIC_900_00.', '2026-04-10', '18:30:00', '20:30:00', 'Phòng D16 - NewSkyEnglish'),
(36, 17, 'Buổi 1 - Tổng quan khóa học', 'Buổi mở đầu cho lớp ENG_COM_BASIC_00.', '2026-04-12', '08:30:00', '10:30:00', 'Phòng A17 - NewSkyEnglish'),
(37, 18, 'Buổi 1 - Tổng quan khóa học', 'Buổi mở đầu cho lớp ENG_COM_INT_00.', '2026-04-15', '18:30:00', '20:30:00', 'Phòng B18 - NewSkyEnglish'),
(38, 19, 'Buổi 1 - Tổng quan khóa học', 'Buổi mở đầu cho lớp BIZ_WRITE_00.', '2026-04-18', '08:30:00', '10:30:00', 'Phòng C19 - NewSkyEnglish'),
(39, 20, 'Buổi 1 - Tổng quan khóa học', 'Buổi mở đầu cho lớp PRONUN_00.', '2026-04-20', '18:30:00', '20:30:00', 'Phòng D20 - NewSkyEnglish'),
(40, 21, 'Buổi 1 - Tổng quan khóa học', 'Buổi mở đầu cho lớp IELTS_FDN_02.', '2026-07-22', '08:30:00', '10:30:00', 'Phòng A21 - NewSkyEnglish'),
(41, 22, 'Buổi 1 - Tổng quan khóa học', 'Buổi mở đầu cho lớp TOEIC_600_02.', '2026-07-24', '18:30:00', '20:30:00', 'Phòng B22 - NewSkyEnglish'),
(42, 23, 'Buổi 1 - Tổng quan khóa học', 'Buổi mở đầu cho lớp IELTS_WRITE_02.', '2026-09-15', '08:30:00', '10:30:00', 'Phòng C23 - NewSkyEnglish'),
(43, 24, 'Buổi 1 - Tổng quan khóa học', 'Buổi mở đầu cho lớp ENG_COM_BASIC_01.', '2026-07-26', '18:30:00', '20:30:00', 'Phòng D24 - NewSkyEnglish');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `test_classes`
--

DROP TABLE IF EXISTS `test_classes`;
CREATE TABLE IF NOT EXISTS `test_classes` (
  `test_class_id` int NOT NULL AUTO_INCREMENT,
  `mock_test_id` int NOT NULL,
  `class_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`test_class_id`),
  UNIQUE KEY `uq_test_classes_test_class` (`mock_test_id`,`class_id`),
  KEY `idx_test_classes_class` (`class_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `test_classes`
--

INSERT INTO `test_classes` (`test_class_id`, `mock_test_id`, `class_id`, `created_at`) VALUES
(1, 1, 1, '2026-07-07 21:06:15'),
(2, 2, 2, '2026-07-07 21:06:15'),
(3, 3, 3, '2026-07-07 21:06:15'),
(4, 4, 4, '2026-07-07 21:06:15'),
(5, 5, 5, '2026-07-07 21:06:15'),
(6, 6, 6, '2026-07-07 21:06:15'),
(7, 7, 7, '2026-07-07 21:06:15'),
(8, 8, 8, '2026-07-07 21:06:15'),
(9, 9, 9, '2026-07-07 21:06:15'),
(10, 10, 10, '2026-07-07 21:06:15'),
(11, 11, 11, '2026-07-07 21:06:15'),
(12, 12, 12, '2026-07-07 21:06:15'),
(13, 13, 13, '2026-07-07 21:06:15'),
(14, 14, 14, '2026-07-07 21:06:15'),
(15, 15, 15, '2026-07-07 21:06:15'),
(16, 16, 16, '2026-07-07 21:06:15'),
(17, 17, 17, '2026-07-07 21:06:15'),
(18, 18, 18, '2026-07-07 21:06:15'),
(19, 19, 19, '2026-07-07 21:06:15'),
(20, 20, 20, '2026-07-07 21:06:15');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `role_id` int DEFAULT NULL,
  `avata_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_approved` tinyint(1) DEFAULT '1',
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `experience` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `education` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `Email` (`email`),
  KEY `fk_users_roles` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=153 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`user_id`, `full_name`, `email`, `password`, `phone`, `address`, `role_id`, `avata_url`, `created_at`, `updated_at`, `is_approved`, `status`, `experience`, `education`) VALUES
(1, 'Lâm Huỳnh Ngọc Khánh', 'abc@gmail.com', '$2y$10$8ErG5FIU9k.QF7SfrW.MiOxmybCts.XV/fS3266jyFz7DmRW9StU6', NULL, NULL, 3, 'uploads/avatars/avatar_8_1762242848.jpg', '2025-11-04 14:53:27', '2026-03-22 20:08:28', 1, 'active', NULL, NULL),
(2, 'Trần Bảo Long', 'admin@gmail.com', '$2y$10$2jGDQuXiI2XRk3.8WrFJau3AbXwnBdn2K5AwUGrZxATDcm6pFfUbS', NULL, NULL, 1, NULL, '2025-11-04 14:01:59', '2026-03-22 20:08:57', 1, 'active', NULL, NULL),
(3, 'Văn Khắc Hải Toàn', 'abc1@gmail.com', '$2y$10$zeF8gflEbmei5EiOW.I0duVCVyOUJV2hDWEho0KJprfsobw5/Hpqy', NULL, NULL, 2, NULL, '2025-11-04 14:12:55', '2026-03-28 21:24:44', 1, 'active', NULL, NULL),
(9, 'Nguyễn Minh Tân', 'minhtan1@gmail.com', '$2y$10$abc123456789abcdefghijklmno1234567890pqrs', NULL, NULL, 3, NULL, '2025-11-20 22:50:09', '2025-11-20 22:50:09', 1, 'active', NULL, NULL),
(10, 'Trần Hữu Khang', 'khangt2@gmail.com', '$2y$10$abc123456789abcdefghijklmno1234567890pqrs', NULL, NULL, 3, NULL, '2025-11-20 22:50:09', '2025-11-20 22:50:09', 1, 'active', NULL, NULL),
(11, 'Phạm Thị Mỹ Hạnh', 'myhanh3@gmail.com', '$2y$10$abc123456789abcdefghijklmno1234567890pqrs', NULL, NULL, 3, NULL, '2025-11-20 22:50:09', '2025-11-20 22:50:09', 1, 'active', NULL, NULL),
(12, 'Lê Nhật Nam', 'nhatnam4@gmail.com', '$2y$10$abc123456789abcdefghijklmno1234567890pqrs', NULL, NULL, 3, NULL, '2025-11-20 22:50:09', '2025-11-20 22:50:09', 1, 'active', NULL, NULL),
(13, 'Võ Phúc Thịnh', 'phucthinh5@gmail.com', '$2y$10$abc123456789abcdefghijklmno1234567890pqrs', NULL, NULL, 3, NULL, '2025-11-20 22:50:09', '2025-11-20 22:50:09', 1, 'active', NULL, NULL),
(14, 'Đặng Gia Huy', 'giahuy6@gmail.com', '$2y$10$abc123456789abcdefghijklmno1234567890pqrs', NULL, NULL, 3, NULL, '2025-11-20 22:50:09', '2025-11-20 22:50:09', 1, 'active', NULL, NULL),
(15, 'Huỳnh Diệu Ly', 'dieuly7@gmail.com', '$2y$10$abc123456789abcdefghijklmno1234567890pqrs', NULL, NULL, 3, NULL, '2025-11-20 22:50:09', '2025-11-20 22:50:09', 1, 'active', NULL, NULL),
(16, 'Ngô Thảo Nhi', 'thaonhi8@gmail.com', '$2y$10$abc123456789abcdefghijklmno1234567890pqrs', NULL, NULL, 3, NULL, '2025-11-20 22:50:09', '2025-11-20 22:50:09', 1, 'active', NULL, NULL),
(17, 'Đoàn Khánh Toàn', 'khanhtoan9@gmail.com', '$2y$10$abc123456789abcdefghijklmno1234567890pqrs', NULL, NULL, 3, NULL, '2025-11-20 22:50:09', '2025-11-20 22:50:09', 1, 'active', NULL, NULL),
(18, 'Hồ Hữu Đạt', 'huudat10@gmail.com', '$2y$10$abc123456789abcdefghijklmno1234567890pqrs', NULL, NULL, 3, NULL, '2025-11-20 22:50:09', '2025-11-20 22:50:09', 1, 'active', NULL, NULL),
(19, 'Nguyễn Văn Kiệt', 'vankiet11@gmail.com', '$2y$10$abc123456789abcdefghijklmno1234567890pqrs', NULL, NULL, 3, NULL, '2025-11-20 22:50:09', '2025-11-20 22:50:09', 1, 'active', NULL, NULL),
(20, 'Bùi Thị Trúc Mai', 'trucmai12@gmail.com', '$2y$10$abc123456789abcdefghijklmno1234567890pqrs', NULL, NULL, 3, NULL, '2025-11-20 22:50:09', '2025-11-20 22:50:09', 1, 'active', NULL, NULL),
(29, 'Nguyễn Thị Thu Hà', 'eng.teacher1@example.com', '$2y$10$eW9J8D3uQp6BzYtHh1mO2O06pZxN8pCkYq8yE4T2kHcV9FgR7xUuu', NULL, NULL, 2, 'uploads/avatars/eng1.jpg', '2025-11-20 22:52:59', '2025-11-20 22:52:59', 1, 'active', '7', 'Thạc sĩ Ngôn ngữ Anh'),
(30, 'Trần Minh Hằng', 'eng.teacher2@example.com', '$2y$10$Gd4Ue8KpRf0La2TsWb3Xv1FgQn7OyHjSu3MpXl0Ht2Aq9PwJm5T1K', NULL, NULL, 2, 'uploads/avatars/eng2.jpg', '2025-11-20 22:52:59', '2025-11-20 22:52:59', 1, 'active', '6', 'Cử nhân Ngôn ngữ Anh'),
(31, 'Phạm Bảo Long', 'eng.teacher3@example.com', '$2y$10$Qo3Ld9PwTg7Na5JkZu8Qw1NhCx3TyHoBu6RkGf3Am2Ye0QpCx9KLa', NULL, NULL, 2, 'uploads/avatars/eng3.jpg', '2025-11-20 22:52:59', '2025-11-20 22:52:59', 1, 'active', '10', 'Thạc sĩ TESOL'),
(139, 'Lý Thành Lập', 'abcd@gmail.com', '$2y$12$CReDyoeRWL1LtVkaVaBzwOT9CR7wtk8pPttelfcHvVeJRKjHKhHWm', NULL, NULL, 3, NULL, '2025-11-21 23:37:05', '2025-11-21 23:37:05', 1, 'active', NULL, NULL),
(141, 'Hoàng Nhật Trường', 'zayluon@gmail.com', '$2y$12$t3rMzddW81tjOy86UQMWbu5CMDw.HP91XQJcmY7OUN072UXHN57Um', NULL, NULL, 1, NULL, '2025-12-01 00:14:45', '2025-12-01 00:15:32', 1, 'active', NULL, NULL),
(144, 'Quang Nè', 'dh52201675@student.stu.edu.vn', '$2y$12$KT19VIARHCwJMZL5/TyIA.GYlkjB1yZcOCWLYmibJyf0TAdea80u.', NULL, NULL, 3, NULL, '2025-12-02 10:57:03', '2025-12-02 10:57:03', 1, 'active', NULL, NULL),
(145, 'Hoàng Nhật Trường', 'long0961511354@gmail.com', '$2y$12$Hcs3tHM8Rfg/RnYNOEChGuAu0FHbA4bbrcneGwf7mTP.eMJYsAheq', NULL, NULL, 2, NULL, '2025-12-05 23:13:26', '2025-12-05 23:14:02', 1, 'active', NULL, NULL),
(147, 'A ha ha', 'asda@gmail.com', '$2a$10$L1ZUwZJeMGhnPtqEWfbztenaMsyDTjwpiqKNk25gOOwBl5C3JNhh.', NULL, NULL, 2, NULL, NULL, NULL, 0, 'active', NULL, NULL);

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `fk_assignments_classes` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  ADD CONSTRAINT `fk_assignmentsubmit_assignment` FOREIGN KEY (`assign_id`) REFERENCES `assignments` (`assign_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_assignmentsubmit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `fk_classes_courses` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_classes_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `fk_enrollments_approver` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_enrollments_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_enrollments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `mock_test_submissions`
--
ALTER TABLE `mock_test_submissions`
  ADD CONSTRAINT `fk_mock_test_submissions_test` FOREIGN KEY (`mock_test_id`) REFERENCES `mock_tests` (`test_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_test_submissions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `notification_receivers`
--
ALTER TABLE `notification_receivers`
  ADD CONSTRAINT `fk_notification_receivers_notification` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`notification_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_notification_receivers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `passages`
--
ALTER TABLE `passages`
  ADD CONSTRAINT `fk_passages_assignment` FOREIGN KEY (`assign_id`) REFERENCES `assignments` (`assign_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_passages_mock_test` FOREIGN KEY (`mock_test_id`) REFERENCES `mock_tests` (`test_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_passages_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`quiz_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `fk_questions_group` FOREIGN KEY (`group_id`) REFERENCES `question_groups` (`group_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `question_groups`
--
ALTER TABLE `question_groups`
  ADD CONSTRAINT `fk_question_groups_assignment` FOREIGN KEY (`assign_id`) REFERENCES `assignments` (`assign_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_question_groups_mock_test` FOREIGN KEY (`mock_test_id`) REFERENCES `mock_tests` (`test_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_question_groups_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`quiz_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `quiz_classes`
--
ALTER TABLE `quiz_classes`
  ADD CONSTRAINT `fk_quiz_classes_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_quiz_classes_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`quiz_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `quiz_submissions`
--
ALTER TABLE `quiz_submissions`
  ADD CONSTRAINT `fk_quiz_submissions_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`quiz_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_quiz_submissions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `fk_schedules_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `test_classes`
--
ALTER TABLE `test_classes`
  ADD CONSTRAINT `fk_test_classes_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_test_classes_mock_test` FOREIGN KEY (`mock_test_id`) REFERENCES `mock_tests` (`test_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_roles` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
