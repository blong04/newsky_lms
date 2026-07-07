const BASE_QUESTION = {
  content: "",
  questionType: "mcq",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "",
  imageUrl: "",
  audioUrl: "",
  explanation: "",
};

// Blueprint cho từng bài kiểm tra theo đúng examType/examPart để admin không phải tự thêm tay từng câu.
export const QUIZ_BLUEPRINTS = {
  IELTS: {
    Reading: {
      timeLimit: 60,
      instructions: "Đọc kỹ từng passage và trả lời câu hỏi theo đúng yêu cầu của từng nhóm.",
      groups: [
        { key: "reading_passage_1", label: "Reading Passage 1", description: "13 câu", questionCount: 13, allowedQuestionTypes: ["mcq", "fill_blank", "matching"], hasPassage: true },
        { key: "reading_passage_2", label: "Reading Passage 2", description: "13 câu", questionCount: 13, allowedQuestionTypes: ["mcq", "fill_blank", "matching"], hasPassage: true },
        { key: "reading_passage_3", label: "Reading Passage 3", description: "14 câu", questionCount: 14, allowedQuestionTypes: ["mcq", "fill_blank", "matching"], hasPassage: true },
      ],
    },
    Listening: {
      timeLimit: 30,
      instructions: "Nghe từng section và trả lời câu hỏi tương ứng.",
      groups: [
        { key: "listening_section_1", label: "Listening Section 1", description: "10 câu", questionCount: 10, allowedQuestionTypes: ["mcq", "fill_blank"], hasAudio: true },
        { key: "listening_section_2", label: "Listening Section 2", description: "10 câu", questionCount: 10, allowedQuestionTypes: ["mcq", "fill_blank"], hasAudio: true },
        { key: "listening_section_3", label: "Listening Section 3", description: "10 câu", questionCount: 10, allowedQuestionTypes: ["mcq", "fill_blank"], hasAudio: true },
        { key: "listening_section_4", label: "Listening Section 4", description: "10 câu", questionCount: 10, allowedQuestionTypes: ["mcq", "fill_blank"], hasAudio: true },
      ],
    },
    Writing_Task1: {
      timeLimit: 20,
      instructions: "Viết tối thiểu 150 từ theo đúng yêu cầu đề bài.",
      groups: [
        { key: "writing_task_1", label: "Writing Task 1", description: "1 đề bài viết", questionCount: 1, allowedQuestionTypes: ["writing"], hasPassage: true },
      ],
    },
    Writing_Task2: {
      timeLimit: 40,
      instructions: "Viết tối thiểu 250 từ cho đề bài luận bên dưới.",
      groups: [
        { key: "writing_task_2", label: "Writing Task 2", description: "1 đề bài viết", questionCount: 1, allowedQuestionTypes: ["writing"], hasPassage: true },
      ],
    },
  },
  TOEIC: {
    Part1: {
      timeLimit: 8,
      instructions: "Quan sát hình và chọn đáp án mô tả phù hợp nhất.",
      groups: [
        { key: "toeic_part_1", label: "Part 1 — Photographs", description: "6 câu", questionCount: 6, allowedQuestionTypes: ["mcq"], questionHasImage: true },
      ],
    },
    Part2: {
      timeLimit: 10,
      instructions: "Nghe câu hỏi/câu nói và chọn phản hồi phù hợp nhất.",
      groups: [
        { key: "toeic_part_2", label: "Part 2 — Question Response", description: "25 câu", questionCount: 25, allowedQuestionTypes: ["mcq"], questionHasAudio: true },
      ],
    },
    Part3: {
      timeLimit: 18,
      instructions: "Mỗi conversation đi kèm 3 câu hỏi.",
      groups: Array.from({ length: 13 }, (_, index) => ({
        key: `toeic_part_3_group_${index + 1}`,
        label: `Conversation ${index + 1}`,
        description: "3 câu",
        questionCount: 3,
        allowedQuestionTypes: ["mcq"],
        hasAudio: true,
      })),
    },
    Part4: {
      timeLimit: 18,
      instructions: "Mỗi short talk đi kèm 3 câu hỏi.",
      groups: Array.from({ length: 10 }, (_, index) => ({
        key: `toeic_part_4_group_${index + 1}`,
        label: `Short Talk ${index + 1}`,
        description: "3 câu",
        questionCount: 3,
        allowedQuestionTypes: ["mcq"],
        hasAudio: true,
      })),
    },
    Part5: {
      timeLimit: 20,
      instructions: "Chọn từ/cụm từ đúng nhất để hoàn thành câu.",
      groups: [
        { key: "toeic_part_5", label: "Part 5 — Incomplete Sentences", description: "30 câu", questionCount: 30, allowedQuestionTypes: ["mcq", "fill_blank"] },
      ],
    },
    Part6: {
      timeLimit: 15,
      instructions: "Điền từ/câu phù hợp vào từng đoạn văn.",
      groups: Array.from({ length: 4 }, (_, index) => ({
        key: `toeic_part_6_group_${index + 1}`,
        label: `Text Completion ${index + 1}`,
        description: "4 câu",
        questionCount: 4,
        allowedQuestionTypes: ["mcq", "fill_blank"],
        hasPassage: true,
      })),
    },
    Part7: {
      timeLimit: 55,
      instructions: "Đọc từng bài và trả lời câu hỏi theo passage tương ứng.",
      groups: Array.from({ length: 9 }, (_, index) => ({
        key: `toeic_part_7_group_${index + 1}`,
        label: `Reading Set ${index + 1}`,
        description: "6 câu",
        questionCount: 6,
        allowedQuestionTypes: ["mcq", "fill_blank", "matching"],
        hasPassage: true,
      })),
    },
  },
};

