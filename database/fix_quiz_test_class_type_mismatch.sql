-- =====================================================================
-- fix_quiz_test_class_type_mismatch.sql
--
-- Script CẬP NHẬT RIÊNG để sửa lỗi: update_min_course_data.sql trước đó
-- gán quiz/mock test cho lớp mà KHÔNG kiểm tra loại chứng chỉ (VD: bài
-- thi TOEIC bị gán cho lớp IELTS). Script này:
--   1) Tạo thêm quiz/mock test ĐÚNG LOẠI còn thiếu (đặc biệt OTHER chưa
--      có quiz/mock test nào, và IELTS/TOEIC chưa đủ mock test) - đều
--      kèm câu hỏi thật để "làm được".
--   2) Xóa mọi dòng quiz_classes/test_classes bị lệch loại so với
--      course_type của lớp.
--   3) Gán lại (top-up) cho từng lớp đủ tối thiểu 3 quiz / 5 mock test
--      ĐÚNG LOẠI - giữ nguyên yêu cầu ban đầu, không còn lệch loại.
--
-- An toàn chạy lại nhiều lần (idempotent): bước tạo dùng ID cố định,
-- bước xóa/gán lại tính theo dữ liệu hiện có mỗi lần chạy.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Phần 1a: 3 quiz mới loại OTHER (hiện chưa có quiz OTHER nào)
-- ---------------------------------------------------------------------
INSERT IGNORE INTO `quizzes` (`quiz_id`, `title`, `description`, `type`, `part`, `time_limit`, `status`, `created_at`, `updated_at`) VALUES
(7, 'Everyday Conversation Quiz - Making Plans', 'Bai kiem tra tinh huong hoi thoai hang ngay ve len ke hoach gap mat va hen lich.', 'OTHER', 'Conversation', 15, 'active', NOW(), NOW()),
(8, 'Business Email Quiz - Meeting Requests', 'Bai kiem tra cach chon tu/cau phu hop khi viet email cong so yeu cau dat lich hop.', 'OTHER', 'Business Writing', 15, 'active', NOW(), NOW()),
(9, 'Pronunciation Quiz - Word Stress Patterns', 'Bai kiem tra nhan biet trong am cua tu trong cac tinh huong giao tiep thong dung.', 'OTHER', 'Pronunciation', 10, 'active', NOW(), NOW());

INSERT IGNORE INTO `question_groups` (`group_id`, `quiz_id`, `assign_id`, `title`, `passage_text`, `image_url`, `audio_url`, `instructions`, `order_num`, `mock_test_id`) VALUES
(609, 7, NULL, 'Making Plans - Situations', NULL, NULL, NULL, 'Choose the best response for each everyday conversation situation.', 1, NULL),
(610, 8, NULL, 'Meeting Request Emails', NULL, NULL, NULL, 'Choose the best word or phrase to complete each business email sentence.', 1, NULL),
(611, 9, NULL, 'Word Stress Check', NULL, NULL, NULL, 'Choose the syllable that carries the main stress for each word.', 1, NULL);

