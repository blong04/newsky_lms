import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "../admin/Admin.css";
import "./Teacher.css";
import "./Notifications.css";

const INITIAL_FORM = {
  title: "",
  content: "",
  targetClassId: "",
  targetUserId: "",
  type: "course",
};

const TYPE_ICON = {
  course: "📚",
  schedule: "📅",
  assignment: "📋",
  system: "⚙️",
  announcement: "📣",
};

export default function TeacherNotifications() {
  // State UI gồm tab hiện tại, dữ liệu form và inbox.
  const [tab, setTab] = useState("send");
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [myNotifications, setMyNotifications] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/teacher/classes").then((response) => setClasses(response.data.data || [])).catch(() => setClasses([]));
    api.get("/users")
      .then((response) => setUsers((response.data.data || []).filter((account) => account.roleId === 3)))
      .catch(() => setUsers([]));
    fetchInbox();
  }, []);

  // Load hộp thư thông báo giáo viên nhận từ admin.
  const fetchInbox = async () => {
    setLoading(true);
    try {
      const response = await api.get("/notifications/my").catch(() => ({ data: { data: [] } }));
      setMyNotifications(response.data.data || []);
    } catch {
      setMyNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Danh sách học viên gợi ý theo lớp đã chọn.
  // FE chỉ hiển thị danh sách học viên để chọn nhanh, còn phạm vi hợp lệ do backend kiểm tra.
  const targetStudents = useMemo(() => users, [users]);

  const handleSend = async () => {
    if (!form.title || !form.content) {
      toast.error("Nhập đầy đủ tiêu đề và nội dung");
      return;
    }

    if (!form.targetClassId && !form.targetUserId) {
      toast.error("Chọn lớp hoặc học viên nhận thông báo");
      return;
    }

    setSending(true);

    try {
      await api.post("/teacher/notifications/send", form);
      toast.success("Đã gửi thông báo thành công");
      setForm(INITIAL_FORM);
    } catch {
      toast.error("Gửi thông báo thất bại");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="admin-page fade-in teacher-notifications">
      <section className="teacher-notifications__hero">
        <div>
          <p className="teacher-notifications__eyebrow">Teacher communication</p>
          <h1>Thông báo</h1>
          <p className="teacher-notifications__subtitle">
            Gửi nhắc nhở đến lớp hoặc từng học viên, đồng thời theo dõi thông báo quản trị gửi xuống.
          </p>
        </div>
        <div className="teacher-notifications__hero-card">
          <span>Hộp thư mới</span>
          <strong>{myNotifications.filter((item) => !item.read).length}</strong>
          <p>Số thông báo chưa đọc hiện có trong hộp thư giáo viên.</p>
        </div>
      </section>

      <div className="teacher-tabs">
        <button className={`ttab ${tab === "send" ? "active" : ""}`} onClick={() => setTab("send")}>📤 Gửi thông báo</button>
        <button className={`ttab ${tab === "inbox" ? "active" : ""}`} onClick={() => { setTab("inbox"); fetchInbox(); }}>
          📥 Hộp thư ({myNotifications.filter((item) => !item.read).length} mới)
        </button>
      </div>

      {tab === "send" && (
        <section className="teacher-notifications__layout">
          {/* Form soạn thông báo cho lớp hoặc học viên cụ thể. */}
          <div className="section-card teacher-notifications__composer">
            <div className="teacher-notifications__section-head">
              <div>
                <p className="teacher-notifications__section-kicker">Compose</p>
                <h3 className="section-title">Soạn thông báo</h3>
              </div>
            </div>

            <div className="teacher-notifications__form-stack">
              <div className="form-group">
                <label>Loại thông báo</label>
                <select
                  value={form.type}
                  onChange={(event) => setForm({ ...form, type: event.target.value })}
                  className="filter-select teacher-notifications__field"
                >
                  <option value="course">📚 Về khóa học</option>
                  <option value="schedule">📅 Về lịch học</option>
                  <option value="assignment">📋 Về bài tập</option>
                  <option value="announcement">📣 Thông báo chung</option>
                </select>
              </div>

              <div className="form-group">
                <label>Gửi đến lớp</label>
                <select
                  value={form.targetClassId}
                  onChange={(event) => setForm({ ...form, targetClassId: event.target.value, targetUserId: "" })}
                  className="filter-select teacher-notifications__field"
                >
                  <option value="">— Chọn lớp —</option>
                  {classes.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>{classroom.name}</option>
                  ))}
                </select>
              </div>

              <div className="teacher-notifications__divider">— hoặc —</div>

              <div className="form-group">
                <label>Gửi cá nhân</label>
                <select
                  value={form.targetUserId}
                  onChange={(event) => setForm({ ...form, targetUserId: event.target.value, targetClassId: "" })}
                  className="filter-select teacher-notifications__field"
                >
                  <option value="">— Chọn học viên —</option>
                  {targetStudents.map((account) => (
                    <option key={account.id} value={account.id}>{account.name} ({account.email})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tiêu đề</label>
                <input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="VD: Thông báo hoãn buổi học"
                  className="search-input teacher-notifications__field"
                />
              </div>

              <div className="form-group">
                <label>Nội dung</label>
                <textarea
                  rows={5}
                  value={form.content}
                  onChange={(event) => setForm({ ...form, content: event.target.value })}
                  placeholder="Nhập nội dung thông báo..."
                  className="teacher-notifications__textarea"
                />
              </div>

              <button className="btn btn-primary" onClick={handleSend} disabled={sending}>
                {sending ? <span className="spinner" /> : "📤 Gửi thông báo"}
              </button>
            </div>
          </div>

          {/* Khối hướng dẫn ngắn để giáo viên hiểu phạm vi gửi thông báo. */}
          <div className="section-card teacher-notifications__guide">
            <h3 className="section-title">Hướng dẫn</h3>
            <div className="teacher-notifications__guide-list">
              <article className="teacher-notifications__guide-item teacher-notifications__guide-item--primary">
                <strong>📚 Gửi theo lớp</strong>
                <p>Chọn một lớp để toàn bộ học viên trong lớp đều nhận được cùng một nội dung.</p>
              </article>
              <article className="teacher-notifications__guide-item teacher-notifications__guide-item--warning">
                <strong>👤 Gửi cá nhân</strong>
                <p>Dùng cho trường hợp cần nhắc bài, nhắc hạn nộp hoặc góp ý riêng cho từng học viên.</p>
              </article>
              <article className="teacher-notifications__guide-item teacher-notifications__guide-item--success">
                <strong>⚠️ Lưu ý</strong>
                <p>Giáo viên chỉ gửi được đến học viên thuộc lớp phụ trách, không gửi ngang sang lớp của giáo viên khác.</p>
              </article>
            </div>
          </div>
        </section>
      )}

      {tab === "inbox" && (
        <section className="section-card">
          <h3 className="section-title">Thông báo từ Admin</h3>
          {loading ? (
            <div className="page-loading"><div className="spinner" /></div>
          ) : myNotifications.length === 0 ? (
            <div className="empty-state"><p>Không có thông báo nào</p></div>
          ) : (
            myNotifications.map((notification) => (
              <article key={notification.id} className={`notif-item ${!notification.read ? "unread" : ""}`}>
                <div className="notif-icon">{TYPE_ICON[notification.type] || "🔔"}</div>
                <div className="teacher-notifications__message">
                  <div className="teacher-notifications__message-head">
                    <p className={`teacher-notifications__message-title ${!notification.read ? "teacher-notifications__message-title--unread" : ""}`}>
                      {notification.title}
                    </p>
                    <span className="teacher-notifications__message-time">
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString("vi-VN") : "—"}
                    </span>
                  </div>
                  <p className="teacher-notifications__message-body">{notification.content}</p>
                </div>
                {!notification.read && <div className="notif-dot" />}
              </article>
            ))
          )}
        </section>
      )}
    </div>
  );
}
