-- =====================================================================
-- remove_thin_mock_tests.sql
--
-- Xóa các bài thi thử chỉ có 5 câu hỏi placeholder (test_id 7, 8-17),
-- không đạt số lượng câu hỏi thực tế của 1 bài full mock test. Nhờ
-- ON DELETE CASCADE sẵn có trên question_groups/questions/test_classes/
-- mock_test_submissions, chỉ cần xóa ở bảng mock_tests là đủ.
--
-- Sau khi xóa, 4 bài mock test còn lại có nội dung thật đầy đủ (test 3,4
-- = 82 câu IELTS; test 5,6 = 200 câu TOEIC) đã sẵn được gán cho TOÀN BỘ
-- lớp cùng loại từ trước (22/22 lớp IELTS, 21/21 lớp TOEIC) - không cần
-- gán lại. Lớp loại OTHER sẽ tạm không còn bài thi thử nào (chấp nhận
-- theo yêu cầu, chờ bộ đề OTHER đầy đủ sau).
-- =====================================================================

DELETE FROM `mock_tests` WHERE `test_id` IN (7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17);

-- =====================================================================
-- Kiểm tra nhanh sau khi chạy
-- =====================================================================
SELECT 'Mock test con lai (ky vong: 6 bai, id 1-6)' AS check_name;
SELECT test_id, title, type, is_placement_pool,
  (SELECT COUNT(*) FROM questions q JOIN question_groups qg ON qg.group_id = q.group_id WHERE qg.mock_test_id = mt.test_id) AS so_cau_hoi
FROM mock_tests mt ORDER BY test_id;

SELECT 'So bai test/lop theo course_type (IELTS/TOEIC ky vong 2, OTHER ky vong 0)' AS check_name;
SELECT co.course_type,
  MIN(test_cnt) AS min_test, MAX(test_cnt) AS max_test
FROM (
  SELECT cl.class_id, co.course_type,
    (SELECT COUNT(DISTINCT tc.mock_test_id) FROM test_classes tc WHERE tc.class_id = cl.class_id) AS test_cnt
  FROM classes cl JOIN courses co ON co.course_id = cl.course_id
) x JOIN courses co ON co.course_type = x.course_type
GROUP BY co.course_type;