INSERT IGNORE INTO `questions` (`question_id`, `group_id`, `question_type`, `question_text`, `image_url`, `audio_url`, `order_num`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`, `explanation`) VALUES
(6206, 609, 'mcq', 'A friend says "Are you free this Saturday?" What is the best response if you are busy?', NULL, NULL, 1, 'Sorry, I already have plans that day.', 'Approve of it.', 'I have never been there.', 'It is on the table.', 'A', 'Cau tra loi phu hop nhat khi tu choi loi moi mot cach lich su.'),
(6207, 609, 'mcq', 'Choose the best way to suggest a time to meet.', NULL, NULL, 2, 'How about we meet at 7pm?', 'I saw it yesterday.', 'That is not mine.', 'He is my brother.', 'A', 'Cau goi y thoi gian gap mat pho bien nhat trong hoi thoai hang ngay.'),
(6208, 609, 'mcq', 'Choose the best response to "Can you make it on time?"', NULL, NULL, 3, 'Yes, I will be there by 6.', 'It is very expensive.', 'I like blue color.', 'She works at a bank.', 'A', 'Cau tra loi xac nhan dung thoi gian, phu hop ngu canh.'),
(6209, 609, 'mcq', 'Choose the polite way to cancel a plan.', NULL, NULL, 4, 'Sorry, something came up, can we reschedule?', 'No, never.', 'I do not care.', 'Whatever you want.', 'A', 'Cach huy hen lich mot cach lich su va de xuat doi lich.'),
(6210, 609, 'mcq', 'Choose the best closing line for a casual chat about weekend plans.', NULL, NULL, 5, 'Alright, see you then!', 'That is impossible.', 'I refuse.', 'Never mind that.', 'A', 'Cau ket thuc hoi thoai tu nhien va lich su.'),

(6211, 610, 'mcq', 'Dear Mr. Tran, I would like to ___ a meeting next Tuesday.', NULL, NULL, 1, 'schedule', 'scheduled', 'scheduling', 'schedules', 'A', 'Dung dang nguyen mau sau dong tu "would like to".'),
(6212, 610, 'mcq', 'Please let me know your ___ availability for the call.', NULL, NULL, 2, 'earliest', 'early', 'earlier', 'earliness', 'A', 'Can tinh tu so sanh nhat de mo ta thoi gian som nhat co the.'),
(6213, 610, 'mcq', 'We look forward to ___ from you soon.', NULL, NULL, 3, 'hearing', 'hear', 'heard', 'to hear', 'A', 'Cau truc quen thuoc "look forward to + V-ing".'),
(6214, 610, 'mcq', 'Could you confirm your ___ for the proposed date?', NULL, NULL, 4, 'availability', 'available', 'avail', 'availably', 'A', 'Can danh tu sau tinh tu so huu "your".'),
(6215, 610, 'mcq', 'Best regards, ___ this email finds you well.', NULL, NULL, 5, 'I hope', 'I hoped', 'hoping', 'hopes', 'A', 'Cum mo dau email trang trong pho bien.'),

(6216, 611, 'mcq', 'Which syllable is stressed in "PHOtograph"?', NULL, NULL, 1, 'First syllable', 'Second syllable', 'Third syllable', 'No stress', 'A', 'Danh tu 3 am tiet "photograph" nhan trong am o am tiet dau.'),
(6217, 611, 'mcq', 'Which syllable is stressed in "phoTOGraphy"?', NULL, NULL, 2, 'First syllable', 'Second syllable', 'Third syllable', 'Fourth syllable', 'B', 'Khi them hau to -y, trong am chuyen sang am tiet thu hai.'),
(6218, 611, 'mcq', 'Which syllable is stressed in "comPUTer"?', NULL, NULL, 3, 'First syllable', 'Second syllable', 'Third syllable', 'No stress', 'B', 'Danh tu 3 am tiet "computer" nhan trong am o am tiet giua.'),
(6219, 611, 'mcq', 'Which syllable is stressed in "EDUcate"?', NULL, NULL, 4, 'First syllable', 'Second syllable', 'Third syllable', 'No stress', 'A', 'Dong tu "educate" nhan trong am o am tiet dau.'),
(6220, 611, 'mcq', 'Which syllable is stressed in "ediCAtion" (education)?', NULL, NULL, 5, 'First syllable', 'Second syllable', 'Third syllable', 'Fourth syllable', 'C', 'Danh tu tan cung -tion thuong nhan trong am o am tiet ngay truoc -tion.');

-- ---------------------------------------------------------------------
-- Phần 1b: mock test mới - IELTS +2, TOEIC +3, OTHER +5 (để mỗi loại
-- đạt đủ 5 bài không-placement-pool, đủ gán tối thiểu 5 bài/lớp).
-- ---------------------------------------------------------------------
INSERT IGNORE INTO `mock_tests` (`test_id`, `title`, `description`, `type`, `part`, `time_limit`, `total_score`, `attempts_allowed`, `status`, `is_placement_pool`, `created_at`, `updated_at`) VALUES
(8, 'IELTS Academic Mock 06 - Digital Learning Platforms', 'Full mock IELTS voi chu de nen tang hoc truc tuyen va tac dong den thoi quen hoc tap.', 'IELTS', 'Full Test', 165, 9.00, 2, 'active', 0, NOW(), NOW()),
(9, 'IELTS Academic Mock 07 - Coastal Wildlife Conservation', 'Full mock IELTS voi chu de bao ton dong vat hoang da ven bien.', 'IELTS', 'Full Test', 165, 9.00, 2, 'active', 0, NOW(), NOW()),
(10, 'TOEIC Full Mock 03 - Retail Operations', 'Full mock TOEIC voi chu de van hanh cua hang ban le, ton kho va cham soc khach hang.', 'TOEIC', 'Full Test', 120, 990.00, 2, 'active', 0, NOW(), NOW()),
(11, 'TOEIC Full Mock 04 - Travel and Hospitality', 'Full mock TOEIC voi chu de dat phong khach san, lich trinh cong tac va dich vu du lich.', 'TOEIC', 'Full Test', 120, 990.00, 2, 'active', 0, NOW(), NOW()),
(12, 'TOEIC Full Mock 05 - IT Support Communication', 'Full mock TOEIC voi chu de ho tro ky thuat noi bo va trao doi qua email.', 'TOEIC', 'Full Test', 120, 990.00, 1, 'active', 0, NOW(), NOW()),
(13, 'General English Mock 01 - Daily Routines and Habits', 'Bai luyen tong hop chu de thoi quen sinh hoat hang ngay.', 'OTHER', 'Full Test', 60, 100.00, 2, 'active', 0, NOW(), NOW()),
(14, 'General English Mock 02 - Travel and Directions', 'Bai luyen tong hop chu de hoi duong va di chuyen khi du lich.', 'OTHER', 'Full Test', 60, 100.00, 2, 'active', 0, NOW(), NOW()),
(15, 'General English Mock 03 - Shopping and Services', 'Bai luyen tong hop chu de mua sam va su dung dich vu.', 'OTHER', 'Full Test', 60, 100.00, 2, 'active', 0, NOW(), NOW()),
(16, 'Business English Mock 01 - Office Communication Basics', 'Bai luyen tong hop chu de giao tiep van phong co ban.', 'OTHER', 'Full Test', 60, 100.00, 2, 'active', 0, NOW(), NOW()),
(17, 'Pronunciation Mock 01 - Common Word Stress Check', 'Bai luyen tong hop kiem tra trong am cac tu thong dung.', 'OTHER', 'Full Test', 45, 100.00, 2, 'active', 0, NOW(), NOW());

INSERT IGNORE INTO `question_groups` (`group_id`, `quiz_id`, `assign_id`, `title`, `passage_text`, `image_url`, `audio_url`, `instructions`, `order_num`, `mock_test_id`) VALUES
(612, NULL, NULL, 'Reading Passage - Digital Learning Platforms', 'This passage discusses how online learning platforms have changed study habits and access to course materials for students worldwide.', NULL, NULL, 'Questions 1-5 refer to the passage.', 1, 8),
(613, NULL, NULL, 'Reading Passage - Coastal Wildlife Conservation', 'This passage examines how local conservation groups monitor seabird and turtle populations along a coastal reserve.', NULL, NULL, 'Questions 1-5 refer to the passage.', 1, 9),
(614, NULL, NULL, 'Reading Set - Retail Operations', 'A short set of documents about inventory checks, staff scheduling and customer service policy at a retail store.', NULL, NULL, 'Questions 1-5 refer to the documents.', 1, 10),
(615, NULL, NULL, 'Reading Set - Travel and Hospitality', 'A short set of documents about hotel booking confirmation, itinerary changes and guest service requests.', NULL, NULL, 'Questions 1-5 refer to the documents.', 1, 11),
(616, NULL, NULL, 'Reading Set - IT Support Communication', 'A short set of internal emails about a system outage, support ticket updates and resolution steps.', NULL, NULL, 'Questions 1-5 refer to the documents.', 1, 12),
(617, NULL, NULL, 'Daily Routines and Habits', 'Short everyday questions about common daily routines and habits.', NULL, NULL, 'Questions 1-5.', 1, 13),
(618, NULL, NULL, 'Travel and Directions', 'Short everyday questions about asking for and giving directions while traveling.', NULL, NULL, 'Questions 1-5.', 1, 14),
(619, NULL, NULL, 'Shopping and Services', 'Short everyday questions about shopping and using common services.', NULL, NULL, 'Questions 1-5.', 1, 15),
(620, NULL, NULL, 'Office Communication Basics', 'Short everyday questions about basic workplace communication.', NULL, NULL, 'Questions 1-5.', 1, 16),
(621, NULL, NULL, 'Common Word Stress Check', 'Choose the syllable that carries the main stress for each common word.', NULL, NULL, 'Questions 1-5.', 1, 17);

INSERT IGNORE INTO `questions` (`question_id`, `group_id`, `question_type`, `question_text`, `image_url`, `audio_url`, `order_num`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`, `explanation`) VALUES
(6221, 612, 'reading_mcq', 'Digital Learning Platforms - Question 1: What has changed for students according to the passage?', NULL, NULL, 1, 'Access to course materials.', 'The price of textbooks only.', 'The length of school holidays.', 'The number of exams.', 'A', 'Thong tin duoc neu dau tien trong doan van.'),
(6222, 612, 'reading_mcq', 'Digital Learning Platforms - Question 2: What study habit is mentioned as affected?', NULL, NULL, 2, 'When and where students study.', 'What sport students play.', 'How long the summer break is.', 'Where teachers live.', 'A', 'Thong tin lien quan den thoi quen hoc tap.'),
(6223, 612, 'reading_mcq', 'Digital Learning Platforms - Question 3: What benefit is highlighted for students in remote areas?', NULL, NULL, 3, 'Easier access to courses.', 'Free transportation.', 'Shorter school days.', 'More holidays.', 'A', 'Loi ich duoc neu cho hoc vien o vung xa.'),
(6224, 612, 'reading_mcq', 'Digital Learning Platforms - Question 4: What challenge is mentioned in the passage?', NULL, NULL, 4, 'Reliable internet access.', 'A shortage of teachers only.', 'Too many holidays.', 'Lack of interest in learning.', 'A', 'Thach thuc duoc neu ve ha tang cong nghe.'),
(6225, 612, 'reading_mcq', 'Digital Learning Platforms - Question 5: What does the passage suggest about the future?', NULL, NULL, 5, 'Online learning will keep growing.', 'Schools will close permanently.', 'Textbooks will disappear entirely.', 'Exams will be cancelled.', 'A', 'Du bao xu huong tuong lai trong doan van.'),

