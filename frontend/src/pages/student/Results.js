import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { assignmentService } from "../../services/assignmentService";
import { enrollmentService } from "../../services/enrollmentService";
import { quizService } from "../../services/quizService";
import { testService } from "../../services/testService";
import { buildQuizSectionsForDisplay, buildTestSectionsForDisplay } from "../../utils/assessmentSections";
import { hasAnyLinkedClass } from "../../utils/assessment";
import { ACTIVE_ENROLLMENT_STATUSES } from "../../constants/enrollments";
import { parseAnswerMap } from "../../utils/quiz";
import { getAnswerReviewClass } from "../../utils/review";
import toast from "react-hot-toast";
import "./Results.css";

export default function StudentResults() {
  const { user } = useAuth();

  // State nguồn dữ liệu kết quả bài tập và bài kiểm tra.
  const [tab, setTab] = useState("assignments");
  const [assignmentSubmissions, setAssignmentSubmissions] = useState([]);
  const [quizSubmissions, setQuizSubmissions] = useState([]);
  const [testSubmissions, setTestSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchAll = async () => {
      setLoading(true);

      try {
        const [
          enrollmentData,
          assignmentSubmissionData,
          quizSubmissionData,
          testSubmissionData,
          assignmentData,
          quizData,
          testData,
        ] = await Promise.all([
          enrollmentService.getStudentEnrollments().catch(() => []),
          assignmentService.getUserSubmissions(user.id).catch(() => []),
          quizService.getUserSubmissions(user.id).catch(() => []),
          testService.getUserSubmissions(user.id).catch(() => []),
          assignmentService.getAll().catch(() => []),
          quizService.getAll().catch(() => []),
          testService.getAll().catch(() => []),
        ]);

        const activeEnrollments = (enrollmentData || []).filter((item) =>
          ACTIVE_ENROLLMENT_STATUSES.includes(item.status)
        );
        const classIds = new Set(activeEnrollments.map((item) => Number(item.classId)).filter(Boolean));
        const assignmentSubmissions = assignmentSubmissionData || [];
        const quizSubmissions = quizSubmissionData || [];
        const testSubmissions = testSubmissionData || [];
        const assignmentIds = new Set(assignmentSubmissions.map((submission) => Number(submission.assignId)).filter(Boolean));
        const quizIds = new Set(quizSubmissions.map((submission) => Number(submission.quizId)).filter(Boolean));
        const testIds = new Set(testSubmissions.map((submission) => Number(submission.testId)).filter(Boolean));
        const availableAssignments = (assignmentData || []).filter((assignment) =>
          classIds.has(Number(assignment.classId)) || assignmentIds.has(Number(assignment.id))
        );
        const availableQuizzes = (quizData || []).filter((quiz) =>
          hasAnyLinkedClass(quiz, classIds) || quizIds.has(Number(quiz.id))
        );
        const availableTests = (testData || []).filter((test) =>
          hasAnyLinkedClass(test, classIds) || testIds.has(Number(test.id))
        );

        setAssignmentSubmissions(assignmentSubmissions);
        setQuizSubmissions(quizSubmissions);
        setTestSubmissions(testSubmissions);
        setAssignments(availableAssignments);
        setQuizzes(availableQuizzes);
        setTests(availableTests);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

  const getAssignment = (id) => assignments.find((assignment) => Number(assignment.id) === Number(id));
  const getQuiz = (id) => quizzes.find((quiz) => Number(quiz.id) === Number(id));
  const getTest = (id) => tests.find((test) => Number(test.id) === Number(id));

  const openAssignmentReview = (submission) => {
    const assignment = getAssignment(submission.assignId);
    setReviewModal({
      type: "assignment",
      assignment,
      submission,
    });
  };

  const openQuizReview = async (submission) => {
    const quizId = submission.quizId;
    const quiz = getQuiz(quizId);
    setReviewLoading(true);

    try {
      const quizDetail = await quizService.getFullQuiz(quizId);
      setReviewModal({
        type: "quiz",
        quiz,
        submission,
        quizDetail,
        answerMap: parseAnswerMap(submission.answersJson),
      });
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải nội dung bài làm");
    } finally {
      setReviewLoading(false);
    }
  };

  const openTestReview = async (submission) => {
    const testId = submission.testId;
    const test = getTest(testId);
    setReviewLoading(true);

    try {
      const testDetail = await testService.getFullTest(testId);
      setReviewModal({
        type: "test",
        test,
        submission,
        testDetail,
        answerMap: parseAnswerMap(submission.answersJson),
      });
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải nội dung bài thi thử");
    } finally {
      setReviewLoading(false);
    }
  };

  const scoreColorClass = (score, max) => {
    if (score == null) {
      return "student-results__score--muted";
    }

    const percent = (score / (max || 100)) * 100;
    if (percent >= 75) {
      return "student-results__score--good";
    }
    if (percent >= 50) {
      return "student-results__score--mid";
    }
    return "student-results__score--low";
  };

  const quizAverage = useMemo(() => (
    quizSubmissions.length > 0
      ? (quizSubmissions.reduce((sum, item) => sum + Number(item.score || 0), 0) / quizSubmissions.length).toFixed(1)
      : "—"
  ), [quizSubmissions]);

  const testAverage = useMemo(() => (
    testSubmissions.length > 0
      ? (testSubmissions.reduce((sum, item) => sum + Number(item.totalScore || 0), 0) / testSubmissions.length).toFixed(1)
      : "—"
  ), [testSubmissions]);

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-page fade-in student-results">
      <section className="student-results__hero">
        <div>
          <p className="student-results__eyebrow">Performance</p>
          <h1>Kết quả học tập</h1>
          <p className="student-results__subtitle">Tổng hợp điểm bài tập, bài kiểm tra và các nhận xét mà bạn đã nhận trong quá trình học.</p>
        </div>
      </section>

      {/* Các chỉ số tổng quan đầu trang. */}
      <div className="stats-grid student-results__stats">
        <article className="stat-card student-results__stat-card student-results__stat-card--assignments">
          <div className="stat-icon">📋</div>
          <div className="stat-body">
            <p className="stat-label">Bài tập đã nộp</p>
            <h3 className="stat-value">{assignmentSubmissions.length}</h3>
          </div>
        </article>
        <article className="stat-card student-results__stat-card student-results__stat-card--graded">
          <div className="stat-icon">✅</div>
          <div className="stat-body">
            <p className="stat-label">Bài tập đã chấm</p>
            <h3 className="stat-value">{assignmentSubmissions.filter((item) => item.status === "graded").length}</h3>
          </div>
        </article>
        <article className="stat-card student-results__stat-card student-results__stat-card--quizzes">
          <div className="stat-icon">📝</div>
          <div className="stat-body">
            <p className="stat-label">Bài kiểm tra đã làm</p>
            <h3 className="stat-value">{quizSubmissions.length}</h3>
          </div>
        </article>
        <article className="stat-card student-results__stat-card student-results__stat-card--average">
          <div className="stat-icon">📊</div>
          <div className="stat-body">
            <p className="stat-label">Điểm TB bài kiểm tra</p>
            <h3 className="stat-value">{quizAverage}</h3>
          </div>
        </article>
      </div>

      <div className="filter-tabs">
        <button className={`filter-tab-btn ${tab === "assignments" ? "active" : ""}`} onClick={() => setTab("assignments")}>
          📋 Bài tập ({assignmentSubmissions.length})
        </button>
        <button className={`filter-tab-btn ${tab === "quizzes" ? "active" : ""}`} onClick={() => setTab("quizzes")}>
          📝 Bài kiểm tra ({quizSubmissions.length})
        </button>
        <button className={`filter-tab-btn ${tab === "tests" ? "active" : ""}`} onClick={() => setTab("tests")}>
          🧪 Bài thi thử ({testSubmissions.length})
        </button>
      </div>

      {tab === "assignments" && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bài tập</th>
                <th>Loại / Part</th>
                <th>Ngày nộp</th>
                <th>Điểm</th>
                <th>Nhận xét</th>
                <th>Trạng thái</th>
                <th>Xem lại</th>
              </tr>
            </thead>
            <tbody>
              {assignmentSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state"><p>Chưa có bài tập nào được nộp</p></td>
                </tr>
              ) : (
                assignmentSubmissions.map((submission) => {
                  const assignment = getAssignment(submission.assignId);
                  const score = submission.score ?? null;
                  const maxScore = assignment?.maxScore || 100;
                  const status = submission.status;
                  const graded = status === "graded";

                  return (
                    <tr key={submission.id}>
                      <td><p className="student-results__item-title">{assignment?.title || `Bài tập #${submission.assignId}`}</p></td>
                      <td>
                        <div className="student-results__badge-list">
                          {assignment?.examType && (
                            <span className={`badge ${assignment.examType === "IELTS" ? "badge-blue" : "badge-green"}`}>
                              {assignment.examType}
                            </span>
                          )}
                          {(assignment?.examPart || assignment?.part) && (
                            <span className="badge badge-gray">{assignment?.examPart || assignment?.part}</span>
                          )}
                        </div>
                      </td>
                      <td className="student-results__muted student-results__tiny">
                        {submission.submittedAt
                          ? new Date(submission.submittedAt).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>
                      <td>
                        {graded && score != null ? (
                          <div>
                            <span className={`student-results__score ${scoreColorClass(score, maxScore)}`}>{score}</span>
                            <span className="student-results__score-denominator">/{maxScore}</span>
                            {assignment?.examType === "IELTS" && Number(maxScore) <= 9 && (
                              <p className="student-results__tiny student-results__muted">Band {Number(score).toFixed(1)}</p>
                            )}
                          </div>
                        ) : (
                          <span className="student-results__muted student-results__tiny">—</span>
                        )}
                      </td>
                      <td className="student-results__comment-cell">
                        {submission.comment
                          ? <p className="student-results__comment">{submission.comment}</p>
                          : <span className="student-results__muted student-results__tiny">—</span>}
                      </td>
                      <td>
                        <span className={`badge ${graded ? "badge-green" : "badge-yellow"}`}>{graded ? "✅ Đã chấm" : "⏳ Chờ chấm"}</span>
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => openAssignmentReview(submission)}>👁️</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "quizzes" && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bài kiểm tra</th>
                <th>Loại</th>
                <th>Ngày làm</th>
                <th>Điểm</th>
                <th>Band / Score ước tính</th>
                <th>Thời gian làm</th>
                <th>Xem lại</th>
              </tr>
            </thead>
            <tbody>
              {quizSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state"><p>Chưa có bài kiểm tra nào được hoàn thành</p></td>
                </tr>
              ) : (
                quizSubmissions.map((submission) => {
                  const quiz = getQuiz(submission.quizId);
                  const score = Number(submission.score || 0);
                  const exam = quiz?.examType || "";
                  const mins = submission.timeSpent
                    ? Math.floor(submission.timeSpent / 60)
                    : null;

                  return (
                    <tr key={submission.id}>
                      <td>
                        <p className="student-results__item-title">{quiz?.title || `Quiz #${submission.quizId}`}</p>
                        {quiz?.examPart && (
                          <p className="student-results__tiny student-results__muted">{quiz.examPart}</p>
                        )}
                      </td>
                      <td>
                        {exam && (
                          <span className={`badge ${exam === "IELTS" ? "badge-blue" : exam === "TOEIC" ? "badge-green" : "badge-gray"}`}>
                            {exam}
                          </span>
                        )}
                      </td>
                      <td className="student-results__muted student-results__tiny">
                        {submission.submittedAt
                          ? new Date(submission.submittedAt).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>
                      <td>
                        <span className={`student-results__score ${scoreColorClass(score, 100)}`}>{score.toFixed(1)}</span>
                        <span className="student-results__score-denominator">/100</span>
                      </td>
                      <td>
                        {exam === "IELTS" && <span className="student-results__estimate student-results__estimate--ielts">Band {(score / 100 * 9).toFixed(1)}</span>}
                        {exam === "TOEIC" && <span className="student-results__estimate student-results__estimate--toeic">~{Math.round(score / 100 * 990)}/990</span>}
                      </td>
                      <td className="student-results__muted student-results__tiny">{mins != null ? `${mins} phút` : "—"}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => openQuizReview(submission)}>👁️</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "tests" && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bài thi thử</th>
                <th>Chứng chỉ</th>
                <th>Lần làm</th>
                <th>Điểm</th>
                <th>Kết quả đúng</th>
                <th>Thời gian làm</th>
                <th>Xem lại</th>
              </tr>
            </thead>
            <tbody>
              {testSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state"><p>Chưa có bài thi thử nào được hoàn thành</p></td>
                </tr>
              ) : (
                testSubmissions.map((submission) => {
                  const test = getTest(submission.testId);
                  const score = Number(submission.totalScore || 0);
                  const totalScore = Number(test?.totalScore || 100);
                  const mins = submission.durationSeconds ? Math.floor(submission.durationSeconds / 60) : null;

                  return (
                    <tr key={submission.id}>
                      <td>
                        <p className="student-results__item-title">{test?.title || `Test #${submission.testId}`}</p>
                        <p className="student-results__tiny student-results__muted">{test?.skillType || test?.testType || "Full test"}</p>
                      </td>
                      <td>
                        {test?.examType && (
                          <span className={`badge ${test.examType === "IELTS" ? "badge-blue" : test.examType === "TOEIC" ? "badge-green" : "badge-gray"}`}>
                            {test.examType}
                          </span>
                        )}
                      </td>
                      <td className="student-results__muted student-results__tiny">Lần {submission.attemptNumber || 1}</td>
                      <td>
                        <span className={`student-results__score ${scoreColorClass(score, totalScore)}`}>{score.toFixed(1)}</span>
                        <span className="student-results__score-denominator">/{totalScore}</span>
                      </td>
                      <td className="student-results__muted student-results__tiny">
                        {submission.correctAnswers ?? 0}/{submission.totalQuestions ?? 0}
                      </td>
                      <td className="student-results__muted student-results__tiny">{mins != null ? `${mins} phút` : "—"}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => openTestReview(submission)}>👁️</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {reviewLoading && (
        <div className="modal-overlay">
          <div className="modal student-results__review-loading">
            <div className="page-loading"><div className="spinner" /></div>
          </div>
        </div>
      )}

      {reviewModal?.type === "assignment" && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal student-results__review-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Xem lại bài tập</h3>
              <button className="modal-close" onClick={() => setReviewModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="student-results__item-title">{reviewModal.assignment?.title || "Bài tập"}</p>
              {reviewModal.assignment?.description && (
                <>
                  <p className="student-results__tiny student-results__muted">Đề bài</p>
                  <div className="student-results__review-box">{reviewModal.assignment.description}</div>
                </>
              )}
              <div className="student-results__review-meta">
                <span>Ngày nộp: {reviewModal.submission.submittedAt ? new Date(reviewModal.submission.submittedAt).toLocaleString("vi-VN") : "—"}</span>
                <span>Điểm: {reviewModal.submission.score ?? "Chưa chấm"}</span>
              </div>
              <p className="student-results__tiny student-results__muted">Bài làm của bạn</p>
              <div className="student-results__review-box">
                {reviewModal.submission.content || "Chưa có nội dung bài làm."}
              </div>
              {reviewModal.submission.comment && (
                <div className="student-results__review-comment">Nhận xét: {reviewModal.submission.comment}</div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setReviewModal(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {reviewModal?.type === "quiz" && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal student-results__review-modal student-results__review-modal--wide" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Xem lại bài kiểm tra</h3>
              <button className="modal-close" onClick={() => setReviewModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="student-results__item-title">{reviewModal.quiz?.title || "Bài kiểm tra"}</p>
              <div className="student-results__review-meta">
                <span>Điểm: {reviewModal.submission.score ?? 0}/100</span>
                <span>Thời gian làm: {reviewModal.submission.timeSpent ? `${Math.floor(reviewModal.submission.timeSpent / 60)} phút` : "—"}</span>
              </div>
              {buildQuizSectionsForDisplay(reviewModal.quiz, reviewModal.quizDetail?.groups, reviewModal.quizDetail?.questions).map((section, sectionIndex, allSections) => {
                const previousQuestionCount = allSections
                  .slice(0, sectionIndex)
                  .reduce((total, currentSection) => total + currentSection.questions.length, 0);

                return (
                <section key={section.key} className="student-results__quiz-section">
                  {section.group && (
                    <div className="student-results__review-box">
                      {section.group.title && <p className="student-results__item-title">{section.group.title}</p>}
                      {section.group.instructions && <p>{section.group.instructions}</p>}
                      {section.group.passageText && <p>{section.group.passageText}</p>}
                      {section.group.imageUrl && (
                        <img className="student-results__question-image" src={section.group.imageUrl} alt="Question group" />
                      )}
                      {section.group.audioUrl && (
                        <audio controls src={section.group.audioUrl} />
                      )}
                    </div>
                  )}
                  {section.questions.map((question, index) => {
                    const answer = reviewModal.answerMap[String(question.id)] ?? reviewModal.answerMap[question.id];
                    return (
                      <article key={question.id} className="student-results__question-review">
                        <p className="student-results__question-title">{previousQuestionCount + index + 1}. {question.content}</p>
                        {question.imageUrl && <img className="student-results__question-image" src={question.imageUrl} alt="Question" />}
                        {question.questionType === "mcq" && (
                          <div className="student-results__answer-list">
                            {["A", "B", "C", "D"].map((option) => {
                              const value = question[`option${option}`];
                              if (!value) {
                                return null;
                              }
                              const isChosen = answer === option;
                              const isCorrect = question.correctAnswer === option;
                              return (
                                <div key={option} className={getAnswerReviewClass({
                                  isChosen,
                                  isCorrect,
                                  isWrongChosen: isChosen && !isCorrect,
                                })}>
                                  <strong>{option}.</strong> {value}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {question.questionType !== "mcq" && (
                          <div className="student-results__review-box">
                            Câu trả lời của bạn: {answer || "Chưa trả lời"}
                          </div>
                        )}
                        {question.correctAnswer && question.questionType !== "writing" && (
                          <p className="student-results__tiny student-results__muted">
                            Đáp án đúng: <strong>{question.correctAnswer}</strong>
                          </p>
                        )}
                        {question.explanation && (
                          <p className="student-results__review-explanation">{question.explanation}</p>
                        )}
                      </article>
                    );
                  })}
                </section>
              );
              })}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setReviewModal(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {reviewModal?.type === "test" && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal student-results__review-modal student-results__review-modal--wide" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Xem lại bài thi thử</h3>
              <button className="modal-close" onClick={() => setReviewModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="student-results__item-title">{reviewModal.test?.title || "Bài thi thử"}</p>
              <div className="student-results__review-meta">
                <span>Điểm: {reviewModal.submission.totalScore ?? 0}/{reviewModal.test?.totalScore || 100}</span>
                <span>Điểm TB hiện tại: {testAverage}</span>
                <span>Lần làm: {reviewModal.submission.attemptNumber || 1}</span>
              </div>
              {buildTestSectionsForDisplay(reviewModal.test, reviewModal.testDetail?.groups, reviewModal.testDetail?.questions).map((section, sectionIndex, allSections) => {
                const previousQuestionCount = allSections
                  .slice(0, sectionIndex)
                  .reduce((total, currentSection) => total + currentSection.questions.length, 0);

                return (
                  <section key={section.key} className="student-results__quiz-section">
                    {section.group && (
                      <div className="student-results__review-box">
                        {section.group.title && <p className="student-results__item-title">{section.group.title}</p>}
                        {section.group.instructions && <p>{section.group.instructions}</p>}
                        {section.group.passageText && <p>{section.group.passageText}</p>}
                      </div>
                    )}
                    {section.questions.map((question, index) => {
                      const answer = reviewModal.answerMap[String(question.id)] ?? reviewModal.answerMap[question.id];
                      return (
                        <article key={question.id} className="student-results__question-review">
                          <p className="student-results__question-title">{previousQuestionCount + index + 1}. {question.content}</p>
                          {question.questionType === "mcq" && (
                            <div className="student-results__answer-list">
                              {["A", "B", "C", "D"].map((option) => {
                                const value = question[`option${option}`];
                                if (!value) {
                                  return null;
                                }
                                const isChosen = answer === option;
                                const isCorrect = question.correctAnswer === option;
                                return (
                                  <div
                                    key={option}
                                    className={getAnswerReviewClass({
                                      isChosen,
                                      isCorrect,
                                      isWrongChosen: isChosen && !isCorrect,
                                    })}
                                  >
                                    <strong>{option}.</strong> {value}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {question.questionType !== "mcq" && (
                            <div className="student-results__review-box">
                              Câu trả lời của bạn: {answer || "Chưa trả lời"}
                            </div>
                          )}
                          {question.correctAnswer && (
                            <p className="student-results__tiny student-results__muted">Đáp án đúng: <strong>{question.correctAnswer}</strong></p>
                          )}
                          {question.explanation && <p className="student-results__review-explanation">{question.explanation}</p>}
                        </article>
                      );
                    })}
                  </section>
                );
              })}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setReviewModal(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
