import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { enrollmentService } from "../../services/enrollmentService";
import { classService } from "../../services/classService";
import { testService } from "../../services/testService";
import { getLinkedClassIds, hasAnyLinkedClass } from "../../utils/assessment";
import { ACTIVE_ENROLLMENT_STATUSES } from "../../constants/enrollments";
import "./Tests.css";

const buildSubmissionStats = (submissions) => (
  (submissions || []).reduce((statsMap, submission) => {
    const testId = Number(submission.testId);
    if (Number.isNaN(testId)) {
      return statsMap;
    }

    const current = statsMap[testId] || { latest: null, count: 0 };
    const nextLatest = !current.latest
      || new Date(submission.submittedAt || 0) > new Date(current.latest.submittedAt || 0)
      ? submission
      : current.latest;

    statsMap[testId] = {
      latest: nextLatest,
      count: current.count + 1,
    };
    return statsMap;
  }, {})
);

export default function StudentTests() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [enrollmentData, testData, classData, testSubmissionData] = await Promise.all([
          enrollmentService.getStudentEnrollments().catch(() => []),
          testService.getAll().catch(() => []),
          classService.getPublicClasses().catch(() => []),
          testService.getUserSubmissions(user.id).catch(() => []),
        ]);

        const activeEnrollments = (enrollmentData || []).filter((item) =>
          ACTIVE_ENROLLMENT_STATUSES.includes(item.status)
        );
        const availableClassIds = new Set(activeEnrollments.map((item) => Number(item.classId)).filter(Boolean));
        const classList = classData || [];
        const submissionStats = buildSubmissionStats(testSubmissionData || []);

        setClasses(classList);
        setTests((testData || [])
          .filter((test) => hasAnyLinkedClass(test, availableClassIds))
          .map((test) => ({
            ...test,
            latestSubmission: submissionStats[Number(test.id)]?.latest || null,
            attemptCount: submissionStats[Number(test.id)]?.count || 0,
          })));
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

  const getClassName = (classId) => classes.find((item) => Number(item.id) === Number(classId))?.name || `Lớp #${classId}`;
  const getClassNames = (test) => {
    const classIds = getLinkedClassIds(test);
    return classIds.length > 0 ? classIds.map(getClassName).join(", ") : "Chưa gắn lớp";
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-page fade-in student-tests">
      <section className="student-tests__hero">
        <div>
          <p className="student-tests__eyebrow">Mock test center</p>
          <h1>Bài thi thử</h1>
          <p className="student-tests__subtitle">
            Làm các bài thi thử full form theo lớp đã đăng ký và theo dõi số lần làm bài ngay trong một nơi.
          </p>
        </div>
        <div className="student-tests__hero-card">
          <span>Khả dụng</span>
          <strong>{tests.length} bài thi thử</strong>
          <p>Các bài thi được mở từ những lớp bạn đang theo học.</p>
        </div>
      </section>

      <div className="student-tests__list">
        {tests.length === 0 ? (
          <div className="empty-state"><p>Hiện chưa có bài thi thử nào cho các lớp bạn đang học</p></div>
        ) : (
          tests.map((test) => {
            const attemptsAllowed = Number(test.attemptsAllowed || 1);
            const attemptCount = Number(test.attemptCount || 0);
            const canRetake = attemptCount < attemptsAllowed;
            const latestScore = test.latestSubmission?.totalScore;

            return (
              <article key={test.id} className="student-tests__card">
                <div className="student-tests__main">
                  <div className="student-tests__badge-row">
                    <span className={`badge ${test.type === "IELTS" ? "badge-blue" : test.type === "TOEIC" ? "badge-green" : "badge-gray"}`}>
                      {test.type || "Khác"}
                    </span>
                    <span className="badge badge-purple">{test.part || "Full test"}</span>
                    {test.timeLimit && <span className="badge badge-yellow">⏱ {test.timeLimit} phút</span>}
                  </div>

                  <h3 className="student-tests__title">{test.title}</h3>
                  <p className="student-tests__description">{test.description || "Bài thi thử full form cho lớp học này."}</p>

                  <div className="student-tests__meta">
                    <span>🏫 {getClassNames(test)}</span>
                    <span>🔁 {attemptCount}/{attemptsAllowed} lần</span>
                    {latestScore != null && <span className="student-tests__score">Điểm gần nhất: {latestScore}/{test.totalScore || 100}</span>}
                  </div>
                </div>

                <div className="student-tests__actions">
                  {canRetake ? (
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/student/test/${test.id}`)}>
                      {attemptCount > 0 ? "Làm lại" : "Bắt đầu"}
                    </button>
                  ) : (
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate("/student/results")}>
                      Xem kết quả
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