(6226, 613, 'reading_mcq', 'Coastal Wildlife Conservation - Question 1: What do the conservation groups monitor?', NULL, NULL, 1, 'Seabird and turtle populations.', 'Local restaurant menus.', 'Traffic on coastal roads.', 'Hotel occupancy rates.', 'A', 'Thong tin duoc neu ve doi tuong theo doi.'),
(6227, 613, 'reading_mcq', 'Coastal Wildlife Conservation - Question 2: Where does the monitoring take place?', NULL, NULL, 2, 'Along a coastal reserve.', 'Inside a shopping mall.', 'At a mountain resort.', 'In a city park.', 'A', 'Dia diem duoc neu trong doan van.'),
(6228, 613, 'reading_mcq', 'Coastal Wildlife Conservation - Question 3: Who carries out the monitoring work?', NULL, NULL, 3, 'Local conservation groups.', 'National sports teams.', 'Airport staff.', 'Bank employees.', 'A', 'Doi tuong thuc hien cong viec giam sat.'),
(6229, 613, 'reading_mcq', 'Coastal Wildlife Conservation - Question 4: What is one goal of the conservation project?', NULL, NULL, 4, 'Protecting nesting sites.', 'Building new hotels.', 'Increasing ticket prices.', 'Reducing bird numbers.', 'A', 'Muc tieu bao ton duoc neu trong doan van.'),
(6230, 613, 'reading_mcq', 'Coastal Wildlife Conservation - Question 5: What does the passage suggest about long-term success?', NULL, NULL, 5, 'It depends on continued community support.', 'It is guaranteed regardless of effort.', 'It has already failed completely.', 'It requires no funding at all.', 'A', 'Yeu to anh huong den thanh cong lau dai.'),

