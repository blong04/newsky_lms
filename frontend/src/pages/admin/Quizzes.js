import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "./Admin.css";
import "./Quizzes.css";

const EXAM_STRUCTURE = {
  IELTS: {
    parts: [
      { key: "Reading", label: "Reading", desc: "3 passages, 40 câu, 60 phút" },
      { key: "Listening", label: "Listening", desc: "4 sections, 40 câu, 30 phút" },
      { key: "Writing_Task1", label: "Writing Task 1", desc: "Mô tả biểu đồ hoặc sơ đồ, 150 từ" },
      { key: "Writing_Task2", label: "Writing Task 2", desc: "Bài luận, 250 từ" },
    ],
  },
  TOEIC: {
    parts: [
      { key: "Part1", label: "Part 1 – Photographs", desc: "6 câu, mô tả ảnh" },
      { key: "Part2", label: "Part 2 – Question-Response", desc: "25 câu, chọn phản hồi đúng" },
      { key: "Part3", label: "Part 3 – Conversations", desc: "39 câu, nghe hội thoại" },
      { key: "Part4", label: "Part 4 – Short Talks", desc: "30 câu, nghe bài nói ngắn" },
      { key: "Part5", label: "Part 5 – Incomplete Sentences", desc: "30 câu, điền câu" },
      { key: "Part6", label: "Part 6 – Text Completion", desc: "16 câu, điền đoạn văn" },
      { key: "Part7", label: "Part 7 – Reading Comprehension", desc: "54 câu, đọc hiểu" },
    ],
  },
};

const INITIAL_QUIZ = {
  classId: "",
  title: "",
  examType: "IELTS",
  examPart: "",
  instructions: "",
  timeLimit: 60,
  passageText: "",
  audioUrl: "",
};

const INITIAL_QUESTION = {
  content: "",
  questionType: "mcq",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "",
  imageUrl: "",
  explanation: "",
};

const QUESTION_TYPE_LABEL = {
  mcq: "Trắc nghiệm",
  fill_blank: "Điền vào chỗ trống",
  matching: "Nối cột",
  writing: "Viết",
};

