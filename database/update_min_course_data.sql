-- =====================================================================
-- update_min_course_data.sql
--
-- Script CẬP NHẬT RIÊNG (không sửa lại database/defaultdb.sql) để đảm bảo
-- trên toàn bộ dữ liệu hiện có:
--   1) MỖI khóa học có >= 2 lớp học đang tuyển
--      ("đang tuyển" = classes.status = 'pending' VÀ còn chỗ trống,
--       đúng theo getAvailableClasses() ở frontend/src/pages/student/Courses.js
--       và thông báo "Không có lớp đang tuyển" trong EnrollmentsService.java)
--   2) MỖI lớp học có >= 3 bài tập (assignments) đang active
--   3) MỖI lớp học có >= 3 bài kiểm tra (quizzes) active và đã có câu hỏi
--   4) MỖI lớp học có >= 5 bài thi thử (mock_tests) active và đã có câu hỏi
--
-- Cách chạy: import file này SAU khi database đã có sẵn dữ liệu từ
-- defaultdb.sql (kể cả các bản vá trước đó như class_id=21, assign_id=13...).
-- Script chỉ INSERT phần còn thiếu (tính deficit theo dữ liệu hiện tại),
-- nên chạy lại nhiều lần vẫn an toàn, không tạo dữ liệu trùng/dư.
--
-- Quiz (6 bài) và mock test không thuộc placement pool (7 bài: id 3-9)
-- đã có sẵn câu hỏi đầy đủ nên được TÁI SỬ DỤNG (gán qua bảng trung gian
-- quiz_classes / test_classes) cho nhiều lớp thay vì tạo câu hỏi mới -
-- không ràng buộc đúng chủ đề IELTS/TOEIC/OTHER theo từng lớp, vì yêu
-- cầu ở đây là về SỐ LƯỢNG và khả năng làm được, không phải nội dung.
-- =====================================================================

-- Bước 0: class_id = 21 (lớp mới tạo ở bản vá trước) chưa khai giảng
-- nên phải là 'pending' mới được tính là "đang tuyển" - trước đó bị
-- để nhầm 'active'.
UPDATE `classes` SET `status` = 'pending' WHERE `class_id` = 21 AND `status` = 'active';

DELIMITER $$

-- ---------------------------------------------------------------------
-- Bước 1: mỗi khóa học có >= 2 lớp đang tuyển (pending + còn chỗ)
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_topup_pending_classes` $$
CREATE PROCEDURE `sp_topup_pending_classes`()
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE v_course_id INT;
  DECLARE v_deficit INT;
  DECLARE v_next_class_id INT;
  DECLARE v_seq INT;
  DECLARE v_teacher_id INT;
  DECLARE cur CURSOR FOR
    SELECT co.course_id, 2 - COALESCE(pc.cnt, 0) AS deficit
    FROM `courses` co
    LEFT JOIN (
      SELECT cl.course_id, COUNT(*) AS cnt
      FROM `classes` cl
      WHERE cl.status = 'pending'
        AND cl.max_students > (
          SELECT COUNT(*) FROM `enrollments` e
          WHERE e.class_id = cl.class_id AND e.approval_status IN ('approved', 'completed')
        )
      GROUP BY cl.course_id
    ) pc ON pc.course_id = co.course_id
    HAVING deficit > 0;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  SELECT COALESCE(MAX(class_id), 0) + 1 INTO v_next_class_id FROM `classes`;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO v_course_id, v_deficit;
    IF done THEN
      LEAVE read_loop;
    END IF;

    SET v_seq = 1;
    WHILE v_seq <= v_deficit DO
      SET v_teacher_id = ELT(1 + (v_next_class_id MOD 4), 3, 29, 30, 31);
      INSERT INTO `classes`
        (`class_id`, `course_id`, `teacher_id`, `class_name`, `description`,
         `max_students`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`)
      VALUES (
        v_next_class_id,
        v_course_id,
        v_teacher_id,
        CONCAT('INTAKE-', v_next_class_id, '-COURSE-', v_course_id),
        'Lop tuyen sinh tu dong sinh de dam bao khoa hoc co du lop dang tuyen.',
        20,
        DATE_ADD(CURDATE(), INTERVAL 21 DAY),
        DATE_ADD(CURDATE(), INTERVAL 77 DAY),
        'pending',
        NOW(), NOW()
      );
      SET v_next_class_id = v_next_class_id + 1;
      SET v_seq = v_seq + 1;
    END WHILE;
  END LOOP;
  CLOSE cur;