(6231, 614, 'reading_mcq', 'Retail Operations - Question 1: What does the inventory check confirm?', NULL, NULL, 1, 'Stock levels for popular items.', 'Employee vacation days.', 'Store opening hours only.', 'Customer complaint numbers.', 'A', 'Noi dung kiem tra ton kho duoc de cap.'),
(6232, 614, 'reading_mcq', 'Retail Operations - Question 2: What is mentioned about staff scheduling?', NULL, NULL, 2, 'Shifts are adjusted for peak hours.', 'All staff work the same shift.', 'Scheduling is done yearly.', 'There is no schedule at all.', 'A', 'Thong tin ve lich lam viec nhan vien.'),
(6233, 614, 'reading_mcq', 'Retail Operations - Question 3: What does the customer service policy emphasize?', NULL, NULL, 3, 'Quick response to complaints.', 'Ignoring customer feedback.', 'Charging extra fees.', 'Limiting store hours.', 'A', 'Trong tam cua chinh sach cham soc khach hang.'),
(6234, 614, 'reading_mcq', 'Retail Operations - Question 4: What action is recommended for low-stock items?', NULL, NULL, 4, 'Reorder before running out.', 'Remove them permanently.', 'Double the price.', 'Ignore the shortage.', 'A', 'Hanh dong de xuat khi hang sap het.'),
(6235, 614, 'reading_mcq', 'Retail Operations - Question 5: What is the overall purpose of the documents?', NULL, NULL, 5, 'To keep store operations running smoothly.', 'To close the store permanently.', 'To reduce staff numbers.', 'To cancel customer service.', 'A', 'Muc dich chung cua bo tai lieu.'),

