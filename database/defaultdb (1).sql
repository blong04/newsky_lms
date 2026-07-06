-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3306
-- Thời gian đã tạo: Th7 05, 2026 lúc 01:12 PM
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
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `assignments`
--

INSERT INTO `assignments` (`assign_id`, `class_id`, `title`, `description`, `assignment_type`, `due_date`, `max_score`, `status`, `created_at`, `updated_at`) VALUES
(1, 21, 'IELTS Reading — True/False/Not Given', 'Read the passage about climate change and answer 13 questions.\n\n**PASSAGE:**\nClimate change represents one of the most significant challenges facing humanity today. Scientific evidence overwhelmingly indicates that global temperatures have risen by approximately 1.1°C since pre-industrial times, primarily due to human activities such as burning fossil fuels, deforestation, and industrial processes. The consequences of this warming are already visible: melting ice caps, rising sea levels, more frequent extreme weather events, and disruption to ecosystems worldwide.\n\nGovernments around the world have responded with varying degrees of urgency. The Paris Agreement of 2015 committed nearly 200 nations to limit global warming to well below 2°C above pre-industrial levels. However, critics argue that the pledges made are insufficient and that more radical action is required immediately.\n\nRenewable energy technologies have advanced dramatically in recent decades. Solar and wind power are now cost-competitive with fossil fuels in many regions, and electric vehicles are becoming increasingly mainstream. Nevertheless, the transition to a low-carbon economy requires massive investment and significant changes to infrastructure, policy, and individual behavior.', 'True/False/NG + Short Answer', '2026-04-03 23:22:20', 13.00, 'active', '2026-03-29 23:22:20', '2026-03-29 23:22:20'),
(2, 21, 'IELTS Reading — Matching Headings', 'Match each paragraph (A–F) with the correct heading from the list below. There are more headings than paragraphs.\n\n**PASSAGE — Urban Farming:**\n**A.** Urban farming has experienced a remarkable resurgence in cities worldwide. What was once considered a relic of wartime necessity has transformed into a sophisticated movement driven by concerns about food security, environmental sustainability, and community wellbeing.\n\n**B.** The methods employed by urban farmers are extraordinarily diverse. Rooftop gardens in Manhattan grow tomatoes and herbs; vertical farms in Singapore produce lettuce under LED lights; community allotments in London yield vegetables for dozens of families. Each approach reflects local conditions, available technology, and community needs.\n\n**C.** Economic viability remains a persistent challenge. Land costs in urban areas are prohibitive, and competition from industrial agriculture — which benefits from economies of scale — makes profitability difficult. Many urban farms operate as social enterprises or nonprofits rather than traditional businesses.\n\n**D.** The environmental benefits of urban agriculture are frequently cited but deserve scrutiny. Reducing food miles does lower carbon emissions from transportation, but the energy requirements of controlled-environment agriculture can sometimes exceed those of conventional farming.\n\n**E.** Community gardens have demonstrated measurable social benefits beyond food production. Studies consistently show reduced social isolation, improved mental health outcomes, and stronger neighborhood cohesion in areas with active community gardens.\n\n**F.** Policy frameworks are evolving to support urban agriculture. Several major cities have amended zoning laws, offered tax incentives, or incorporated food production into building codes for new developments.', 'Matching Headings', '2026-04-04 23:22:20', 6.00, 'active', '2026-03-29 23:22:20', '2026-03-29 23:22:20'),
(3, 21, 'IELTS Writing Task 1 — Bar Chart', 'The bar chart below shows the percentage of households with internet access in five European countries in 2005, 2010, and 2020.\n\n**Data:**\n| Country | 2005 | 2010 | 2020 |\n|---------|------|------|------|\n| UK | 55% | 77% | 96% |\n| Germany | 62% | 80% | 92% |\n| France | 41% | 68% | 91% |\n| Spain | 35% | 59% | 87% |\n| Italy | 28% | 53% | 78% |\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant. **Write at least 150 words.**', 'Writing Task 1', '2026-04-02 23:22:20', 9.00, 'active', '2026-03-29 23:22:20', '2026-03-29 23:22:20'),
(4, 21, 'IELTS Writing Task 2 — Opinion Essay', 'Some people believe that university education should be free for all students, while others argue that students should pay tuition fees.\n\nDiscuss both views and give your own opinion.\n\n**Requirements:**\n- Write at least 250 words\n- Include an introduction, 2 body paragraphs, and a conclusion\n- Support your arguments with specific examples\n- Use a range of vocabulary and grammatical structures\n\n**Assessment criteria:** Task Achievement (25%), Coherence & Cohesion (25%), Lexical Resource (25%), Grammatical Range & Accuracy (25%)', 'Writing Task 2', '2026-04-05 23:22:20', 9.00, 'active', '2026-03-29 23:22:20', '2026-03-29 23:22:20'),
(5, 24, 'TOEIC Part 5 — Incomplete Sentences (30 câu)', 'Choose the best word or phrase to complete each sentence. You have **20 minutes** to complete all 30 questions.\n\n**Instructions:**\n- Read each sentence carefully\n- Choose ONE answer from options A, B, C, or D\n- Consider grammar, vocabulary, and context\n- Do not spend too long on any single question\n\n*This assignment tests: Parts of speech, Verb tenses, Prepositions, Conjunctions, Vocabulary in context*', 'Part 5', '2026-04-01 23:22:20', 30.00, 'active', '2026-03-29 23:22:20', '2026-03-29 23:22:20'),
(6, 24, 'TOEIC Part 6 — Text Completion (4 đoạn văn, 16 câu)', 'Read each text and choose the best word or phrase for each blank.\n\n**Email 1 — Subject: Project Update**\nDear Mr. Thompson,\nI am writing to provide you with an update ___(1)___ the Henderson account. As discussed in last week\'s meeting, our team has been working diligently to address the concerns ___(2)___ by the client. We have implemented the three recommendations from your report and ___(3)___ see significant improvements in customer satisfaction metrics. A detailed report will be ___(4)___ to all stakeholders by Friday.\n\nBest regards, Sarah Chen\n\n**Answer options provided in class session.*', 'Part 6', '2026-04-03 23:22:20', 16.00, 'active', '2026-03-29 23:22:20', '2026-03-29 23:22:20'),
(7, 24, 'TOEIC Part 7 — Reading Comprehension (Single Passage)', 'Read the following notice and answer questions 1-4.\n\n**NOTICE — Hillside Community Center**\n\nATTENTION ALL MEMBERS\n\nPlease be advised that the Community Center will be closed for renovations from Monday, April 7 to Friday, April 18. During this period, all scheduled fitness classes will be held at Riverside Sports Complex, located at 245 River Road (10-minute walk from our main entrance).\n\nMembers who have prepaid for classes during the closure period will receive a two-week extension on their membership. No action is required — extensions will be applied automatically to all affected accounts.\n\nThe café and library services will remain accessible via the side entrance on Oak Street during the first week of renovations only.\n\nWe apologize for any inconvenience and appreciate your patience.\n\n— Management, Hillside Community Center\n\n**Questions:**\n1. What is the main purpose of this notice?\n2. How long will the renovation take?\n3. What will happen to members with prepaid classes?\n4. Which services will be partially available during the closure?', 'Part 7', '2026-04-04 23:22:20', 4.00, 'active', '2026-03-29 23:22:20', '2026-03-29 23:22:20'),
(8, 21, 'IELTS Reading — True/False/Not Given', 'Read the passage about climate change and answer 13 questions.\n\n**PASSAGE:**\nClimate change represents one of the most significant challenges facing humanity today. Scientific evidence overwhelmingly indicates that global temperatures have risen by approximately 1.1°C since pre-industrial times, primarily due to human activities such as burning fossil fuels, deforestation, and industrial processes. The consequences of this warming are already visible: melting ice caps, rising sea levels, more frequent extreme weather events, and disruption to ecosystems worldwide.\n\nGovernments around the world have responded with varying degrees of urgency. The Paris Agreement of 2015 committed nearly 200 nations to limit global warming to well below 2°C above pre-industrial levels. However, critics argue that the pledges made are insufficient and that more radical action is required immediately.\n\nRenewable energy technologies have advanced dramatically in recent decades. Solar and wind power are now cost-competitive with fossil fuels in many regions, and electric vehicles are becoming increasingly mainstream. Nevertheless, the transition to a low-carbon economy requires massive investment and significant changes to infrastructure, policy, and individual behavior.', 'True/False/NG + Short Answer', '2026-04-03 23:30:49', 13.00, 'active', '2026-03-29 23:30:49', '2026-03-29 23:30:49'),
(9, 21, 'IELTS Reading — Matching Headings', 'Match each paragraph (A–F) with the correct heading from the list below. There are more headings than paragraphs.\n\n**PASSAGE — Urban Farming:**\n**A.** Urban farming has experienced a remarkable resurgence in cities worldwide. What was once considered a relic of wartime necessity has transformed into a sophisticated movement driven by concerns about food security, environmental sustainability, and community wellbeing.\n\n**B.** The methods employed by urban farmers are extraordinarily diverse. Rooftop gardens in Manhattan grow tomatoes and herbs; vertical farms in Singapore produce lettuce under LED lights; community allotments in London yield vegetables for dozens of families. Each approach reflects local conditions, available technology, and community needs.\n\n**C.** Economic viability remains a persistent challenge. Land costs in urban areas are prohibitive, and competition from industrial agriculture — which benefits from economies of scale — makes profitability difficult. Many urban farms operate as social enterprises or nonprofits rather than traditional businesses.\n\n**D.** The environmental benefits of urban agriculture are frequently cited but deserve scrutiny. Reducing food miles does lower carbon emissions from transportation, but the energy requirements of controlled-environment agriculture can sometimes exceed those of conventional farming.\n\n**E.** Community gardens have demonstrated measurable social benefits beyond food production. Studies consistently show reduced social isolation, improved mental health outcomes, and stronger neighborhood cohesion in areas with active community gardens.\n\n**F.** Policy frameworks are evolving to support urban agriculture. Several major cities have amended zoning laws, offered tax incentives, or incorporated food production into building codes for new developments.', 'Matching Headings', '2026-04-04 23:30:49', 6.00, 'active', '2026-03-29 23:30:49', '2026-03-29 23:30:49'),
(10, 21, 'IELTS Writing Task 1 — Bar Chart', 'The bar chart below shows the percentage of households with internet access in five European countries in 2005, 2010, and 2020.\n\n**Data:**\n| Country | 2005 | 2010 | 2020 |\n|---------|------|------|------|\n| UK | 55% | 77% | 96% |\n| Germany | 62% | 80% | 92% |\n| France | 41% | 68% | 91% |\n| Spain | 35% | 59% | 87% |\n| Italy | 28% | 53% | 78% |\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant. **Write at least 150 words.**', 'Writing Task 1', '2026-04-02 23:30:49', 9.00, 'active', '2026-03-29 23:30:49', '2026-03-29 23:30:49'),
(11, 21, 'IELTS Writing Task 2 — Opinion Essay', 'Some people believe that university education should be free for all students, while others argue that students should pay tuition fees.\n\nDiscuss both views and give your own opinion.\n\n**Requirements:**\n- Write at least 250 words\n- Include an introduction, 2 body paragraphs, and a conclusion\n- Support your arguments with specific examples\n- Use a range of vocabulary and grammatical structures\n\n**Assessment criteria:** Task Achievement (25%), Coherence & Cohesion (25%), Lexical Resource (25%), Grammatical Range & Accuracy (25%)', 'Writing Task 2', '2026-04-05 23:30:49', 9.00, 'active', '2026-03-29 23:30:49', '2026-03-29 23:30:49'),
(12, 24, 'TOEIC Part 5 — Incomplete Sentences (30 câu)', 'Choose the best word or phrase to complete each sentence. You have **20 minutes** to complete all 30 questions.\n\n**Instructions:**\n- Read each sentence carefully\n- Choose ONE answer from options A, B, C, or D\n- Consider grammar, vocabulary, and context\n- Do not spend too long on any single question\n\n*This assignment tests: Parts of speech, Verb tenses, Prepositions, Conjunctions, Vocabulary in context*', 'Part 5', '2026-04-01 23:30:49', 30.00, 'active', '2026-03-29 23:30:49', '2026-03-29 23:30:49'),
(13, 24, 'TOEIC Part 6 — Text Completion (4 đoạn văn, 16 câu)', 'Read each text and choose the best word or phrase for each blank.\n\n**Email 1 — Subject: Project Update**\nDear Mr. Thompson,\nI am writing to provide you with an update ___(1)___ the Henderson account. As discussed in last week\'s meeting, our team has been working diligently to address the concerns ___(2)___ by the client. We have implemented the three recommendations from your report and ___(3)___ see significant improvements in customer satisfaction metrics. A detailed report will be ___(4)___ to all stakeholders by Friday.\n\nBest regards, Sarah Chen\n\n**Answer options provided in class session.*', 'Part 6', '2026-04-03 23:30:49', 16.00, 'active', '2026-03-29 23:30:49', '2026-03-29 23:30:49'),
(14, 24, 'TOEIC Part 7 — Reading Comprehension (Single Passage)', 'Read the following notice and answer questions 1-4.\n\n**NOTICE — Hillside Community Center**\n\nATTENTION ALL MEMBERS\n\nPlease be advised that the Community Center will be closed for renovations from Monday, April 7 to Friday, April 18. During this period, all scheduled fitness classes will be held at Riverside Sports Complex, located at 245 River Road (10-minute walk from our main entrance).\n\nMembers who have prepaid for classes during the closure period will receive a two-week extension on their membership. No action is required — extensions will be applied automatically to all affected accounts.\n\nThe café and library services will remain accessible via the side entrance on Oak Street during the first week of renovations only.\n\nWe apologize for any inconvenience and appreciate your patience.\n\n— Management, Hillside Community Center\n\n**Questions:**\n1. What is the main purpose of this notice?\n2. How long will the renovation take?\n3. What will happen to members with prepaid classes?\n4. Which services will be partially available during the closure?', 'Part 7', '2026-04-04 23:30:49', 4.00, 'active', '2026-03-29 23:30:49', '2026-03-29 23:30:49'),
(15, 21, 'IELTS Reading — True/False/Not Given', 'Read the passage about climate change and answer 13 questions.\n\n**PASSAGE:**\nClimate change represents one of the most significant challenges facing humanity today. Scientific evidence overwhelmingly indicates that global temperatures have risen by approximately 1.1°C since pre-industrial times, primarily due to human activities such as burning fossil fuels, deforestation, and industrial processes. The consequences of this warming are already visible: melting ice caps, rising sea levels, more frequent extreme weather events, and disruption to ecosystems worldwide.\n\nGovernments around the world have responded with varying degrees of urgency. The Paris Agreement of 2015 committed nearly 200 nations to limit global warming to well below 2°C above pre-industrial levels. However, critics argue that the pledges made are insufficient and that more radical action is required immediately.\n\nRenewable energy technologies have advanced dramatically in recent decades. Solar and wind power are now cost-competitive with fossil fuels in many regions, and electric vehicles are becoming increasingly mainstream. Nevertheless, the transition to a low-carbon economy requires massive investment and significant changes to infrastructure, policy, and individual behavior.', 'True/False/NG + Short Answer', '2026-04-03 23:35:26', 13.00, 'active', '2026-03-29 23:35:26', '2026-03-29 23:35:26'),
(16, 21, 'IELTS Reading — Matching Headings', 'Match each paragraph (A–F) with the correct heading from the list below. There are more headings than paragraphs.\n\n**PASSAGE — Urban Farming:**\n**A.** Urban farming has experienced a remarkable resurgence in cities worldwide. What was once considered a relic of wartime necessity has transformed into a sophisticated movement driven by concerns about food security, environmental sustainability, and community wellbeing.\n\n**B.** The methods employed by urban farmers are extraordinarily diverse. Rooftop gardens in Manhattan grow tomatoes and herbs; vertical farms in Singapore produce lettuce under LED lights; community allotments in London yield vegetables for dozens of families. Each approach reflects local conditions, available technology, and community needs.\n\n**C.** Economic viability remains a persistent challenge. Land costs in urban areas are prohibitive, and competition from industrial agriculture — which benefits from economies of scale — makes profitability difficult. Many urban farms operate as social enterprises or nonprofits rather than traditional businesses.\n\n**D.** The environmental benefits of urban agriculture are frequently cited but deserve scrutiny. Reducing food miles does lower carbon emissions from transportation, but the energy requirements of controlled-environment agriculture can sometimes exceed those of conventional farming.\n\n**E.** Community gardens have demonstrated measurable social benefits beyond food production. Studies consistently show reduced social isolation, improved mental health outcomes, and stronger neighborhood cohesion in areas with active community gardens.\n\n**F.** Policy frameworks are evolving to support urban agriculture. Several major cities have amended zoning laws, offered tax incentives, or incorporated food production into building codes for new developments.', 'Matching Headings', '2026-04-04 23:35:26', 6.00, 'active', '2026-03-29 23:35:26', '2026-03-29 23:35:26'),
(17, 21, 'IELTS Writing Task 1 — Bar Chart', 'The bar chart below shows the percentage of households with internet access in five European countries in 2005, 2010, and 2020.\n\n**Data:**\n| Country | 2005 | 2010 | 2020 |\n|---------|------|------|------|\n| UK | 55% | 77% | 96% |\n| Germany | 62% | 80% | 92% |\n| France | 41% | 68% | 91% |\n| Spain | 35% | 59% | 87% |\n| Italy | 28% | 53% | 78% |\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant. **Write at least 150 words.**', 'Writing Task 1', '2026-04-02 23:35:26', 9.00, 'active', '2026-03-29 23:35:26', '2026-03-29 23:35:26'),
(18, 21, 'IELTS Writing Task 2 — Opinion Essay', 'Some people believe that university education should be free for all students, while others argue that students should pay tuition fees.\n\nDiscuss both views and give your own opinion.\n\n**Requirements:**\n- Write at least 250 words\n- Include an introduction, 2 body paragraphs, and a conclusion\n- Support your arguments with specific examples\n- Use a range of vocabulary and grammatical structures\n\n**Assessment criteria:** Task Achievement (25%), Coherence & Cohesion (25%), Lexical Resource (25%), Grammatical Range & Accuracy (25%)', 'Writing Task 2', '2026-04-05 23:35:26', 9.00, 'active', '2026-03-29 23:35:26', '2026-03-29 23:35:26'),
(19, 24, 'TOEIC Part 5 — Incomplete Sentences (30 câu)', 'Choose the best word or phrase to complete each sentence. You have **20 minutes** to complete all 30 questions.\n\n**Instructions:**\n- Read each sentence carefully\n- Choose ONE answer from options A, B, C, or D\n- Consider grammar, vocabulary, and context\n- Do not spend too long on any single question\n\n*This assignment tests: Parts of speech, Verb tenses, Prepositions, Conjunctions, Vocabulary in context*', 'Part 5', '2026-04-01 23:35:26', 30.00, 'active', '2026-03-29 23:35:26', '2026-03-29 23:35:26'),
(20, 24, 'TOEIC Part 6 — Text Completion (4 đoạn văn, 16 câu)', 'Read each text and choose the best word or phrase for each blank.\n\n**Email 1 — Subject: Project Update**\nDear Mr. Thompson,\nI am writing to provide you with an update ___(1)___ the Henderson account. As discussed in last week\'s meeting, our team has been working diligently to address the concerns ___(2)___ by the client. We have implemented the three recommendations from your report and ___(3)___ see significant improvements in customer satisfaction metrics. A detailed report will be ___(4)___ to all stakeholders by Friday.\n\nBest regards, Sarah Chen\n\n**Answer options provided in class session.*', 'Part 6', '2026-04-03 23:35:26', 16.00, 'active', '2026-03-29 23:35:26', '2026-03-29 23:35:26'),
(21, 24, 'TOEIC Part 7 — Reading Comprehension (Single Passage)', 'Read the following notice and answer questions 1-4.\n\n**NOTICE — Hillside Community Center**\n\nATTENTION ALL MEMBERS\n\nPlease be advised that the Community Center will be closed for renovations from Monday, April 7 to Friday, April 18. During this period, all scheduled fitness classes will be held at Riverside Sports Complex, located at 245 River Road (10-minute walk from our main entrance).\n\nMembers who have prepaid for classes during the closure period will receive a two-week extension on their membership. No action is required — extensions will be applied automatically to all affected accounts.\n\nThe café and library services will remain accessible via the side entrance on Oak Street during the first week of renovations only.\n\nWe apologize for any inconvenience and appreciate your patience.\n\n— Management, Hillside Community Center\n\n**Questions:**\n1. What is the main purpose of this notice?\n2. How long will the renovation take?\n3. What will happen to members with prepaid classes?\n4. Which services will be partially available during the closure?', 'Part 7', '2026-04-04 23:35:26', 4.00, 'active', '2026-03-29 23:35:26', '2026-03-29 23:35:26'),
(22, 21, 'IELTS Reading — True/False/Not Given', 'Read the passage about climate change and answer 13 questions.\n\n**PASSAGE:**\nClimate change represents one of the most significant challenges facing humanity today. Scientific evidence overwhelmingly indicates that global temperatures have risen by approximately 1.1°C since pre-industrial times, primarily due to human activities such as burning fossil fuels, deforestation, and industrial processes. The consequences of this warming are already visible: melting ice caps, rising sea levels, more frequent extreme weather events, and disruption to ecosystems worldwide.\n\nGovernments around the world have responded with varying degrees of urgency. The Paris Agreement of 2015 committed nearly 200 nations to limit global warming to well below 2°C above pre-industrial levels. However, critics argue that the pledges made are insufficient and that more radical action is required immediately.\n\nRenewable energy technologies have advanced dramatically in recent decades. Solar and wind power are now cost-competitive with fossil fuels in many regions, and electric vehicles are becoming increasingly mainstream. Nevertheless, the transition to a low-carbon economy requires massive investment and significant changes to infrastructure, policy, and individual behavior.', 'True/False/NG + Short Answer', '2026-04-03 23:40:32', 13.00, 'active', '2026-03-29 23:40:32', '2026-03-29 23:40:32'),
(23, 21, 'IELTS Reading — Matching Headings', 'Match each paragraph (A–F) with the correct heading from the list below. There are more headings than paragraphs.\n\n**PASSAGE — Urban Farming:**\n**A.** Urban farming has experienced a remarkable resurgence in cities worldwide. What was once considered a relic of wartime necessity has transformed into a sophisticated movement driven by concerns about food security, environmental sustainability, and community wellbeing.\n\n**B.** The methods employed by urban farmers are extraordinarily diverse. Rooftop gardens in Manhattan grow tomatoes and herbs; vertical farms in Singapore produce lettuce under LED lights; community allotments in London yield vegetables for dozens of families. Each approach reflects local conditions, available technology, and community needs.\n\n**C.** Economic viability remains a persistent challenge. Land costs in urban areas are prohibitive, and competition from industrial agriculture — which benefits from economies of scale — makes profitability difficult. Many urban farms operate as social enterprises or nonprofits rather than traditional businesses.\n\n**D.** The environmental benefits of urban agriculture are frequently cited but deserve scrutiny. Reducing food miles does lower carbon emissions from transportation, but the energy requirements of controlled-environment agriculture can sometimes exceed those of conventional farming.\n\n**E.** Community gardens have demonstrated measurable social benefits beyond food production. Studies consistently show reduced social isolation, improved mental health outcomes, and stronger neighborhood cohesion in areas with active community gardens.\n\n**F.** Policy frameworks are evolving to support urban agriculture. Several major cities have amended zoning laws, offered tax incentives, or incorporated food production into building codes for new developments.', 'Matching Headings', '2026-04-04 23:40:32', 6.00, 'active', '2026-03-29 23:40:32', '2026-03-29 23:40:32'),
(24, 21, 'IELTS Writing Task 1 — Bar Chart', 'The bar chart below shows the percentage of households with internet access in five European countries in 2005, 2010, and 2020.\n\n**Data:**\n| Country | 2005 | 2010 | 2020 |\n|---------|------|------|------|\n| UK | 55% | 77% | 96% |\n| Germany | 62% | 80% | 92% |\n| France | 41% | 68% | 91% |\n| Spain | 35% | 59% | 87% |\n| Italy | 28% | 53% | 78% |\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant. **Write at least 150 words.**', 'Writing Task 1', '2026-04-02 23:40:32', 9.00, 'active', '2026-03-29 23:40:32', '2026-03-29 23:40:32'),
(25, 21, 'IELTS Writing Task 2 — Opinion Essay', 'Some people believe that university education should be free for all students, while others argue that students should pay tuition fees.\n\nDiscuss both views and give your own opinion.\n\n**Requirements:**\n- Write at least 250 words\n- Include an introduction, 2 body paragraphs, and a conclusion\n- Support your arguments with specific examples\n- Use a range of vocabulary and grammatical structures\n\n**Assessment criteria:** Task Achievement (25%), Coherence & Cohesion (25%), Lexical Resource (25%), Grammatical Range & Accuracy (25%)', 'Writing Task 2', '2026-04-05 23:40:32', 9.00, 'active', '2026-03-29 23:40:32', '2026-03-29 23:40:32'),
(26, 24, 'TOEIC Part 5 — Incomplete Sentences (30 câu)', 'Choose the best word or phrase to complete each sentence. You have **20 minutes** to complete all 30 questions.\n\n**Instructions:**\n- Read each sentence carefully\n- Choose ONE answer from options A, B, C, or D\n- Consider grammar, vocabulary, and context\n- Do not spend too long on any single question\n\n*This assignment tests: Parts of speech, Verb tenses, Prepositions, Conjunctions, Vocabulary in context*', 'Part 5', '2026-04-01 23:40:32', 30.00, 'active', '2026-03-29 23:40:32', '2026-03-29 23:40:32'),
(27, 24, 'TOEIC Part 6 — Text Completion (4 đoạn văn, 16 câu)', 'Read each text and choose the best word or phrase for each blank.\n\n**Email 1 — Subject: Project Update**\nDear Mr. Thompson,\nI am writing to provide you with an update ___(1)___ the Henderson account. As discussed in last week\'s meeting, our team has been working diligently to address the concerns ___(2)___ by the client. We have implemented the three recommendations from your report and ___(3)___ see significant improvements in customer satisfaction metrics. A detailed report will be ___(4)___ to all stakeholders by Friday.\n\nBest regards, Sarah Chen\n\n**Answer options provided in class session.*', 'Part 6', '2026-04-03 23:40:32', 16.00, 'active', '2026-03-29 23:40:32', '2026-03-29 23:40:32'),
(28, 24, 'TOEIC Part 7 — Reading Comprehension (Single Passage)', 'Read the following notice and answer questions 1-4.\n\n**NOTICE — Hillside Community Center**\n\nATTENTION ALL MEMBERS\n\nPlease be advised that the Community Center will be closed for renovations from Monday, April 7 to Friday, April 18. During this period, all scheduled fitness classes will be held at Riverside Sports Complex, located at 245 River Road (10-minute walk from our main entrance).\n\nMembers who have prepaid for classes during the closure period will receive a two-week extension on their membership. No action is required — extensions will be applied automatically to all affected accounts.\n\nThe café and library services will remain accessible via the side entrance on Oak Street during the first week of renovations only.\n\nWe apologize for any inconvenience and appreciate your patience.\n\n— Management, Hillside Community Center\n\n**Questions:**\n1. What is the main purpose of this notice?\n2. How long will the renovation take?\n3. What will happen to members with prepaid classes?\n4. Which services will be partially available during the closure?', 'Part 7', '2026-04-04 23:40:32', 4.00, 'active', '2026-03-29 23:40:32', '2026-03-29 23:40:32');

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
  `score` decimal(5,2) DEFAULT NULL,
  `feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`assign_submission_id`),
  KEY `fk_assignmentsubmit_assignment` (`assign_id`),
  KEY `fk_assignmentsubmit_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `assignment_submissions`