END $$

-- ---------------------------------------------------------------------
-- Bước 2: mỗi lớp học có >= 3 bài tập active
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_topup_assignments` $$
CREATE PROCEDURE `sp_topup_assignments`()
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE v_class_id INT;
  DECLARE v_deficit INT;
  DECLARE v_next_assign_id INT;
  DECLARE v_seq INT;
  DECLARE cur CURSOR FOR
    SELECT cl.class_id, 3 - COUNT(a.assign_id) AS deficit
    FROM `classes` cl
    LEFT JOIN `assignments` a ON a.class_id = cl.class_id AND a.status = 'active'
    GROUP BY cl.class_id
    HAVING deficit > 0;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  SELECT COALESCE(MAX(assign_id), 0) + 1 INTO v_next_assign_id FROM `assignments`;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO v_class_id, v_deficit;
    IF done THEN
      LEAVE read_loop;
    END IF;

    SET v_seq = 1;
    WHILE v_seq <= v_deficit DO
      INSERT INTO `assignments`
        (`assign_id`, `class_id`, `title`, `description`, `type`,
         `due_date`, `max_score`, `status`, `created_at`, `updated_at`)
      VALUES (
        v_next_assign_id,
        v_class_id,
        CONCAT('Bai tap on tap ', v_seq, ' - Lop ', v_class_id),
        'Bai tap tu dong sinh de dam bao lop hoc co du so luong bai tap toi thieu cho demo/phan bien.',
        ELT(1 + (v_next_assign_id MOD 4), 'worksheet', 'writing', 'reflection', 'other'),
        DATE_ADD(CURDATE(), INTERVAL 30 + v_seq DAY),
        100.00,
        'active',
        NOW(), NOW()
      );
      SET v_next_assign_id = v_next_assign_id + 1;
      SET v_seq = v_seq + 1;
    END WHILE;
  END LOOP;
  CLOSE cur;
END $$

-- ---------------------------------------------------------------------
-- Bước 3: mỗi lớp học có >= 3 bài kiểm tra (quiz) active, tái sử dụng
-- 6 quiz có sẵn (đều đã có câu hỏi hoàn chỉnh).
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_topup_quiz_classes` $$
CREATE PROCEDURE `sp_topup_quiz_classes`()
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE v_class_id INT;
  DECLARE v_deficit INT;
  DECLARE v_next_id INT;
  DECLARE v_seq INT;
  DECLARE v_pick INT;
  DECLARE v_try INT;
  DECLARE cur CURSOR FOR
    SELECT cl.class_id, 3 - COUNT(DISTINCT qc.quiz_id) AS deficit
    FROM `classes` cl
    LEFT JOIN `quiz_classes` qc ON qc.class_id = cl.class_id
    LEFT JOIN `quizzes` q ON q.quiz_id = qc.quiz_id AND q.status = 'active'
    GROUP BY cl.class_id
    HAVING deficit > 0;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  SELECT COALESCE(MAX(quiz_class_id), 0) + 1 INTO v_next_id FROM `quiz_classes`;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO v_class_id, v_deficit;
    IF done THEN
      LEAVE read_loop;
    END IF;

    SET v_seq = 1;
    SET v_try = 0;
    WHILE v_seq <= v_deficit AND v_try < 12 DO
      SET v_pick = 1 + ((v_class_id + v_try) MOD 6);
      IF NOT EXISTS (
        SELECT 1 FROM `quiz_classes` WHERE quiz_id = v_pick AND class_id = v_class_id
      ) THEN
        INSERT INTO `quiz_classes` (`quiz_class_id`, `quiz_id`, `class_id`, `open_time`, `close_time`, `created_at`)
        VALUES (v_next_id, v_pick, v_class_id, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), NOW());
        SET v_next_id = v_next_id + 1;
        SET v_seq = v_seq + 1;
      END IF;
      SET v_try = v_try + 1;
    END WHILE;
  END LOOP;
  CLOSE cur;
END $$