(6236, 615, 'reading_mcq', 'Travel and Hospitality - Question 1: What does the booking confirmation include?', NULL, NULL, 1, 'Check-in and check-out dates.', 'The hotel staff schedule.', 'A list of nearby restaurants only.', 'The hotel construction history.', 'A', 'Noi dung xac nhan dat phong.'),
(6237, 615, 'reading_mcq', 'Travel and Hospitality - Question 2: Why was the itinerary changed?', NULL, NULL, 2, 'A flight schedule change.', 'The hotel closed permanently.', 'The guest cancelled everything.', 'There was no reason given.', 'A', 'Ly do thay doi lich trinh.'),
(6238, 615, 'reading_mcq', 'Travel and Hospitality - Question 3: What did the guest request?', NULL, NULL, 3, 'A late check-out time.', 'A refund for the whole stay.', 'A different hotel entirely.', 'To cancel the reservation.', 'A', 'Yeu cau cua khach duoc neu trong tai lieu.'),
(6239, 615, 'reading_mcq', 'Travel and Hospitality - Question 4: How did the hotel respond to the request?', NULL, NULL, 4, 'It confirmed the request politely.', 'It refused without explanation.', 'It ignored the message.', 'It charged double the price.', 'A', 'Phan hoi cua khach san doi voi yeu cau.'),
(6240, 615, 'reading_mcq', 'Travel and Hospitality - Question 5: What is the main purpose of these documents?', NULL, NULL, 5, 'To manage a guest booking and requests.', 'To advertise a new hotel.', 'To cancel all future bookings.', 'To hire new hotel staff.', 'A', 'Muc dich chung cua bo tai lieu.'),

(6241, 616, 'reading_mcq', 'IT Support Communication - Question 1: What caused the system outage?', NULL, NULL, 1, 'A server issue mentioned in the email.', 'A scheduled office holiday.', 'A change in company logo.', 'A new employee starting work.', 'A', 'Nguyen nhan su co duoc neu trong email.'),
(6242, 616, 'reading_mcq', 'IT Support Communication - Question 2: What did the support ticket update report?', NULL, NULL, 2, 'Progress on fixing the issue.', 'A request for a pay raise.', 'A new marketing campaign.', 'A change in office location.', 'A', 'Noi dung cap nhat ticket ho tro.'),
(6243, 616, 'reading_mcq', 'IT Support Communication - Question 3: Who was responsible for resolving the issue?', NULL, NULL, 3, 'The IT support team.', 'The marketing department.', 'External customers.', 'The delivery driver.', 'A', 'Bo phan chiu trach nhiem xu ly.'),
(6244, 616, 'reading_mcq', 'IT Support Communication - Question 4: What was the final resolution step?', NULL, NULL, 4, 'Restarting the affected server.', 'Closing the office early.', 'Cancelling all meetings.', 'Changing the company name.', 'A', 'Buoc xu ly cuoi cung duoc neu.'),
(6245, 616, 'reading_mcq', 'IT Support Communication - Question 5: What is the overall purpose of the emails?', NULL, NULL, 5, 'To communicate and resolve a technical issue.', 'To announce a company merger.', 'To advertise a new product.', 'To plan a company trip.', 'A', 'Muc dich chung cua chuoi email.'),

(6246, 617, 'mcq', 'Daily Routines - Question 1: What time do you usually wake up on weekdays?', NULL, NULL, 1, 'Around 6-7 in the morning for most people.', 'Never on weekdays.', 'Only on weekends.', 'It is not related to routines.', 'A', 'Cau tra loi pho bien nhat theo ngu canh thoi quen hang ngay.'),
(6247, 617, 'mcq', 'Daily Routines - Question 2: Which sentence best describes a morning habit?', NULL, NULL, 2, 'I always have coffee before work.', 'I never leave the house.', 'I sleep during the day only.', 'I do not eat breakfast ever.', 'A', 'Cau mo ta thoi quen buoi sang tu nhien nhat.'),
(6248, 617, 'mcq', 'Daily Routines - Question 3: Choose the best response to "What do you do after work?"', NULL, NULL, 3, 'I usually go to the gym or relax at home.', 'I am not a person.', 'It is very expensive.', 'That is not mine.', 'A', 'Cau tra loi hop ly cho cau hoi ve thoi quen sau gio lam.'),
(6249, 617, 'mcq', 'Daily Routines - Question 4: Choose the best way to describe a weekly habit.', NULL, NULL, 4, 'I go grocery shopping every Sunday.', 'I never buy food.', 'I do not have a schedule.', 'That is impossible.', 'A', 'Mo ta thoi quen hang tuan hop ly.'),
(6250, 617, 'mcq', 'Daily Routines - Question 5: Choose the best response to "Do you exercise regularly?"', NULL, NULL, 5, 'Yes, I jog three times a week.', 'I dislike all colors.', 'It is on the table.', 'She lives far away.', 'A', 'Cau tra loi phu hop ve tan suat tap the duc.'),

