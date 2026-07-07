// Tạo class hiển thị trạng thái đáp án để các màn review dùng thống nhất.
export const getAnswerReviewClass = ({ isChosen, isCorrect, isWrongChosen }) => {
  const classNames = ["student-results__answer-item"];

  if (isChosen) {
    classNames.push("student-results__answer-item--chosen");
  }
  if (isCorrect) {
    classNames.push("student-results__answer-item--correct");
  }
  if (isWrongChosen) {
    classNames.push("student-results__answer-item--wrong");
  }

  return classNames.join(" ");
};
