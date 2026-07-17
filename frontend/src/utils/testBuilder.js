const QUESTION_TEMPLATE = {
  content: "",
  questionType: "mcq",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "",
  explanation: "",
};

const toGroupClientKey = (value, fallbackKey) => (
  value != null && value !== ""
    ? `group-${value}`
    : fallbackKey
);

// Blueprint full form để màn quản trị dựng sẵn các phần thi theo đúng cấu trúc quen thuộc.
export const TEST_BLUEPRINTS = {
  IELTS: {
    label: "IELTS Full Mock Test",
    defaults: {
      part: "Full Test",
      timeLimit: 165,
      totalScore: 9,
      attemptsAllowed: 1,
      status: "active",
    },
    sections: [
      { key: "listening", label: "Listening", description: "4 sections, 40 câu", questionCount: 40, allowedQuestionTypes: ["mcq", "fill_blank", "matching"], hasAudio: true },
      { key: "reading_1", label: "Reading Passage 1", description: "Passage 1, 13 câu", questionCount: 13, allowedQuestionTypes: ["mcq", "fill_blank", "matching"], hasPassage: true },
      { key: "reading_2", label: "Reading Passage 2", description: "Passage 2, 13 câu", questionCount: 13, allowedQuestionTypes: ["mcq", "fill_blank", "matching"], hasPassage: true },
      { key: "reading_3", label: "Reading Passage 3", description: "Passage 3, 14 câu", questionCount: 14, allowedQuestionTypes: ["mcq", "fill_blank", "matching"], hasPassage: true },
      { key: "writing_1", label: "Writing Task 1", description: "1 đề bài viết", questionCount: 1, allowedQuestionTypes: ["writing"], hasPassage: true },
      { key: "writing_2", label: "Writing Task 2", description: "1 đề bài viết", questionCount: 1, allowedQuestionTypes: ["writing"], hasPassage: true },
    ],
  },
  TOEIC: {
    label: "TOEIC Full Mock Test",
    defaults: {
      part: "Full Test",
      timeLimit: 120,
      totalScore: 990,
      attemptsAllowed: 1,
      status: "active",
    },
    sections: [
      { key: "part_1", label: "Part 1 — Photographs", description: "6 câu", questionCount: 6, allowedQuestionTypes: ["mcq"], questionHasImage: true },
      { key: "part_2", label: "Part 2 — Question Response", description: "25 câu", questionCount: 25, allowedQuestionTypes: ["mcq"], hasAudio: true },
      { key: "part_3", label: "Part 3 — Conversations", description: "39 câu", questionCount: 39, allowedQuestionTypes: ["mcq"], hasAudio: true },
      { key: "part_4", label: "Part 4 — Short Talks", description: "30 câu", questionCount: 30, allowedQuestionTypes: ["mcq"], hasAudio: true },
      { key: "part_5", label: "Part 5 — Incomplete Sentences", description: "30 câu", questionCount: 30, allowedQuestionTypes: ["mcq", "fill_blank"] },
      { key: "part_6", label: "Part 6 — Text Completion", description: "16 câu", questionCount: 16, allowedQuestionTypes: ["mcq", "fill_blank"], hasPassage: true },
      { key: "part_7", label: "Part 7 — Reading Comprehension", description: "54 câu", questionCount: 54, allowedQuestionTypes: ["mcq", "fill_blank", "matching"], hasPassage: true },
    ],
  },
};

// Tạo mẫu câu hỏi rỗng theo loại mặc định của từng section.
export const createQuestionDraft = (questionType = "mcq", orderNum = 1) => ({
  ...QUESTION_TEMPLATE,
  questionType,
  orderNum,
});

// Tạo danh sách section chuẩn cho một full test mới.
export const createSectionsFromBlueprint = (examType) => {
  const blueprint = TEST_BLUEPRINTS[examType] || TEST_BLUEPRINTS.IELTS;

  return blueprint.sections.map((section, sectionIndex) => ({
    ...section,
    clientKey: `${section.key}-${sectionIndex + 1}`,
    title: section.label,
    passageText: "",
    imageUrl: "",
    audioUrl: "",
    instructions: "",
    questions: Array.from({ length: section.questionCount }, (_, questionIndex) => (
      createQuestionDraft(section.allowedQuestionTypes[0], questionIndex + 1)
    )),
  }));
};