(6251, 618, 'mcq', 'Directions - Question 1: Choose the best response to "How do I get to the station?"', NULL, NULL, 1, 'Go straight and turn left at the corner.', 'It is very old.', 'I like that color.', 'She is my sister.', 'A', 'Cau chi duong pho bien nhat.'),
(6252, 618, 'mcq', 'Directions - Question 2: Which phrase means turning right?', NULL, NULL, 2, 'Turn right at the next intersection.', 'Stay where you are.', 'Go back the way you came.', 'Stop immediately.', 'A', 'Cum tu chi huong re phai.'),
(6253, 618, 'mcq', 'Directions - Question 3: Choose the best question to ask when lost.', NULL, NULL, 3, 'Excuse me, could you tell me the way to the airport?', 'What is your name?', 'How old are you?', 'Do you like coffee?', 'A', 'Cau hoi phu hop khi can hoi duong.'),
(6254, 618, 'mcq', 'Directions - Question 4: Choose the best response confirming a location.', NULL, NULL, 4, 'Yes, it is just around the corner.', 'I do not know you.', 'That is not possible.', 'I refuse to answer.', 'A', 'Cau xac nhan vi tri gan do.'),
(6255, 618, 'mcq', 'Directions - Question 5: Choose the best way to describe distance.', NULL, NULL, 5, 'It is about a ten-minute walk from here.', 'It never existed.', 'That is not correct at all.', 'I have no idea what that means.', 'A', 'Cach mo ta khoang cach hop ly.'),

(6256, 619, 'mcq', 'Shopping - Question 1: Choose the best response to "Can I help you find something?"', NULL, NULL, 1, 'Yes, I am looking for a jacket.', 'I do not like shopping.', 'That is very old.', 'She is not here.', 'A', 'Cau tra loi phu hop khi duoc nhan vien ho tro.'),
(6257, 619, 'mcq', 'Shopping - Question 2: Choose the best question to ask about price.', NULL, NULL, 2, 'How much does this cost?', 'What is your name?', 'Where do you live?', 'What time is it?', 'A', 'Cau hoi hoi gia pho bien.'),
(6258, 619, 'mcq', 'Shopping - Question 3: Choose the best response when something is too expensive.', NULL, NULL, 3, 'Do you have a cheaper option?', 'I will buy ten of them.', 'That is very cheap.', 'I do not need money.', 'A', 'Cau phan hoi khi gia qua cao.'),
(6259, 619, 'mcq', 'Shopping - Question 4: Choose the best way to ask about a return policy.', NULL, NULL, 4, 'Can I return this if it does not fit?', 'Is this a restaurant?', 'Do you sell cars here?', 'What time do you sleep?', 'A', 'Cau hoi ve chinh sach doi/tra hang.'),
(6260, 619, 'mcq', 'Shopping - Question 5: Choose the best response to "Will that be cash or card?"', NULL, NULL, 5, 'Card, please.', 'I do not want anything.', 'That is not mine.', 'I am not shopping.', 'A', 'Cau tra loi phu hop khi thanh toan.'),

(6261, 620, 'mcq', 'Office Basics - Question 1: Choose the best greeting for a colleague in the morning.', NULL, NULL, 1, 'Good morning, how are you today?', 'Goodbye forever.', 'I am busy, leave me alone.', 'Who are you?', 'A', 'Cau chao pho bien noi cong so.'),
(6262, 620, 'mcq', 'Office Basics - Question 2: Choose the best way to ask for help with a task.', NULL, NULL, 2, 'Could you help me with this report?', 'Do it yourself.', 'I refuse to work.', 'That is not my job, ever.', 'A', 'Cau nho su tro giup lich su.'),
(6263, 620, 'mcq', 'Office Basics - Question 3: Choose the best response to "Can we reschedule the meeting?"', NULL, NULL, 3, 'Sure, what time works for you?', 'Never contact me again.', 'I do not attend meetings.', 'That is impossible forever.', 'A', 'Cau phan hoi linh hoat ve doi lich hop.'),
(6264, 620, 'mcq', 'Office Basics - Question 4: Choose the best way to end a work email politely.', NULL, NULL, 4, 'Best regards,', 'Whatever,', 'Bye forever,', 'Not interested,', 'A', 'Cach ket thuc email cong viec lich su.'),
(6265, 620, 'mcq', 'Office Basics - Question 5: Choose the best response when you agree with a colleague''s idea.', NULL, NULL, 5, 'That sounds like a great idea.', 'I disagree with everything.', 'That is a terrible idea.', 'I do not care at all.', 'A', 'Cau dong y mang tinh xay dung.'),

