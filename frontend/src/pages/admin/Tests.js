import React, { useEffect, useMemo, useState } from "react";
import { classService } from "../../services/classService";
import { testService } from "../../services/testService";
import { QUESTION_TYPE_LABELS } from "../../constants/quizzes";
import { getLinkedClassIds, normalizeClassIdsPayload } from "../../utils/assessment";
import { buildTestSectionsForDisplay } from "../../utils/assessmentSections";
import {
  TEST_BLUEPRINTS,
  applyBlueprintDefaults,
  countCompletedQuestions,
  createSectionsFromBlueprint,
  serializeTestSections,
  splitQuestionsIntoSections,
} from "../../utils/testBuilder";
import toast from "react-hot-toast";
import "./Tests.css";

const INITIAL_FORM = {
  classId: "",
  classIds: [],
  title: "",
  description: "",
  testType: "full_mock_test",
  examType: "IELTS",
  examPart: "Full Test",
  skillType: "full_test",
  durationMinutes: 165,
  totalScore: 9,
  attemptsAllowed: 1,
  startTime: "",
  endTime: "",
  status: "active",
};

export default function AdminTests() {
  // State dữ liệu chính cho list bài thi thử và lớp học.
  const [tests, setTests] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // State điều khiển bộ lọc, modal xem và editor tạo/sửa.
  const [search, setSearch] = useState("");
  const [filterExamType, setFilterExamType] = useState("");
  const [viewDetail, setViewDetail] = useState(null);
  const [editorMode, setEditorMode] = useState(null);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [sections, setSections] = useState(createSectionsFromBlueprint("IELTS"));
  const [expandedSectionKey, setExpandedSectionKey] = useState("listening-1");
  const [saving, setSaving] = useState(false);

  // Load danh sách bài thi thử và lớp học để dùng cho list + editor.
  const fetchData = async () => {
    setLoading(true);
    try {
      const [testData, classData] = await Promise.all([
        testService.getAll().catch(() => []),
        classService.getAdminClasses().catch(() => []),
      ]);
      setTests(testData || []);
      setClasses(classData || []);
    } catch {
      toast.error("Không thể tải dữ liệu bài thi thử");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTests = useMemo(() => (
    tests.filter((test) => {
      const normalizedSearch = search.trim().toLowerCase();
      const matchesSearch = !normalizedSearch
        || test.title?.toLowerCase().includes(normalizedSearch)
        || test.description?.toLowerCase().includes(normalizedSearch);

      return matchesSearch && (!filterExamType || test.examType === filterExamType);
    })
  ), [tests, search, filterExamType]);

  const totalQuestionCount = useMemo(() => (
    sections.reduce((total, section) => total + (section.questions?.length || 0), 0)
  ), [sections]);

  const completedQuestionCount = useMemo(() => (
    sections.reduce((total, section) => total + countCompletedQuestions(section), 0)
  ), [sections]);

  const blueprint = TEST_BLUEPRINTS[form.examType] || TEST_BLUEPRINTS.IELTS;

  const getClassName = (classId) => classes.find((item) => Number(item.id) === Number(classId))?.name || `Lớp #${classId}`;
  const getClassNames = (classIds = []) => (
    classIds.length > 0
      ? classIds.map(getClassName).join(", ")
      : "Chưa gắn lớp"
  );

  // Reset toàn bộ editor để quay về list sạch sẽ.
  const resetEditor = () => {
    setEditorMode(null);
    setSelectedTestId(null);
    setStep(1);
    const nextForm = applyBlueprintDefaults(INITIAL_FORM, "IELTS");
    setForm(nextForm);
    const nextSections = createSectionsFromBlueprint("IELTS");
    setSections(nextSections);
    setExpandedSectionKey(nextSections[0]?.clientKey || null);
  };

  // Bắt đầu flow tạo bài thi thử mới theo full form.
  const startCreateFlow = () => {
    const nextForm = applyBlueprintDefaults({
      ...INITIAL_FORM,
      title: TEST_BLUEPRINTS.IELTS.label,
    }, "IELTS");
    const nextSections = createSectionsFromBlueprint("IELTS");

    setEditorMode("create");
    setSelectedTestId(null);
    setStep(1);
    setForm(nextForm);
    setSections(nextSections);
    setExpandedSectionKey(nextSections[0]?.clientKey || null);
  };

  // Load bài thi hiện có vào editor và chia lại theo các phần chuẩn của full form.
  const startEditFlow = async (test) => {
    try {
      const detail = await testService.getFullTest(test.id);
      const examType = detail.test.examType || "IELTS";
      const nextSections = splitQuestionsIntoSections(examType, detail.groups || [], detail.questions || []);

      setEditorMode("edit");
      setSelectedTestId(test.id);
      setStep(2);
      setForm({
        classId: detail.test.classId || "",
        classIds: getLinkedClassIds(detail.test),
        title: detail.test.title || "",
        description: detail.test.description || "",
        testType: detail.test.testType || "full_mock_test",
        examType,
        examPart: detail.test.examPart || "Full Test",
        skillType: detail.test.skillType || "full_test",
        durationMinutes: detail.test.durationMinutes || applyBlueprintDefaults(INITIAL_FORM, examType).durationMinutes,
        totalScore: detail.test.totalScore || applyBlueprintDefaults(INITIAL_FORM, examType).totalScore,
        attemptsAllowed: detail.test.attemptsAllowed || 1,
        startTime: detail.test.startTime ? detail.test.startTime.slice(0, 16) : "",
        endTime: detail.test.endTime ? detail.test.endTime.slice(0, 16) : "",
        status: detail.test.status || "active",
      });
      setSections(nextSections);
      setExpandedSectionKey(nextSections[0]?.clientKey || null);
    } catch {
      toast.error("Không thể tải dữ liệu bài thi thử");
    }
  };

  // Đổi loại chứng chỉ sẽ đổi luôn bộ section full form tương ứng.
  const selectExamType = (examType) => {
    const nextForm = applyBlueprintDefaults({
      ...form,
      title: editorMode === "edit" ? form.title : TEST_BLUEPRINTS[examType].label,
    }, examType);
    const nextSections = createSectionsFromBlueprint(examType);

    setForm(nextForm);
    setSections(nextSections);
    setExpandedSectionKey(nextSections[0]?.clientKey || null);
  };

  // Cập nhật field của một câu hỏi trong section tương ứng.
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

  // Cập nhật metadata riêng cho từng block như passage, audio hoặc hướng dẫn.
  const updateSectionField = (sectionKey, field, value) => {
    setSections((current) => current.map((section) => (
      section.clientKey === sectionKey ? { ...section, [field]: value } : section
    )));
  };

  const handleSave = async () => {
    const classIds = normalizeClassIdsPayload(form.classIds, form.classId);
    if (classIds.length === 0) {
      toast.error("Chọn ít nhất một lớp học");
      return;
    }
    if (!form.title.trim()) {
      toast.error("Nhập tiêu đề bài thi thử");
      return;
    }
    if (sections.some((section) => section.questions.some((question) => !question.content.trim()))) {
      toast.error("Bạn cần nhập nội dung cho toàn bộ câu hỏi trong full form");
      return;
    }

    setSaving(true);
    try {
      const serializedSections = serializeTestSections(sections);
      const payload = {
        ...form,
        classId: classIds[0] || null,
        classIds,
        durationMinutes: Number(form.durationMinutes || 0),
        totalScore: Number(form.totalScore || 0),
        attemptsAllowed: Number(form.attemptsAllowed || 1),
        questions: serializedSections.questions,
        groups: serializedSections.groups,
      };

      if (editorMode === "edit" && selectedTestId) {
        await testService.update(selectedTestId, payload);
        toast.success("Cập nhật bài thi thử thành công");
      } else {
        await testService.create(payload);
        toast.success("Tạo bài thi thử thành công");
      }

      resetEditor();
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể lưu bài thi thử");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (testId) => {
    if (!window.confirm("Xóa bài thi thử này?")) {
      return;
    }

    try {
      await testService.delete(testId);
      toast.success("Đã xóa bài thi thử");
      fetchData();
    } catch {
      toast.error("Không thể xóa bài thi thử");
    }
  };

  const openView = async (test) => {
    try {
      const detail = await testService.getFullTest(test.id);
      setViewDetail({
        ...detail,
        sectionBlocks: buildTestSectionsForDisplay(detail.test, detail.groups, detail.questions),
      });
    } catch {
      toast.error("Không thể tải chi tiết bài thi thử");
    }
  };

  const toggleClassSelection = (classId) => {
    const normalizedClassId = Number(classId);
    setForm((current) => {
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

  if (editorMode) {
    return (
      <div className="admin-page fade-in admin-tests admin-tests--editor">
        <div className="page-header admin-tests__editor-header">
          <button className="btn btn-ghost btn-sm" onClick={resetEditor}>← Quay lại</button>
          <div>
            <h1>{editorMode === "edit" ? "Chỉnh sửa bài thi thử" : "Tạo bài thi thử mới"}</h1>
            <p>
              Bước {step}/3 — {step === 1 ? "Chọn TOEIC hoặc IELTS" : step === 2 ? "Cấu hình đề full form" : "Nhập câu hỏi theo từng phần"}
            </p>
          </div>
        </div>

        {/* Step indicator giúp admin biết mình đang ở đâu trong flow cấu hình. */}
        <div className="step-indicator">
          {["Chứng chỉ", "Cấu hình", "Câu hỏi full form"].map((label, index) => (
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
            <h3 className="section-title">Chọn loại bài thi thử</h3>
            <div className="exam-type-grid">
              {Object.entries(TEST_BLUEPRINTS).map(([examType, config]) => (
                <button
                  key={examType}
                  type="button"
                  className={`exam-type-card ${form.examType === examType ? "selected" : ""}`}
                  onClick={() => selectExamType(examType)}
                  disabled={editorMode === "edit"}
                >
                  <div className="exam-type-icon">{examType === "IELTS" ? "🎓" : "💼"}</div>
                  <h4>{examType}</h4>
                  <p>{config.label}</p>
                  <div className="exam-parts-preview">
                    {config.sections.map((section) => (
                      <span key={section.key} className="part-tag">{section.label}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {editorMode === "edit" && (
              <p className="admin-tests__note">
                Loại chứng chỉ đang bị khóa khi sửa để tránh làm lệch cấu trúc full form đã có.
              </p>
            )}

            <div className="admin-tests__footer-actions admin-tests__footer-actions--end">
              <button className="btn btn-primary" onClick={() => setStep(2)}>Tiếp theo →</button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="section-card">
            <div className="selected-part-banner">
              <strong>{form.examType} — {blueprint.label}</strong>
              <span>{blueprint.sections.length} phần, {totalQuestionCount} câu hỏi chuẩn</span>
            </div>

            <div className="admin-tests__form-stack">
              <div className="form-group">
                <label>Lớp học áp dụng</label>
                <div className="admin-tests__class-picker">
                  {classes.map((classroom) => {
                    const selected = form.classIds.includes(Number(classroom.id));
                    return (
                      <button
                        key={classroom.id}
                        type="button"
                        className={`admin-tests__class-option ${selected ? "active" : ""}`}
                        onClick={() => toggleClassSelection(classroom.id)}
                      >
                        <span>{classroom.name}</span>
                        <small>{selected ? "Đã chọn" : "Bấm để gắn"}</small>
                      </button>
                    );
                  })}
                </div>
                <p className="admin-tests__note">
                  Có thể gắn bài thi thử cho nhiều lớp cùng lúc.
                </p>
              </div>

              <div className="form-group">
                <label>Tiêu đề bài thi thử</label>
                <input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder={blueprint.label}
                />
              </div>

              <div className="form-group">
                <label>Mô tả đề</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Mô tả ngắn về đề, phạm vi kiến thức, mục tiêu ôn luyện..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Thời gian (phút)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.durationMinutes}
                    onChange={(event) => setForm({ ...form, durationMinutes: event.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Tổng điểm</label>
                  <input
                    type="number"
                    min={1}
                    value={form.totalScore}
                    onChange={(event) => setForm({ ...form, totalScore: event.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Số lần làm</label>
                  <input
                    type="number"
                    min={1}
                    value={form.attemptsAllowed}
                    onChange={(event) => setForm({ ...form, attemptsAllowed: event.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Bắt đầu</label>
                  <input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(event) => setForm({ ...form, startTime: event.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Kết thúc</label>
                  <input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(event) => setForm({ ...form, endTime: event.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                    <option value="draft">draft</option>
                    <option value="closed">closed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="admin-tests__footer-actions">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>← Quay lại</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>Tiếp theo →</button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="admin-tests__builder">
            <div className="section-card admin-tests__summary-card">
              <div className="selected-part-banner">
                <strong>{form.title || blueprint.label}</strong>
                <span>{completedQuestionCount}/{totalQuestionCount} câu đã nhập nội dung</span>
              </div>
              <div className="admin-tests__section-pills">
                {sections.map((section) => (
                  <button
                    key={section.clientKey}
                    className={`admin-tests__section-pill ${expandedSectionKey === section.clientKey ? "active" : ""}`}
                    onClick={() => setExpandedSectionKey(section.clientKey)}
                  >
                    {section.label} ({countCompletedQuestions(section)}/{section.questions.length})
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-tests__sections">
              {sections.map((section) => {
                const isExpanded = expandedSectionKey === section.clientKey;

                return (
                  <article key={section.clientKey} className={`admin-tests__section-card ${isExpanded ? "active" : ""}`}>
                    <button
                      className="admin-tests__section-header"
                      onClick={() => setExpandedSectionKey(isExpanded ? null : section.clientKey)}
                    >
                      <div>
                        <h3>{section.label}</h3>
                        <p>{section.description}</p>
                      </div>
                      <span>{countCompletedQuestions(section)}/{section.questions.length}</span>
                    </button>

                    {isExpanded && (
                      <div className="admin-tests__section-body">
                        {(section.hasPassage || section.hasAudio) && (
                          <div className="admin-tests__group-config">
                            <div className="form-group">
                              <label>Tên block hiển thị</label>
                              <input
                                value={section.title || ""}
                                onChange={(event) => updateSectionField(section.clientKey, "title", event.target.value)}
                              />
                            </div>

                            {section.hasPassage && (
                              <div className="form-group">
                                <label>Passage / đoạn văn của block</label>
                                <textarea
                                  rows={6}
                                  className="admin-tests__passage-input"
                                  value={section.passageText || ""}
                                  onChange={(event) => updateSectionField(section.clientKey, "passageText", event.target.value)}
                                  placeholder={`Nhập passage cho ${section.label}`}
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

                        {section.questions.map((question, questionIndex) => (
                          <article key={`${section.clientKey}-${questionIndex + 1}`} className="admin-tests__question-card">
                            <div className="admin-tests__question-top">
                              <strong>Câu {questionIndex + 1}</strong>
                              <span className="badge badge-gray">{QUESTION_TYPE_LABELS[question.questionType] || question.questionType}</span>
                            </div>

                            {section.allowedQuestionTypes.length > 1 ? (
                              <div className="form-group">
                                <label>Loại câu hỏi</label>
                                <select
                                  value={question.questionType}
                                  onChange={(event) => updateQuestion(section.clientKey, questionIndex, "questionType", event.target.value)}
                                >
                                  {section.allowedQuestionTypes.map((type) => (
                                    <option key={type} value={type}>{QUESTION_TYPE_LABELS[type] || type}</option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <input type="hidden" value={question.questionType} readOnly />
                            )}

                            <div className="form-group">
                              <label>Nội dung câu hỏi</label>
                              <textarea
                                rows={question.questionType === "writing" ? 4 : 2}
                                value={question.content}
                                onChange={(event) => updateQuestion(section.clientKey, questionIndex, "content", event.target.value)}
                                placeholder={`Nhập nội dung cho ${section.label} - câu ${questionIndex + 1}`}
                              />
                            </div>

                            {section.questionHasImage && (
                              <div className="form-group">
                                <label>URL ảnh cho câu hỏi</label>
                                <input
                                  value={question.imageUrl || ""}
                                  onChange={(event) => updateQuestion(section.clientKey, questionIndex, "imageUrl", event.target.value)}
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
                                      onChange={(event) => updateQuestion(section.clientKey, questionIndex, `option${option}`, event.target.value)}
                                      placeholder={`Lựa chọn ${option}`}
                                    />
                                  </div>
                                ))}
                                <div className="form-group">
                                  <label>Đáp án đúng</label>
                                  <select
                                    value={question.correctAnswer || ""}
                                    onChange={(event) => updateQuestion(section.clientKey, questionIndex, "correctAnswer", event.target.value)}
                                  >
                                    <option value="">Chọn</option>
                                    {["A", "B", "C", "D"].map((option) => (
                                      <option key={option} value={option}>{option}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            )}

                            {question.questionType !== "mcq" && (
                              <div className="form-group">
                                <label>Đáp án đúng</label>
                                <input
                                  value={question.correctAnswer || ""}
                                  onChange={(event) => updateQuestion(section.clientKey, questionIndex, "correctAnswer", event.target.value)}
                                  placeholder={question.questionType === "matching" ? "VD: 1-A, 2-C, 3-B" : "Nhập đáp án đúng"}
                                />
                              </div>
                            )}

                            <div className="form-group">
                              <label>Giải thích đáp án</label>
                              <input
                                value={question.explanation || ""}
                                onChange={(event) => updateQuestion(section.clientKey, questionIndex, "explanation", event.target.value)}
                                placeholder="Giải thích nhanh cho đáp án đúng"
                              />
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            <div className="admin-tests__footer-actions">
              <button className="btn btn-ghost" onClick={() => setStep(2)}>← Quay lại</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Đang lưu..." : editorMode === "edit" ? "Lưu thay đổi" : `Tạo bài thi thử (${totalQuestionCount} câu)`}
              </button>
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="admin-page fade-in admin-tests">
      <section className="admin-tests__hero">
        <div>
          <p className="admin-tests__eyebrow">Mock test manager</p>
          <h1>Bài thi thử</h1>
          <p className="admin-tests__subtitle">
            Tạo đề TOEIC hoặc IELTS theo full form chuẩn, rồi điền lần lượt câu hỏi theo đúng từng phần thi.
          </p>
        </div>
        <div className="admin-tests__hero-card">
          <span>Tổng bài thi</span>
          <strong>{tests.length}</strong>
          <p>{filteredTests.length} bài đang hiển thị theo bộ lọc hiện tại.</p>
        </div>
      </section>

      <div className="toolbar">
        <div className="toolbar-left">
          <input
            className="search-input"
            placeholder="Tìm theo tiêu đề hoặc mô tả..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select className="filter-select" value={filterExamType} onChange={(event) => setFilterExamType(event.target.value)}>
            <option value="">Tất cả chứng chỉ</option>
            <option value="IELTS">IELTS</option>
            <option value="TOEIC">TOEIC</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={startCreateFlow}>+ Tạo bài thi thử</button>
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
                <th>Tổng điểm</th>
                <th>Thời gian</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state"><p>Chưa có bài thi thử nào</p></td>
                </tr>
              ) : (
                filteredTests.map((test) => (
                  <tr key={test.id}>
                    <td>
                      <p className="admin-tests__title">{test.title}</p>
                      <p className="admin-tests__muted">{test.description || "Không có mô tả"}</p>
                    </td>
                    <td>{getClassNames(getLinkedClassIds(test))}</td>
                    <td>
                      <span className={`badge ${test.examType === "IELTS" ? "badge-blue" : test.examType === "TOEIC" ? "badge-green" : "badge-gray"}`}>
                        {test.examType}
                      </span>
                    </td>
                    <td>{test.totalScore || "—"}</td>
                    <td>{test.durationMinutes ? `${test.durationMinutes} phút` : "—"}</td>
                    <td>
                      <div className="admin-tests__actions">
                        <button className="btn btn-info btn-sm" title="Xem" onClick={() => openView(test)}>👁️</button>
                        <button className="btn btn-warning btn-sm" title="Sửa" onClick={() => startEditFlow(test)}>✏️</button>
                        <button className="btn btn-danger btn-sm" title="Xóa" onClick={() => handleDelete(test.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal xem bài thi thử theo từng phần full form đã chia sẵn. */}
      {viewDetail && (
        <div className="modal-overlay" onClick={() => setViewDetail(null)}>
          <div className="modal admin-tests__modal admin-tests__modal--wide" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>{viewDetail.test.title}</h3>
              <button className="modal-close" onClick={() => setViewDetail(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="admin-tests__summary-grid">
                <div className="admin-tests__summary-card">
                  <span>Lớp</span>
                  <strong>{getClassNames(getLinkedClassIds(viewDetail.test))}</strong>
                </div>
                <div className="admin-tests__summary-card">
                  <span>Chứng chỉ</span>
                  <strong>{viewDetail.test.examType}</strong>
                </div>
                <div className="admin-tests__summary-card">
                  <span>Thời gian</span>
                  <strong>{viewDetail.test.durationMinutes || "—"} phút</strong>
                </div>
              </div>

              {viewDetail.test.description && (
                <div className="admin-tests__detail-block">
                  <label>Mô tả</label>
                  <p>{viewDetail.test.description}</p>
                </div>
              )}

              <div className="admin-tests__question-list">
                {viewDetail.sectionBlocks.map((section) => (
                  <section key={section.key} className="admin-tests__detail-section">
                    <div className="admin-tests__detail-section-head">
                      <h4>{section.group?.title || "Nhóm câu hỏi"}</h4>
                      <span>{section.questions.length} câu</span>
                    </div>
                    {section.group?.instructions && (
                      <p className="admin-tests__muted">{section.group.instructions}</p>
                    )}

                    {section.group?.passageText && (
                      <div className="admin-tests__detail-block">
                        <label>Passage</label>
                        <p>{section.group.passageText}</p>
                      </div>
                    )}

                    {section.group?.audioUrl && (
                      <div className="admin-tests__detail-block">
                        <label>Audio URL</label>
                        <p>{section.group.audioUrl}</p>
                      </div>
                    )}

                    {section.questions.map((question, index) => (
                      <article key={`${section.key}-${index + 1}`} className="admin-tests__question-card">
                        <p className="admin-tests__question-title">{index + 1}. {question.content || "Chưa nhập nội dung"}</p>
                        {question.imageUrl && (
                          <p className="admin-tests__muted">Ảnh: {question.imageUrl}</p>
                        )}
                        {question.questionType === "mcq" && (
                          <div className="admin-tests__option-list">
                            {["A", "B", "C", "D"].map((option) => question[`option${option}`] ? (
                              <div key={option} className={`admin-tests__option-item ${question.correctAnswer === option ? "admin-tests__option-item--correct" : ""}`}>
                                <strong>{option}.</strong> {question[`option${option}`]}
                              </div>
                            ) : null)}
                          </div>
                        )}
                        {question.questionType !== "mcq" && question.correctAnswer && (
                          <p className="admin-tests__muted">Đáp án đúng: <strong>{question.correctAnswer}</strong></p>
                        )}
                      </article>
                    ))}
                  </section>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setViewDetail(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