export default function AdminQuizzes() {
  // State dữ liệu hiện có để list quiz.
  const [quizzes, setQuizzes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // State điều khiển wizard tạo quiz.
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [quizForm, setQuizForm] = useState(INITIAL_QUIZ);
  const [questions, setQuestions] = useState([{ ...INITIAL_QUESTION }]);

  // State bộ lọc và modal thao tác.
  const [filterType, setFilterType] = useState("");
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);

  // Load danh sách quiz cho màn quản trị.
  const fetchData = async () => {
    setLoading(true);
    try {
      const [quizResponse, classResponse] = await Promise.all([
        api.get("/quizzes"),
        api.get("/admin/classes").catch(() => ({ data: { data: [] } })),
      ]);
      setQuizzes(quizResponse.data.data || []);
      setClasses(classResponse.data.data || []);
    } catch {
      toast.error("Không thể tải dữ liệu bài kiểm tra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredQuizzes = useMemo(() => (
    quizzes.filter((quiz) => !filterType || quiz.examType === filterType)
  ), [quizzes, filterType]);

  const selectedPart = EXAM_STRUCTURE[quizForm.examType]?.parts.find((part) => part.key === quizForm.examPart);
  const getClassName = (classId) => classes.find((classroom) => Number(classroom.id) === Number(classId))?.name || "Chưa gắn lớp";

  // Quy ước loại câu hỏi theo phần thi để giảm nhập sai.
  const getQuestionTypes = () => {
    const { examType, examPart } = quizForm;

    if (examType === "IELTS") {
      if (examPart === "Listening" || examPart === "Reading") {
        return ["mcq", "fill_blank", "matching"];
      }

      if (examPart?.startsWith("Writing")) {
        return ["writing"];
      }
    }

    if (examType === "TOEIC") {
      if (["Part1", "Part2", "Part3", "Part4", "Part7"].includes(examPart)) {
        return ["mcq"];
      }

      if (["Part5", "Part6"].includes(examPart)) {
        return ["mcq", "fill_blank"];
      }
    }

    return ["mcq", "fill_blank"];
  };

  const needsPassage = () => (
    (quizForm.examType === "IELTS" && (quizForm.examPart === "Reading" || quizForm.examPart?.startsWith("Writing")))
    || (quizForm.examType === "TOEIC" && ["Part6", "Part7"].includes(quizForm.examPart))
  );

  const needsAudio = () => (
    (quizForm.examType === "IELTS" && quizForm.examPart === "Listening")
    || (quizForm.examType === "TOEIC" && ["Part1", "Part2", "Part3", "Part4"].includes(quizForm.examPart))
  );

  const resetCreationFlow = () => {
    setCreating(false);
    setStep(1);
    setQuizForm(INITIAL_QUIZ);
    setQuestions([{ ...INITIAL_QUESTION }]);
  };

  const addQuestion = () => {
    setQuestions((current) => [...current, { ...INITIAL_QUESTION, questionType: getQuestionTypes()[0] }]);
  };

  const removeQuestion = (index) => {
    setQuestions((current) => current.filter((_, questionIndex) => questionIndex !== index));
  };

  const updateQuestion = (index, field, value) => {
    setQuestions((current) => current.map((question, questionIndex) => (
      questionIndex === index ? { ...question, [field]: value } : question
    )));
  };

  const handleCreateQuiz = async () => {
    if (!quizForm.title) {
      toast.error("Nhập tiêu đề bài kiểm tra");
      return;
    }

    if (!quizForm.examPart) {
      toast.error("Chọn phần thi");
      return;
    }

    if (questions.some((question) => !question.content)) {
      toast.error("Nhập nội dung cho tất cả câu hỏi");
      return;
    }

    try {
      await api.post("/quizzes", {
        ...quizForm,
        classId: quizForm.classId ? Number(quizForm.classId) : null,
        timeLimit: Number(quizForm.timeLimit),
        questions: questions.map((question, index) => ({ ...question, orderNum: index + 1 })),
      });

      toast.success("Tạo bài kiểm tra thành công");
      resetCreationFlow();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Tạo bài kiểm tra thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa bài kiểm tra này?")) {
      return;
    }

    try {
      await api.delete(`/quizzes/${id}`);
      toast.success("Đã xóa bài kiểm tra");
      fetchData();
    } catch {
      toast.error("Không thể xóa bài kiểm tra");
    }
  };

  const fetchQuizDetail = async (quizId) => {
    const response = await api.get(`/quizzes/${quizId}/full`);
    return response.data.data;
  };

  const openViewModal = async (quiz) => {
    try {
      const fullQuiz = await fetchQuizDetail(quiz.id);
      setViewModal(fullQuiz);
    } catch {
      toast.error("Không thể tải chi tiết bài kiểm tra");
    }
  };

  const openEditQuiz = async (quiz) => {
    try {
      const fullQuiz = await fetchQuizDetail(quiz.id);
      setEditModal(fullQuiz);
    } catch {
      toast.error("Không thể tải dữ liệu để chỉnh sửa");
    }
  };

  const updateEditQuestion = (index, field, value) => {
    setEditModal((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) => (
        questionIndex === index ? { ...question, [field]: value } : question
      )),
    }));
  };

  const handleUpdateQuiz = async () => {
    try {
      await api.put(`/quizzes/${editModal.quiz.id}`, {
        classId: editModal.quiz.classId || null,
        title: editModal.quiz.title,
        examType: editModal.quiz.examType,
        examPart: editModal.quiz.examPart,
        type: editModal.quiz.type,
        instructions: editModal.quiz.instructions,
        passageText: editModal.quiz.passageText,
        audioUrl: editModal.quiz.audioUrl,
        timeLimit: Number(editModal.quiz.timeLimit || 0),
        questions: (editModal.questions || []).map((question, index) => ({
          ...question,
          orderNum: question.orderNum || index + 1,
        })),
      });
      toast.success("Cập nhật thành công");
      setEditModal(null);
      fetchData();
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  if (creating) {
    return (
      <div className="admin-page fade-in admin-quizzes">
        <div className="page-header admin-quizzes__create-header">
          <button className="btn btn-ghost btn-sm" onClick={resetCreationFlow}>← Quay lại</button>
          <div>
            <h1>Tạo bài kiểm tra mới</h1>
            <p>
              Bước {step}/3 — {step === 1 ? "Chọn loại bài thi" : step === 2 ? "Cấu hình bài thi" : "Nhập câu hỏi"}
            </p>
          </div>
        </div>

        {/* Wizard cho flow tạo quiz nhiều bước. */}
        <div className="step-indicator">
          {["Loại bài thi", "Cấu hình", "Câu hỏi"].map((label, index) => (
            <div
              key={label}
              className={`step-item ${step > index + 1 ? "done" : step === index + 1 ? "active" : ""}`}
            >
              <div className="step-circle">{step > index + 1 ? "✓" : index + 1}</div>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Step 1 chọn exam type và part. */}
        {step === 1 && (
          <section className="section-card">
            <h3 className="section-title">Chọn loại bài kiểm tra</h3>
            <div className="exam-type-grid">
              {["IELTS", "TOEIC"].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`exam-type-card ${quizForm.examType === type ? "selected" : ""}`}
                  onClick={() => setQuizForm({ ...quizForm, examType: type, examPart: "" })}
                >
                  <div className="exam-type-icon">{type === "IELTS" ? "🎓" : "💼"}</div>
                  <h4>{type}</h4>
                  <p>
                    {type === "IELTS"
                      ? "International English Language Testing System"
                      : "Test of English for International Communication"}
                  </p>
                  <div className="exam-parts-preview">
                    {EXAM_STRUCTURE[type].parts.map((part) => (
                      <span key={part.key} className="part-tag">{part.label}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <h3 className="section-title admin-quizzes__section-space">Chọn phần thi</h3>
            <div className="parts-grid">
              {EXAM_STRUCTURE[quizForm.examType].parts.map((part) => (
                <button
                  key={part.key}
                  type="button"
                  className={`part-card ${quizForm.examPart === part.key ? "selected" : ""}`}
                  onClick={() => setQuizForm({ ...quizForm, examPart: part.key })}
                >
                  <h5>{part.label}</h5>
                  <p>{part.desc}</p>
                </button>
              ))}
            </div>

            <div className="admin-quizzes__footer-actions admin-quizzes__footer-actions--end">
              <button className="btn btn-primary" disabled={!quizForm.examPart} onClick={() => setStep(2)}>
                Tiếp theo →
              </button>
            </div>
          </section>
        )}

        {/* Step 2 cấu hình metadata của bài kiểm tra. */}
        {step === 2 && (
          <section className="section-card">
            <div className="selected-part-banner">
              <strong>{quizForm.examType} — {selectedPart?.label}</strong>
              <span>{selectedPart?.desc}</span>
            </div>

            <div className="admin-quizzes__form-stack">
              <div className="form-group">
                <label>Lớp học áp dụng</label>
                <select
                  value={quizForm.classId}
                  onChange={(event) => setQuizForm({ ...quizForm, classId: event.target.value })}
                >
                  <option value="">— Chưa gắn lớp cụ thể —</option>
                  {classes.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tiêu đề bài kiểm tra</label>
                <input
                  value={quizForm.title}
                  onChange={(event) => setQuizForm({ ...quizForm, title: event.target.value })}
                  placeholder={`VD: ${quizForm.examType} ${selectedPart?.label} Practice Test 1`}
                />
              </div>

              <div className="form-group">
                <label>Thời gian (phút)</label>
                <input
                  type="number"
                  min={1}
                  value={quizForm.timeLimit}
                  onChange={(event) => setQuizForm({ ...quizForm, timeLimit: event.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Hướng dẫn làm bài</label>
                <textarea
                  rows={3}
                  value={quizForm.instructions}
                  onChange={(event) => setQuizForm({ ...quizForm, instructions: event.target.value })}
                  placeholder="Hướng dẫn cho học viên trước khi làm bài"
                />
              </div>

              {needsPassage() && (
                <div className="form-group">
                  <label>Đoạn văn / Passage</label>
                  <textarea
                    rows={8}
                    className="admin-quizzes__passage-input"
                    value={quizForm.passageText}
                    onChange={(event) => setQuizForm({ ...quizForm, passageText: event.target.value })}
                    placeholder="Nhập đoạn văn đọc hiểu..."
                  />
                </div>
              )}

              {needsAudio() && (
                <div className="form-group">
                  <label>URL file audio</label>
                  <input
                    value={quizForm.audioUrl}
                    onChange={(event) => setQuizForm({ ...quizForm, audioUrl: event.target.value })}
                    placeholder="https://... (mp3, wav)"
                  />
                </div>
              )}
            </div>

            <div className="admin-quizzes__footer-actions">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>← Quay lại</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setQuestions([{ ...INITIAL_QUESTION, questionType: getQuestionTypes()[0] }]);
                  setStep(3);
                }}
              >
                Tiếp theo →
              </button>
            </div>
          </section>
        )}

        {/* Step 3 nhập danh sách câu hỏi cho quiz. */}
        {step === 3 && (
          <section>
            <div className="section-card admin-quizzes__summary-card">
              <div className="selected-part-banner">
                <strong>{quizForm.examType} — {selectedPart?.label}: {quizForm.title}</strong>
                <span>{questions.length} câu hỏi</span>
              </div>
            </div>

            {questions.map((question, index) => (
              <div key={`${question.questionType}-${index}`} className="question-card">
                <div className="question-header">
                  <span className="question-num">Câu {index + 1}</span>
                  <div className="admin-quizzes__question-tools">
                    <select
                      value={question.questionType}
                      onChange={(event) => updateQuestion(index, "questionType", event.target.value)}
                      className="filter-select admin-quizzes__type-select"
                    >
                      {getQuestionTypes().map((type) => (
                        <option key={type} value={type}>{QUESTION_TYPE_LABEL[type] || type}</option>
                      ))}
                    </select>
                    {questions.length > 1 && (
                      <button className="btn btn-danger btn-sm" onClick={() => removeQuestion(index)}>✕</button>
                    )}
                  </div>
                </div>

                <div className="form-group admin-quizzes__question-space">
                  <label>Nội dung câu hỏi</label>
                  <textarea
                    rows={2}
                    value={question.content}
                    onChange={(event) => updateQuestion(index, "content", event.target.value)}
                    placeholder={question.questionType === "fill_blank" ? "VD: The company ___ (establish) in 1990." : "Nhập câu hỏi..."}
                  />
                </div>

                {quizForm.examPart === "Part1" && (
                  <div className="form-group admin-quizzes__question-space">
                    <label>URL ảnh</label>
                    <input
                      value={question.imageUrl || ""}
                      onChange={(event) => updateQuestion(index, "imageUrl", event.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                )}

                {question.questionType === "mcq" && (
                  <div className="options-grid">
                    {["A", "B", "C", "D"].map((option) => (
                      <div key={option} className="form-group">
                        <label>Đáp án {option}</label>
                        <input
                          value={question[`option${option}`] || ""}
                          onChange={(event) => updateQuestion(index, `option${option}`, event.target.value)}
                          placeholder={`Lựa chọn ${option}`}
                        />
                      </div>
                    ))}
                    <div className="form-group">
                      <label>Đáp án đúng</label>
                      <select
                        value={question.correctAnswer}
                        onChange={(event) => updateQuestion(index, "correctAnswer", event.target.value)}
                      >
                        <option value="">Chọn</option>
                        {["A", "B", "C", "D"].map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {question.questionType === "fill_blank" && (
                  <div className="form-group admin-quizzes__question-space">
                    <label>Đáp án đúng</label>
                    <input
                      value={question.correctAnswer}
                      onChange={(event) => updateQuestion(index, "correctAnswer", event.target.value)}
                      placeholder="Nhập đáp án chính xác"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Giải thích đáp án</label>
                  <input
                    value={question.explanation || ""}
                    onChange={(event) => updateQuestion(index, "explanation", event.target.value)}
                    placeholder="Giải thích tại sao đây là đáp án đúng"
                  />
                </div>
              </div>
            ))}

            <button className="btn btn-ghost admin-quizzes__add-question" onClick={addQuestion}>+ Thêm câu hỏi</button>

            <div className="admin-quizzes__footer-actions">
              <button className="btn btn-ghost" onClick={() => setStep(2)}>← Quay lại</button>
              <button className="btn btn-primary" onClick={handleCreateQuiz}>✅ Tạo bài kiểm tra ({questions.length} câu)</button>
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="admin-page fade-in admin-quizzes">
      <section className="admin-quizzes__hero">
        <div>
          <p className="admin-quizzes__eyebrow">Assessment builder</p>
          <h1>Bài kiểm tra</h1>
          <p className="admin-quizzes__subtitle">
            Tạo và quản lý các bộ đề IELTS, TOEIC với cấu trúc rõ ràng theo từng phần thi.
          </p>
        </div>
        <div className="admin-quizzes__hero-metrics">
          <article className="admin-quizzes__metric-card">
            <span>Tổng đề</span>
            <strong>{quizzes.length}</strong>
          </article>
          <article className="admin-quizzes__metric-card admin-quizzes__metric-card--accent">
            <span>Đang lọc</span>
            <strong>{filteredQuizzes.length}</strong>
          </article>
        </div>
      </section>

      <div className="toolbar">
        <div className="toolbar-left">
          <select className="filter-select" value={filterType} onChange={(event) => setFilterType(event.target.value)}>
            <option value="">Tất cả chứng chỉ</option>
            <option value="IELTS">IELTS</option>
            <option value="TOEIC">TOEIC</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>+ Tạo bài kiểm tra</button>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Lớp</th>
                <th>Loại</th>
                <th>Phần thi</th>
                <th>Thời gian</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state"><p>Chưa có bài kiểm tra nào</p></td>
                </tr>
              ) : (
                filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id}>
                    <td className="admin-quizzes__title-cell">{quiz.title}</td>
                    <td>{getClassName(quiz.classId)}</td>
                    <td>
                      <span className={`badge ${quiz.examType === "IELTS" ? "badge-blue" : "badge-green"}`}>{quiz.examType}</span>
                    </td>
                    <td>{quiz.examPart || "—"}</td>
                    <td>{quiz.timeLimit ? `${quiz.timeLimit} phút` : "—"}</td>
                    <td>
                      <div className="admin-quizzes__row-actions">
                        <button className="btn btn-info btn-sm" title="Xem chi tiết" onClick={() => openViewModal(quiz)}>👁️</button>
                        <button className="btn btn-warning btn-sm" title="Sửa" onClick={() => openEditQuiz(quiz)}>✏️</button>
                        <button className="btn btn-danger btn-sm" title="Xóa" onClick={() => handleDelete(quiz.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal xem chi tiết quiz. */}
      {viewModal && (
        <div className="modal-overlay" onClick={() => setViewModal(null)}>
          <div className="modal admin-quizzes__modal-wide" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết — {viewModal.quiz.title}</h3>
              <button className="modal-close" onClick={() => setViewModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div>
                  <label className="admin-quizzes__label">Lớp áp dụng</label>
                  <p className="admin-quizzes__value admin-quizzes__value--strong">{getClassName(viewModal.quiz.classId)}</p>
                </div>
                <div>
                  <label className="admin-quizzes__label">Loại</label>
                  <p className="admin-quizzes__value">
                    <span className={`badge ${viewModal.quiz.examType === "IELTS" ? "badge-blue" : "badge-green"}`}>
                      {viewModal.quiz.examType}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="admin-quizzes__label">Phần thi</label>
                  <p className="admin-quizzes__value admin-quizzes__value--strong">{viewModal.quiz.examPart || "—"}</p>
                </div>
              </div>

              <div>
                <label className="admin-quizzes__label">Thời gian làm bài</label>
                <p className="admin-quizzes__value">{viewModal.quiz.timeLimit ? `${viewModal.quiz.timeLimit} phút` : "Không giới hạn"}</p>
              </div>

              {viewModal.quiz.instructions && (
                <div>
                  <label className="admin-quizzes__label">Hướng dẫn</label>
                  <p className="admin-quizzes__text-block">{viewModal.quiz.instructions}</p>
                </div>
              )}

              {viewModal.quiz.passageText && (
                <div>
                  <label className="admin-quizzes__label">Đoạn văn</label>
                  <div className="admin-quizzes__passage-view">{viewModal.quiz.passageText}</div>
                </div>
              )}

              {viewModal.quiz.audioUrl && (
                <div>
                  <label className="admin-quizzes__label">File audio</label>
                  <audio controls src={viewModal.quiz.audioUrl} className="admin-quizzes__audio" />
                </div>
              )}

              <div>
                <label className="admin-quizzes__label">Câu hỏi</label>
                <div className="admin-quizzes__question-preview-list">
                  {(viewModal.questions || []).map((question, index) => (
                    <article key={question.id || index} className="admin-quizzes__question-preview">
                      <p className="admin-quizzes__value admin-quizzes__value--strong">{index + 1}. {question.content}</p>
                      <p className="admin-quizzes__text-block">{QUESTION_TYPE_LABEL[question.questionType] || question.questionType}</p>
                      {question.questionType === "mcq" && (
                        <div className="admin-quizzes__option-list">
                          {["A", "B", "C", "D"].map((option) => question[`option${option}`] ? (
                            <div key={option} className={`admin-quizzes__option-item ${question.correctAnswer === option ? "admin-quizzes__option-item--correct" : ""}`}>
                              <strong>{option}.</strong> {question[`option${option}`]}
                            </div>
                          ) : null)}
                        </div>
                      )}
                      {question.questionType !== "mcq" && question.correctAnswer && (
                        <p className="admin-quizzes__text-block">Đáp án đúng: <strong>{question.correctAnswer}</strong></p>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setViewModal(null)}>Đóng</button>
              <button
                className="btn btn-warning btn-sm"
                title="Sửa bài kiểm tra"
                onClick={() => {
                  openEditQuiz(viewModal.quiz);
                  setViewModal(null);
                }}
              >
                ✏️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal sửa metadata cơ bản của quiz. */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal admin-quizzes__modal-medium" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Sửa bài kiểm tra</h3>
              <button className="modal-close" onClick={() => setEditModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Lớp học áp dụng</label>
                <select
                  value={editModal.quiz.classId || ""}
                  onChange={(event) => setEditModal({
                    ...editModal,
                    quiz: { ...editModal.quiz, classId: event.target.value ? Number(event.target.value) : null },
                  })}
                >
                  <option value="">— Chưa gắn lớp cụ thể —</option>
                  {classes.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tiêu đề</label>
                <input value={editModal.quiz.title || ""} onChange={(event) => setEditModal({ ...editModal, quiz: { ...editModal.quiz, title: event.target.value } })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Loại chứng chỉ</label>
                  <select
                    value={editModal.quiz.examType || "IELTS"}
                    onChange={(event) => setEditModal({ ...editModal, quiz: { ...editModal.quiz, examType: event.target.value } })}
                  >
                    <option value="IELTS">IELTS</option>
                    <option value="TOEIC">TOEIC</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Thời gian (phút)</label>
                  <input
                    type="number"
                    min={1}
                    value={editModal.quiz.timeLimit || ""}
                    onChange={(event) => setEditModal({ ...editModal, quiz: { ...editModal.quiz, timeLimit: Number(event.target.value) } })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Hướng dẫn làm bài</label>
                <textarea
                  rows={3}
                  value={editModal.quiz.instructions || ""}
                  onChange={(event) => setEditModal({ ...editModal, quiz: { ...editModal.quiz, instructions: event.target.value } })}
                />
              </div>
              <div className="form-group">
                <label>Danh sách câu hỏi</label>
                <div className="admin-quizzes__question-edit-list">
                  {(editModal.questions || []).map((question, index) => (
                    <article key={question.id || index} className="admin-quizzes__question-edit">
                      <div className="form-group">
                        <label>Câu {index + 1}</label>
                        <textarea
                          rows={2}
                          value={question.content || ""}
                          onChange={(event) => updateEditQuestion(index, "content", event.target.value)}
                        />
                      </div>
                      {question.questionType === "mcq" && (
                        <div className="options-grid">
                          {["A", "B", "C", "D"].map((option) => (
                            <div key={option} className="form-group">
                              <label>Đáp án {option}</label>
                              <input
                                value={question[`option${option}`] || ""}
                                onChange={(event) => updateEditQuestion(index, `option${option}`, event.target.value)}
                              />
                            </div>
                          ))}
                          <div className="form-group">
                            <label>Đáp án đúng</label>
                            <select value={question.correctAnswer || ""} onChange={(event) => updateEditQuestion(index, "correctAnswer", event.target.value)}>
                              <option value="">Chọn</option>
                              {["A", "B", "C", "D"].map((option) => <option key={option} value={option}>{option}</option>)}
                            </select>
                          </div>
                        </div>
                      )}
                      {question.questionType !== "mcq" && (
                        <div className="form-group">
                          <label>Đáp án đúng</label>
                          <input
                            value={question.correctAnswer || ""}
                            onChange={(event) => updateEditQuestion(index, "correctAnswer", event.target.value)}
                          />
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setEditModal(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleUpdateQuiz}>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
