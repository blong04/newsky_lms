import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { testService } from "../../services/testService";
import toast from "react-hot-toast";
import "./Placement.css";

export default function StudentPlacement() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showRetakePicker, setShowRetakePicker] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const placementStatus = await testService.getPlacementStatus();
      setStatus(placementStatus);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải trạng thái bài thi xếp lớp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleStart = async () => {
    if (!selectedType) {
      toast.error("Hãy chọn TOEIC hoặc IELTS");
      return;
    }

    setStarting(true);
    try {
      const test = await testService.getRandomPlacementTest(selectedType);
      navigate(`/student/test/${test.id}?mode=placement`, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể mở bài thi xếp lớp");
    } finally {
      setStarting(false);
    }
  };

  // Học viên muốn làm lại (đổi hệ chứng chỉ hoặc thi lại) - xóa kết quả cũ rồi cho chọn lại.
  const handleRequestRetake = async () => {
    setResetting(true);
    try {
      await testService.resetPlacement();
      setStatus(null);
      setSelectedType("");
      setShowRetakePicker(true);
      toast.success("Đã đặt lại bài xếp lớp, hãy chọn hệ chứng chỉ để làm lại.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể đặt lại bài xếp lớp");
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-page fade-in placement-page">
      <section className="placement-page__hero">
        <div>
          <p className="placement-page__eyebrow">Placement test</p>
          <h1>Chào mừng {user?.name}</h1>
          <p className="placement-page__subtitle">
            Trước khi xem khóa học, bạn cần làm một bài thi xếp lớp để hệ thống gợi ý lộ trình phù hợp hơn.
          </p>
        </div>
        <div className="placement-page__hero-card">
          <span>Bắt buộc một lần</span>
          <strong>Thi đầu vào TOEIC hoặc IELTS</strong>
          <p>Kết quả sẽ được dùng để gợi ý các khóa học phù hợp với trình độ hiện tại.</p>
        </div>
      </section>

      {status?.placementCompleted && !showRetakePicker ? (
        <section className="section-card placement-page__panel">
          <h3 className="section-title">Bạn đã hoàn thành bài xếp lớp</h3>
          <div className="placement-page__note-box">
            <p>
              Hệ chứng chỉ: <strong>{status.placementExamType}</strong>
              {" — "}
              Điểm: <strong>{status.placementExamType === "IELTS" ? Number(status.placementScore || 0).toFixed(1) : Number(status.placementScore || 0).toFixed(0)}</strong>
            </p>
            <p>Bạn có thể tiếp tục xem khóa học theo kết quả này, hoặc làm lại nếu muốn đổi sang hệ chứng chỉ khác (VD: đã học TOEIC muốn chuyển qua IELTS).</p>
          </div>
          <div className="placement-page__actions">
            <button className="btn btn-primary" onClick={() => navigate("/student/courses")}>
              Xem khóa học phù hợp
            </button>
            <button className="btn btn-ghost" onClick={handleRequestRetake} disabled={resetting}>
              {resetting ? "Đang đặt lại..." : "Làm lại bài xếp lớp"}
            </button>
          </div>
        </section>
      ) : (
        <section className="section-card placement-page__panel">
          <h3 className="section-title">1. Chọn hệ chứng chỉ bạn muốn theo học</h3>
          <div className="placement-page__type-grid">
            {["TOEIC", "IELTS"].map((type) => (
              <button
                key={type}
                type="button"
                className={`placement-page__type-card ${selectedType === type ? "placement-page__type-card--active" : ""}`}
                onClick={() => setSelectedType(type)}
              >
                <span className="placement-page__type-badge">{type}</span>
                <strong>{type === "TOEIC" ? "Lộ trình TOEIC" : "Lộ trình IELTS"}</strong>
                <p>{type === "TOEIC" ? "Phù hợp nếu bạn muốn luyện đề và phát triển theo thang điểm TOEIC." : "Phù hợp nếu bạn muốn học theo band IELTS học thuật."}</p>
              </button>
            ))}
          </div>

          <div className="placement-page__note-box">
            <p>2. Hệ thống sẽ chọn ngẫu nhiên một đề thi thử từ kho đề xếp lớp của {selectedType || "bạn"}.</p>
            <p>3. Sau khi nộp bài, bạn sẽ được gợi ý các khóa học phù hợp thay vì xem toàn bộ danh mục.</p>
          </div>

          <div className="placement-page__actions">
            <button className="btn btn-primary" onClick={handleStart} disabled={starting}>
              {starting ? "Đang mở đề..." : "Bắt đầu bài thi xếp lớp"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
