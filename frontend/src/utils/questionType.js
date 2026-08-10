// Chuẩn hóa các biến thể question type từ database về nhóm render ổn định trên frontend.
export function normalizeQuestionType(rawType) {
  const normalizedType = String(rawType || "").trim().toLowerCase();

  if (["mcq", "multiple_choice", "listening_mcq", "reading_mcq"].includes(normalizedType)) {
    return "mcq";
  }
  if (["fill_blank", "fill-in-blank", "short_answer", "text"].includes(normalizedType)) {
    return "fill_blank";
  }
  if (["matching", "ordering"].includes(normalizedType)) {
    return "matching";
  }
  if (["writing", "essay"].includes(normalizedType)) {
    return "writing";
  }

  return "writing";
}