// Áp cấu hình mặc định theo chứng chỉ để admin đỡ nhập tay các trường lặp lại.
export const applyBlueprintDefaults = (currentForm, examType) => {
  const blueprint = TEST_BLUEPRINTS[examType] || TEST_BLUEPRINTS.IELTS;

  return {
    ...currentForm,
    examType,
    part: blueprint.defaults.part,
    timeLimit: blueprint.defaults.timeLimit,
    totalScore: blueprint.defaults.totalScore,
    attemptsAllowed: blueprint.defaults.attemptsAllowed,
    status: blueprint.defaults.status,
  };
};

// Tách bộ câu hỏi phẳng từ backend thành từng section full form để quay lại màn chỉnh sửa.
export const splitQuestionsIntoSections = (examType, groups = [], questions = []) => {
  const blueprint = TEST_BLUEPRINTS[examType] || TEST_BLUEPRINTS.IELTS;
  const sortedQuestions = [...questions].sort((first, second) => (
    Number(first.orderNum || 0) - Number(second.orderNum || 0)
  ));
  const sortedGroups = [...groups].sort((first, second) => (
    Number(first.orderNum || 0) - Number(second.orderNum || 0)
  ));

  if (sortedGroups.length > 0) {
    return sortedGroups.map((group, sectionIndex) => {
      const blueprintSection = blueprint.sections[sectionIndex] || blueprint.sections[0];
      const sectionQuestions = sortedQuestions.filter((question) => Number(question.groupId) === Number(group.id));

      return {
        ...(blueprintSection || {}),
        clientKey: toGroupClientKey(group.id, `${blueprintSection?.key || "group"}-${sectionIndex + 1}`),
        title: group.title || blueprintSection?.label || `Phần ${sectionIndex + 1}`,
        passageText: group.passageText || "",
        imageUrl: group.imageUrl || "",
        audioUrl: group.audioUrl || "",
        instructions: group.instructions || "",
        questions: sectionQuestions.length > 0
          ? sectionQuestions.map((question, questionIndex) => ({
              ...QUESTION_TEMPLATE,
              ...question,
              orderNum: questionIndex + 1,
            }))
          : Array.from({ length: blueprintSection?.questionCount || 0 }, (_, questionIndex) => (
              createQuestionDraft(blueprintSection?.allowedQuestionTypes?.[0] || "mcq", questionIndex + 1)
            )),
      };
    });
  }

  let cursor = 0;
  const sections = blueprint.sections.map((section, sectionIndex) => {
    const sectionQuestions = sortedQuestions.slice(cursor, cursor + section.questionCount);
    cursor += section.questionCount;
    return {
      ...section,
      clientKey: `${section.key}-${sectionIndex + 1}`,
      title: section.label,
      passageText: "",
      imageUrl: "",
      audioUrl: "",
      instructions: "",
      questions: Array.from({ length: section.questionCount }, (_, questionIndex) => (
        sectionQuestions[questionIndex]
          ? {
              ...QUESTION_TEMPLATE,
              ...sectionQuestions[questionIndex],
              orderNum: questionIndex + 1,
            }
          : createQuestionDraft(section.allowedQuestionTypes[0], questionIndex + 1)
      )),
    };
  });

  if (cursor < sortedQuestions.length) {
    sections.push({
      key: "extra",
      label: "Câu hỏi bổ sung",
      description: "Các câu hỏi nằm ngoài cấu trúc mặc định",
      questionCount: sortedQuestions.length - cursor,
      allowedQuestionTypes: ["mcq", "fill_blank", "matching", "writing"],
      clientKey: "extra-section",
      title: "Câu hỏi bổ sung",
      passageText: "",
      imageUrl: "",
      audioUrl: "",
      instructions: "",
      questions: sortedQuestions.slice(cursor).map((question, questionIndex) => ({
        ...QUESTION_TEMPLATE,
        ...question,
        orderNum: questionIndex + 1,
      })),
    });
  }

  return sections;
};

// Chuyển block section về payload groups/questions để backend lưu đúng owner và thứ tự.
export const serializeTestSections = (sections = []) => {
  let orderCounter = 1;

  const groups = sections.map((section, sectionIndex) => ({
    clientKey: section.clientKey,
    title: section.title || section.label || `Phần ${sectionIndex + 1}`,
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

// Đếm nhanh số câu đã nhập nội dung trong một phần thi.
export const countCompletedQuestions = (section) => (
  (section.questions || []).filter((question) => question.content?.trim()).length
);