(6266, 621, 'mcq', 'Which syllable is stressed in "MANager"?', NULL, NULL, 1, 'First syllable', 'Second syllable', 'Third syllable', 'No stress', 'A', 'Danh tu 3 am tiet "manager" nhan trong am o am tiet dau.'),
(6267, 621, 'mcq', 'Which syllable is stressed in "manaGERial"?', NULL, NULL, 2, 'First syllable', 'Second syllable', 'Third syllable', 'Fourth syllable', 'C', 'Tinh tu "managerial" nhan trong am o am tiet thu ba.'),
(6268, 621, 'mcq', 'Which syllable is stressed in "inforMAtion"?', NULL, NULL, 3, 'First syllable', 'Second syllable', 'Third syllable', 'Fourth syllable', 'C', 'Danh tu tan cung -tion nhan trong am o am tiet ngay truoc -tion.'),
(6269, 621, 'mcq', 'Which syllable is stressed in "DEVelop"?', NULL, NULL, 4, 'First syllable', 'Second syllable', 'Third syllable', 'No stress', 'A', 'Dong tu "develop" nhan trong am o am tiet dau.'),
(6270, 621, 'mcq', 'Which syllable is stressed in "developMENT"?', NULL, NULL, 5, 'First syllable', 'Second syllable', 'Third syllable', 'Fourth syllable', 'C', 'Danh tu "development" giu nguyen trong am nhu dong tu goc "develop".');

-- ---------------------------------------------------------------------
-- Phần 2: xóa mọi dòng quiz_classes/test_classes bị lệch loại so với
-- course_type của lớp (nguyên nhân chính của bug được báo cáo).
-- ---------------------------------------------------------------------
DELETE qc FROM `quiz_classes` qc
JOIN `quizzes` q ON q.quiz_id = qc.quiz_id
JOIN `classes` cl ON cl.class_id = qc.class_id
JOIN `courses` co ON co.course_id = cl.course_id
WHERE q.type <> co.course_type;

DELETE tc FROM `test_classes` tc
JOIN `mock_tests` mt ON mt.test_id = tc.mock_test_id
JOIN `classes` cl ON cl.class_id = tc.class_id
JOIN `courses` co ON co.course_id = cl.course_id
WHERE mt.type <> co.course_type;

-- ---------------------------------------------------------------------
-- Phần 3: gán lại cho đủ tối thiểu 3 quiz / 5 mock test ĐÚNG LOẠI cho
-- từng lớp, dùng đúng course_type để chọn ứng viên.
-- ---------------------------------------------------------------------
DELIMITER $$

DROP PROCEDURE IF EXISTS `sp_topup_quiz_classes_typed` $$
CREATE PROCEDURE `sp_topup_quiz_classes_typed`()
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE v_class_id INT;
  DECLARE v_course_type VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
  DECLARE v_deficit INT;
  DECLARE v_next_id INT;
  DECLARE v_pool_size INT;
  DECLARE v_offset INT;
  DECLARE v_pick INT;
  DECLARE v_seq INT;
  DECLARE v_try INT;
  DECLARE cur CURSOR FOR
    SELECT cl.class_id, co.course_type,
           3 - COUNT(DISTINCT qc.quiz_id) AS deficit
    FROM `classes` cl
    JOIN `courses` co ON co.course_id = cl.course_id
    LEFT JOIN `quiz_classes` qc ON qc.class_id = cl.class_id
    LEFT JOIN `quizzes` q ON q.quiz_id = qc.quiz_id AND q.status = 'active' AND q.type = co.course_type
    GROUP BY cl.class_id, co.course_type
    HAVING deficit > 0;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  SELECT COALESCE(MAX(quiz_class_id), 0) + 1 INTO v_next_id FROM `quiz_classes`;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO v_class_id, v_course_type, v_deficit;
    IF done THEN
      LEAVE read_loop;
    END IF;

    SELECT COUNT(*) INTO v_pool_size FROM `quizzes` WHERE type = v_course_type AND status = 'active';
    IF v_pool_size > 0 THEN
      SET v_seq = 1;
      SET v_try = 0;
      WHILE v_seq <= v_deficit AND v_try < (v_pool_size * 2) DO
        SET v_offset = (v_class_id + v_try) MOD v_pool_size;
        SELECT quiz_id INTO v_pick FROM `quizzes`
        WHERE type = v_course_type AND status = 'active'
        ORDER BY quiz_id LIMIT 1 OFFSET v_offset;

        IF NOT EXISTS (SELECT 1 FROM `quiz_classes` WHERE quiz_id = v_pick AND class_id = v_class_id) THEN
          INSERT INTO `quiz_classes` (`quiz_class_id`, `quiz_id`, `class_id`, `open_time`, `close_time`, `created_at`)
          VALUES (v_next_id, v_pick, v_class_id, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), NOW());
          SET v_next_id = v_next_id + 1;
          SET v_seq = v_seq + 1;
        END IF;
        SET v_try = v_try + 1;
      END WHILE;
    END IF;
  END LOOP;
  CLOSE cur;