--

INSERT INTO `assignment_submissions` (`assign_submission_id`, `assign_id`, `user_id`, `content`, `score`, `feedback`, `status`, `submitted_at`, `updated_at`) VALUES
(1, 3, 1, 'The bar chart illustrates the proportion of households with internet connectivity across five European nations over a 15-year period from 2005 to 2020.\n\nOverall, all five countries experienced significant growth in internet access throughout this period, with the UK and Germany consistently maintaining the highest rates, while Italy showed the lowest penetration despite considerable improvement.\n\nIn 2005, Germany led with 62% of households connected, closely followed by the UK at 55%. France, Spain, and Italy had considerably lower rates of 41%, 35%, and 28% respectively. By 2010, all countries had made substantial progress: Germany reached 80% and the UK 77%, while France (68%), Spain (59%), and Italy (53%) had also improved markedly.\n\nThe most dramatic convergence occurred between 2010 and 2020. The UK achieved the highest rate of 96%, with Germany close behind at 92%. France and Spain reached 91% and 87% respectively, demonstrating impressive growth. Italy, while remaining lowest at 78%, had nevertheless nearly tripled its 2005 figure.\n\nIn conclusion, the data reveals a clear upward trajectory across all nations, with the gap between the highest and lowest performers narrowing from 34 percentage points in 2005 to just 18 points by 2020. (198 words)', 7.50, 'Excellent work! Task Achievement: 8 — accurately covers key features and comparisons. Coherence & Cohesion: 7.5 — well-organized with effective use of discourse markers. Lexical Resource: 7.5 — good range of vocabulary (\"penetration,\" \"convergence,\" \"trajectory\"). Grammar: 7.5 — mostly accurate with good variety. Minor improvement: could specify the overall change more precisely in the overview.', 'graded', '2026-03-27 23:35:27', '2026-03-29 23:35:27'),
(2, 4, 1, 'The question of whether higher education should be provided free of charge or funded through student fees is a contentious issue that divides opinion worldwide. This essay will examine arguments on both sides before presenting my own perspective.\n\nProponents of free university education contend that it promotes social equality by ensuring that talented individuals from disadvantaged backgrounds are not deterred by financial barriers. Countries such as Germany and Norway have successfully implemented fee-free systems, demonstrating its practical viability. Furthermore, a highly educated workforce benefits the entire society through increased productivity and innovation, suggesting that public funding represents a sound collective investment.\n\nConversely, advocates for tuition fees argue that students who directly benefit from their education should bear the associated costs. With limited government resources, free university education may come at the expense of other essential public services such as healthcare or primary education. Additionally, some economists suggest that students who pay fees are more motivated and selective in their course choices, potentially leading to better outcomes.\n\nIn my opinion, a balanced approach is most equitable. A needs-based funding model — where students from low-income families receive substantial financial support while those from affluent backgrounds contribute proportionally — addresses concerns of both access and sustainability. This approach, similar to models in Australia and the United Kingdom, ensures that ability, rather than wealth, determines educational opportunity.\n\nIn conclusion, while completely free university education has its merits, a carefully designed income-contingent funding system represents the most fair and practical solution. (243 words)', 7.00, 'Strong essay overall. Task Achievement: 7 — addresses both views and presents a clear position with a nuanced solution. Coherence: 7 — logical structure, good use of linking phrases. Lexical Resource: 7 — good academic vocabulary (\"contentious,\" \"viability,\" \"equitable,\" \"income-contingent\"). Grammar: 7 — generally accurate with some complex structures. Areas to improve: conclusions could be more developed; 243 words is just below the 250-word minimum — always aim slightly above.', 'graded', '2026-03-28 23:35:27', '2026-03-29 23:35:27'),
(3, 1, 1, 'Answers:\n1. TRUE — The classical model assumes humans always make optimal decisions\n2. FALSE — Research was in the 1970s, not 1980s\n3. TRUE — Availability heuristic causes overestimation of memorable events\n4. NOT GIVEN — Text does not mention whether Tversky shared the prize\n5. TRUE — Loss aversion: losing $100 causes ~2x more pain than gaining $100\n6. FALSE — Early researchers believed emotion INTERFERED with rational thought\n7. TRUE — Opt-out pension enrollment is mentioned as a nudge policy example\n8. Homo economicus\n9. heuristics\n10. loss aversion\n11. amygdala\n12. Behavioral economics\n13. nudge', 11.50, 'Excellent performance! 11.5/13 correct. Errors: Q4 — you answered NOT GIVEN correctly. Q12 — \"Behavioural economics\" (British spelling) also accepted. Strong understanding of the passage and question types. Review: for Short Answer questions, always check the word limit (NO MORE THAN THREE WORDS).', 'graded', '2026-03-26 23:35:27', '2026-03-29 23:35:27'),
(4, 5, 1, 'Answers:\n1.B 2.A 3.A 4.A 5.A 6.B 7.A 8.A 9.A 10.A 11.B 12.A 13.A 14.C 15.A 16.B 17.A 18.A 19.A 20.B 21.A 22.A 23.B 24.A 25.A 26.A 27.B 28.A 29.A 30.A', NULL, NULL, 'submitted', '2026-03-29 11:35:27', '2026-03-29 23:35:27'),
(5, 2, 1, 'Paragraph A — iv (The revival of urban farming)\nParagraph B — vii (Diverse cultivation techniques)\nParagraph C — i (Financial difficulties faced by urban farmers)\nParagraph D — vi (Questioning environmental claims)\nParagraph E — ii (Positive social outcomes)\nParagraph F — iii (Government support measures)', NULL, NULL, 'submitted', '2026-03-29 23:35:27', '2026-03-29 23:35:27'),
(6, 3, 1, 'The bar chart illustrates the proportion of households with internet connectivity across five European nations over a 15-year period from 2005 to 2020.\n\nOverall, all five countries experienced significant growth in internet access throughout this period, with the UK and Germany consistently maintaining the highest rates, while Italy showed the lowest penetration despite considerable improvement.\n\nIn 2005, Germany led with 62% of households connected, closely followed by the UK at 55%. France, Spain, and Italy had considerably lower rates of 41%, 35%, and 28% respectively. By 2010, all countries had made substantial progress: Germany reached 80% and the UK 77%, while France (68%), Spain (59%), and Italy (53%) had also improved markedly.\n\nThe most dramatic convergence occurred between 2010 and 2020. The UK achieved the highest rate of 96%, with Germany close behind at 92%. France and Spain reached 91% and 87% respectively, demonstrating impressive growth. Italy, while remaining lowest at 78%, had nevertheless nearly tripled its 2005 figure.\n\nIn conclusion, the data reveals a clear upward trajectory across all nations, with the gap between the highest and lowest performers narrowing from 34 percentage points in 2005 to just 18 points by 2020. (198 words)', 7.50, 'Excellent work! Task Achievement: 8 — accurately covers key features and comparisons. Coherence & Cohesion: 7.5 — well-organized with effective use of discourse markers. Lexical Resource: 7.5 — good range of vocabulary (\"penetration,\" \"convergence,\" \"trajectory\"). Grammar: 7.5 — mostly accurate with good variety. Minor improvement: could specify the overall change more precisely in the overview.', 'graded', '2026-03-27 23:40:33', '2026-03-29 23:40:33'),
(7, 4, 1, 'The question of whether higher education should be provided free of charge or funded through student fees is a contentious issue that divides opinion worldwide. This essay will examine arguments on both sides before presenting my own perspective.\n\nProponents of free university education contend that it promotes social equality by ensuring that talented individuals from disadvantaged backgrounds are not deterred by financial barriers. Countries such as Germany and Norway have successfully implemented fee-free systems, demonstrating its practical viability. Furthermore, a highly educated workforce benefits the entire society through increased productivity and innovation, suggesting that public funding represents a sound collective investment.\n\nConversely, advocates for tuition fees argue that students who directly benefit from their education should bear the associated costs. With limited government resources, free university education may come at the expense of other essential public services such as healthcare or primary education. Additionally, some economists suggest that students who pay fees are more motivated and selective in their course choices, potentially leading to better outcomes.\n\nIn my opinion, a balanced approach is most equitable. A needs-based funding model — where students from low-income families receive substantial financial support while those from affluent backgrounds contribute proportionally — addresses concerns of both access and sustainability. This approach, similar to models in Australia and the United Kingdom, ensures that ability, rather than wealth, determines educational opportunity.\n\nIn conclusion, while completely free university education has its merits, a carefully designed income-contingent funding system represents the most fair and practical solution. (243 words)', 7.00, 'Strong essay overall. Task Achievement: 7 — addresses both views and presents a clear position with a nuanced solution. Coherence: 7 — logical structure, good use of linking phrases. Lexical Resource: 7 — good academic vocabulary (\"contentious,\" \"viability,\" \"equitable,\" \"income-contingent\"). Grammar: 7 — generally accurate with some complex structures. Areas to improve: conclusions could be more developed; 243 words is just below the 250-word minimum — always aim slightly above.', 'graded', '2026-03-28 23:40:33', '2026-03-29 23:40:33'),
(8, 1, 1, 'Answers:\n1. TRUE — The classical model assumes humans always make optimal decisions\n2. FALSE — Research was in the 1970s, not 1980s\n3. TRUE — Availability heuristic causes overestimation of memorable events\n4. NOT GIVEN — Text does not mention whether Tversky shared the prize\n5. TRUE — Loss aversion: losing $100 causes ~2x more pain than gaining $100\n6. FALSE — Early researchers believed emotion INTERFERED with rational thought\n7. TRUE — Opt-out pension enrollment is mentioned as a nudge policy example\n8. Homo economicus\n9. heuristics\n10. loss aversion\n11. amygdala\n12. Behavioral economics\n13. nudge', 11.50, 'Excellent performance! 11.5/13 correct. Errors: Q4 — you answered NOT GIVEN correctly. Q12 — \"Behavioural economics\" (British spelling) also accepted. Strong understanding of the passage and question types. Review: for Short Answer questions, always check the word limit (NO MORE THAN THREE WORDS).', 'graded', '2026-03-26 23:40:33', '2026-03-29 23:40:33'),
(9, 5, 1, 'Answers:\n1.B 2.A 3.A 4.A 5.A 6.B 7.A 8.A 9.A 10.A 11.B 12.A 13.A 14.C 15.A 16.B 17.A 18.A 19.A 20.B 21.A 22.A 23.B 24.A 25.A 26.A 27.B 28.A 29.A 30.A', NULL, NULL, 'submitted', '2026-03-29 11:40:33', '2026-03-29 23:40:33'),
(10, 2, 1, 'Paragraph A — iv (The revival of urban farming)\nParagraph B — vii (Diverse cultivation techniques)\nParagraph C — i (Financial difficulties faced by urban farmers)\nParagraph D — vi (Questioning environmental claims)\nParagraph E — ii (Positive social outcomes)\nParagraph F — iii (Government support measures)', NULL, NULL, 'submitted', '2026-03-29 23:40:33', '2026-03-29 23:40:33'),
(11, 1, 1, 'Bài làm assignment 1 của học viên 1.', 8.50, 'Nội dung khá tốt, cần cải thiện từ vựng học thuật.', 'graded', '2026-04-01 09:00:00', '2026-04-01 10:00:00'),
(12, 2, 9, 'Bài làm assignment 2 của học viên 9.', 7.00, 'Đã xác định đúng ý chính nhưng còn thiếu chi tiết.', 'graded', '2026-04-02 08:30:00', '2026-04-02 09:15:00'),
(13, 3, 10, 'Bài viết Task 1 của học viên 10.', 6.50, 'Cần cải thiện phần overview.', 'graded', '2026-04-02 20:00:00', '2026-04-02 21:00:00'),
(14, 4, 11, 'Bài viết Task 2 của học viên 11.', NULL, NULL, 'submitted', '2026-04-03 19:20:00', '2026-04-03 19:20:00'),
(15, 5, 12, 'Đáp án Part 5 của học viên 12.', 24.00, 'Ngữ pháp tốt, cần chú ý từ vựng.', 'graded', '2026-04-01 07:45:00', '2026-04-01 08:10:00'),
(16, 6, 13, 'Đáp án Part 6 của học viên 13.', 13.00, 'Làm tốt phần liên từ và thì.', 'graded', '2026-04-03 14:10:00', '2026-04-03 14:40:00'),
(17, 7, 14, 'Đáp án Part 7 của học viên 14.', 3.00, 'Cần đọc kỹ câu hỏi trước khi chọn.', 'graded', '2026-04-04 09:30:00', '2026-04-04 10:00:00'),
(18, 8, 15, 'Bài làm reading bổ sung của học viên 15.', NULL, NULL, 'submitted', '2026-04-04 11:00:00', '2026-04-04 11:00:00'),
(19, 9, 16, 'Bài làm writing bổ sung của học viên 16.', 7.50, 'Lập luận tốt, cần thêm ví dụ cụ thể.', 'graded', '2026-04-05 20:15:00', '2026-04-05 20:50:00'),
(20, 10, 17, 'Bài làm speaking notes của học viên 17.', NULL, NULL, 'submitted', '2026-04-05 21:05:00', '2026-04-05 21:05:00');

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
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `classes`
--