-- ---------------------------------------------------------------------
-- Bước 4: mỗi lớp học có >= 5 bài thi thử (mock test) active, tái sử
-- dụng các mock test KHÔNG thuộc placement pool (id 3,4,5,6,7,8,9).
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_topup_test_classes` $$
CREATE PROCEDURE `sp_topup_test_classes`()
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE v_class_id INT;
  DECLARE v_deficit INT;
  DECLARE v_next_id INT;
  DECLARE v_seq INT;
  DECLARE v_pick INT;
  DECLARE v_try INT;
  DECLARE v_pool_size INT;
  DECLARE v_offset INT;
  DECLARE cur CURSOR FOR
    SELECT cl.class_id, 5 - COUNT(DISTINCT tc.mock_test_id) AS deficit
    FROM `classes` cl
    LEFT JOIN `test_classes` tc ON tc.class_id = cl.class_id
    LEFT JOIN `mock_tests` mt ON mt.test_id = tc.mock_test_id
      AND mt.status = 'active' AND mt.is_placement_pool = 0
    GROUP BY cl.class_id
    HAVING deficit > 0;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  SELECT COALESCE(MAX(test_class_id), 0) + 1 INTO v_next_id FROM `test_classes`;
  SELECT COUNT(*) INTO v_pool_size FROM `mock_tests` WHERE is_placement_pool = 0 AND status = 'active';

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO v_class_id, v_deficit;
    IF done THEN
      LEAVE read_loop;
    END IF;

    SET v_seq = 1;
    SET v_try = 0;
    WHILE v_seq <= v_deficit AND v_try < (v_pool_size * 2) DO
      SET v_offset = (v_class_id + v_try) MOD v_pool_size;
      SELECT test_id INTO v_pick FROM `mock_tests`
      WHERE is_placement_pool = 0 AND status = 'active'
      ORDER BY test_id
      LIMIT 1 OFFSET v_offset;

      IF NOT EXISTS (
        SELECT 1 FROM `test_classes` WHERE mock_test_id = v_pick AND class_id = v_class_id
      ) THEN
        INSERT INTO `test_classes` (`test_class_id`, `mock_test_id`, `class_id`, `open_time`, `close_time`, `created_at`)
        VALUES (v_next_id, v_pick, v_class_id, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), NOW());
        SET v_next_id = v_next_id + 1;
        SET v_seq = v_seq + 1;
      END IF;
      SET v_try = v_try + 1;
    END WHILE;
  END LOOP;
  CLOSE cur;
END $$

DELIMITER ;

-- Thứ tự bắt buộc: phải topup lớp (bước 1) trước, để bước 2-4 chạy
-- trên cả những lớp mới được sinh ra.
CALL `sp_topup_pending_classes`();
CALL `sp_topup_assignments`();
CALL `sp_topup_quiz_classes`();
CALL `sp_topup_test_classes`();

DROP PROCEDURE IF EXISTS `sp_topup_pending_classes`;
DROP PROCEDURE IF EXISTS `sp_topup_assignments`;
DROP PROCEDURE IF EXISTS `sp_topup_quiz_classes`;
DROP PROCEDURE IF EXISTS `sp_topup_test_classes`;

-- =====================================================================
-- Kiểm tra nhanh sau khi chạy (có thể xóa phần này nếu không cần xem)
-- =====================================================================
SELECT 'Khoa hoc CHUA du 2 lop dang tuyen (ky vong: rong)' AS check_name;
SELECT co.course_id, co.title, COUNT(*) AS pending_available_classes
FROM `courses` co
JOIN `classes` cl ON cl.course_id = co.course_id
  AND cl.status = 'pending'
  AND cl.max_students > (
    SELECT COUNT(*) FROM `enrollments` e
    WHERE e.class_id = cl.class_id AND e.approval_status IN ('approved', 'completed')
  )
GROUP BY co.course_id, co.title
HAVING COUNT(*) < 2;

SELECT 'Lop CHUA du 3 bai tap / 3 bai kiem tra / 5 bai thi thu (ky vong: rong)' AS check_name;
SELECT cl.class_id,
  (SELECT COUNT(*) FROM `assignments` a WHERE a.class_id = cl.class_id AND a.status = 'active') AS assignments_count,
  (SELECT COUNT(DISTINCT qc.quiz_id) FROM `quiz_classes` qc JOIN `quizzes` q ON q.quiz_id = qc.quiz_id AND q.status = 'active' WHERE qc.class_id = cl.class_id) AS quizzes_count,
  (SELECT COUNT(DISTINCT tc.mock_test_id) FROM `test_classes` tc JOIN `mock_tests` mt ON mt.test_id = tc.mock_test_id AND mt.status = 'active' AND mt.is_placement_pool = 0 WHERE tc.class_id = cl.class_id) AS mock_tests_count
FROM `classes` cl
HAVING assignments_count < 3 OR quizzes_count < 3 OR mock_tests_count < 5;