const createQuestionDraft = (questionType, orderNum) => ({
  ...BASE_QUESTION,
  questionType,
  orderNum,
});

// Tạo block section/question cố định theo blueprint đã chọn.
export const createQuizSections = (examType, examPart) => {
  const config = QUIZ_BLUEPRINTS[examType]?.[examPart];
  if (!config) {
    return [];
  }

  return config.groups.map((group, groupIndex) => ({
    ...group,
    clientKey: `${group.key}-${groupIndex + 1}`,
    title: group.label,
    passageText: "",
    imageUrl: "",
    audioUrl: "",
    instructions: "",
    questions: Array.from({ length: group.questionCount }, (_, questionIndex) => (
      createQuestionDraft(group.allowedQuestionTypes[0], questionIndex + 1)
    )),
  }));
};

// Áp mặc định theo part để admin chỉ cần tinh chỉnh thay vì nhập lại từ đầu.
export const applyQuizBlueprintDefaults = (currentForm, examType, examPart) => {
  const config = QUIZ_BLUEPRINTS[examType]?.[examPart];
  if (!config) {
    return currentForm;
  }

  return {
    ...currentForm,
    examType,
    examPart,
    timeLimit: config.timeLimit,
    instructions: config.instructions,
    passageText: "",
    audioUrl: "",
  };
};

// Tách dữ liệu đã lưu thành các block phù hợp với blueprint để quay lại màn chỉnh sửa.
export const hydrateQuizSections = (examType, examPart, groups = [], questions = []) => {
  const blueprintSections = createQuizSections(examType, examPart);
  const questionGroups = [...groups].sort((first, second) => Number(first.orderNum || 0) - Number(second.orderNum || 0));
  const sortedQuestions = [...questions].sort((first, second) => Number(first.orderNum || 0) - Number(second.orderNum || 0));

  if (questionGroups.length === 0) {
    const singleSection = blueprintSections[0];
    if (!singleSection) {
      return [];
    }

    return [
      {
        ...singleSection,
        questions: sortedQuestions.length > 0
          ? sortedQuestions.map((question, index) => ({
              ...BASE_QUESTION,
              ...question,
              orderNum: index + 1,
            }))
          : singleSection.questions,
      },
    ];
  }

  return questionGroups.map((group, index) => {
    const matchingBlueprint = blueprintSections[index] || blueprintSections[0];
    const groupQuestions = sortedQuestions.filter((question) => Number(question.groupId) === Number(group.id));

    return {
      ...(matchingBlueprint || {}),
      clientKey: group.id ? `group-${group.id}` : `${matchingBlueprint?.key || "group"}-${index + 1}`,
      title: group.title || matchingBlueprint?.label || `Nhóm ${index + 1}`,
      passageText: group.passageText || "",
      imageUrl: group.imageUrl || "",
      audioUrl: group.audioUrl || "",
      instructions: group.instructions || "",
      questions: groupQuestions.length > 0
        ? groupQuestions.map((question, questionIndex) => ({
            ...BASE_QUESTION,
            ...question,
            orderNum: questionIndex + 1,
          }))
        : (matchingBlueprint?.questions || []),
    };
  });
};

// Chuyển block section về payload groups/questions để backend lưu đúng thứ tự và liên kết.
export const serializeQuizSections = (sections = []) => {
  let orderCounter = 1;

  const groups = sections.map((section, sectionIndex) => ({
    clientKey: section.clientKey,
    title: section.title,
    passageText: section.passageText || "",
    imageUrl: section.imageUrl || "",
    audioUrl: section.audioUrl || "",
    instructions: section.instructions || "",
    orderNum: sectionIndex + 1,
  }));

  const questions = sections.flatMap((section) => (
    (section.questions || []).map((question) => ({
      questionType: question.questionType,
      content: question.content,
      imageUrl: question.imageUrl || "",
      audioUrl: question.audioUrl || "",
      optionA: question.optionA || "",
      optionB: question.optionB || "",
      optionC: question.optionC || "",
      optionD: question.optionD || "",
      correctAnswer: question.correctAnswer || "",
      explanation: question.explanation || "",
      groupKey: section.clientKey,
      orderNum: orderCounter++,
    }))
  ));

  return { groups, questions };
};

// Đếm số câu đã nhập nội dung để hiện tiến độ.
export const countFilledQuizQuestions = (sections = []) => (
  sections.reduce((total, section) => (
    total + (section.questions || []).filter((question) => question.content?.trim()).length
  ), 0)
);