INSERT INTO `classes` (`class_id`, `course_id`, `teacher_id`, `class_name`, `description`, `max_students`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 29, 'IELTS_F_01', 'Lớp IELTS Foundation buổi sáng', 15, '2025-01-06', '2025-03-28', 'completed', '2026-03-21 20:44:04', '2026-03-29 12:40:59'),
(2, 1, 3, 'IELTS_F_02', 'Lớp IELTS Foundation buổi tối', 15, '2025-02-03', '2025-04-25', 'completed', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(3, 2, 3, 'IELTS_PRE_01', 'Lớp IELTS Pre-Intermediate', 15, '2025-03-03', '2025-05-23', 'completed', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(4, 3, 29, 'IELTS_INT_01', 'Lớp IELTS Intermediate sáng', 15, '2025-04-07', '2025-06-27', 'completed', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(5, 3, 29, 'IELTS_INT_02', 'Lớp IELTS Intermediate tối', 15, '2025-05-05', '2025-07-25', 'completed', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(6, 4, 29, 'IELTS_UP_01', 'Lớp IELTS Upper-Intermediate', 12, '2025-06-02', '2025-08-22', 'completed', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(7, 5, 31, 'IELTS_ADV_01', 'Lớp IELTS Advanced sáng', 10, '2025-07-07', '2025-09-26', 'completed', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(8, 5, 31, 'IELTS_ADV_02', 'Lớp IELTS Advanced tối', 10, '2025-08-04', '2025-10-24', 'completed', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(9, 6, 31, 'IELTS_WR_01', 'Lớp IELTS Writing chuyên sâu', 10, '2025-09-01', '2025-11-21', 'completed', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(10, 7, 30, 'IELTS_SP_01', 'Lớp IELTS Speaking 1-1', 8, '2025-10-06', '2025-12-26', 'completed', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(11, 11, 30, 'TOEIC_450_01', 'Lớp TOEIC 450+ cơ bản', 20, '2025-01-13', '2025-03-07', 'completed', '2026-03-21 20:44:04', '2026-03-29 12:41:19'),
(12, 11, 3, 'TOEIC_450_02', 'Lớp TOEIC 450+ buổi tối', 20, '2025-02-10', '2025-04-04', 'completed', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(13, 12, 3, 'TOEIC_600_01', 'Lớp TOEIC 600+ sáng', 20, '2025-03-10', '2025-05-02', 'completed', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(14, 13, 30, 'TOEIC_700_01', 'Lớp TOEIC 700+ chuyên sâu', 15, '2025-04-14', '2025-06-06', 'completed', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(15, 14, 30, 'TOEIC_800_01', 'Lớp TOEIC 800+ nâng cao', 12, '2025-05-12', '2025-07-04', 'completed', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(16, 15, 31, 'TOEIC_900_01', 'Lớp TOEIC 900+ expert', 10, '2025-06-09', '2025-08-01', 'completed', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(17, 21, 3, 'ENG_COM_01', 'Lớp giao tiếp cơ bản sáng', 20, '2025-07-14', '2025-09-05', 'completed', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(18, 21, 3, 'ENG_COM_02', 'Lớp giao tiếp cơ bản tối', 20, '2025-08-11', '2025-10-03', 'completed', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(19, 22, 29, 'BIZ_ENG_01', 'Lớp tiếng Anh công sở', 15, '2025-09-08', '2025-10-31', 'completed', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(20, 25, 3, 'GRAM_01', 'Lớp Grammar Mastery', 15, '2025-10-13', '2025-12-05', 'completed', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(21, 1, 3, 'IELTS_F_03', 'Lớp IELTS Foundation tháng 1/2026', 15, '2026-01-05', '2026-03-27', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(22, 3, 29, 'IELTS_INT_03', 'Lớp IELTS Intermediate tháng 1/2026', 15, '2026-01-12', '2026-04-03', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(23, 5, 3, 'IELTS_ADV_03', 'Lớp IELTS Advanced tháng 2/2026', 10, '2026-02-02', '2026-04-24', 'active', '2026-03-21 20:44:04', '2026-04-18 13:30:05'),
(24, 11, 3, 'TOEIC_450_03', 'Lớp TOEIC 450+ tháng 1/2026', 20, '2026-01-05', '2026-02-27', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(25, 13, 30, 'TOEIC_700_02', 'Lớp TOEIC 700+ tháng 2/2026', 15, '2026-02-09', '2026-04-03', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(26, 6, 31, 'IELTS_WR_02', 'Lớp IELTS Writing tháng 2/2026', 10, '2026-02-02', '2026-04-24', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(27, 7, 30, 'IELTS_SP_02', 'Lớp IELTS Speaking tháng 2/2026', 8, '2026-02-16', '2026-05-08', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(28, 14, 30, 'TOEIC_800_02', 'Lớp TOEIC 800+ tháng 3/2026', 12, '2026-03-02', '2026-04-24', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(29, 22, 29, 'BIZ_ENG_02', 'Lớp Business English tháng 3/2026', 15, '2026-03-09', '2026-05-01', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(30, 31, 29, 'IELTS_CC_01', 'Lớp IELTS Crash Course tháng 3/2026', 12, '2026-03-16', '2026-04-10', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(31, 2, 3, 'IELTS_PRE_02', 'Lớp IELTS Pre tháng 4/2026', 15, '2026-04-06', '2026-06-26', 'pending', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(32, 4, 29, 'IELTS_UP_02', 'Lớp IELTS Upper tháng 4/2026', 12, '2026-04-06', '2026-06-26', 'pending', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(33, 8, 30, 'IELTS_LIS_01', 'Lớp IELTS Listening tháng 4/2026', 12, '2026-04-13', '2026-07-03', 'pending', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(34, 12, 3, 'TOEIC_600_02', 'Lớp TOEIC 600+ tháng 4/2026', 20, '2026-04-06', '2026-05-29', 'pending', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(35, 15, 31, 'TOEIC_900_02', 'Lớp TOEIC 900+ tháng 5/2026', 10, '2026-05-04', '2026-06-26', 'pending', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(36, 16, 3, 'TOEIC_LIS_01', 'Lớp TOEIC Listening tháng 4/2026', 15, '2026-04-13', '2026-06-05', 'pending', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(37, 23, 31, 'BIZ_ADV_01', 'Lớp Business English Advanced', 12, '2026-05-04', '2026-07-24', 'pending', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(38, 24, 30, 'PRON_01', 'Lớp Pronunciation tháng 4/2026', 15, '2026-04-06', '2026-05-29', 'pending', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(39, 27, 31, 'ACAD_WR_01', 'Lớp Academic Writing tháng 5/2026', 10, '2026-05-04', '2026-07-24', 'pending', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(40, 32, 31, 'IELTS_WR7_01', 'Lớp IELTS Writing Band 7', 10, '2026-05-11', '2026-08-28', 'pending', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(41, 33, 30, 'IELTS_SP7_01', 'Lớp IELTS Speaking Band 7', 8, '2026-05-11', '2026-08-28', 'pending', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(42, 36, 30, 'TOEIC_SW_01', 'Lớp TOEIC Speaking & Writing', 10, '2026-06-01', '2026-08-21', 'pending', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(43, 38, 3, 'TOEIC_VOC_01', 'Lớp TOEIC Vocabulary', 20, '2026-06-01', '2026-07-24', 'pending', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(44, 44, 3, 'CONV_01', 'Lớp Everyday Conversation', 20, '2026-06-08', '2026-08-28', 'pending', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(45, 45, 29, 'INTER_01', 'Lớp Interview Skills', 15, '2026-06-15', '2026-08-07', 'pending', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(46, 49, 29, 'PUB_SPEAK_01', 'Lớp Public Speaking', 12, '2026-07-06', '2026-09-25', 'pending', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(47, 19, 3, 'TOEIC_BIZ_01', 'Lớp TOEIC Business Vocab', 20, '2026-07-06', '2026-08-28', 'pending', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(48, 26, 29, 'VOC_3000_01', 'Lớp Vocabulary 3000', 20, '2026-07-13', '2026-09-04', 'pending', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(49, 17, 29, 'TOEIC_GR_01', 'Lớp TOEIC Grammar Part 5-6', 15, '2026-07-13', '2026-09-04', 'pending', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(50, 20, 31, 'TOEIC_MOCK_01', 'Lớp TOEIC Mock Tests', 15, '2026-08-03', '2026-09-25', 'pending', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(51, 51, 3, 'IELTS_F_TEST_A', 'Lớp IELTS Foundation buổi sáng - đang tuyển sinh', 15, '2026-05-01', '2026-07-31', 'pending', '2026-03-28 21:32:01', '2026-03-29 08:37:52'),
(52, 51, 3, 'IELTS_F_TEST_B', 'Lớp IELTS Foundation buổi tối - đang tuyển sinh', 12, '2026-05-05', '2026-08-05', 'pending', '2026-03-28 21:32:01', '2026-03-29 08:37:52'),
(53, 52, 3, 'TOEIC_600_TEST_A', 'Lớp TOEIC 600+ cuối tuần - đang tuyển sinh', 20, '2026-04-20', '2026-06-20', 'pending', '2026-03-28 21:32:01', '2026-03-29 08:37:52'),
(54, 53, 3, 'IELTS_WR7_TEST', 'Lớp IELTS Writing Band 7 - đang tuyển sinh', 10, '2026-05-10', '2026-08-10', 'pending', '2026-03-28 21:32:01', '2026-03-29 08:37:52'),
(55, 54, 3, 'TOEIC_800_TEST_A', 'Lớp TOEIC 800+ đang học', 15, '2026-03-01', '2026-05-31', 'active', '2026-03-28 21:32:01', '2026-03-29 08:37:52'),
(56, 52, 3, 'TOEIC_600_TEST_B', 'Lớp TOEIC 600+ đang học', 20, '2026-02-15', '2026-04-30', 'active', '2026-03-28 21:32:01', '2026-03-29 08:37:52'),
(57, 55, 3, 'ENG_COM_TEST', 'Lớp English Communication đang học', 20, '2026-03-10', '2026-05-10', 'active', '2026-03-28 21:32:01', '2026-03-29 08:37:52'),
(58, 56, 3, 'IELTS_F_TEST_A', 'Lớp IELTS Foundation buổi sáng - đang tuyển sinh', 15, '2026-05-01', '2026-07-31', 'pending', '2026-03-28 21:34:32', '2026-03-29 08:37:52'),
(59, 56, 3, 'IELTS_F_TEST_B', 'Lớp IELTS Foundation buổi tối - đang tuyển sinh', 12, '2026-05-05', '2026-08-05', 'pending', '2026-03-28 21:34:32', '2026-03-29 08:37:52'),
(60, 57, 3, 'TOEIC_600_TEST_A', 'Lớp TOEIC 600+ cuối tuần - đang tuyển sinh', 20, '2026-04-20', '2026-06-20', 'pending', '2026-03-28 21:34:32', '2026-03-29 08:37:52'),
(61, 58, 3, 'IELTS_WR7_TEST', 'Lớp IELTS Writing Band 7 - đang tuyển sinh', 10, '2026-05-10', '2026-08-10', 'pending', '2026-03-28 21:34:32', '2026-03-29 08:37:52'),
(62, 59, 3, 'TOEIC_800_TEST_A', 'Lớp TOEIC 800+ đang học', 15, '2026-03-01', '2026-05-31', 'active', '2026-03-28 21:34:32', '2026-03-29 08:37:52'),
(63, 57, 29, 'TOEIC_600_TEST_B', 'Lớp TOEIC 600+ đang học', 20, '2026-02-15', '2026-04-30', 'active', '2026-03-28 21:34:32', '2026-03-29 12:41:47'),
(64, 60, 3, 'ENG_COM_TEST', 'Lớp English Communication đang học', 20, '2026-03-10', '2026-05-10', 'active', '2026-03-28 21:34:32', '2026-03-29 08:37:52');

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
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `courses`
--

INSERT INTO `courses` (`course_id`, `title`, `description`, `price`, `level`, `course_type`, `status`, `created_at`, `updated_at`) VALUES
(1, 'IELTS Foundation', 'Khóa học IELTS cho người mới bắt đầu, từ band 0 đến 4.0', 2500000.00, 'beginner', 'IELTS', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(2, 'IELTS Pre-Intermediate', 'Nâng band từ 4.0 lên 5.0, củng cố nền tảng ngữ pháp và từ vựng', 3000000.00, 'beginner', 'IELTS', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(3, 'IELTS Intermediate', 'Đạt band 5.5 - 6.0, luyện tập 4 kỹ năng toàn diện', 3500000.00, 'intermediate', 'IELTS', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(4, 'IELTS Upper-Intermediate', 'Target band 6.0 - 6.5, chuyên sâu Reading và Writing', 4000000.00, 'intermediate', 'IELTS', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(5, 'IELTS Advanced', 'Đạt band 7.0+, luyện đề thi thực tế Cambridge', 4500000.00, 'advanced', 'IELTS', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(6, 'IELTS Academic Writing', 'Chuyên sâu Writing Task 1 và Task 2, band 7.0+', 3000000.00, 'advanced', 'IELTS', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(7, 'IELTS Speaking Intensive', 'Luyện Speaking 1-1 với giáo viên, tăng band nhanh', 3500000.00, 'intermediate', 'IELTS', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(8, 'IELTS Listening Mastery', 'Chinh phục Listening band 8.0+, kỹ thuật note-taking', 2800000.00, 'advanced', 'IELTS', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(9, 'IELTS Reading Strategies', 'Đọc hiểu nhanh, chính xác band 7.0+', 2800000.00, 'intermediate', 'IELTS', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(10, 'IELTS Mock Test Intensive', 'Luyện đề thi thật Cambridge 15, 16, 17, 18', 2000000.00, 'advanced', 'IELTS', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(11, 'TOEIC 450+', 'Khóa học TOEIC cơ bản, target 450 điểm', 2000000.00, 'beginner', 'TOEIC', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(12, 'TOEIC 600+', 'Nâng điểm lên 600, chiến lược làm bài hiệu quả', 2500000.00, 'beginner', 'TOEIC', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(13, 'TOEIC 700+', 'Target 700 điểm, luyện Listening và Reading chuyên sâu', 3000000.00, 'intermediate', 'TOEIC', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(14, 'TOEIC 800+', 'Đạt 800+ với chiến lược làm bài tối ưu', 3500000.00, 'intermediate', 'TOEIC', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(15, 'TOEIC 900+', 'Perfect score strategy, full mock tests', 4000000.00, 'advanced', 'TOEIC', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(16, 'TOEIC Listening Intensive', 'Chinh phục Part 1-4, kỹ năng nghe nâng cao', 2500000.00, 'intermediate', 'TOEIC', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(17, 'TOEIC Reading Grammar', 'Part 5-6 Grammar Mastery, zero mistake strategy', 2500000.00, 'intermediate', 'TOEIC', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(18, 'TOEIC Reading Comprehension', 'Part 7 Speed Reading, 54 câu trong 55 phút', 2500000.00, 'advanced', 'TOEIC', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(19, 'TOEIC Business Vocabulary', 'Từ vựng kinh doanh 2000+ từ cho TOEIC', 1500000.00, 'beginner', 'TOEIC', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(20, 'TOEIC Full Mock Tests', 'Luyện 20 bộ đề TOEIC thực tế có đáp án giải thích', 2000000.00, 'advanced', 'TOEIC', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(21, 'English Communication Basic', 'Tiếng Anh giao tiếp cơ bản cho người mất gốc', 1500000.00, 'beginner', 'OTHER', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(22, 'English for Work', 'Tiếng Anh công sở, email, meeting, presentation', 2500000.00, 'intermediate', 'OTHER', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(23, 'Business English Advanced', 'Negotiation, report writing, business communication', 3500000.00, 'advanced', 'OTHER', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(24, 'English Pronunciation', 'Phát âm chuẩn American English, IPA', 2000000.00, 'beginner', 'OTHER', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(25, 'Grammar Mastery', 'Ngữ pháp toàn diện từ cơ bản đến nâng cao', 2000000.00, 'intermediate', 'OTHER', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(26, 'Vocabulary Building 3000', 'Học 3000 từ vựng thông dụng theo chủ đề', 1800000.00, 'beginner', 'OTHER', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(27, 'Academic English Writing', 'Viết luận học thuật, research paper chuẩn quốc tế', 3000000.00, 'advanced', 'OTHER', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(28, 'English for Healthcare', 'Tiếng Anh chuyên ngành y tế, điều dưỡng', 3000000.00, 'intermediate', 'OTHER', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(29, 'English for IT', 'Tiếng Anh chuyên ngành CNTT, technical writing', 2500000.00, 'intermediate', 'OTHER', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(30, 'Kids English Foundation', 'Tiếng Anh cho trẻ em 6-12 tuổi', 1500000.00, 'beginner', 'OTHER', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(31, 'IELTS Crash Course 4 Weeks', 'Luyện thi cấp tốc 4 tuần, tăng 0.5 band', 5000000.00, 'intermediate', 'IELTS', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(32, 'IELTS Writing Band 7', 'Chuyên luyện Writing đạt band 7.0', 3500000.00, 'advanced', 'IELTS', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(33, 'IELTS Speaking Band 7', 'Fluency, coherence, vocabulary, pronunciation', 3500000.00, 'advanced', 'IELTS', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(34, 'IELTS General Training', 'IELTS GT cho mục đích định cư, du học nghề', 3000000.00, 'intermediate', 'IELTS', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(35, 'IELTS Academic Module', 'IELTS Academic cho du học đại học, cao học', 3500000.00, 'advanced', 'IELTS', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(36, 'TOEIC Speaking & Writing', 'Luyện TOEIC S&W, chứng chỉ output skills', 3500000.00, 'advanced', 'TOEIC', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(37, 'TOEIC Part 5 Grammar 100%', 'Chinh phục 30 câu Part 5 với 0 sai sót', 2000000.00, 'advanced', 'TOEIC', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(38, 'TOEIC Vocabulary by Topic', 'Từ vựng TOEIC theo 30 chủ đề thường gặp', 1800000.00, 'beginner', 'TOEIC', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(39, 'TOEIC Time Management', 'Chiến lược phân bổ thời gian làm bài TOEIC', 2000000.00, 'intermediate', 'TOEIC', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(40, 'TOEIC Error Analysis', 'Phân tích lỗi sai thường gặp và cách tránh', 2500000.00, 'advanced', 'TOEIC', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(41, 'English Idioms & Phrases', '500 thành ngữ và cụm từ thông dụng', 1500000.00, 'intermediate', 'OTHER', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(42, 'English for Tourism', 'Tiếng Anh ngành du lịch, khách sạn, nhà hàng', 2500000.00, 'intermediate', 'OTHER', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(43, 'English Debate & Discussion', 'Kỹ năng tranh luận và thảo luận bằng tiếng Anh', 3000000.00, 'advanced', 'OTHER', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(44, 'Everyday English Conversation', 'Hội thoại tiếng Anh hàng ngày, 100 tình huống', 2000000.00, 'beginner', 'OTHER', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(45, 'English Interview Skills', 'Chuẩn bị phỏng vấn xin việc bằng tiếng Anh', 2500000.00, 'intermediate', 'OTHER', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(46, 'English Reading Club', 'Đọc sách tiếng Anh, mở rộng vốn từ tự nhiên', 1500000.00, 'intermediate', 'OTHER', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(47, 'English News & Media', 'Đọc báo, xem tin tức tiếng Anh BBC, CNN', 2000000.00, 'advanced', 'OTHER', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(48, 'American English vs British', 'Sự khác biệt AmE và BrE, accent training', 1800000.00, 'intermediate', 'OTHER', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(49, 'English Public Speaking', 'Thuyết trình, diễn thuyết bằng tiếng Anh tự tin', 3000000.00, 'advanced', 'OTHER', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(50, 'English for Social Media', 'Viết content, caption tiếng Anh cho MXH', 1500000.00, 'beginner', 'OTHER', 'active', '2026-03-21 20:44:04', '2026-03-29 08:37:52'),
(51, 'IELTS Foundation Test', 'Khóa IELTS cơ bản dành cho người mới bắt đầu, target band 5.0', 2500000.00, 'beginner', 'IELTS', 'active', '2026-03-28 21:32:01', '2026-03-29 08:37:52'),
(52, 'TOEIC 600+ Test', 'Luyện TOEIC chinh phục mốc 600 điểm, tập trung Part 5-7', 2000000.00, 'intermediate', 'TOEIC', 'active', '2026-03-28 21:32:01', '2026-03-29 08:37:52'),
(53, 'IELTS Writing Band 7 Test', 'Chuyên luyện Writing Task 1 & Task 2 đạt band 7.0+', 3000000.00, 'advanced', 'IELTS', 'active', '2026-03-28 21:32:01', '2026-03-29 08:37:52'),
(54, 'TOEIC 800+ Test', 'Đạt 800+ với chiến lược làm bài tối ưu cho từng Part', 3500000.00, 'advanced', 'TOEIC', 'active', '2026-03-28 21:32:01', '2026-03-29 08:37:52'),
(55, 'English Communication Test', 'Tiếng Anh giao tiếp thực tế cho người đi làm', 1500000.00, 'beginner', 'OTHER', 'active', '2026-03-28 21:32:01', '2026-03-29 08:37:52'),
(56, 'IELTS Foundation Test', 'Khóa IELTS cơ bản dành cho người mới bắt đầu, target band 5.0', 2500000.00, 'beginner', 'IELTS', 'active', '2026-03-28 21:34:32', '2026-03-29 08:37:52'),
(57, 'TOEIC 600+ Test', 'Luyện TOEIC chinh phục mốc 600 điểm, tập trung Part 5-7', 2000000.00, 'intermediate', 'TOEIC', 'active', '2026-03-28 21:34:32', '2026-03-29 08:37:52'),
(58, 'IELTS Writing Band 7 Test', 'Chuyên luyện Writing Task 1 & Task 2 đạt band 7.0+', 3000000.00, 'advanced', 'IELTS', 'active', '2026-03-28 21:34:32', '2026-03-29 08:37:52'),
(59, 'TOEIC 800+ Test', 'Đạt 800+ với chiến lược làm bài tối ưu cho từng Part', 3500000.00, 'advanced', 'TOEIC', 'active', '2026-03-28 21:34:32', '2026-03-29 08:37:52'),
(60, 'English Communication Test', 'Tiếng Anh giao tiếp thực tế cho người đi làm', 1500000.00, 'beginner', 'OTHER', 'active', '2026-03-28 21:34:32', '2026-03-29 08:37:52');

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
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `enrollments`
--

INSERT INTO `enrollments` (`enroll_id`, `user_id`, `class_id`, `enrolled_at`, `approved_at`, `approved_by`, `payment_status`, `approval_status`) VALUES
(1, 1, 1, '2025-01-05 08:00:00', '2025-01-06 09:00:00', 2, 0, 'completed'),
(2, 1, 11, '2025-01-12 08:00:00', '2025-01-13 09:00:00', 2, 0, 'completed'),
(3, 1, 4, '2025-04-06 08:00:00', '2025-04-07 09:00:00', 2, 0, 'completed'),
(4, 9, 1, '2025-01-05 09:00:00', '2025-01-06 09:00:00', 2, 0, 'completed'),
(5, 9, 11, '2025-01-12 09:00:00', '2025-01-13 09:00:00', 2, 0, 'completed'),
(6, 10, 2, '2025-02-02 08:00:00', '2025-02-03 09:00:00', 2, 0, 'completed'),
(7, 10, 17, '2025-07-13 08:00:00', '2025-07-14 09:00:00', 2, 0, 'completed'),
(8, 11, 4, '2025-04-06 10:00:00', '2025-04-07 09:00:00', 2, 0, 'completed'),
(9, 11, 14, '2025-04-13 10:00:00', '2025-04-14 09:00:00', 2, 0, 'completed'),
(10, 12, 5, '2025-05-04 08:00:00', '2025-05-05 09:00:00', 2, 0, 'completed'),
(11, 12, 19, '2025-09-07 08:00:00', '2025-09-08 09:00:00', 2, 0, 'completed'),
(12, 13, 7, '2025-07-06 08:00:00', '2025-07-07 09:00:00', 2, 0, 'completed'),
(13, 14, 7, '2025-07-06 09:00:00', '2025-07-07 09:00:00', 2, 0, 'completed'),
(14, 15, 12, '2025-02-09 08:00:00', '2025-02-10 09:00:00', 2, 0, 'completed'),
(15, 15, 21, '2026-01-11 08:00:00', '2026-01-12 09:00:00', 2, 0, 'enrolled'),
(16, 16, 14, '2025-04-13 11:00:00', '2025-04-14 09:00:00', 2, 0, 'completed'),
(17, 17, 18, '2025-08-10 08:00:00', '2025-08-11 09:00:00', 2, 0, 'completed'),
(18, 18, 19, '2025-09-07 09:00:00', '2025-09-08 09:00:00', 2, 0, 'completed'),
(19, 19, 21, '2026-01-04 08:00:00', '2026-01-05 09:00:00', 2, 0, 'enrolled'),
(20, 20, 24, '2026-01-04 09:00:00', '2026-01-05 09:00:00', 2, 0, 'enrolled'),
(37, 3, 6, '2026-03-20 09:00:00', NULL, NULL, 0, 'pending'),
(38, 1, 8, '2026-03-20 10:00:00', NULL, NULL, 0, 'dropped'),
(39, 12, 10, '2026-03-20 11:00:00', NULL, NULL, 0, 'pending'),
(40, 15, 12, '2026-03-20 12:00:00', NULL, NULL, 0, 'pending'),
(42, 16, NULL, '2026-03-21 09:00:00', NULL, NULL, 0, 'pending'),
(43, 10, 14, '2026-03-21 10:00:00', NULL, NULL, 0, 'pending'),
(44, 9, NULL, '2026-03-21 11:00:00', NULL, NULL, 0, 'pending'),
(45, 11, 15, '2026-03-21 12:00:00', NULL, NULL, 0, 'pending'),
(46, 12, 18, '2026-03-21 13:00:00', NULL, NULL, 0, 'pending'),
(47, 13, NULL, '2026-03-21 14:00:00', NULL, NULL, 0, 'pending'),
(51, 1, NULL, '2026-03-21 20:57:13', NULL, NULL, 0, 'pending'),
(52, 1, NULL, '2026-03-21 20:57:15', NULL, NULL, 0, 'pending'),
(53, 1, 55, '2026-03-01 08:00:00', '2026-03-01 09:00:00', 2, 0, 'enrolled'),
(54, 1, 56, '2026-02-15 08:00:00', '2026-02-15 09:00:00', 2, 0, 'enrolled'),
(55, 1, 57, '2026-03-10 08:00:00', '2026-03-10 09:00:00', 2, 0, 'approved'),
(56, 1, NULL, '2026-03-28 10:00:00', NULL, NULL, 0, 'pending'),
(57, 1, 62, '2026-03-01 08:00:00', '2026-03-01 09:00:00', 2, 0, 'enrolled'),
(58, 1, 63, '2026-02-15 08:00:00', '2026-02-15 09:00:00', 2, 0, 'enrolled'),
(59, 1, 64, '2026-03-10 08:00:00', '2026-03-10 09:00:00', 2, 0, 'approved'),
(60, 1, NULL, '2026-03-28 10:00:00', NULL, NULL, 0, 'pending'),
(61, 1, 21, '2026-03-30 12:58:08', '2026-03-30 12:58:08', 2, 1, 'enrolled'),
(62, 1, 21, '2026-03-30 12:58:22', '2026-03-30 12:58:22', 2, 1, 'enrolled'),
(63, 1, 24, '2026-03-30 12:58:22', '2026-03-30 12:58:22', 2, 1, 'enrolled'),
(64, 1, 48, '2026-03-31 10:20:52', NULL, NULL, 0, 'dropped'),
(65, 1, 33, '2026-04-18 13:34:19', NULL, NULL, 0, 'dropped'),
(66, 1, 33, '2026-04-18 13:54:33', NULL, NULL, 0, 'dropped'),
(67, 1, 33, '2026-04-21 13:18:37', NULL, NULL, 0, 'pending');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `notification_type` varchar(50) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `fk_notifications_sender` (`sender_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `passages`
--

DROP TABLE IF EXISTS `passages`;
CREATE TABLE IF NOT EXISTS `passages` (
  `passage_id` int NOT NULL AUTO_INCREMENT,
  `quiz_id` int DEFAULT NULL,
  `assign_id` int DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` longtext NOT NULL,
  `payment_type` varchar(50) DEFAULT NULL,
  `order_num` int DEFAULT '1',
  `test_id` int DEFAULT NULL,
  PRIMARY KEY (`passage_id`),
  KEY `fk_passages_quiz` (`quiz_id`),
  KEY `fk_passages_assignment` (`assign_id`),
  KEY `fk_passages_test` (`test_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `passages`
--

INSERT INTO `passages` (`passage_id`, `quiz_id`, `assign_id`, `title`, `content`, `payment_type`, `order_num`, `test_id`) VALUES
(1, 1, NULL, 'Climate Change Basics', 'This passage explains the causes and effects of climate change.', '', 1, NULL),
(2, 2, NULL, 'Urban Farming', 'This passage introduces the development of urban farming.', '', 1, NULL),
(3, 5, NULL, 'Company Memo', 'A short internal memo used for TOEIC reading practice.', '', 1, NULL),
(4, 6, NULL, 'Project Update Email', 'An email passage for TOEIC text completion practice.', '', 1, NULL),
(5, 7, NULL, 'Community Center Notice', 'A notice passage for reading comprehension.', '', 1, NULL),
(6, 17, NULL, 'Online Education', 'Students today can access lessons from anywhere using online platforms.', '', 1, NULL),
(7, 17, NULL, 'Green Transport', 'Many cities are investing in bicycles and electric buses.', '', 2, NULL),
(8, 17, NULL, 'Remote Work', 'Remote work has changed how companies hire and manage staff.', '', 3, NULL),
(9, NULL, 1, 'TFNG Supplement 1', 'Support passage for assignment 1.', '', 1, NULL),
(10, NULL, 2, 'Heading Matching Supplement', 'Support passage for assignment 2.', '', 1, NULL),
(11, NULL, 3, 'Chart Description Notes', 'Support text for writing task 1.', '', 1, NULL),
(12, NULL, 4, 'Opinion Essay Notes', 'Support text for writing task 2.', '', 1, NULL),
(13, NULL, 5, 'Sentence Completion Set A', 'Support text for TOEIC part 5.', '', 1, NULL),
(14, NULL, 6, 'Text Completion Set A', 'Support text for TOEIC part 6.', '', 1, NULL),
(15, NULL, 7, 'Reading Comprehension Set A', 'Support text for TOEIC part 7.', '', 1, NULL),
(16, 18, NULL, 'Business Email 1', 'Please submit the revised report before Friday afternoon.', '', 1, NULL),
(17, 18, NULL, 'Business Email 2', 'The meeting has been moved to the main conference room.', '', 2, NULL),
(18, 19, NULL, 'Writing Prompt Background', 'Some people think online learning can replace classrooms.', '', 1, NULL),
(19, 20, NULL, 'Speaking Topic Background', 'Describe a teacher who helped you achieve a goal.', '', 1, NULL),
(20, 20, NULL, 'Speaking Topic Extension', 'Describe a skill you want to learn in the future.', '', 2, NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `payments`
--

INSERT INTO `payments` (`pay_id`, `user_id`, `course_id`, `amount`, `payment_method`, `maid_at`, `status`) VALUES
(1, 1, 1, 2500000.00, 'banking', '2026-03-01 08:00:00', ''),
(2, 9, 2, 3000000.00, 'cash', '2026-03-01 09:00:00', ''),
(3, 10, 3, 3500000.00, 'banking', '2026-03-02 10:00:00', ''),
(4, 11, 4, 3800000.00, 'momo', '2026-03-02 11:00:00', ''),
(5, 12, 5, 2200000.00, 'cash', '2026-03-03 08:30:00', ''),
(6, 13, 6, 2400000.00, 'banking', '2026-03-03 09:45:00', ''),
(7, 14, 7, 2600000.00, 'momo', '2026-03-04 13:00:00', ''),
(8, 15, 8, 2700000.00, 'banking', '2026-03-04 14:15:00', ''),
(9, 16, 9, 2800000.00, 'cash', '2026-03-05 15:30:00', 'pending'),
(10, 17, 10, 2900000.00, 'banking', '2026-03-05 16:00:00', ''),
(11, 18, 11, 2000000.00, 'momo', '2026-03-06 08:20:00', ''),
(12, 19, 12, 2300000.00, 'cash', '2026-03-06 09:10:00', ''),
(13, 20, 13, 3200000.00, 'banking', '2026-03-07 10:25:00', ''),
(14, 29, 14, 3400000.00, 'momo', '2026-03-07 14:00:00', ''),
(15, 30, 15, 3600000.00, 'banking', '2026-03-08 08:00:00', ''),
(16, 31, 16, 1800000.00, 'cash', '2026-03-08 10:10:00', 'failed'),
(17, 139, 17, 1500000.00, 'banking', '2026-03-09 12:00:00', ''),
(18, 141, 18, 2100000.00, 'momo', '2026-03-09 13:40:00', ''),
(19, 144, 19, 1950000.00, 'cash', '2026-03-10 09:55:00', 'pending'),
(20, 145, 20, 2050000.00, 'banking', '2026-03-10 16:25:00', '');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `questions`
--

DROP TABLE IF EXISTS `questions`;
CREATE TABLE IF NOT EXISTS `questions` (
  `question_id` int NOT NULL AUTO_INCREMENT,
  `quiz_id` int DEFAULT NULL,
  `group_id` int DEFAULT NULL,
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
  `test_id` int DEFAULT NULL,
  PRIMARY KEY (`question_id`),
  KEY `fk_questions_quiz` (`quiz_id`),
  KEY `fk_questions_group` (`group_id`),
  KEY `fk_questions_test` (`test_id`)
) ENGINE=InnoDB AUTO_INCREMENT=113 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `questions`
--

INSERT INTO `questions` (`question_id`, `quiz_id`, `group_id`, `question_type`, `question_text`, `image_url`, `audio_url`, `order_num`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`, `explanation`, `test_id`) VALUES
(1, 1, 1, 'mcq', 'The classical economic model assumed that people always make decisions that are in their best interest.', NULL, NULL, 1, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'A', 'Paragraph 2 states the classical model proposed humans are \"rational actors who consistently choose actions that maximize their utility or benefit.\"', NULL),
(2, 1, 1, 'mcq', 'Kahneman and Tversky conducted their research in the 1980s.', NULL, NULL, 2, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'B', 'The passage states their research was in \"the 1970s,\" not the 1980s.', NULL),
(3, 1, 1, 'mcq', 'People tend to overestimate the danger of plane crashes compared to car accidents.', NULL, NULL, 3, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'A', 'Paragraph 3 explicitly states this: people \"overestimate the likelihood of events that are easily recalled, such as plane crashes.\"', NULL),
(4, 1, 1, 'mcq', 'Kahneman shared the Nobel Prize with Tversky in 2002.', NULL, NULL, 4, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'C', 'The passage says Kahneman was awarded the prize but does not mention whether Tversky shared it (Tversky had died in 1996 and the prize is not awarded posthumously).', NULL),
(5, 1, 1, 'mcq', 'According to prospect theory, a financial loss of $100 causes more distress than the pleasure from gaining $100.', NULL, NULL, 5, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'A', 'Paragraph 4 states: \"the pain of losing $100 is approximately twice as powerful as the pleasure of gaining the same amount.\"', NULL),
(6, 1, 1, 'mcq', 'Early researchers believed emotional responses improved rational decision-making.', NULL, NULL, 6, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'B', 'Paragraph 5 states \"Contrary to earlier beliefs that emotion interferes with rational thought\" — early researchers believed emotion was harmful, not helpful.', NULL),
(7, 1, 1, 'mcq', 'Opt-out pension enrollment schemes have been introduced in some workplaces.', NULL, NULL, 7, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'A', 'The final paragraph mentions \"automatically enrolling employees in pension schemes (while allowing opt-out)\" as an example of nudge policy.', NULL),
(8, 1, 1, 'fill_blank', 'What term is used to describe the idealized rational human decision-maker in classical economics?', NULL, NULL, 8, NULL, NULL, NULL, NULL, 'Homo economicus', 'Paragraph 2: \"This concept, known as Homo economicus...\"', NULL),
(9, 1, 1, 'fill_blank', 'What name is given to the mental shortcuts that people use when making decisions?', NULL, NULL, 9, NULL, NULL, NULL, NULL, 'heuristics', 'Paragraph 3: \"people rely on mental shortcuts, or heuristics, when making decisions.\"', NULL),
(10, 1, 1, 'fill_blank', 'What is the name of the phenomenon where people are more affected by losses than equivalent gains?', NULL, NULL, 10, NULL, NULL, NULL, NULL, 'loss aversion', 'Paragraph 4: \"more sensitive to losses than equivalent gains — a phenomenon called loss aversion.\"', NULL),
(11, 1, 1, 'fill_blank', 'Which brain region is associated with emotional processing in decision-making?', NULL, NULL, 11, NULL, NULL, NULL, NULL, 'amygdala', 'Paragraph 5 mentions \"emotional brain regions, such as the amygdala.\"', NULL),
(12, 1, 1, 'fill_blank', 'What field combines psychological insights with economic behavior?', NULL, NULL, 12, NULL, NULL, NULL, NULL, 'Behavioral economics', 'Final paragraph: \"Behavioral economics — which applies psychological insights to economic behavior.\"', NULL),
(13, 1, 1, 'fill_blank', 'What policy approach guides people toward beneficial choices without restricting their freedom?', NULL, NULL, 13, NULL, NULL, NULL, NULL, 'nudge', 'Final paragraph: \'Governments have designed \"nudge\" policies that guide citizens toward beneficial choices.\'', NULL),
(14, 4, NULL, 'mcq', 'The company ___ its quarterly earnings report next Monday.', NULL, NULL, 1, 'announces', 'will announce', 'announced', 'has announced', 'B', 'Future schedule with specific time expression \"next Monday\" requires simple future \"will announce\".', NULL),
(15, 4, NULL, 'mcq', 'All employees are ___ to complete the safety training by the end of the month.', NULL, NULL, 2, 'required', 'requiring', 'requirement', 'require', 'A', 'After \"are\" we need an adjective or past participle. \"Required\" (past participle used as adjective) fits grammatically.', NULL),
(16, 4, NULL, 'mcq', 'The new software system will ___ manual data entry by 80%.', NULL, NULL, 3, 'reduce', 'reduction', 'reduced', 'reducing', 'A', 'Modal verb \"will\" must be followed by the base form of the verb.', NULL),
(17, 4, NULL, 'mcq', '___ the bad weather forecast, the outdoor conference proceeded as planned.', NULL, NULL, 4, 'Despite', 'Although', 'Because of', 'Since', 'A', '\"Despite\" + noun phrase shows contrast. \"Although\" requires a clause. \"Because of\" shows cause, not contrast.', NULL),
(18, 4, NULL, 'mcq', 'The merger negotiations have been ___ for several months without a resolution.', NULL, NULL, 5, 'ongoing', 'ongoingly', 'to go on', 'gone on', 'A', '\"Ongoing\" is an adjective meaning \"continuing\" — correct complement for \"have been.\"', NULL),
(19, 4, NULL, 'mcq', 'Please submit your expense report ___ the end of business day Friday.', NULL, NULL, 6, 'until', 'by', 'during', 'within', 'B', '\"By\" indicates a deadline. \"Until\" suggests continuous action up to a point. \"By Friday\" = no later than Friday.', NULL),
(20, 4, NULL, 'mcq', 'The marketing team is ___ a new campaign to attract younger customers.', NULL, NULL, 7, 'developing', 'development', 'developed', 'develops', 'A', 'After \"is\" we need the present participle (-ing) to form present continuous tense.', NULL),
(21, 4, NULL, 'mcq', 'Ms. Park was promoted to regional manager ___ her outstanding sales performance.', NULL, NULL, 8, 'due to', 'so that', 'in case', 'provided that', 'A', '\"Due to\" + noun phrase expresses reason/cause. The others require clauses or express different relationships.', NULL),
(22, 4, NULL, 'mcq', 'The conference room is available for ___ between 9 AM and 5 PM on weekdays.', NULL, NULL, 9, 'reservation', 'reserve', 'reserving', 'reserved', 'A', 'After the preposition \"for\" we need a noun. \"Reservation\" is the correct noun form.', NULL),
(23, 4, NULL, 'mcq', 'Customers who place orders ___ midnight will receive next-day delivery.', NULL, NULL, 10, 'before', 'ago', 'since', 'during', 'A', '\"Before midnight\" indicates the time boundary for qualifying orders. Other options do not fit this context.', NULL),
(24, 4, 2, 'mcq', 'What is the primary purpose of Mr. Chen\'s email?', NULL, NULL, 11, 'To request a meeting with Ms. Williams', 'To confirm the details of a business agreement', 'To complain about a delayed project', 'To advertise a new software product', 'B', 'The email summarizes and confirms the terms discussed in a previous meeting.', NULL),
(25, 4, 2, 'mcq', 'When is the software implementation expected to be completed?', NULL, NULL, 12, 'March 22', 'April 3', 'April 6', 'April 24', 'D', 'The email states \"full implementation expected by April 24.\"', NULL),
(26, 4, 2, 'mcq', 'What is the one-time setup fee mentioned in the email?', NULL, NULL, 13, '$3,200', '$47,500', '$40,375', '$50,700', 'A', 'The email clearly states \"a one-time setup fee of $3,200.\"', NULL),
(27, 4, 2, 'mcq', 'According to the email, what discount is being offered?', NULL, NULL, 14, '3%', '10%', '15%', '20%', 'C', 'The email states \"a 15% discount from our standard pricing.\"', NULL),
(28, 4, 2, 'mcq', 'By what date does Mr. Chen need a response?', NULL, NULL, 15, 'March 15', 'March 22', 'April 3', 'April 5', 'B', 'The email states \"Please let me know by March 22.\"', NULL),
(29, 1, 3, 'mcq', 'The classical economic model assumed that people always make decisions that are in their best interest.', NULL, NULL, 1, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'A', 'Paragraph 2 states the classical model proposed humans are \"rational actors who consistently choose actions that maximize their utility or benefit.\"', NULL),
(30, 1, 3, 'mcq', 'Kahneman and Tversky conducted their research in the 1980s.', NULL, NULL, 2, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'B', 'The passage states their research was in \"the 1970s,\" not the 1980s.', NULL),
(31, 1, 3, 'mcq', 'People tend to overestimate the danger of plane crashes compared to car accidents.', NULL, NULL, 3, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'A', 'Paragraph 3 explicitly states this: people \"overestimate the likelihood of events that are easily recalled, such as plane crashes.\"', NULL),
(32, 1, 3, 'mcq', 'Kahneman shared the Nobel Prize with Tversky in 2002.', NULL, NULL, 4, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'C', 'The passage says Kahneman was awarded the prize but does not mention whether Tversky shared it (Tversky had died in 1996 and the prize is not awarded posthumously).', NULL),
(33, 1, 3, 'mcq', 'According to prospect theory, a financial loss of $100 causes more distress than the pleasure from gaining $100.', NULL, NULL, 5, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'A', 'Paragraph 4 states: \"the pain of losing $100 is approximately twice as powerful as the pleasure of gaining the same amount.\"', NULL),
(34, 1, 3, 'mcq', 'Early researchers believed emotional responses improved rational decision-making.', NULL, NULL, 6, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'B', 'Paragraph 5 states \"Contrary to earlier beliefs that emotion interferes with rational thought\" — early researchers believed emotion was harmful, not helpful.', NULL),
(35, 1, 3, 'mcq', 'Opt-out pension enrollment schemes have been introduced in some workplaces.', NULL, NULL, 7, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'A', 'The final paragraph mentions \"automatically enrolling employees in pension schemes (while allowing opt-out)\" as an example of nudge policy.', NULL),
(36, 1, 3, 'fill_blank', 'What term is used to describe the idealized rational human decision-maker in classical economics?', NULL, NULL, 8, NULL, NULL, NULL, NULL, 'Homo economicus', 'Paragraph 2: \"This concept, known as Homo economicus...\"', NULL),
(37, 1, 3, 'fill_blank', 'What name is given to the mental shortcuts that people use when making decisions?', NULL, NULL, 9, NULL, NULL, NULL, NULL, 'heuristics', 'Paragraph 3: \"people rely on mental shortcuts, or heuristics, when making decisions.\"', NULL),
(38, 1, 3, 'fill_blank', 'What is the name of the phenomenon where people are more affected by losses than equivalent gains?', NULL, NULL, 10, NULL, NULL, NULL, NULL, 'loss aversion', 'Paragraph 4: \"more sensitive to losses than equivalent gains — a phenomenon called loss aversion.\"', NULL),
(39, 1, 3, 'fill_blank', 'Which brain region is associated with emotional processing in decision-making?', NULL, NULL, 11, NULL, NULL, NULL, NULL, 'amygdala', 'Paragraph 5 mentions \"emotional brain regions, such as the amygdala.\"', NULL),
(40, 1, 3, 'fill_blank', 'What field combines psychological insights with economic behavior?', NULL, NULL, 12, NULL, NULL, NULL, NULL, 'Behavioral economics', 'Final paragraph: \"Behavioral economics — which applies psychological insights to economic behavior.\"', NULL),
(41, 1, 3, 'fill_blank', 'What policy approach guides people toward beneficial choices without restricting their freedom?', NULL, NULL, 13, NULL, NULL, NULL, NULL, 'nudge', 'Final paragraph: \'Governments have designed \"nudge\" policies that guide citizens toward beneficial choices.\'', NULL),
(42, 4, NULL, 'mcq', 'The company ___ its quarterly earnings report next Monday.', NULL, NULL, 1, 'announces', 'will announce', 'announced', 'has announced', 'B', 'Future schedule with specific time expression \"next Monday\" requires simple future \"will announce\".', NULL),
(43, 4, NULL, 'mcq', 'All employees are ___ to complete the safety training by the end of the month.', NULL, NULL, 2, 'required', 'requiring', 'requirement', 'require', 'A', 'After \"are\" we need an adjective or past participle. \"Required\" (past participle used as adjective) fits grammatically.', NULL),
(44, 4, NULL, 'mcq', 'The new software system will ___ manual data entry by 80%.', NULL, NULL, 3, 'reduce', 'reduction', 'reduced', 'reducing', 'A', 'Modal verb \"will\" must be followed by the base form of the verb.', NULL),
(45, 4, NULL, 'mcq', '___ the bad weather forecast, the outdoor conference proceeded as planned.', NULL, NULL, 4, 'Despite', 'Although', 'Because of', 'Since', 'A', '\"Despite\" + noun phrase shows contrast. \"Although\" requires a clause. \"Because of\" shows cause, not contrast.', NULL),
(46, 4, NULL, 'mcq', 'The merger negotiations have been ___ for several months without a resolution.', NULL, NULL, 5, 'ongoing', 'ongoingly', 'to go on', 'gone on', 'A', '\"Ongoing\" is an adjective meaning \"continuing\" — correct complement for \"have been.\"', NULL),
(47, 4, NULL, 'mcq', 'Please submit your expense report ___ the end of business day Friday.', NULL, NULL, 6, 'until', 'by', 'during', 'within', 'B', '\"By\" indicates a deadline. \"Until\" suggests continuous action up to a point. \"By Friday\" = no later than Friday.', NULL),
(48, 4, NULL, 'mcq', 'The marketing team is ___ a new campaign to attract younger customers.', NULL, NULL, 7, 'developing', 'development', 'developed', 'develops', 'A', 'After \"is\" we need the present participle (-ing) to form present continuous tense.', NULL),
(49, 4, NULL, 'mcq', 'Ms. Park was promoted to regional manager ___ her outstanding sales performance.', NULL, NULL, 8, 'due to', 'so that', 'in case', 'provided that', 'A', '\"Due to\" + noun phrase expresses reason/cause. The others require clauses or express different relationships.', NULL),
(50, 4, NULL, 'mcq', 'The conference room is available for ___ between 9 AM and 5 PM on weekdays.', NULL, NULL, 9, 'reservation', 'reserve', 'reserving', 'reserved', 'A', 'After the preposition \"for\" we need a noun. \"Reservation\" is the correct noun form.', NULL),
(51, 4, NULL, 'mcq', 'Customers who place orders ___ midnight will receive next-day delivery.', NULL, NULL, 10, 'before', 'ago', 'since', 'during', 'A', '\"Before midnight\" indicates the time boundary for qualifying orders. Other options do not fit this context.', NULL),
(52, 4, 4, 'mcq', 'What is the primary purpose of Mr. Chen\'s email?', NULL, NULL, 11, 'To request a meeting with Ms. Williams', 'To confirm the details of a business agreement', 'To complain about a delayed project', 'To advertise a new software product', 'B', 'The email summarizes and confirms the terms discussed in a previous meeting.', NULL),
(53, 4, 4, 'mcq', 'When is the software implementation expected to be completed?', NULL, NULL, 12, 'March 22', 'April 3', 'April 6', 'April 24', 'D', 'The email states \"full implementation expected by April 24.\"', NULL),
(54, 4, 4, 'mcq', 'What is the one-time setup fee mentioned in the email?', NULL, NULL, 13, '$3,200', '$47,500', '$40,375', '$50,700', 'A', 'The email clearly states \"a one-time setup fee of $3,200.\"', NULL),
(55, 4, 4, 'mcq', 'According to the email, what discount is being offered?', NULL, NULL, 14, '3%', '10%', '15%', '20%', 'C', 'The email states \"a 15% discount from our standard pricing.\"', NULL),
(56, 4, 4, 'mcq', 'By what date does Mr. Chen need a response?', NULL, NULL, 15, 'March 15', 'March 22', 'April 3', 'April 5', 'B', 'The email states \"Please let me know by March 22.\"', NULL),
(57, 1, 5, 'mcq', 'The classical economic model assumed that people always make decisions that are in their best interest.', NULL, NULL, 1, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'A', 'Paragraph 2 states the classical model proposed humans are \"rational actors who consistently choose actions that maximize their utility or benefit.\"', NULL),
(58, 1, 5, 'mcq', 'Kahneman and Tversky conducted their research in the 1980s.', NULL, NULL, 2, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'B', 'The passage states their research was in \"the 1970s,\" not the 1980s.', NULL),
(59, 1, 5, 'mcq', 'People tend to overestimate the danger of plane crashes compared to car accidents.', NULL, NULL, 3, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'A', 'Paragraph 3 explicitly states this: people \"overestimate the likelihood of events that are easily recalled, such as plane crashes.\"', NULL),
(60, 1, 5, 'mcq', 'Kahneman shared the Nobel Prize with Tversky in 2002.', NULL, NULL, 4, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'C', 'The passage says Kahneman was awarded the prize but does not mention whether Tversky shared it (Tversky had died in 1996 and the prize is not awarded posthumously).', NULL),
(61, 1, 5, 'mcq', 'According to prospect theory, a financial loss of $100 causes more distress than the pleasure from gaining $100.', NULL, NULL, 5, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'A', 'Paragraph 4 states: \"the pain of losing $100 is approximately twice as powerful as the pleasure of gaining the same amount.\"', NULL),
(62, 1, 5, 'mcq', 'Early researchers believed emotional responses improved rational decision-making.', NULL, NULL, 6, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'B', 'Paragraph 5 states \"Contrary to earlier beliefs that emotion interferes with rational thought\" — early researchers believed emotion was harmful, not helpful.', NULL),
(63, 1, 5, 'mcq', 'Opt-out pension enrollment schemes have been introduced in some workplaces.', NULL, NULL, 7, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'A', 'The final paragraph mentions \"automatically enrolling employees in pension schemes (while allowing opt-out)\" as an example of nudge policy.', NULL),
(64, 1, 5, 'fill_blank', 'What term is used to describe the idealized rational human decision-maker in classical economics?', NULL, NULL, 8, NULL, NULL, NULL, NULL, 'Homo economicus', 'Paragraph 2: \"This concept, known as Homo economicus...\"', NULL),
(65, 1, 5, 'fill_blank', 'What name is given to the mental shortcuts that people use when making decisions?', NULL, NULL, 9, NULL, NULL, NULL, NULL, 'heuristics', 'Paragraph 3: \"people rely on mental shortcuts, or heuristics, when making decisions.\"', NULL),
(66, 1, 5, 'fill_blank', 'What is the name of the phenomenon where people are more affected by losses than equivalent gains?', NULL, NULL, 10, NULL, NULL, NULL, NULL, 'loss aversion', 'Paragraph 4: \"more sensitive to losses than equivalent gains — a phenomenon called loss aversion.\"', NULL),
(67, 1, 5, 'fill_blank', 'Which brain region is associated with emotional processing in decision-making?', NULL, NULL, 11, NULL, NULL, NULL, NULL, 'amygdala', 'Paragraph 5 mentions \"emotional brain regions, such as the amygdala.\"', NULL),
(68, 1, 5, 'fill_blank', 'What field combines psychological insights with economic behavior?', NULL, NULL, 12, NULL, NULL, NULL, NULL, 'Behavioral economics', 'Final paragraph: \"Behavioral economics — which applies psychological insights to economic behavior.\"', NULL),
(69, 1, 5, 'fill_blank', 'What policy approach guides people toward beneficial choices without restricting their freedom?', NULL, NULL, 13, NULL, NULL, NULL, NULL, 'nudge', 'Final paragraph: \'Governments have designed \"nudge\" policies that guide citizens toward beneficial choices.\'', NULL),
(70, 4, NULL, 'mcq', 'The company ___ its quarterly earnings report next Monday.', NULL, NULL, 1, 'announces', 'will announce', 'announced', 'has announced', 'B', 'Future schedule with specific time expression \"next Monday\" requires simple future \"will announce\".', NULL),
(71, 4, NULL, 'mcq', 'All employees are ___ to complete the safety training by the end of the month.', NULL, NULL, 2, 'required', 'requiring', 'requirement', 'require', 'A', 'After \"are\" we need an adjective or past participle. \"Required\" (past participle used as adjective) fits grammatically.', NULL),
(72, 4, NULL, 'mcq', 'The new software system will ___ manual data entry by 80%.', NULL, NULL, 3, 'reduce', 'reduction', 'reduced', 'reducing', 'A', 'Modal verb \"will\" must be followed by the base form of the verb.', NULL),
(73, 4, NULL, 'mcq', '___ the bad weather forecast, the outdoor conference proceeded as planned.', NULL, NULL, 4, 'Despite', 'Although', 'Because of', 'Since', 'A', '\"Despite\" + noun phrase shows contrast. \"Although\" requires a clause. \"Because of\" shows cause, not contrast.', NULL),
(74, 4, NULL, 'mcq', 'The merger negotiations have been ___ for several months without a resolution.', NULL, NULL, 5, 'ongoing', 'ongoingly', 'to go on', 'gone on', 'A', '\"Ongoing\" is an adjective meaning \"continuing\" — correct complement for \"have been.\"', NULL),
(75, 4, NULL, 'mcq', 'Please submit your expense report ___ the end of business day Friday.', NULL, NULL, 6, 'until', 'by', 'during', 'within', 'B', '\"By\" indicates a deadline. \"Until\" suggests continuous action up to a point. \"By Friday\" = no later than Friday.', NULL),
(76, 4, NULL, 'mcq', 'The marketing team is ___ a new campaign to attract younger customers.', NULL, NULL, 7, 'developing', 'development', 'developed', 'develops', 'A', 'After \"is\" we need the present participle (-ing) to form present continuous tense.', NULL),
(77, 4, NULL, 'mcq', 'Ms. Park was promoted to regional manager ___ her outstanding sales performance.', NULL, NULL, 8, 'due to', 'so that', 'in case', 'provided that', 'A', '\"Due to\" + noun phrase expresses reason/cause. The others require clauses or express different relationships.', NULL),
(78, 4, NULL, 'mcq', 'The conference room is available for ___ between 9 AM and 5 PM on weekdays.', NULL, NULL, 9, 'reservation', 'reserve', 'reserving', 'reserved', 'A', 'After the preposition \"for\" we need a noun. \"Reservation\" is the correct noun form.', NULL),
(79, 4, NULL, 'mcq', 'Customers who place orders ___ midnight will receive next-day delivery.', NULL, NULL, 10, 'before', 'ago', 'since', 'during', 'A', '\"Before midnight\" indicates the time boundary for qualifying orders. Other options do not fit this context.', NULL),
(80, 4, 6, 'mcq', 'What is the primary purpose of Mr. Chen\'s email?', NULL, NULL, 11, 'To request a meeting with Ms. Williams', 'To confirm the details of a business agreement', 'To complain about a delayed project', 'To advertise a new software product', 'B', 'The email summarizes and confirms the terms discussed in a previous meeting.', NULL),
(81, 4, 6, 'mcq', 'When is the software implementation expected to be completed?', NULL, NULL, 12, 'March 22', 'April 3', 'April 6', 'April 24', 'D', 'The email states \"full implementation expected by April 24.\"', NULL),
(82, 4, 6, 'mcq', 'What is the one-time setup fee mentioned in the email?', NULL, NULL, 13, '$3,200', '$47,500', '$40,375', '$50,700', 'A', 'The email clearly states \"a one-time setup fee of $3,200.\"', NULL),
(83, 4, 6, 'mcq', 'According to the email, what discount is being offered?', NULL, NULL, 14, '3%', '10%', '15%', '20%', 'C', 'The email states \"a 15% discount from our standard pricing.\"', NULL),
(84, 4, 6, 'mcq', 'By what date does Mr. Chen need a response?', NULL, NULL, 15, 'March 15', 'March 22', 'April 3', 'April 5', 'B', 'The email states \"Please let me know by March 22.\"', NULL),
(85, 1, 7, 'mcq', 'The classical economic model assumed that people always make decisions that are in their best interest.', NULL, NULL, 1, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'A', 'Paragraph 2 states the classical model proposed humans are \"rational actors who consistently choose actions that maximize their utility or benefit.\"', NULL),
(86, 1, 7, 'mcq', 'Kahneman and Tversky conducted their research in the 1980s.', NULL, NULL, 2, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'B', 'The passage states their research was in \"the 1970s,\" not the 1980s.', NULL),
(87, 1, 7, 'mcq', 'People tend to overestimate the danger of plane crashes compared to car accidents.', NULL, NULL, 3, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'A', 'Paragraph 3 explicitly states this: people \"overestimate the likelihood of events that are easily recalled, such as plane crashes.\"', NULL),
(88, 1, 7, 'mcq', 'Kahneman shared the Nobel Prize with Tversky in 2002.', NULL, NULL, 4, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'C', 'The passage says Kahneman was awarded the prize but does not mention whether Tversky shared it (Tversky had died in 1996 and the prize is not awarded posthumously).', NULL),
(89, 1, 7, 'mcq', 'According to prospect theory, a financial loss of $100 causes more distress than the pleasure from gaining $100.', NULL, NULL, 5, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'A', 'Paragraph 4 states: \"the pain of losing $100 is approximately twice as powerful as the pleasure of gaining the same amount.\"', NULL),
(90, 1, 7, 'mcq', 'Early researchers believed emotional responses improved rational decision-making.', NULL, NULL, 6, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'B', 'Paragraph 5 states \"Contrary to earlier beliefs that emotion interferes with rational thought\" — early researchers believed emotion was harmful, not helpful.', NULL),
(91, 1, 7, 'mcq', 'Opt-out pension enrollment schemes have been introduced in some workplaces.', NULL, NULL, 7, 'TRUE', 'FALSE', 'NOT GIVEN', NULL, 'A', 'The final paragraph mentions \"automatically enrolling employees in pension schemes (while allowing opt-out)\" as an example of nudge policy.', NULL),
(92, 1, 7, 'fill_blank', 'What term is used to describe the idealized rational human decision-maker in classical economics?', NULL, NULL, 8, NULL, NULL, NULL, NULL, 'Homo economicus', 'Paragraph 2: \"This concept, known as Homo economicus...\"', NULL),
(93, 1, 7, 'fill_blank', 'What name is given to the mental shortcuts that people use when making decisions?', NULL, NULL, 9, NULL, NULL, NULL, NULL, 'heuristics', 'Paragraph 3: \"people rely on mental shortcuts, or heuristics, when making decisions.\"', NULL),
(94, 1, 7, 'fill_blank', 'What is the name of the phenomenon where people are more affected by losses than equivalent gains?', NULL, NULL, 10, NULL, NULL, NULL, NULL, 'loss aversion', 'Paragraph 4: \"more sensitive to losses than equivalent gains — a phenomenon called loss aversion.\"', NULL),
(95, 1, 7, 'fill_blank', 'Which brain region is associated with emotional processing in decision-making?', NULL, NULL, 11, NULL, NULL, NULL, NULL, 'amygdala', 'Paragraph 5 mentions \"emotional brain regions, such as the amygdala.\"', NULL),
(96, 1, 7, 'fill_blank', 'What field combines psychological insights with economic behavior?', NULL, NULL, 12, NULL, NULL, NULL, NULL, 'Behavioral economics', 'Final paragraph: \"Behavioral economics — which applies psychological insights to economic behavior.\"', NULL),
(97, 1, 7, 'fill_blank', 'What policy approach guides people toward beneficial choices without restricting their freedom?', NULL, NULL, 13, NULL, NULL, NULL, NULL, 'nudge', 'Final paragraph: \'Governments have designed \"nudge\" policies that guide citizens toward beneficial choices.\'', NULL),
(98, 4, NULL, 'mcq', 'The company ___ its quarterly earnings report next Monday.', NULL, NULL, 1, 'announces', 'will announce', 'announced', 'has announced', 'B', 'Future schedule with specific time expression \"next Monday\" requires simple future \"will announce\".', NULL),
(99, 4, NULL, 'mcq', 'All employees are ___ to complete the safety training by the end of the month.', NULL, NULL, 2, 'required', 'requiring', 'requirement', 'require', 'A', 'After \"are\" we need an adjective or past participle. \"Required\" (past participle used as adjective) fits grammatically.', NULL),
(100, 4, NULL, 'mcq', 'The new software system will ___ manual data entry by 80%.', NULL, NULL, 3, 'reduce', 'reduction', 'reduced', 'reducing', 'A', 'Modal verb \"will\" must be followed by the base form of the verb.', NULL),
(101, 4, NULL, 'mcq', '___ the bad weather forecast, the outdoor conference proceeded as planned.', NULL, NULL, 4, 'Despite', 'Although', 'Because of', 'Since', 'A', '\"Despite\" + noun phrase shows contrast. \"Although\" requires a clause. \"Because of\" shows cause, not contrast.', NULL),
(102, 4, NULL, 'mcq', 'The merger negotiations have been ___ for several months without a resolution.', NULL, NULL, 5, 'ongoing', 'ongoingly', 'to go on', 'gone on', 'A', '\"Ongoing\" is an adjective meaning \"continuing\" — correct complement for \"have been.\"', NULL),
(103, 4, NULL, 'mcq', 'Please submit your expense report ___ the end of business day Friday.', NULL, NULL, 6, 'until', 'by', 'during', 'within', 'B', '\"By\" indicates a deadline. \"Until\" suggests continuous action up to a point. \"By Friday\" = no later than Friday.', NULL),
(104, 4, NULL, 'mcq', 'The marketing team is ___ a new campaign to attract younger customers.', NULL, NULL, 7, 'developing', 'development', 'developed', 'develops', 'A', 'After \"is\" we need the present participle (-ing) to form present continuous tense.', NULL),
(105, 4, NULL, 'mcq', 'Ms. Park was promoted to regional manager ___ her outstanding sales performance.', NULL, NULL, 8, 'due to', 'so that', 'in case', 'provided that', 'A', '\"Due to\" + noun phrase expresses reason/cause. The others require clauses or express different relationships.', NULL),
(106, 4, NULL, 'mcq', 'The conference room is available for ___ between 9 AM and 5 PM on weekdays.', NULL, NULL, 9, 'reservation', 'reserve', 'reserving', 'reserved', 'A', 'After the preposition \"for\" we need a noun. \"Reservation\" is the correct noun form.', NULL),
(107, 4, NULL, 'mcq', 'Customers who place orders ___ midnight will receive next-day delivery.', NULL, NULL, 10, 'before', 'ago', 'since', 'during', 'A', '\"Before midnight\" indicates the time boundary for qualifying orders. Other options do not fit this context.', NULL),
(108, 4, 8, 'mcq', 'What is the primary purpose of Mr. Chen\'s email?', NULL, NULL, 11, 'To request a meeting with Ms. Williams', 'To confirm the details of a business agreement', 'To complain about a delayed project', 'To advertise a new software product', 'B', 'The email summarizes and confirms the terms discussed in a previous meeting.', NULL),
(109, 4, 8, 'mcq', 'When is the software implementation expected to be completed?', NULL, NULL, 12, 'March 22', 'April 3', 'April 6', 'April 24', 'D', 'The email states \"full implementation expected by April 24.\"', NULL),
(110, 4, 8, 'mcq', 'What is the one-time setup fee mentioned in the email?', NULL, NULL, 13, '$3,200', '$47,500', '$40,375', '$50,700', 'A', 'The email clearly states \"a one-time setup fee of $3,200.\"', NULL),
(111, 4, 8, 'mcq', 'According to the email, what discount is being offered?', NULL, NULL, 14, '3%', '10%', '15%', '20%', 'C', 'The email states \"a 15% discount from our standard pricing.\"', NULL),
(112, 4, 8, 'mcq', 'By what date does Mr. Chen need a response?', NULL, NULL, 15, 'March 15', 'March 22', 'April 3', 'April 5', 'B', 'The email states \"Please let me know by March 22.\"', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `question_groups`
--

DROP TABLE IF EXISTS `question_groups`;
CREATE TABLE IF NOT EXISTS `question_groups` (
  `group_id` int NOT NULL AUTO_INCREMENT,
  `quiz_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `passage_text` longtext COLLATE utf8mb4_general_ci,
  `image_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `audio_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `instructions` text COLLATE utf8mb4_general_ci,
  `order_num` int DEFAULT '1',
  `test_id` int DEFAULT NULL,
  PRIMARY KEY (`group_id`),
  KEY `QuizID` (`quiz_id`),
  KEY `fk_question_groups_test` (`test_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `question_groups`
--

INSERT INTO `question_groups` (`group_id`, `quiz_id`, `title`, `passage_text`, `image_url`, `audio_url`, `instructions`, `order_num`, `test_id`) VALUES
(1, 1, 'READING PASSAGE 1 — The Psychology of Decision Making', 'Every day, humans make thousands of decisions, ranging from the trivial (what to eat for breakfast) to the life-altering (which career to pursue). Psychologists have long been fascinated by the mechanisms underlying these choices, and decades of research have revealed that human decision-making is far more complex, and often less rational, than previously assumed.\n\nThe classical economic model proposed that humans are rational actors who carefully weigh all available information before making optimal decisions. This concept, known as Homo economicus, suggested that people consistently choose actions that maximize their utility or benefit. However, groundbreaking research by Daniel Kahneman and Amos Tversky in the 1970s fundamentally challenged this assumption.\n\nKahneman and Tversky demonstrated through a series of elegant experiments that people rely on mental shortcuts, or heuristics, when making decisions. While these shortcuts often serve us well — allowing rapid decisions in complex situations — they can also lead to systematic errors called cognitive biases. The availability heuristic, for instance, causes people to overestimate the likelihood of events that are easily recalled, such as plane crashes (which receive extensive media coverage) while underestimating more common but less memorable risks like car accidents.\n\nPerhaps the most influential concept to emerge from this research was prospect theory, for which Kahneman was awarded the Nobel Prize in Economics in 2002. Prospect theory holds that people evaluate outcomes relative to a reference point (usually the status quo) and are more sensitive to losses than equivalent gains — a phenomenon called loss aversion. Experiments showed that the pain of losing $100 is approximately twice as powerful as the pleasure of gaining the same amount.\n\nMore recent neuroscientific research has added another dimension to our understanding of decision-making. Brain imaging studies have revealed that decisions involve an interplay between emotional brain regions, such as the amygdala, and more analytical areas like the prefrontal cortex. Contrary to earlier beliefs that emotion interferes with rational thought, researchers like Antonio Damasio have shown that emotional input is actually essential for making good decisions. Patients with damage to emotional brain regions often become paralyzed by indecision or make consistently poor choices, despite having intact analytical abilities.\n\nThe implications of this research extend far beyond academic psychology. Behavioral economics — which applies psychological insights to economic behavior — has influenced public policy in numerous countries. Governments have designed \"nudge\" policies that guide citizens toward beneficial choices without restricting freedom. For example, automatically enrolling employees in pension schemes (while allowing opt-out) dramatically increases retirement savings rates. Similarly, placing healthier food options at eye level in cafeterias has been shown to increase their consumption without prohibiting less healthy alternatives.', NULL, NULL, 'Questions 1-13 are based on Reading Passage 1. Answer questions 1-7 (True/False/Not Given), then 8-13 (Short Answer, NO MORE THAN THREE WORDS).', 1, NULL),
(2, 4, 'READING PASSAGE — Email Correspondence', 'FROM: David Chen <d.chen@techsolutions.com>\nTO: Sarah Williams <s.williams@northstarco.com>\nDATE: Tuesday, March 15\nSUBJECT: Follow-up: Software Implementation Project\n\nDear Ms. Williams,\n\nThank you for taking the time to meet with us last week regarding the implementation of our inventory management software. I wanted to follow up on several points discussed during our meeting.\n\nAs agreed, our technical team will begin the initial setup phase on April 3, with full implementation expected by April 24. Please note that your IT staff will need to be available for a two-day orientation session, which we suggest scheduling for April 5-6.\n\nRegarding the pricing structure: based on your company\'s requirements (150 user licenses, premium support package, and cloud hosting), the total annual cost will be $47,500, with a one-time setup fee of $3,200. This represents a 15% discount from our standard pricing, as discussed.\n\nPlease let me know by March 22 if these terms are acceptable so we can finalize the contract and begin preparations. If you have any questions, do not hesitate to contact me directly at extension 4412 or by email.\n\nBest regards,\nDavid Chen\nSenior Account Manager\nTech Solutions Inc.', NULL, NULL, 'Questions 11-15: Read the email and answer the questions.', 2, NULL),
(3, 1, 'READING PASSAGE 1 — The Psychology of Decision Making', 'Every day, humans make thousands of decisions, ranging from the trivial (what to eat for breakfast) to the life-altering (which career to pursue). Psychologists have long been fascinated by the mechanisms underlying these choices, and decades of research have revealed that human decision-making is far more complex, and often less rational, than previously assumed.\n\nThe classical economic model proposed that humans are rational actors who carefully weigh all available information before making optimal decisions. This concept, known as Homo economicus, suggested that people consistently choose actions that maximize their utility or benefit. However, groundbreaking research by Daniel Kahneman and Amos Tversky in the 1970s fundamentally challenged this assumption.\n\nKahneman and Tversky demonstrated through a series of elegant experiments that people rely on mental shortcuts, or heuristics, when making decisions. While these shortcuts often serve us well — allowing rapid decisions in complex situations — they can also lead to systematic errors called cognitive biases. The availability heuristic, for instance, causes people to overestimate the likelihood of events that are easily recalled, such as plane crashes (which receive extensive media coverage) while underestimating more common but less memorable risks like car accidents.\n\nPerhaps the most influential concept to emerge from this research was prospect theory, for which Kahneman was awarded the Nobel Prize in Economics in 2002. Prospect theory holds that people evaluate outcomes relative to a reference point (usually the status quo) and are more sensitive to losses than equivalent gains — a phenomenon called loss aversion. Experiments showed that the pain of losing $100 is approximately twice as powerful as the pleasure of gaining the same amount.\n\nMore recent neuroscientific research has added another dimension to our understanding of decision-making. Brain imaging studies have revealed that decisions involve an interplay between emotional brain regions, such as the amygdala, and more analytical areas like the prefrontal cortex. Contrary to earlier beliefs that emotion interferes with rational thought, researchers like Antonio Damasio have shown that emotional input is actually essential for making good decisions. Patients with damage to emotional brain regions often become paralyzed by indecision or make consistently poor choices, despite having intact analytical abilities.\n\nThe implications of this research extend far beyond academic psychology. Behavioral economics — which applies psychological insights to economic behavior — has influenced public policy in numerous countries. Governments have designed \"nudge\" policies that guide citizens toward beneficial choices without restricting freedom. For example, automatically enrolling employees in pension schemes (while allowing opt-out) dramatically increases retirement savings rates. Similarly, placing healthier food options at eye level in cafeterias has been shown to increase their consumption without prohibiting less healthy alternatives.', NULL, NULL, 'Questions 1-13 are based on Reading Passage 1. Answer questions 1-7 (True/False/Not Given), then 8-13 (Short Answer, NO MORE THAN THREE WORDS).', 1, NULL),
(4, 4, 'READING PASSAGE — Email Correspondence', 'FROM: David Chen <d.chen@techsolutions.com>\nTO: Sarah Williams <s.williams@northstarco.com>\nDATE: Tuesday, March 15\nSUBJECT: Follow-up: Software Implementation Project\n\nDear Ms. Williams,\n\nThank you for taking the time to meet with us last week regarding the implementation of our inventory management software. I wanted to follow up on several points discussed during our meeting.\n\nAs agreed, our technical team will begin the initial setup phase on April 3, with full implementation expected by April 24. Please note that your IT staff will need to be available for a two-day orientation session, which we suggest scheduling for April 5-6.\n\nRegarding the pricing structure: based on your company\'s requirements (150 user licenses, premium support package, and cloud hosting), the total annual cost will be $47,500, with a one-time setup fee of $3,200. This represents a 15% discount from our standard pricing, as discussed.\n\nPlease let me know by March 22 if these terms are acceptable so we can finalize the contract and begin preparations. If you have any questions, do not hesitate to contact me directly at extension 4412 or by email.\n\nBest regards,\nDavid Chen\nSenior Account Manager\nTech Solutions Inc.', NULL, NULL, 'Questions 11-15: Read the email and answer the questions.', 2, NULL),
(5, 1, 'READING PASSAGE 1 — The Psychology of Decision Making', 'Every day, humans make thousands of decisions, ranging from the trivial (what to eat for breakfast) to the life-altering (which career to pursue). Psychologists have long been fascinated by the mechanisms underlying these choices, and decades of research have revealed that human decision-making is far more complex, and often less rational, than previously assumed.\n\nThe classical economic model proposed that humans are rational actors who carefully weigh all available information before making optimal decisions. This concept, known as Homo economicus, suggested that people consistently choose actions that maximize their utility or benefit. However, groundbreaking research by Daniel Kahneman and Amos Tversky in the 1970s fundamentally challenged this assumption.\n\nKahneman and Tversky demonstrated through a series of elegant experiments that people rely on mental shortcuts, or heuristics, when making decisions. While these shortcuts often serve us well — allowing rapid decisions in complex situations — they can also lead to systematic errors called cognitive biases. The availability heuristic, for instance, causes people to overestimate the likelihood of events that are easily recalled, such as plane crashes (which receive extensive media coverage) while underestimating more common but less memorable risks like car accidents.\n\nPerhaps the most influential concept to emerge from this research was prospect theory, for which Kahneman was awarded the Nobel Prize in Economics in 2002. Prospect theory holds that people evaluate outcomes relative to a reference point (usually the status quo) and are more sensitive to losses than equivalent gains — a phenomenon called loss aversion. Experiments showed that the pain of losing $100 is approximately twice as powerful as the pleasure of gaining the same amount.\n\nMore recent neuroscientific research has added another dimension to our understanding of decision-making. Brain imaging studies have revealed that decisions involve an interplay between emotional brain regions, such as the amygdala, and more analytical areas like the prefrontal cortex. Contrary to earlier beliefs that emotion interferes with rational thought, researchers like Antonio Damasio have shown that emotional input is actually essential for making good decisions. Patients with damage to emotional brain regions often become paralyzed by indecision or make consistently poor choices, despite having intact analytical abilities.\n\nThe implications of this research extend far beyond academic psychology. Behavioral economics — which applies psychological insights to economic behavior — has influenced public policy in numerous countries. Governments have designed \"nudge\" policies that guide citizens toward beneficial choices without restricting freedom. For example, automatically enrolling employees in pension schemes (while allowing opt-out) dramatically increases retirement savings rates. Similarly, placing healthier food options at eye level in cafeterias has been shown to increase their consumption without prohibiting less healthy alternatives.', NULL, NULL, 'Questions 1-13 are based on Reading Passage 1. Answer questions 1-7 (True/False/Not Given), then 8-13 (Short Answer, NO MORE THAN THREE WORDS).', 1, NULL),
(6, 4, 'READING PASSAGE — Email Correspondence', 'FROM: David Chen <d.chen@techsolutions.com>\nTO: Sarah Williams <s.williams@northstarco.com>\nDATE: Tuesday, March 15\nSUBJECT: Follow-up: Software Implementation Project\n\nDear Ms. Williams,\n\nThank you for taking the time to meet with us last week regarding the implementation of our inventory management software. I wanted to follow up on several points discussed during our meeting.\n\nAs agreed, our technical team will begin the initial setup phase on April 3, with full implementation expected by April 24. Please note that your IT staff will need to be available for a two-day orientation session, which we suggest scheduling for April 5-6.\n\nRegarding the pricing structure: based on your company\'s requirements (150 user licenses, premium support package, and cloud hosting), the total annual cost will be $47,500, with a one-time setup fee of $3,200. This represents a 15% discount from our standard pricing, as discussed.\n\nPlease let me know by March 22 if these terms are acceptable so we can finalize the contract and begin preparations. If you have any questions, do not hesitate to contact me directly at extension 4412 or by email.\n\nBest regards,\nDavid Chen\nSenior Account Manager\nTech Solutions Inc.', NULL, NULL, 'Questions 11-15: Read the email and answer the questions.', 2, NULL),
(7, 1, 'READING PASSAGE 1 — The Psychology of Decision Making', 'Every day, humans make thousands of decisions, ranging from the trivial (what to eat for breakfast) to the life-altering (which career to pursue). Psychologists have long been fascinated by the mechanisms underlying these choices, and decades of research have revealed that human decision-making is far more complex, and often less rational, than previously assumed.\n\nThe classical economic model proposed that humans are rational actors who carefully weigh all available information before making optimal decisions. This concept, known as Homo economicus, suggested that people consistently choose actions that maximize their utility or benefit. However, groundbreaking research by Daniel Kahneman and Amos Tversky in the 1970s fundamentally challenged this assumption.\n\nKahneman and Tversky demonstrated through a series of elegant experiments that people rely on mental shortcuts, or heuristics, when making decisions. While these shortcuts often serve us well — allowing rapid decisions in complex situations — they can also lead to systematic errors called cognitive biases. The availability heuristic, for instance, causes people to overestimate the likelihood of events that are easily recalled, such as plane crashes (which receive extensive media coverage) while underestimating more common but less memorable risks like car accidents.\n\nPerhaps the most influential concept to emerge from this research was prospect theory, for which Kahneman was awarded the Nobel Prize in Economics in 2002. Prospect theory holds that people evaluate outcomes relative to a reference point (usually the status quo) and are more sensitive to losses than equivalent gains — a phenomenon called loss aversion. Experiments showed that the pain of losing $100 is approximately twice as powerful as the pleasure of gaining the same amount.\n\nMore recent neuroscientific research has added another dimension to our understanding of decision-making. Brain imaging studies have revealed that decisions involve an interplay between emotional brain regions, such as the amygdala, and more analytical areas like the prefrontal cortex. Contrary to earlier beliefs that emotion interferes with rational thought, researchers like Antonio Damasio have shown that emotional input is actually essential for making good decisions. Patients with damage to emotional brain regions often become paralyzed by indecision or make consistently poor choices, despite having intact analytical abilities.\n\nThe implications of this research extend far beyond academic psychology. Behavioral economics — which applies psychological insights to economic behavior — has influenced public policy in numerous countries. Governments have designed \"nudge\" policies that guide citizens toward beneficial choices without restricting freedom. For example, automatically enrolling employees in pension schemes (while allowing opt-out) dramatically increases retirement savings rates. Similarly, placing healthier food options at eye level in cafeterias has been shown to increase their consumption without prohibiting less healthy alternatives.', NULL, NULL, 'Questions 1-13 are based on Reading Passage 1. Answer questions 1-7 (True/False/Not Given), then 8-13 (Short Answer, NO MORE THAN THREE WORDS).', 1, NULL),
(8, 4, 'READING PASSAGE — Email Correspondence', 'FROM: David Chen <d.chen@techsolutions.com>\nTO: Sarah Williams <s.williams@northstarco.com>\nDATE: Tuesday, March 15\nSUBJECT: Follow-up: Software Implementation Project\n\nDear Ms. Williams,\n\nThank you for taking the time to meet with us last week regarding the implementation of our inventory management software. I wanted to follow up on several points discussed during our meeting.\n\nAs agreed, our technical team will begin the initial setup phase on April 3, with full implementation expected by April 24. Please note that your IT staff will need to be available for a two-day orientation session, which we suggest scheduling for April 5-6.\n\nRegarding the pricing structure: based on your company\'s requirements (150 user licenses, premium support package, and cloud hosting), the total annual cost will be $47,500, with a one-time setup fee of $3,200. This represents a 15% discount from our standard pricing, as discussed.\n\nPlease let me know by March 22 if these terms are acceptable so we can finalize the contract and begin preparations. If you have any questions, do not hesitate to contact me directly at extension 4412 or by email.\n\nBest regards,\nDavid Chen\nSenior Account Manager\nTech Solutions Inc.', NULL, NULL, 'Questions 11-15: Read the email and answer the questions.', 2, NULL),
(9, 17, 'Reading Passage 1', 'A short passage about online education and learner autonomy.', NULL, NULL, 'Read the text and answer questions 1-3.', 1, NULL),
(10, 17, 'Reading Passage 2', 'A short passage about climate-friendly transport in cities.', NULL, NULL, 'Read the text and answer questions 4-6.', 2, NULL),
(11, 18, 'Part 5 Set 1', NULL, NULL, NULL, 'Choose the best word to complete each sentence.', 1, NULL),
(12, 18, 'Part 5 Set 2', NULL, NULL, NULL, 'Choose the best word to complete each sentence.', 2, NULL),
(13, 18, 'Part 5 Set 3', NULL, NULL, NULL, 'Choose the best word to complete each sentence.', 3, NULL),
(14, 19, 'Essay Prompt Group 1', NULL, NULL, NULL, 'Complete the essay based on the prompt.', 1, NULL),
(15, 19, 'Essay Prompt Group 2', NULL, NULL, NULL, 'Complete the essay based on the prompt.', 2, NULL),
(16, 20, 'Speaking Cue Card 1', NULL, NULL, NULL, 'Speak for up to 2 minutes.', 1, NULL),
(17, 20, 'Speaking Cue Card 2', NULL, NULL, NULL, 'Speak for up to 2 minutes.', 2, NULL),
(18, 17, 'Reading Passage 3', 'A short passage about the future of remote work.', NULL, NULL, 'Read the text and answer questions 7-9.', 3, NULL),
(19, 18, 'Part 5 Set 4', NULL, NULL, NULL, 'Choose the best word to complete each sentence.', 4, NULL),
(20, 18, 'Part 5 Set 5', NULL, NULL, NULL, 'Choose the best word to complete each sentence.', 5, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `quizzes`
--

DROP TABLE IF EXISTS `quizzes`;
CREATE TABLE IF NOT EXISTS `quizzes` (
  `quiz_id` int NOT NULL AUTO_INCREMENT,
  `class_id` int DEFAULT NULL,
  `title` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `quiz_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `exam_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `exam_part` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `passage_text` longtext COLLATE utf8mb4_general_ci,
  `audio_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `instructions` text COLLATE utf8mb4_general_ci,
  `time_limit` int DEFAULT NULL,
  PRIMARY KEY (`quiz_id`),
  KEY `fk_quizzes_classes` (`class_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `quizzes`
--

INSERT INTO `quizzes` (`quiz_id`, `class_id`, `title`, `quiz_type`, `exam_type`, `exam_part`, `passage_text`, `audio_url`, `instructions`, `time_limit`) VALUES
(1, 21, 'IELTS Academic Reading — Full Test 1', 'mcq', 'IELTS', 'Reading', NULL, NULL, 'This test contains 3 reading passages with 40 questions. You have 60 minutes. Read each passage carefully before answering the questions. Questions are based on the information in the text.', 60),
(2, 21, 'IELTS Academic — Mock Test: Reading + Writing', 'mcq', 'IELTS', 'Reading', NULL, NULL, 'Full IELTS Academic test. Part 1: Reading (60 min, 40Q). Part 2: Writing (60 min, Task 1 + Task 2). Complete within the time limit.', 120),
(3, 24, 'TOEIC Full Test — Listening + Reading (200 câu)', 'mcq', 'TOEIC', 'Part1', NULL, NULL, 'Complete TOEIC test: Listening (Parts 1-4, 100 questions, 45 minutes) + Reading (Parts 5-7, 100 questions, 75 minutes). Total: 200 questions, 120 minutes.', 120),
(4, 24, 'TOEIC Mini Test — Reading Only (Part 5-7, 100 câu)', 'mcq', 'TOEIC', 'Part5', NULL, NULL, 'TOEIC Reading section only. Part 5: 30 questions (Incomplete Sentences). Part 6: 16 questions (Text Completion). Part 7: 54 questions (Reading Comprehension). Total: 100 questions, 75 minutes.', 75),
(5, 21, 'IELTS Academic Reading — Full Test 1', 'mcq', 'IELTS', 'Reading', NULL, NULL, 'This test contains 3 reading passages with 40 questions. You have 60 minutes. Read each passage carefully before answering the questions. Questions are based on the information in the text.', 60),
(6, 21, 'IELTS Academic — Mock Test: Reading + Writing', 'mcq', 'IELTS', 'Reading', NULL, NULL, 'Full IELTS Academic test. Part 1: Reading (60 min, 40Q). Part 2: Writing (60 min, Task 1 + Task 2). Complete within the time limit.', 120),
(7, 24, 'TOEIC Full Test — Listening + Reading (200 câu)', 'mcq', 'TOEIC', 'Part1', NULL, NULL, 'Complete TOEIC test: Listening (Parts 1-4, 100 questions, 45 minutes) + Reading (Parts 5-7, 100 questions, 75 minutes). Total: 200 questions, 120 minutes.', 120),
(8, 24, 'TOEIC Mini Test — Reading Only (Part 5-7, 100 câu)', 'mcq', 'TOEIC', 'Part5', NULL, NULL, 'TOEIC Reading section only. Part 5: 30 questions (Incomplete Sentences). Part 6: 16 questions (Text Completion). Part 7: 54 questions (Reading Comprehension). Total: 100 questions, 75 minutes.', 75),
(9, 21, 'IELTS Academic Reading — Full Test 1', 'mcq', 'IELTS', 'Reading', NULL, NULL, 'This test contains 3 reading passages with 40 questions. You have 60 minutes. Read each passage carefully before answering the questions. Questions are based on the information in the text.', 60),
(10, 21, 'IELTS Academic — Mock Test: Reading + Writing', 'mcq', 'IELTS', 'Reading', NULL, NULL, 'Full IELTS Academic test. Part 1: Reading (60 min, 40Q). Part 2: Writing (60 min, Task 1 + Task 2). Complete within the time limit.', 120),
(11, 24, 'TOEIC Full Test — Listening + Reading (200 câu)', 'mcq', 'TOEIC', 'Part1', NULL, NULL, 'Complete TOEIC test: Listening (Parts 1-4, 100 questions, 45 minutes) + Reading (Parts 5-7, 100 questions, 75 minutes). Total: 200 questions, 120 minutes.', 120),
(12, 24, 'TOEIC Mini Test — Reading Only (Part 5-7, 100 câu)', 'mcq', 'TOEIC', 'Part5', NULL, NULL, 'TOEIC Reading section only. Part 5: 30 questions (Incomplete Sentences). Part 6: 16 questions (Text Completion). Part 7: 54 questions (Reading Comprehension). Total: 100 questions, 75 minutes.', 75),
(13, 21, 'IELTS Academic Reading — Full Test 1', 'mcq', 'IELTS', 'Reading', NULL, NULL, 'This test contains 3 reading passages with 40 questions. You have 60 minutes. Read each passage carefully before answering the questions. Questions are based on the information in the text.', 60),
(14, 21, 'IELTS Academic — Mock Test: Reading + Writing', 'mcq', 'IELTS', 'Reading', NULL, NULL, 'Full IELTS Academic test. Part 1: Reading (60 min, 40Q). Part 2: Writing (60 min, Task 1 + Task 2). Complete within the time limit.', 120),
(15, 24, 'TOEIC Full Test — Listening + Reading (200 câu)', 'mcq', 'TOEIC', 'Part1', NULL, NULL, 'Complete TOEIC test: Listening (Parts 1-4, 100 questions, 45 minutes) + Reading (Parts 5-7, 100 questions, 75 minutes). Total: 200 questions, 120 minutes.', 120),
(16, 24, 'TOEIC Mini Test — Reading Only (Part 5-7, 100 câu)', 'mcq', 'TOEIC', 'Part5', NULL, NULL, 'TOEIC Reading section only. Part 5: 30 questions (Incomplete Sentences). Part 6: 16 questions (Text Completion). Part 7: 54 questions (Reading Comprehension). Total: 100 questions, 75 minutes.', 75),
(17, 21, 'IELTS Reading Mini Test 01', 'mcq', 'IELTS', 'Reading', 'Read the passage and answer the questions.', NULL, 'Chọn đáp án đúng nhất.', 30),
(18, 24, 'TOEIC Reading Practice 01', 'mcq', 'TOEIC', 'Part 5', 'Choose the best option to complete each sentence.', NULL, 'Làm bài trong thời gian quy định.', 25),
(19, 26, 'IELTS Writing Checkpoint 01', 'writing', 'IELTS', 'Writing Task 2', NULL, NULL, 'Viết tối thiểu 250 từ.', 40),
(20, 27, 'IELTS Speaking Mock 01', 'speaking', 'IELTS', 'Speaking Part 2', NULL, NULL, 'Chuẩn bị 1 phút và nói 2 phút.', 15);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `quiz_submissions`
--

DROP TABLE IF EXISTS `quiz_submissions`;
CREATE TABLE IF NOT EXISTS `quiz_submissions` (
  `quiz_submission_id` int NOT NULL AUTO_INCREMENT,
  `quiz_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `answers` text,
  `score` float DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `submitted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`quiz_submission_id`),
  KEY `fk_quiz_submissions_quiz` (`quiz_id`),
  KEY `fk_quiz_submissions_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `quiz_submissions`
--

INSERT INTO `quiz_submissions` (`quiz_submission_id`, `quiz_id`, `user_id`, `answers`, `score`, `duration`, `submitted_at`) VALUES
(1, 4, 1, '{\"1\":\"B\",\"2\":\"A\",\"3\":\"A\",\"4\":\"A\",\"5\":\"A\",\"6\":\"B\",\"7\":\"A\",\"8\":\"A\",\"9\":\"A\",\"10\":\"A\",\"11\":\"B\",\"12\":\"D\",\"13\":\"A\",\"14\":\"C\",\"15\":\"B\"}', 73.33, 2845, '2026-03-25 23:40:33'),
(2, 1, 1, '{\"1\":\"A\",\"2\":\"B\",\"3\":\"A\",\"4\":\"C\",\"5\":\"A\",\"6\":\"B\",\"7\":\"A\",\"8\":\"Homo economicus\",\"9\":\"heuristics\",\"10\":\"loss aversion\",\"11\":\"amygdala\",\"12\":\"Behavioral economics\",\"13\":\"nudge\"}', 84.62, 3245, '2026-03-27 23:40:33'),
(3, 1, 1, '{\"1\":\"A\",\"2\":\"B\",\"3\":\"C\"}', 7.5, 1200, '2026-04-01 09:10:00'),
(4, 2, 9, '{\"1\":\"TRUE\",\"2\":\"FALSE\"}', 6, 1400, '2026-04-01 09:25:00'),
(5, 3, 10, '{\"essay\":\"Task 1 response\"}', 6.5, 2100, '2026-04-02 20:20:00'),
(6, 4, 11, '{\"essay\":\"Task 2 response\"}', 7, 2400, '2026-04-02 21:15:00'),
(7, 5, 12, '{\"1\":\"C\",\"2\":\"D\",\"3\":\"A\"}', 24, 1000, '2026-04-03 07:55:00'),
(8, 6, 13, '{\"1\":\"B\",\"2\":\"A\",\"3\":\"D\"}', 12, 1100, '2026-04-03 14:20:00'),
(9, 7, 14, '{\"1\":\"A\",\"2\":\"C\"}', 3, 900, '2026-04-04 09:35:00'),
(10, 8, 15, '{\"1\":\"B\",\"2\":\"B\"}', 8, 950, '2026-04-04 11:05:00'),
(11, 9, 16, '{\"1\":\"D\",\"2\":\"A\"}', 7, 980, '2026-04-04 13:15:00'),
(12, 10, 17, '{\"1\":\"A\",\"2\":\"D\"}', 6.5, 1020, '2026-04-04 16:40:00'),
(13, 11, 18, '{\"1\":\"C\",\"2\":\"C\"}', 7.5, 1070, '2026-04-05 08:15:00'),
(14, 12, 19, '{\"1\":\"B\",\"2\":\"D\"}', 8, 950, '2026-04-05 09:25:00'),
(15, 13, 20, '{\"1\":\"A\",\"2\":\"A\"}', 7, 880, '2026-04-05 10:45:00'),
(16, 14, 29, '{\"1\":\"D\",\"2\":\"B\"}', 8.5, 990, '2026-04-05 11:20:00'),
(17, 15, 30, '{\"1\":\"C\",\"2\":\"A\"}', 9, 930, '2026-04-05 14:50:00'),
(18, 16, 31, '{\"1\":\"B\",\"2\":\"C\"}', 7.5, 970, '2026-04-05 15:40:00'),
(19, 17, 139, '{\"1\":\"A\",\"2\":\"B\"}', 8, 1000, '2026-04-06 08:05:00'),
(20, 18, 141, '{\"1\":\"D\",\"2\":\"D\"}', 18, 1120, '2026-04-06 08:50:00');

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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `schedules`
--

INSERT INTO `schedules` (`schedule_id`, `class_id`, `title`, `description`, `study_date`, `start_time`, `end_time`, `location`) VALUES
(1, 21, 'Buổi 1: IELTS Reading — True/False/NG', 'Học kỹ năng phân biệt True/False/Not Given. Luyện 1 passage thực tế.', '2026-03-29', '08:00:00', '10:00:00', 'Phòng 101 - Trung tâm NewSky, 123 Nguyễn Huệ, Q.1'),
(2, 21, 'Buổi 2: IELTS Reading — Matching Headings', 'Chiến lược nối tiêu đề đoạn văn, tiết kiệm thời gian.', '2026-03-31', '08:00:00', '10:00:00', 'Phòng 101 - Trung tâm NewSky, 123 Nguyễn Huệ, Q.1'),
(3, 21, 'Buổi 3: IELTS Writing Task 1 — Charts & Graphs', 'Cách viết overview và body paragraphs cho biểu đồ cột, đường, tròn.', '2026-04-03', '08:00:00', '10:00:00', 'Phòng 101 - Trung tâm NewSky, 123 Nguyễn Huệ, Q.1'),
(4, 21, 'Buổi 4: IELTS Writing Task 2 — Opinion Essays', 'Cấu trúc bài agree/disagree chuẩn band 7.0, luyện viết introduction và thesis.', '2026-04-05', '08:00:00', '10:00:00', 'Phòng 101 - Trung tâm NewSky, 123 Nguyễn Huệ, Q.1'),
(5, 21, 'Buổi 5: IELTS Mock Test Review', 'Chữa bài Mock Test lần 1, phân tích lỗi sai và hướng cải thiện.', '2026-04-08', '08:00:00', '11:00:00', 'Phòng 101 - Trung tâm NewSky, 123 Nguyễn Huệ, Q.1'),
(6, 22, 'Buổi 1: TOEIC Part 5 — Từ loại (Parts of Speech)', 'Phương pháp nhận diện vị trí từ loại: noun, verb, adjective, adverb.', '2026-03-30', '18:00:00', '20:00:00', 'Phòng 203 - Trung tâm NewSky, 123 Nguyễn Huệ, Q.1'),
(7, 22, 'Buổi 2: TOEIC Part 6 — Text Completion', 'Chiến lược điền từ vào đoạn văn: đọc ngữ cảnh, loại trừ đáp án sai.', '2026-04-01', '18:00:00', '20:00:00', 'Phòng 203 - Trung tâm NewSky, 123 Nguyễn Huệ, Q.1'),
(8, 22, 'Buổi 3: TOEIC Part 7 — Email & Notice Reading', 'Đọc nhanh email và thông báo, xác định ý chính và chi tiết cụ thể.', '2026-04-04', '18:00:00', '20:00:00', 'Phòng 203 - Trung tâm NewSky, 123 Nguyễn Huệ, Q.1'),
(9, 21, 'Buổi 1: IELTS Reading — True/False/NG', 'Học kỹ năng phân biệt True/False/Not Given. Luyện 1 passage thực tế.', '2026-03-29', '08:00:00', '10:00:00', 'Phòng 101 - Trung tâm NewSky, 123 Nguyễn Huệ, Q.1'),
(10, 21, 'Buổi 2: IELTS Reading — Matching Headings', 'Chiến lược nối tiêu đề đoạn văn, tiết kiệm thời gian.', '2026-03-31', '08:00:00', '10:00:00', 'Phòng 101 - Trung tâm NewSky, 123 Nguyễn Huệ, Q.1'),
(11, 21, 'Buổi 3: IELTS Writing Task 1 — Charts & Graphs', 'Cách viết overview và body paragraphs cho biểu đồ cột, đường, tròn.', '2026-04-03', '08:00:00', '10:00:00', 'Phòng 101 - Trung tâm NewSky, 123 Nguyễn Huệ, Q.1'),
(12, 21, 'Buổi 4: IELTS Writing Task 2 — Opinion Essays', 'Cấu trúc bài agree/disagree chuẩn band 7.0, luyện viết introduction và thesis.', '2026-04-05', '08:00:00', '10:00:00', 'Phòng 101 - Trung tâm NewSky, 123 Nguyễn Huệ, Q.1'),
(13, 21, 'Buổi 5: IELTS Mock Test Review', 'Chữa bài Mock Test lần 1, phân tích lỗi sai và hướng cải thiện.', '2026-04-08', '08:00:00', '11:00:00', 'Phòng 101 - Trung tâm NewSky, 123 Nguyễn Huệ, Q.1'),
(14, 22, 'Buổi 1: TOEIC Part 5 — Từ loại (Parts of Speech)', 'Phương pháp nhận diện vị trí từ loại: noun, verb, adjective, adverb.', '2026-03-30', '18:00:00', '20:00:00', 'Phòng 203 - Trung tâm NewSky, 123 Nguyễn Huệ, Q.1'),
(15, 22, 'Buổi 2: TOEIC Part 6 — Text Completion', 'Chiến lược điền từ vào đoạn văn: đọc ngữ cảnh, loại trừ đáp án sai.', '2026-04-01', '18:00:00', '20:00:00', 'Phòng 203 - Trung tâm NewSky, 123 Nguyễn Huệ, Q.1'),
(16, 22, 'Buổi 3: TOEIC Part 7 — Email & Notice Reading', 'Đọc nhanh email và thông báo, xác định ý chính và chi tiết cụ thể.', '2026-04-04', '18:00:00', '20:00:00', 'Phòng 203 - Trung tâm NewSky, 123 Nguyễn Huệ, Q.1'),
(17, 21, 'Buổi 5 - Reading Skills', 'Luyện kỹ năng đọc scanning và skimming.', '2026-04-08', '18:00:00', '20:00:00', 'Phòng A1'),
(18, 24, 'Buổi 4 - TOEIC Grammar', 'Ôn ngữ pháp Part 5 và 6.', '2026-04-09', '08:00:00', '10:00:00', 'Phòng B2'),
(19, 26, 'Buổi 6 - Writing Feedback', 'Chữa bài writing task 2.', '2026-04-10', '18:30:00', '20:30:00', 'Phòng C1'),
(20, 27, 'Buổi 3 - Speaking Mock', 'Thực hành speaking theo cặp.', '2026-04-11', '14:00:00', '16:00:00', 'Phòng D1');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tests`
--

DROP TABLE IF EXISTS `tests`;
CREATE TABLE IF NOT EXISTS `tests` (
  `test_id` int NOT NULL AUTO_INCREMENT,
  `class_id` int DEFAULT NULL,
  `title` varchar(150) NOT NULL,
  `description` text,
  `test_type` varchar(50) NOT NULL,
  `exam_type` varchar(50) NOT NULL,
  `exam_part` varchar(50) DEFAULT NULL,
  `skill_type` varchar(50) NOT NULL,
  `duration_minutes` int DEFAULT NULL,
  `total_score` decimal(5,2) DEFAULT '100.00',
  `attempts_allowed` int DEFAULT '1',
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `status` varchar(50) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`test_id`),
  KEY `idx_tests_class` (`class_id`),
  KEY `idx_tests_exam_type` (`exam_type`),
  KEY `idx_tests_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `test_submissions`
--

DROP TABLE IF EXISTS `test_submissions`;
CREATE TABLE IF NOT EXISTS `test_submissions` (
  `test_submission_id` int NOT NULL AUTO_INCREMENT,
  `test_id` int NOT NULL,
  `user_id` int NOT NULL,
  `started_at` datetime DEFAULT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL,
  `total_score` decimal(5,2) DEFAULT '0.00',
  `correct_answers` int DEFAULT '0',
  `total_questions` int DEFAULT '0',
  `attempt_number` int DEFAULT '1',
  `status` varchar(50) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`test_submission_id`),
  KEY `fk_test_submissions_test` (`test_id`),
  KEY `fk_test_submissions_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=152 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(147, 'A ha ha', 'asda@gmail.com', '$2a$10$L1ZUwZJeMGhnPtqEWfbztenaMsyDTjwpiqKNk25gOOwBl5C3JNhh.', NULL, NULL, 2, NULL, NULL, NULL, 0, 'active', NULL, NULL),
(148, 'aaaa', 'zzz@gmail.com', '$2a$10$nBRI.a/8HVYm89InWtGPIuq0rj7Qv9CEVbGupBNz/x1U3HsVHL3XS', NULL, NULL, 3, NULL, NULL, NULL, 1, 'active', NULL, NULL),
(149, 'aaaa', 'vvv@gmail.com', '$2a$10$RV/5anOVcbHgfao5hDeQFO.CIvLCdsXdmKnx8uoR8mxYb2ihauBJa', NULL, NULL, 3, NULL, NULL, NULL, 1, 'active', NULL, NULL),
(150, 'aaaa', 'aaaaaaa@gmail.com', '$2a$10$CJvNMABs/5samtoHd998aeAE6Ubm6DD9rHQ1x.H36JVl1/SeToICS', NULL, NULL, 3, NULL, NULL, NULL, 1, 'active', NULL, NULL),
(151, 'aaaa', 'jjjjj@gmail.com', '$2a$10$fan7OdttGGBdI7oMyKTNLuzZw2axwDfUR2bIzv9/gbhyvuH6dGzd6', NULL, NULL, 3, NULL, NULL, NULL, 1, 'active', NULL, NULL);

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
  ADD CONSTRAINT `fk_passages_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`quiz_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_passages_test` FOREIGN KEY (`test_id`) REFERENCES `tests` (`test_id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
  ADD CONSTRAINT `fk_questions_group` FOREIGN KEY (`group_id`) REFERENCES `question_groups` (`group_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_questions_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`quiz_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_questions_test` FOREIGN KEY (`test_id`) REFERENCES `tests` (`test_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `question_groups`
--
ALTER TABLE `question_groups`
  ADD CONSTRAINT `fk_question_groups_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`quiz_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_question_groups_test` FOREIGN KEY (`test_id`) REFERENCES `tests` (`test_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `quizzes`
--
ALTER TABLE `quizzes`
  ADD CONSTRAINT `fk_quizzes_classes` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
-- Các ràng buộc cho bảng `tests`
--
ALTER TABLE `tests`
  ADD CONSTRAINT `fk_tests_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `test_submissions`
--
ALTER TABLE `test_submissions`
  ADD CONSTRAINT `fk_test_submissions_test` FOREIGN KEY (`test_id`) REFERENCES `tests` (`test_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_test_submissions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_roles` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
