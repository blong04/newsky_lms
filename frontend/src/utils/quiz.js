// Parse đáp án cũ và mới để màn xem lại bài làm đọc được cả dữ liệu đã lưu trước/sau refactor.
export const parseAnswerMap = (rawAnswers) => {
  if (!rawAnswers) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawAnswers);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return String(rawAnswers)
      .split("|")
      .filter(Boolean)
      .reduce((answerMap, pair) => {
        const [questionId, value] = pair.split(":");
        if (questionId) {
          answerMap[questionId] = value ?? "";
        }
        return answerMap;
      }, {});
  }
};

// Gom câu hỏi theo group để các màn hình quiz hiển thị đúng passage/audio/instructions của đề.
export const buildQuizSections = (groups, questions) => {
  const safeGroups = groups || [];
  const safeQuestions = questions || [];
  const groupedSections = safeGroups.map((group) => ({
    key: `group-${group.id}`,
    group,
    questions: safeQuestions.filter((question) => Number(question.groupId) === Number(group.id)),
  }));
  const ungroupedQuestions = safeQuestions.filter((question) => (
    !question.groupId || !safeGroups.some((group) => Number(group.id) === Number(question.groupId))
  ));

  return ungroupedQuestions.length > 0
    ? [...groupedSections, { key: "ungrouped", group: null, questions: ungroupedQuestions }]
    : groupedSections;
};

// Quy đổi cấu hình quiz sang loại đề backend đang lưu.
export const inferQuizType = (examPart, questionList) => {
  if (String(examPart || "").startsWith("Speaking")) {
    return "speaking";
  }

  if ((questionList || []).some((question) => question.questionType === "writing")) {
    return "writing";
  }

  return "mcq";
};
