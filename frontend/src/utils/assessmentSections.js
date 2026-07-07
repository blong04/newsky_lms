import { buildQuizSections } from "./quiz";
import { QUIZ_BLUEPRINTS } from "./quizBuilder";
import { TEST_BLUEPRINTS } from "./testBuilder";

const sortQuestionsByOrder = (questions = []) => (
  [...questions].sort((first, second) => Number(first.orderNum || 0) - Number(second.orderNum || 0))
);

const toRenderableGroup = (section, fallbackTitle) => ({
  title: section.title || section.label || fallbackTitle || "",
  passageText: section.passageText || "",
  imageUrl: section.imageUrl || "",
  audioUrl: section.audioUrl || "",
  instructions: section.instructions || "",
});

const toExtraSection = (questions, prefix) => (
  questions.length > 0
    ? [{
        key: `${prefix}-extra`,
        group: {
          title: "Câu hỏi bổ sung",
          passageText: "",
          imageUrl: "",
          audioUrl: "",
          instructions: "",
        },
        questions,
      }]
    : []
);

const chunkQuestionsByBlueprint = (blueprintSections = [], questions = [], prefix = "section") => {
  const sortedQuestions = sortQuestionsByOrder(questions);
  let cursor = 0;

  const sections = blueprintSections.reduce((renderSections, blueprintSection, index) => {
    const chunk = sortedQuestions.slice(cursor, cursor + Number(blueprintSection.questionCount || 0));
    cursor += Number(blueprintSection.questionCount || 0);

    if (chunk.length === 0) {
      return renderSections;
    }

    renderSections.push({
      key: `${prefix}-${blueprintSection.key || index + 1}`,
      group: toRenderableGroup(blueprintSection, `Nhóm ${index + 1}`),
      questions: chunk,
    });
    return renderSections;
  }, []);

  return [
    ...sections,
    ...toExtraSection(sortedQuestions.slice(cursor), prefix),
  ];
};

const resolveQuizBlueprint = (examType, examPart) => {
  if (!examType || !examPart || !QUIZ_BLUEPRINTS[examType]) {
    return null;
  }

  const blueprintMap = QUIZ_BLUEPRINTS[examType];
  const normalizedPart = String(examPart).trim();
  const candidates = [
    normalizedPart,
    normalizedPart.replace(/\s+/g, ""),
    normalizedPart.replace(/\s+/g, "_"),
    normalizedPart.replace(/[^a-zA-Z0-9]+/g, ""),
    normalizedPart.replace(/[^a-zA-Z0-9]+/g, "_"),
  ];
  const matchedKey = candidates.find((candidate) => blueprintMap[candidate]);
  return matchedKey ? blueprintMap[matchedKey] : null;
};

const shouldUseBlueprintFallback = (sections = [], expectedSectionCount = 0) => {
  if (sections.length === 0) {
    return true;
  }

  if (sections.length === 1 && expectedSectionCount > 1) {
    return true;
  }

  const populatedGroups = sections.filter((section) => section.group);
  return populatedGroups.length === 0 && expectedSectionCount > 0;
};

// Dựng section hiển thị cho quiz theo dữ liệu thực tế; nếu backend chưa lưu group thì tự suy ra từ blueprint.
export const buildQuizSectionsForDisplay = (quizMeta, groups, questions) => {
  const directSections = buildQuizSections(groups, questions);
  const blueprint = resolveQuizBlueprint(quizMeta?.examType, quizMeta?.examPart);

  if (!blueprint || !shouldUseBlueprintFallback(directSections, blueprint.groups?.length || 0)) {
    return directSections;
  }

  const inferredSections = chunkQuestionsByBlueprint(blueprint.groups || [], questions, "quiz");
  return inferredSections.length > 0 ? inferredSections : directSections;
};

// Dựng section hiển thị cho test full form; ưu tiên group thực, nếu thiếu sẽ chia lại theo blueprint TOEIC/IELTS.
export const buildTestSectionsForDisplay = (testMeta, groups, questions) => {
  const directSections = buildQuizSections(groups, questions);
  const blueprint = TEST_BLUEPRINTS[testMeta?.examType];

  if (!blueprint || !shouldUseBlueprintFallback(directSections, blueprint.sections?.length || 0)) {
    return directSections;
  }

  const inferredSections = chunkQuestionsByBlueprint(blueprint.sections || [], questions, "test");
  return inferredSections.length > 0 ? inferredSections : directSections;
};
