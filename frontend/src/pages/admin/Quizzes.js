import React, { useEffect, useMemo, useState } from "react";
import { classService } from "../../services/classService";
import { QUESTION_TYPE_LABELS } from "../../constants/quizzes";
import { quizService } from "../../services/quizService";
import { buildQuizSectionsForDisplay } from "../../utils/assessmentSections";
import { getLinkedClassIds, normalizeClassIdsPayload } from "../../utils/assessment";
import {
  QUIZ_BLUEPRINTS,
  applyQuizBlueprintDefaults,
  countFilledQuizQuestions,
  createQuizSections,
  hydrateQuizSections,
  serializeQuizSections,
} from "../../utils/quizBuilder";
import toast from "react-hot-toast";
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
  classIds: [],
  title: "",
  examType: "IELTS",
  examPart: "",
  timeLimit: 60,
};

export default function AdminQuizzes() {
  // State dữ liệu hiện có để list quiz.
  const [quizzes, setQuizzes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // State điều khiển editor create/edit dạng wizard theo part.
  const [editorMode, setEditorMode] = useState(null);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [step, setStep] = useState(1);
  const [quizForm, setQuizForm] = useState(INITIAL_QUIZ);
  const [sections, setSections] = useState([]);
  const [expandedSectionKey, setExpandedSectionKey] = useState(null);
  const [saving, setSaving] = useState(false);

  // State bộ lọc và modal thao tác.
  const [filterType, setFilterType] = useState("");
  const [viewModal, setViewModal] = useState(null);

  // Load danh sách quiz cho màn quản trị.
  const fetchData = async () => {
    setLoading(true);
    try {
      const [quizData, classData] = await Promise.all([
        quizService.getAll(),
        classService.getAdminClasses().catch(() => []),
      ]);
      setQuizzes(quizData || []);
      setClasses(classData || []);
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
    quizzes.filter((quiz) => !filterType || quiz.type === filterType)
  ), [quizzes, filterType]);

  const selectedPart = EXAM_STRUCTURE[quizForm.examType]?.parts.find((part) => part.key === quizForm.examPart);
  const selectedBlueprint = QUIZ_BLUEPRINTS[quizForm.examType]?.[quizForm.examPart];
  const totalQuestionCount = useMemo(() => (
    sections.reduce((total, section) => total + (section.questions?.length || 0), 0)
  ), [sections]);
  const filledQuestionCount = useMemo(() => countFilledQuizQuestions(sections), [sections]);
  const getClassName = (classId) => classes.find((classroom) => Number(classroom.id) === Number(classId))?.name || `Lớp #${classId}`;
  const getClassNames = (classIds = []) => (
    classIds.length > 0
      ? classIds.map(getClassName).join(", ")
      : "Chưa gắn lớp"
  );

  // Đóng editor và trả state về mặc định.
  const resetEditor = () => {
    setEditorMode(null);
    setSelectedQuizId(null);
    setStep(1);
    setQuizForm(INITIAL_QUIZ);
    setSections([]);
    setExpandedSectionKey(null);
  };

  // Bắt đầu flow tạo quiz mới.
  const startCreateFlow = () => {
    setEditorMode("create");
    setSelectedQuizId(null);
    setStep(1);
    setQuizForm(INITIAL_QUIZ);
    setSections([]);
    setExpandedSectionKey(null);
  };

  // Chọn loại chứng chỉ ở step 1.
  const selectExamType = (examType) => {
    setQuizForm((current) => ({
      ...current,
      examType,
      examPart: "",
      timeLimit: examType === "TOEIC" ? 45 : 60,
    }));
    setSections([]);
    setExpandedSectionKey(null);
  };

  // Chọn part và dựng sẵn toàn bộ form câu hỏi phù hợp với part đó.
  const selectExamPart = (examPart) => {
    const nextForm = applyQuizBlueprintDefaults(quizForm, quizForm.examType, examPart);
    const nextSections = createQuizSections(quizForm.examType, examPart);

    setQuizForm({
      ...nextForm,
      title: editorMode === "edit" ? quizForm.title : `${quizForm.examType} ${EXAM_STRUCTURE[quizForm.examType].parts.find((part) => part.key === examPart)?.label || examPart}`,
    });
    setSections(nextSections);
    setExpandedSectionKey(nextSections[0]?.clientKey || null);
  };

  // Load quiz hiện có vào editor theo đúng section blueprint.
  const startEditFlow = async (quiz) => {
    try {
      const fullQuiz = await quizService.getFullQuiz(quiz.id);
      const nextSections = hydrateQuizSections(
        fullQuiz.quiz.type || "IELTS",
        fullQuiz.quiz.part,
        fullQuiz.groups || [],
        fullQuiz.questions || [],
      );

      setEditorMode("edit");
      setSelectedQuizId(quiz.id);
      setStep(2);
      setQuizForm({
        classId: fullQuiz.quiz.classId || "",
        classIds: getLinkedClassIds(fullQuiz.quiz),
        title: fullQuiz.quiz.title || "",
        examType: fullQuiz.quiz.type || "IELTS",
        examPart: fullQuiz.quiz.part || "",
        timeLimit: fullQuiz.quiz.timeLimit || 60,
      });
      setSections(nextSections);
      setExpandedSectionKey(nextSections[0]?.clientKey || null);
    } catch {
      toast.error("Không thể tải dữ liệu để chỉnh sửa");
    }
  };

  // Cập nhật metadata của một group/section như passage, audio hoặc instructions riêng.
  const updateSectionField = (sectionKey, field, value) => {
    setSections((current) => current.map((section) => (
      section.clientKey === sectionKey ? { ...section, [field]: value } : section
    )));
  };

  // Cập nhật nội dung câu hỏi trong section tương ứng.
  const updateQuestion = (sectionKey, questionIndex, field, value) => {
    setSections((current) => current.map((section) => (
      section.clientKey !== sectionKey
        ? section
        : {
            ...section,
            questions: section.questions.map((question, currentIndex) => (
              currentIndex === questionIndex ? { ...question, [field]: value } : question
            )),
          }
    )));
  };

  const handleSaveQuiz = async () => {
    if (!quizForm.title.trim()) {
      toast.error("Nhập tiêu đề bài kiểm tra");
      return;
    }
    if (!quizForm.examPart) {
      toast.error("Chọn phần thi");
      return;
    }
    if (sections.some((section) => section.questions.some((question) => !question.content.trim()))) {
      toast.error("Bạn cần nhập nội dung cho toàn bộ câu hỏi của part này");
      return;
    }

    setSaving(true);
    try {
      const serializedSections = serializeQuizSections(sections);
      const allQuestions = serializedSections.questions;
      const classIds = normalizeClassIdsPayload(quizForm.classIds, quizForm.classId);
      const payload = {
        classId: classIds[0] || null,
        classIds,
        title: quizForm.title,
        type: quizForm.examType,
        part: quizForm.examPart,
        timeLimit: Number(quizForm.timeLimit),
        groups: serializedSections.groups,
        questions: allQuestions,
      };

      if (editorMode === "edit" && selectedQuizId) {
        await quizService.update(selectedQuizId, payload);
        toast.success("Cập nhật thành công");
      } else {
        await quizService.create(payload);
        toast.success("Tạo bài kiểm tra thành công");
      }

      resetEditor();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lưu bài kiểm tra thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa bài kiểm tra này?")) {
      return;
    }

    try {
      await quizService.delete(id);
      toast.success("Đã xóa bài kiểm tra");
      fetchData();
    } catch {
      toast.error("Không thể xóa bài kiểm tra");
    }
  };

  const fetchQuizDetail = async (quizId) => quizService.getFullQuiz(quizId);

  const toggleClassSelection = (classId) => {
    const normalizedClassId = Number(classId);
    setQuizForm((current) => {
      const exists = current.classIds.includes(normalizedClassId);
      const nextClassIds = exists
        ? current.classIds.filter((item) => item !== normalizedClassId)
        : [...current.classIds, normalizedClassId];
      return {
        ...current,
        classId: nextClassIds[0] || "",
        classIds: nextClassIds,
      };
    });
  };

  const openViewModal = async (quiz) => {
    try {
      const fullQuiz = await fetchQuizDetail(quiz.id);
      setViewModal(fullQuiz);
    } catch {
      toast.error("Không thể tải chi tiết bài kiểm tra");
    }
  };

  if (editorMode) {
    return (
      <div className="admin-page fade-in admin-quizzes">
        <div className="page-header admin-quizzes__create-header">
          <button className="btn btn-ghost btn-sm" onClick={resetEditor}>← Quay lại</button>
          <div>
            <h1>{editorMode === "edit" ? "Chỉnh sửa bài kiểm tra" : "Tạo bài kiểm tra mới"}</h1>
            <p>
              Bước {step}/3 — {step === 1 ? "Chọn loại bài thi" : step === 2 ? "Cấu hình bài thi" : "Điền form câu hỏi theo part"}
            </p>
          </div>
        </div>

        {/* Wizard cho flow tạo/sửa quiz nhiều bước. */}
        <div className="step-indicator">
          {["Loại bài thi", "Cấu hình", "Form câu hỏi"].map((label, index) => (
            <div
              key={label}
              className={`step-item ${step > index + 1 ? "done" : step === index + 1 ? "active" : ""}`}
            >
              <div className="step-circle">{step > index + 1 ? "✓" : index + 1}</div>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <section className="section-card">
            <h3 className="section-title">Chọn loại bài kiểm tra</h3>
            <div className="exam-type-grid">
              {["IELTS", "TOEIC"].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`exam-type-card ${quizForm.examType === type ? "selected" : ""}`}
                  onClick={() => selectExamType(type)}
                  disabled={editorMode === "edit"}
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

            {editorMode === "edit" && (
              <p className="admin-quizzes__note">
                Khi sửa, loại chứng chỉ đang được khóa để tránh làm lệch blueprint của part hiện tại.
              </p>
            )}

            <h3 className="section-title admin-quizzes__section-space">Chọn phần thi</h3>
            <div className="parts-grid">
              {EXAM_STRUCTURE[quizForm.examType].parts.map((part) => (
                <button
                  key={part.key}
                  type="button"
                  className={`part-card ${quizForm.examPart === part.key ? "selected" : ""}`}
                  onClick={() => selectExamPart(part.key)}
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

        {step === 2 && (
          <section className="section-card">
            <div className="selected-part-banner">
              <strong>{quizForm.examType} — {selectedPart?.label}</strong>
              <span>{selectedPart?.desc}</span>
            </div>

            <div className="admin-quizzes__form-stack">
              <div className="form-group">
                <label>Lớp học áp dụng</label>
                <div className="admin-quizzes__class-picker">
                  {classes.map((classroom) => {
                    const selected = quizForm.classIds.includes(Number(classroom.id));
                    return (
                      <button
                        key={classroom.id}
                        type="button"
                        className={`admin-quizzes__class-option ${selected ? "active" : ""}`}
                        onClick={() => toggleClassSelection(classroom.id)}
                      >
                        <span>{classroom.name}</span>
                        <small>{selected ? "Đã chọn" : "Bấm để gắn"}</small>
                      </button>
                    );
                  })}
                </div>
                <p className="admin-quizzes__note">
                  Có thể gắn bài kiểm tra cho một hoặc nhiều lớp cùng lúc.
                </p>
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

            </div>

            <div className="admin-quizzes__footer-actions">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>← Quay lại</button>
              <button
                className="btn btn-primary"
                disabled={!selectedBlueprint}
                onClick={() => setStep(3)}
              >
                Tiếp theo →
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="admin-quizzes__builder">
            <div className="section-card admin-quizzes__summary-card">
              <div className="selected-part-banner">
                <strong>{quizForm.examType} — {selectedPart?.label}: {quizForm.title}</strong>
                <span>{filledQuestionCount}/{totalQuestionCount} câu đã nhập nội dung</span>
              </div>

              <div className="admin-quizzes__section-pills">
                {sections.map((section) => (
                  <button
                    key={section.clientKey}
                    className={`admin-quizzes__section-pill ${expandedSectionKey === section.clientKey ? "active" : ""}`}
                    onClick={() => setExpandedSectionKey(section.clientKey)}
                  >
                    {section.title} ({section.questions.length})
                  </button>
                ))}
              </div>
            </div>

            {sections.map((section) => {
              const isExpanded = expandedSectionKey === section.clientKey;

              return (
                <article key={section.clientKey} className={`admin-quizzes__section-card ${isExpanded ? "active" : ""}`}>
                  <button
                    className="admin-quizzes__section-header"
                    onClick={() => setExpandedSectionKey(isExpanded ? null : section.clientKey)}
                  >
                    <div>
                      <h3>{section.title}</h3>
                      <p>{section.description}</p>
                    </div>
                    <span>{section.questions.length} câu</span>
                  </button>

                  {isExpanded && (
                    <div className="admin-quizzes__section-body">
                      {(section.hasPassage || section.hasAudio || section.hasImage) && (
                        <div className="admin-quizzes__group-config">
                          <div className="form-group">
                            <label>Tên block hiển thị</label>
                            <input
                              value={section.title}
                              onChange={(event) => updateSectionField(section.clientKey, "title", event.target.value)}
                            />
                          </div>

                          {section.hasPassage && (
                            <div className="form-group">
                              <label>Passage / đoạn văn</label>
                              <textarea
                                rows={6}
                                className="admin-quizzes__passage-input"
                                value={section.passageText || ""}
                                onChange={(event) => updateSectionField(section.clientKey, "passageText", event.target.value)}
                                placeholder={`Nhập passage cho ${section.title}`}
                              />
                            </div>
                          )}

                          {section.hasAudio && (
                            <div className="form-group">
                              <label>Audio URL của block</label>
                              <input
                                value={section.audioUrl || ""}
                                onChange={(event) => updateSectionField(section.clientKey, "audioUrl", event.target.value)}
                                placeholder="https://... (mp3, wav)"
                              />
                            </div>
                          )}

                          <div className="form-group">
                            <label>Hướng dẫn riêng cho block</label>
                            <textarea
                              rows={2}
                              value={section.instructions || ""}
                              onChange={(event) => updateSectionField(section.clientKey, "instructions", event.target.value)}
                              placeholder="Hướng dẫn riêng cho nhóm câu hỏi này"
                            />
                          </div>
                        </div>
                      )}

                      {section.questions.map((question, index) => (
                        <div key={`${section.clientKey}-${index + 1}`} className="question-card">
                          <div className="question-header">
                            <span className="question-num">Câu {index + 1}</span>
                            <div className="admin-quizzes__question-tools">
                              {section.allowedQuestionTypes.length > 1 ? (
                                <select
                                  value={question.questionType}
                                  onChange={(event) => updateQuestion(section.clientKey, index, "questionType", event.target.value)}
                                  className="filter-select admin-quizzes__type-select"
                                >
                                  {section.allowedQuestionTypes.map((type) => (
                                    <option key={type} value={type}>{QUESTION_TYPE_LABELS[type] || type}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="badge badge-gray">{QUESTION_TYPE_LABELS[question.questionType] || question.questionType}</span>
                              )}
                            </div>
                          </div>

                          <div className="form-group admin-quizzes__question-space">
                            <label>Nội dung câu hỏi</label>
                            <textarea
                              rows={question.questionType === "writing" ? 4 : 2}
                              value={question.content}
                              onChange={(event) => updateQuestion(section.clientKey, index, "content", event.target.value)}
                              placeholder={`Nhập nội dung cho ${section.title} - câu ${index + 1}`}
                            />
                          </div>

                          {section.questionHasImage && (
                            <div className="form-group admin-quizzes__question-space">
                              <label>URL ảnh</label>
                              <input
                                value={question.imageUrl || ""}
                                onChange={(event) => updateQuestion(section.clientKey, index, "imageUrl", event.target.value)}
                                placeholder="https://..."
                              />
                            </div>
                          )}

                          {section.questionHasAudio && (
                            <div className="form-group admin-quizzes__question-space">
                              <label>Audio URL riêng cho câu</label>
                              <input
                                value={question.audioUrl || ""}
                                onChange={(event) => updateQuestion(section.clientKey, index, "audioUrl", event.target.value)}
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
                                    onChange={(event) => updateQuestion(section.clientKey, index, `option${option}`, event.target.value)}
                                    placeholder={`Lựa chọn ${option}`}
                                  />
                                </div>
                              ))}
                              <div className="form-group">
                                <label>Đáp án đúng</label>
                                <select
                                  value={question.correctAnswer}
                                  onChange={(event) => updateQuestion(section.clientKey, index, "correctAnswer", event.target.value)}
                                >
                                  <option value="">Chọn</option>
                                  {["A", "B", "C", "D"].map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}

                          {["fill_blank", "matching", "writing"].includes(question.questionType) && (
                            <div className="form-group admin-quizzes__question-space">
                              <label>Đáp án đúng</label>
                              <input
                                value={question.correctAnswer}
                                onChange={(event) => updateQuestion(section.clientKey, index, "correctAnswer", event.target.value)}
                                placeholder={question.questionType === "matching" ? "VD: 1-A, 2-C, 3-B" : "Nhập đáp án chính xác"}
                              />
                            </div>
                          )}

                          <div className="form-group">
                            <label>Giải thích đáp án</label>
                            <input
                              value={question.explanation || ""}
                              onChange={(event) => updateQuestion(section.clientKey, index, "explanation", event.target.value)}
                              placeholder="Giải thích tại sao đây là đáp án đúng"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}

            <div className="admin-quizzes__footer-actions">
              <button className="btn btn-ghost" onClick={() => setStep(2)}>← Quay lại</button>
              <button className="btn btn-primary" onClick={handleSaveQuiz} disabled={saving}>
                {saving ? "Đang lưu..." : editorMode === "edit" ? "Lưu thay đổi" : `Tạo bài kiểm tra (${totalQuestionCount} câu)`}
              </button>
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
            Tạo và quản lý các bộ đề IELTS, TOEIC với form nhập bám sát theo từng part thực tế.
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
        <button className="btn btn-primary" onClick={startCreateFlow}>+ Tạo bài kiểm tra</button>
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
                    <td>{getClassNames(getLinkedClassIds(quiz))}</td>
                    <td>
                      <span className={`badge ${quiz.type === "IELTS" ? "badge-blue" : quiz.type === "TOEIC" ? "badge-green" : "badge-gray"}`}>{quiz.type}</span>
                    </td>
                    <td>{quiz.part || "—"}</td>
                    <td>{quiz.timeLimit ? `${quiz.timeLimit} phút` : "—"}</td>
                    <td>
                      <div className="admin-quizzes__row-actions">
                        <button className="btn btn-info btn-sm" title="Xem chi tiết" onClick={() => openViewModal(quiz)}>👁️</button>
                        <button className="btn btn-warning btn-sm" title="Sửa" onClick={() => startEditFlow(quiz)}>✏️</button>
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
                  <p className="admin-quizzes__value admin-quizzes__value--strong">{getClassNames(getLinkedClassIds(viewModal.quiz))}</p>
                </div>
                <div>
                  <label className="admin-quizzes__label">Loại</label>
                  <p className="admin-quizzes__value">
                    <span className={`badge ${viewModal.quiz.type === "IELTS" ? "badge-blue" : viewModal.quiz.type === "TOEIC" ? "badge-green" : "badge-gray"}`}>
                      {viewModal.quiz.type}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="admin-quizzes__label">Phần thi</label>
                  <p className="admin-quizzes__value admin-quizzes__value--strong">{viewModal.quiz.part || "—"}</p>
                </div>
              </div>

              <div>
                <label className="admin-quizzes__label">Thời gian làm bài</label>
                <p className="admin-quizzes__value">{viewModal.quiz.timeLimit ? `${viewModal.quiz.timeLimit} phút` : "Không giới hạn"}</p>
              </div>

              <div>
                <label className="admin-quizzes__label">Câu hỏi</label>
                <div className="admin-quizzes__question-preview-list">
                  {buildQuizSectionsForDisplay(viewModal.quiz, viewModal.groups, viewModal.questions).map((section, sectionIndex, allSections) => {
                    const previousQuestionCount = allSections
                      .slice(0, sectionIndex)
                      .reduce((total, currentSection) => total + currentSection.questions.length, 0);

                    return (
                      <section key={section.key}>
                        {section.group && (
                          <article className="admin-quizzes__question-preview">
                            {section.group.title && <p className="admin-quizzes__value admin-quizzes__value--strong">{section.group.title}</p>}
                            {section.group.instructions && <p className="admin-quizzes__text-block">{section.group.instructions}</p>}
                            {section.group.passageText && <div className="admin-quizzes__passage-view">{section.group.passageText}</div>}
                            {section.group.imageUrl && <img src={section.group.imageUrl} alt="Question group" />}
                            {section.group.audioUrl && <audio controls src={section.group.audioUrl} className="admin-quizzes__audio" />}
                          </article>
                        )}
                        {section.questions.map((question, index) => (
                          <article key={question.id || index} className="admin-quizzes__question-preview">
                            <p className="admin-quizzes__value admin-quizzes__value--strong">{previousQuestionCount + index + 1}. {question.content}</p>
                            <p className="admin-quizzes__text-block">{QUESTION_TYPE_LABELS[question.questionType] || question.questionType}</p>
                            {question.imageUrl && <img src={question.imageUrl} alt="Question" />}
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
                      </section>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setViewModal(null)}>Đóng</button>
              <button
                className="btn btn-warning btn-sm"
                title="Sửa bài kiểm tra"
                onClick={() => {
                  startEditFlow(viewModal.quiz);
                  setViewModal(null);
                }}
              >
                ✏️
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
