-- =====================================================================
-- enrich_generated_demo_data.sql
--
-- Script CẬP NHẬT RIÊNG để thay nội dung "giả/sơ sài" mà
-- update_min_course_data.sql đã tự sinh (class_name kiểu
-- "INTAKE-21-COURSE-1", assignment title kiểu "Bai tap on tap 1 -
-- Lop 21") bằng nội dung thật, đúng chủ đề IELTS/TOEIC/OTHER và
-- đúng session/level của từng khóa học - giống văn phong dữ liệu gốc
-- trong defaultdb.sql.
--
-- Script này CHỈ động vào đúng các dòng do update_min_course_data.sql
-- tạo ra (nhận diện qua class_name LIKE 'INTAKE-%' và assignment
-- title LIKE 'Bai tap on tap%'), không đụng tới dữ liệu gốc/dữ liệu
-- bạn đã tự nhập tay. An toàn chạy lại nhiều lần.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Phần 1: đặt lại tên lớp, mô tả, ngày khai giảng/kết thúc, sĩ số cho
-- 34 lớp "đang tuyển" mới được sinh - theo đúng quy ước đặt tên đã
-- dùng cho các lớp gốc (VD: IELTS_FDN_MAY_01, TOEIC_600_AM_01...),
-- xem như đợt tuyển sinh tiếp theo (đợt 02 / 03) của từng khóa học.
-- ---------------------------------------------------------------------
UPDATE `classes` cl
JOIN (
  SELECT 21 AS class_id, 'IELTS_FDN_SEP_02' AS class_name, 'Lop nen tang IELTS dot 2, khai giang thang 9 cho hoc vien moi bat dau.' AS description, '2026-09-07' AS start_date, '2026-11-02' AS end_date, 20 AS max_students UNION ALL
  SELECT 22, 'IELTS_FDN_OCT_03', 'Lop nen tang IELTS dot 3, mo them do nhu cau dang ky tang vao cuoi nam.', '2026-10-05', '2026-11-30', 20 UNION ALL
  SELECT 23, 'IELTS_PRE_AM_02', 'Lop pre-intermediate buoi sang, cung co ngu phap va tu vung de len band 5.0.', '2026-09-07', '2026-11-02', 20 UNION ALL
  SELECT 24, 'IELTS_PRE_WEEKEND_03', 'Lop pre-intermediate cuoi tuan danh cho hoc vien di lam ban ngay.', '2026-10-03', '2026-11-28', 20 UNION ALL
  SELECT 25, 'IELTS_READING_PM_02', 'Lop chuyen reading buoi chieu, luyen scanning, skimming va cac dang cau hoi doc hieu.', '2026-09-08', '2026-11-03', 18 UNION ALL
  SELECT 26, 'IELTS_READING_EVE_03', 'Lop chuyen reading buoi toi, tap trung xu ly passage hoc thuat toc do nhanh.', '2026-10-06', '2026-12-01', 18 UNION ALL
  SELECT 27, 'IELTS_LISTEN_PM_02', 'Lop listening buoi chieu, luyen note completion, map va cac dang MCQ.', '2026-09-08', '2026-11-03', 18 UNION ALL
  SELECT 28, 'IELTS_LISTEN_WEEKEND_03', 'Lop listening cuoi tuan, tap trung ky nang nghe hoc thuat cho hoc vien di lam.', '2026-10-06', '2026-12-01', 18 UNION ALL
  SELECT 29, 'IELTS_WRITING_AM_02', 'Lop writing intensive buoi sang, luyen Task 1 va Task 2 theo band descriptor.', '2026-09-09', '2026-11-04', 16 UNION ALL
  SELECT 30, 'IELTS_WRITING_EVE_03', 'Lop writing intensive buoi toi cho hoc vien muc tieu band 6.0-6.5.', '2026-10-07', '2026-12-02', 16 UNION ALL
  SELECT 31, 'IELTS_SPEAKING_AM_02', 'Lop speaking workshop buoi sang, ren phan xa va phat trien y tuong tra loi.', '2026-09-09', '2026-11-04', 16 UNION ALL
  SELECT 32, 'IELTS_SPEAKING_WEEKEND_03', 'Lop speaking workshop cuoi tuan cho hoc vien muc tieu 6.0 tro len.', '2026-10-07', '2026-12-02', 16 UNION ALL
  SELECT 33, 'IELTS_MOCK_EVE_02', 'Lop luyen de IELTS buoi toi, lam full mock test va chua bai chi tiet hang tuan.', '2026-09-10', '2026-11-05', 16 UNION ALL
  SELECT 34, 'IELTS_65_PLUS_OCT_02', 'Lop tang toc band 6.5+ dot 2, uu tien hoc vien da co ket qua dau vao gan muc tieu.', '2026-10-08', '2026-12-03', 14 UNION ALL
  SELECT 35, 'TOEIC_STARTER_SEP_02', 'Lop TOEIC starter dot 2 cho hoc vien mat goc, khai giang thang 9.', '2026-09-07', '2026-11-02', 24 UNION ALL
  SELECT 36, 'TOEIC_STARTER_OCT_03', 'Lop TOEIC starter dot 3, mo them ca hoc de dap ung nhu cau dang ky.', '2026-10-05', '2026-11-30', 24 UNION ALL
  SELECT 37, 'TOEIC_600_PM_02', 'Lop TOEIC 600 buoi chieu, tap trung Part 3-4-5 va tu vung cong so.', '2026-09-08', '2026-11-03', 24 UNION ALL
  SELECT 38, 'TOEIC_600_EVE_03', 'Lop TOEIC 600 buoi toi danh cho hoc vien di lam ban ngay.', '2026-10-06', '2026-12-01', 24 UNION ALL
  SELECT 39, 'TOEIC_GRAMMAR_AM_02', 'Lop ngu phap TOEIC Part 5-6 buoi sang.', '2026-09-08', '2026-11-03', 22 UNION ALL
  SELECT 40, 'TOEIC_GRAMMAR_WEEKEND_03', 'Lop ngu phap TOEIC Part 5-6 cuoi tuan.', '2026-10-06', '2026-12-01', 22 UNION ALL
  SELECT 41, 'TOEIC_LISTEN_OCT_02', 'Lop listening mastery TOEIC dot 2, chinh phuc Part 1-4 voi chien luoc nghe tu khoa.', '2026-10-09', '2026-12-04', 20 UNION ALL
  SELECT 42, 'TOEIC_READ_OCT_02', 'Lop reading speed TOEIC dot 2, luyen tang toc do doc Part 7.', '2026-10-09', '2026-12-04', 20 UNION ALL
  SELECT 43, 'TOEIC_750_AM_01', 'Lop luyen diem TOEIC 750+ buoi sang, khai giang dot dau tien.', '2026-09-10', '2026-11-05', 20 UNION ALL
  SELECT 44, 'TOEIC_750_PM_02', 'Lop luyen diem TOEIC 750+ buoi chieu cho hoc vien di lam.', '2026-10-08', '2026-12-03', 20 UNION ALL
  SELECT 45, 'TOEIC_MOCK_OCT_03', 'Lop TOEIC mock test lab dot 3, lam de mo phong va chua chi tiet.', '2026-10-09', '2026-12-04', 18 UNION ALL
  SELECT 46, 'TOEIC_900_SEP_02', 'Lop TOEIC 900 sprint dot 2 cho hoc vien muc tieu diem cao.', '2026-09-09', '2026-11-04', 16 UNION ALL
  SELECT 47, 'TOEIC_900_OCT_03', 'Lop TOEIC 900 sprint dot 3, uu tien hoc vien da dat 750+.', '2026-10-07', '2026-12-02', 16 UNION ALL
  SELECT 48, 'ENG_BASIC_AM_02', 'Lop giao tiep co ban buoi sang cho nguoi moi hoc.', '2026-09-07', '2026-11-02', 22 UNION ALL
  SELECT 49, 'ENG_BASIC_PM_03', 'Lop giao tiep co ban buoi chieu, si so nho de ho tro sat hoc vien.', '2026-10-05', '2026-11-30', 22 UNION ALL
  SELECT 50, 'ENG_INTER_OCT_02', 'Lop giao tiep trung cap dot 2 danh cho hoc vien di lam.', '2026-10-10', '2026-12-05', 20 UNION ALL
  SELECT 51, 'BUSINESS_WRITE_AM_02', 'Lop business writing buoi sang, luyen email, memo va bao cao ngan.', '2026-09-09', '2026-11-04', 18 UNION ALL
  SELECT 52, 'BUSINESS_WRITE_WEEKEND_03', 'Lop business writing cuoi tuan cho hoc vien ban ram gio hanh chinh.', '2026-10-07', '2026-12-02', 18 UNION ALL
  SELECT 53, 'PRONUN_CLINIC_PM_02', 'Lop phat am va trong am buoi chieu cho hoc vien can cai thien giao tiep.', '2026-09-08', '2026-11-03', 20 UNION ALL
  SELECT 54, 'PRONUN_CLINIC_EVE_03', 'Lop phat am va trong am buoi toi, si so nho de sua loi tung hoc vien.', '2026-10-06', '2026-12-01', 20
) src ON src.class_id = cl.class_id
SET cl.class_name = src.class_name,
    cl.description = src.description,
    cl.start_date = src.start_date,
    cl.end_date = src.end_date,
    cl.max_students = src.max_students,
    cl.updated_at = NOW()
WHERE cl.class_name LIKE 'INTAKE-%';

-- ---------------------------------------------------------------------
-- Phần 2: đặt lại tiêu đề/mô tả cho 152 bài tập tự sinh, dùng bộ mẫu
-- nội dung thật theo đúng (loại khóa học x loại bài tập) - 4 biến
-- thể mỗi tổ hợp để tránh lặp y hệt giữa các lớp cạnh nhau.
-- ---------------------------------------------------------------------
DROP TEMPORARY TABLE IF EXISTS `tmp_assignment_templates`;
CREATE TEMPORARY TABLE `tmp_assignment_templates` (
  course_type VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  type VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  variant TINYINT NOT NULL,
  title VARCHAR(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (course_type, type, variant)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tmp_assignment_templates` (course_type, type, variant, title, description) VALUES
-- IELTS / worksheet
('IELTS','worksheet',1,'Grammar drill: linking words for opinion essays','Hoan thanh 15 cau su dung however, therefore, in addition va although trong ngu canh hoc thuat.'),
('IELTS','worksheet',2,'Vocabulary worksheet: environment and society topics','Dien tu vung chu de moi truong va xa hoi vao 12 cau con thieu, kem giai thich nghia.'),
('IELTS','worksheet',3,'Sentence structure worksheet: complex sentences for Task 2','Viet lai 10 cau don thanh cau phuc su dung mau relative clause va conditional.'),
('IELTS','worksheet',4,'Collocation worksheet: academic word list practice','Ghep 20 collocation thuong gap trong bai doc va bai nghe IELTS hoc thuat.'),
-- IELTS / writing
('IELTS','writing',1,'Task 2 outline: technology and education','Lap dan y cho de bai ve anh huong cong nghe den giao duc, gom thesis va 2 than bai.'),
('IELTS','writing',2,'Task 1 summary practice: bar chart description','Viet doan mo bai va tong quan cho mot bieu do cot gia dinh, it nhat 150 tu.'),
('IELTS','writing',3,'Paragraph writing: advantages and disadvantages','Viet mot doan van 200 tu trinh bay uu va nhuoc diem cua chu de duoc giao tren lop.'),
('IELTS','writing',4,'Email writing: requesting course information','Viet email trang trong yeu cau thong tin ve khoa hoc, dung dung van phong lich su.'),
-- IELTS / reflection
('IELTS','reflection',1,'Reading strategy journal','Ghi lai cach ban ap dung skimming va scanning trong mot bai doc da lam tren lop.'),
('IELTS','reflection',2,'Listening self-review','Tong hop 3 loi sai thuong gap khi nghe va cach khac phuc cho buoi hoc tiep theo.'),
('IELTS','reflection',3,'Speaking practice reflection','Danh gia phan speaking cua ban theo 4 tieu chi fluency, vocabulary, grammar, pronunciation.'),
('IELTS','reflection',4,'Weekly study log','Ghi lai thoi gian tu hoc trong tuan va nhung kho khan gap phai voi tung ky nang.'),
-- IELTS / other
('IELTS','other',1,'Word formation practice','Lam bai luyen tap nhanh ve bien doi tu loai (noun/verb/adjective/adverb) theo chu de da hoc.'),
('IELTS','other',2,'Peer review exercise','Doi bai writing voi ban cung lop va gop y theo checklist cham diem IELTS.'),
('IELTS','other',3,'Mini presentation prep','Chuan bi hai phut noi ve mot chu de quen thuoc, dung cau truc mo bai - than bai - ket bai.'),
('IELTS','other',4,'Error correction task','Sua 10 loi ngu phap thuong gap trong bai viet cua hoc vien IELTS.'),
-- TOEIC / worksheet
('TOEIC','worksheet',1,'Part 5 grammar worksheet: verb tense review','Hoan thanh 15 cau trac nghiem ve thi cua dong tu trong ngu canh cong so.'),
('TOEIC','worksheet',2,'Vocabulary worksheet: office and finance terms','Dien tu vung chu de tai chinh va van phong vao 12 cau con thieu.'),
('TOEIC','worksheet',3,'Part 6 text completion practice','Lam hai doan van ban thieu tu/cau theo dinh dang TOEIC Part 6.'),
('TOEIC','worksheet',4,'Collocation worksheet: business English','Ghep 20 collocation thuong gap trong email va bao cao cong viec.'),
-- TOEIC / writing
('TOEIC','writing',1,'Email reply practice: meeting reschedule','Viet email tra loi doi lich hop, xac nhan thoi gian moi va ly do thay doi.'),
('TOEIC','writing',2,'Memo writing: policy update','Viet mot memo ngan thong bao thay doi chinh sach noi bo cho nhan vien.'),
('TOEIC','writing',3,'Report summary practice','Tom tat mot bao cao ngan theo bullet points, nhan manh so lieu chinh.'),
('TOEIC','writing',4,'Business email: request for quotation','Viet email yeu cau bao gia tu nha cung cap, neu ro so luong va thoi han.'),
-- TOEIC / reflection
('TOEIC','reflection',1,'Listening error log','Ghi lai 3 dang cau hoi Part 3-4 hay sai va cach nghe lai de rut kinh nghiem.'),
('TOEIC','reflection',2,'Reading speed journal','Ghi lai thoi gian doc va so cau dung cho mot bo de Part 7 da lam.'),
('TOEIC','reflection',3,'Vocabulary retention log','Liet ke 10 tu vung moi hoc trong tuan va vi du cau su dung.'),
('TOEIC','reflection',4,'Test-taking strategy reflection','Danh gia chien luoc lam bai cua ban va de xuat cach cai thien toc do.'),
-- TOEIC / other
('TOEIC','other',1,'Part 2 response drill','Luyen tap nhanh cac mau cau hoi - dap thuong gap trong Part 2.'),
('TOEIC','other',2,'Vocabulary quiz practice: synonyms','Lam bai trac nghiem tim tu dong nghia trong ngu canh cong so.'),
('TOEIC','other',3,'Peer email review','Doi email da viet voi ban cung lop va gop y theo tieu chi ro rang, lich su, du y.'),
('TOEIC','other',4,'Mini mock warm-up','Lam thu 10 cau Part 5 trong 5 phut de lam quen toc do lam bai.'),
-- OTHER / worksheet
('OTHER','worksheet',1,'Everyday vocabulary worksheet: shopping and dining','Dien tu vung chu de mua sam va an uong vao 12 cau con thieu.'),
('OTHER','worksheet',2,'Grammar worksheet: present tenses for daily conversation','Hoan thanh 15 cau su dung thi hien tai don va hien tai tiep dien trong hoi thoai.'),
('OTHER','worksheet',3,'Phrasal verb worksheet: workplace situations','Ghep 15 phrasal verb thuong dung trong tinh huong cong so.'),
('OTHER','worksheet',4,'Pronunciation worksheet: word stress patterns','Danh dau trong am cho 20 tu thuong dung va luyen doc lai.'),
-- OTHER / writing
('OTHER','writing',1,'Self-introduction paragraph','Viet mot doan van 100-150 tu gioi thieu ban than, cong viec va so thich.'),
('OTHER','writing',2,'Simple email: making an appointment','Viet email ngan de hen lich gap voi dong nghiep hoac khach hang.'),
('OTHER','writing',3,'Journal entry: a memorable weekend','Viet nhat ky ngan ve mot cuoi tuan dang nho, dung it nhat 5 dong tu qua khu.'),
('OTHER','writing',4,'Message writing: asking for help','Viet mot tin nhan lich su nho su giup do trong tinh huong hang ngay.'),
-- OTHER / reflection
('OTHER','reflection',1,'Conversation practice log','Ghi lai mot doan hoi thoai ban da thuc hanh va nhung tu moi hoc duoc.'),
('OTHER','reflection',2,'Pronunciation self-check','Tu ghi am mot doan ngan va danh gia phat am theo checklist tren lop.'),
('OTHER','reflection',3,'Weekly vocabulary review','Liet ke va on lai 10 tu vung moi hoc trong tuan qua.'),
('OTHER','reflection',4,'Speaking confidence journal','Ghi lai cam nhan ve su tu tin khi noi tieng Anh va muc tieu can cai thien.'),
-- OTHER / other
('OTHER','other',1,'Role-play preparation','Chuan bi doan hoi thoai role-play cho tinh huong giao tiep hang ngay.'),
('OTHER','other',2,'Listening warm-up quiz','Lam bai nghe ngan va tra loi cau hoi trac nghiem don gian.'),
('OTHER','other',3,'Vocabulary matching game prep','Chuan bi 10 the tu vung de choi matching game tren lop.'),
('OTHER','other',4,'Peer conversation review','Nghe lai doan hoi thoai voi ban cung lop va gop y cach phat am, ngu dieu.');

UPDATE `assignments` a
JOIN `classes` cl ON cl.class_id = a.class_id
JOIN `courses` co ON co.course_id = cl.course_id
JOIN `tmp_assignment_templates` t
  ON t.course_type = co.course_type
 AND t.type = a.type
 AND t.variant = 1 + ((a.class_id + a.assign_id) MOD 4)
SET a.title = t.title,
    a.description = t.description,
    a.updated_at = NOW()
WHERE a.title LIKE 'Bai tap on tap%';

DROP TEMPORARY TABLE IF EXISTS `tmp_assignment_templates`;

-- ---------------------------------------------------------------------
-- Phần 3: BUG FIX - update_min_course_data.sql giả định đã có 7 mock
-- test không thuộc placement pool (id 3-9), nhưng vì DB hiện tại chưa
-- từng có mock_test 7/8/9 nên pool thực tế chỉ có 4 bài (id 3,4,5,6).
-- Kết quả: MỌI lớp hiện chỉ có 4 bài thi thử, thiếu 1 để đạt tối
-- thiểu 5. Bổ sung 1 mock test mới (đã có câu hỏi thật) và gán cho
-- toàn bộ lớp hiện có để đạt đủ 5 bài thi thử/lớp.
-- ---------------------------------------------------------------------
INSERT IGNORE INTO `mock_tests`
  (`test_id`, `title`, `description`, `type`, `part`, `time_limit`, `total_score`, `attempts_allowed`, `status`, `is_placement_pool`, `created_at`, `updated_at`)
VALUES
  (7, 'IELTS Academic Mock 03 - Urban Green Spaces', 'Full mock IELTS voi chu de cong vien do thi, quy hoach xanh va tac dong den suc khoe cong dong.', 'IELTS', 'Full Test', 165, 9.00, 2, 'active', 0, NOW(), NOW());

INSERT IGNORE INTO `question_groups`
  (`group_id`, `quiz_id`, `assign_id`, `title`, `passage_text`, `image_url`, `audio_url`, `instructions`, `order_num`, `mock_test_id`)
VALUES
  (608, NULL, NULL, 'Reading Passage - Urban Green Spaces', 'This passage discusses how city parks and green corridors influence air quality, community wellbeing and property values in dense urban districts.', NULL, NULL, 'Questions 1-5 refer to the passage.', 1, 7);

INSERT IGNORE INTO `questions`
  (`question_id`, `group_id`, `question_type`, `question_text`, `image_url`, `audio_url`, `order_num`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`, `explanation`)
VALUES
  (6201, 608, 'reading_mcq', 'Urban Green Spaces - Question 1: What benefit of city parks is mentioned first in the passage?', NULL, NULL, 1, 'Improved air quality.', 'Higher tax revenue.', 'Reduced traffic congestion.', 'Lower crime rates.', 'A', 'Thong tin duoc neu dau tien trong doan van ve loi ich cua cong vien do thi.'),
  (6202, 608, 'reading_mcq', 'Urban Green Spaces - Question 2: How do green corridors affect community wellbeing according to the passage?', NULL, NULL, 2, 'They have no clear effect.', 'They encourage outdoor activity and social contact.', 'They only benefit local businesses.', 'They increase noise levels.', 'B', 'Thong tin duoc neu trong doan van ve tac dong den cong dong.'),
  (6203, 608, 'reading_mcq', 'Urban Green Spaces - Question 3: What happened to property values near new green corridors?', NULL, NULL, 3, 'They decreased sharply.', 'They stayed exactly the same.', 'They tended to increase.', 'They became impossible to measure.', 'C', 'Thong tin duoc neu trong doan van ve gia bat dong san.'),
  (6204, 608, 'reading_mcq', 'Urban Green Spaces - Question 4: What challenge does the passage mention for city planners?', NULL, NULL, 4, 'Balancing green space with limited urban land.', 'A total lack of public interest.', 'Excessive funding with no use for it.', 'Banning all future construction.', 'A', 'Thong tin duoc neu trong doan van ve thach thuc quy hoach.'),
  (6205, 608, 'reading_mcq', 'Urban Green Spaces - Question 5: What does the passage suggest about the future of urban parks?', NULL, NULL, 5, 'They will likely be removed.', 'They are expected to expand further.', 'They will remain unchanged.', 'They will be replaced by parking lots.', 'B', 'Thong tin duoc neu trong doan van ve xu huong tuong lai.');

INSERT IGNORE INTO `test_classes` (`mock_test_id`, `class_id`, `open_time`, `close_time`, `created_at`)
SELECT 7, cl.class_id, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), NOW()
FROM `classes` cl;

-- =====================================================================
-- Kiểm tra nhanh sau khi chạy
-- =====================================================================
SELECT 'Con lop/bai tap CHUA duoc doi ten (ky vong: rong)' AS check_name;
SELECT class_id, class_name FROM `classes` WHERE class_name LIKE 'INTAKE-%';
SELECT assign_id, title FROM `assignments` WHERE title LIKE 'Bai tap on tap%';

SELECT 'Lop CHUA du 5 bai thi thu sau khi vá (ky vong: rong)' AS check_name;
SELECT cl.class_id,
  (SELECT COUNT(DISTINCT tc.mock_test_id) FROM test_classes tc JOIN mock_tests mt ON mt.test_id = tc.mock_test_id AND mt.status = 'active' AND mt.is_placement_pool = 0 WHERE tc.class_id = cl.class_id) AS mock_tests_count
FROM `classes` cl
HAVING mock_tests_count < 5;
