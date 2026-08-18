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

// Cột question_type trong DB là ENUM('mcq','listening_mcq','reading_mcq','fill_blank',
// 'matching','short_answer','essay') - không có "writing". normalizeQuestionType() dùng
// "writing" làm nhóm hiển thị chung cho FE nên phải đổi ngược lại "essay" trước khi lưu,
// nếu không MySQL báo "Data truncated for column 'question_type'".
export function toDbQuestionType(frontendType) {
  return frontendType === "writing" ? "essay" : frontendType;
}