END $$

DROP PROCEDURE IF EXISTS `sp_topup_test_classes_typed` $$
CREATE PROCEDURE `sp_topup_test_classes_typed`()
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE v_class_id INT;
  DECLARE v_course_type VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
  DECLARE v_deficit INT;
  DECLARE v_next_id INT;
  DECLARE v_pool_size INT;
  DECLARE v_offset INT;
  DECLARE v_pick INT;
  DECLARE v_seq INT;
  DECLARE v_try INT;
  DECLARE cur CURSOR FOR
    SELECT cl.class_id, co.course_type,
           5 - COUNT(DISTINCT tc.mock_test_id) AS deficit
    FROM `classes` cl
    JOIN `courses` co ON co.course_id = cl.course_id
    LEFT JOIN `test_classes` tc ON tc.class_id = cl.class_id
    LEFT JOIN `mock_tests` mt ON mt.test_id = tc.mock_test_id
      AND mt.status = 'active' AND mt.is_placement_pool = 0 AND mt.type = co.course_type
    GROUP BY cl.class_id, co.course_type
    HAVING deficit > 0;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  SELECT COALESCE(MAX(test_class_id), 0) + 1 INTO v_next_id FROM `test_classes`;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO v_class_id, v_course_type, v_deficit;
    IF done THEN
      LEAVE read_loop;
    END IF;

    SELECT COUNT(*) INTO v_pool_size FROM `mock_tests`
    WHERE type = v_course_type AND status = 'active' AND is_placement_pool = 0;
    IF v_pool_size > 0 THEN
      SET v_seq = 1;
      SET v_try = 0;
      WHILE v_seq <= v_deficit AND v_try < (v_pool_size * 2) DO
        SET v_offset = (v_class_id + v_try) MOD v_pool_size;
        SELECT test_id INTO v_pick FROM `mock_tests`
        WHERE type = v_course_type AND status = 'active' AND is_placement_pool = 0
        ORDER BY test_id LIMIT 1 OFFSET v_offset;

        IF NOT EXISTS (SELECT 1 FROM `test_classes` WHERE mock_test_id = v_pick AND class_id = v_class_id) THEN
          INSERT INTO `test_classes` (`test_class_id`, `mock_test_id`, `class_id`, `open_time`, `close_time`, `created_at`)
          VALUES (v_next_id, v_pick, v_class_id, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), NOW());
          SET v_next_id = v_next_id + 1;
          SET v_seq = v_seq + 1;
        END IF;
        SET v_try = v_try + 1;
      END WHILE;
    END IF;
  END LOOP;
  CLOSE cur;
END $$

DELIMITER ;

CALL `sp_topup_quiz_classes_typed`();
CALL `sp_topup_test_classes_typed`();

DROP PROCEDURE IF EXISTS `sp_topup_quiz_classes_typed`;
DROP PROCEDURE IF EXISTS `sp_topup_test_classes_typed`;

-- =====================================================================
-- Kiểm tra nhanh sau khi chạy
-- =====================================================================
SELECT 'Con lien ket quiz_classes/test_classes bi lech loai (ky vong: 0)' AS check_name;
SELECT COUNT(*) AS mismatched_quiz_links
FROM `quiz_classes` qc
JOIN `quizzes` q ON q.quiz_id = qc.quiz_id
JOIN `classes` cl ON cl.class_id = qc.class_id
JOIN `courses` co ON co.course_id = cl.course_id
WHERE q.type <> co.course_type;

SELECT COUNT(*) AS mismatched_test_links
FROM `test_classes` tc
JOIN `mock_tests` mt ON mt.test_id = tc.mock_test_id
JOIN `classes` cl ON cl.class_id = tc.class_id
JOIN `courses` co ON co.course_id = cl.course_id
WHERE mt.type <> co.course_type;

SELECT 'Lop CHUA du 3 quiz / 5 mock test dung loai (ky vong: rong)' AS check_name;
SELECT cl.class_id, co.course_type,
  (SELECT COUNT(DISTINCT qc.quiz_id) FROM quiz_classes qc JOIN quizzes q ON q.quiz_id=qc.quiz_id AND q.status='active' AND q.type=co.course_type WHERE qc.class_id=cl.class_id) AS quiz_count,
  (SELECT COUNT(DISTINCT tc.mock_test_id) FROM test_classes tc JOIN mock_tests mt ON mt.test_id=tc.mock_test_id AND mt.status='active' AND mt.is_placement_pool=0 AND mt.type=co.course_type WHERE tc.class_id=cl.class_id) AS mock_test_count
FROM `classes` cl JOIN `courses` co ON co.course_id = cl.course_id
HAVING quiz_count < 3 OR mock_test_count < 5;
