import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "./Admin.css";
import "./Notifications.css";

const INITIAL_FORM = {
  title: "",
  content: "",
  targetRole: "",
  targetUserId: "",
  type: "announcement",
};

const TYPE_OPTIONS = [
  { value: "announcement", label: "📣 Thông báo chung" },
  { value: "system", label: "⚙️ Hệ thống" },
  { value: "course", label: "📚 Khóa học" },
  { value: "schedule", label: "📅 Lịch học" },
];

export default function AdminNotifications() {
  // State dữ liệu người dùng để chọn đối tượng nhận.
  const [users, setUsers] = useState([]);

  // State cho form tạo thông báo.
  const [form, setForm] = useState(INITIAL_FORM);
  const [sending, setSending] = useState(false);

  // State lịch sử hiện đang để placeholder cho phần mở rộng sau.
  const [history] = useState([]);

  useEffect(() => {
    api.get("/users")
      .then((response) => setUsers(response.data.data || []))
      .catch(() => setUsers([]));
  }, []);

  // Danh sách người dùng hợp lệ theo role đã chọn.
  const targetUsers = useMemo(() => (
    users.filter((user) => !form.targetRole || user.roleId === Number(form.targetRole))
  ), [users, form.targetRole]);

  const recipientLabel = useMemo(() => {
    if (form.targetUserId) {
      return users.find((user) => user.id === Number(form.targetUserId))?.name || "Người dùng đã chọn";
    }

    if (form.targetRole === "2") {
      return "Tất cả giáo viên";
    }

    if (form.targetRole === "3") {
      return "Tất cả học viên";
    }

    return "Tất cả mọi người";
  }, [form.targetRole, form.targetUserId, users]);

  const handleSend = async () => {
    if (!form.title || !form.content) {
      toast.error("Nhập đầy đủ tiêu đề và nội dung");
      return;
    }

    setSending(true);

    try {
      await api.post("/admin/notifications/send", {
        title: form.title,
        content: form.content,
        type: form.type,
        targetRole: form.targetRole ? Number(form.targetRole) : null,
        targetUserId: form.targetUserId ? Number(form.targetUserId) : null,
      });

      toast.success("Gửi thông báo thành công");
      setForm(INITIAL_FORM);
    } catch {
      toast.error("Gửi thông báo thất bại");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="admin-page fade-in admin-notifications">
      <section className="admin-notifications__hero">
        <div>
          <p className="admin-notifications__eyebrow">Broadcast center</p>
          <h1>Gửi thông báo</h1>
          <p className="admin-notifications__subtitle">
            Soạn và phát thông điệp theo nhóm người dùng hoặc tới từng cá nhân mà không cần rời khỏi màn quản trị.
          </p>
        </div>
        <div className="admin-notifications__tips">
          <article className="admin-notifications__tip-card">
            <strong>Thông báo hệ thống</strong>
            <span>Dùng cho thay đổi quan trọng như bảo trì hoặc cập nhật nền tảng.</span>
          </article>
          <article className="admin-notifications__tip-card admin-notifications__tip-card--alt">
            <strong>Thông báo theo nhóm</strong>
            <span>Chọn đúng vai trò nhận để tránh gửi nhầm nội dung hành chính.</span>
          </article>
        </div>
      </section>

      <section className="admin-notifications__layout">
        {/* Cột form nhập nội dung và đối tượng nhận. */}
        <div className="section-card admin-notifications__composer">
          <div className="admin-notifications__section-head">
            <div>
              <p className="admin-notifications__section-kicker">Compose</p>
              <h3 className="section-title">Soạn thông báo</h3>
            </div>
            <span className="badge badge-blue">{TYPE_OPTIONS.find((item) => item.value === form.type)?.label}</span>
          </div>

          <div className="admin-notifications__form-grid">
            <div className="form-group">
              <label>Loại thông báo</label>
              <select
                value={form.type}
                onChange={(event) => setForm({ ...form, type: event.target.value })}
                className="filter-select admin-notifications__field"
              >
                {TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Gửi đến vai trò</label>
              <select
                value={form.targetRole}
                onChange={(event) => setForm({ ...form, targetRole: event.target.value, targetUserId: "" })}
                className="filter-select admin-notifications__field"
              >
                <option value="">🌐 Tất cả mọi người</option>
                <option value="2">👨‍🏫 Tất cả giáo viên</option>
                <option value="3">👨‍🎓 Tất cả học viên</option>
              </select>
            </div>

            <div className="form-group">
              <label>Hoặc chọn người nhận cụ thể</label>
              <select
                value={form.targetUserId}
                onChange={(event) => setForm({ ...form, targetUserId: event.target.value })}
                className="filter-select admin-notifications__field"
              >
                <option value="">— Chọn người nhận —</option>
                {targetUsers.map((user) => (
                  <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tiêu đề</label>
              <input
                className="search-input admin-notifications__field"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="VD: Thông báo thay đổi lịch học cuối tuần"
              />
            </div>

            <div className="form-group admin-notifications__full">
              <label>Nội dung</label>
              <textarea
                rows={6}
                className="admin-notifications__textarea"
                value={form.content}
                onChange={(event) => setForm({ ...form, content: event.target.value })}
                placeholder="Nhập nội dung thông báo..."
              />
            </div>
          </div>

          <div className="admin-notifications__recipient">
            <span>Người nhận hiện tại</span>
            <strong>{recipientLabel}</strong>
          </div>

          <div className="admin-notifications__submit">
            <button className="btn btn-primary" onClick={handleSend} disabled={sending}>
              {sending ? <span className="spinner" /> : "📤 Gửi thông báo"}
            </button>
          </div>
        </div>

        {/* Cột phải là phần gợi ý và vùng lịch sử để mở rộng sau. */}
        <div className="admin-notifications__side">
          <div className="section-card admin-notifications__guide">
            <p className="admin-notifications__section-kicker">Guidelines</p>
            <h3 className="section-title">Mẹo gửi hiệu quả</h3>
            <div className="admin-notifications__guide-list">
              <article className="admin-notifications__guide-item">
                <strong>Viết tiêu đề rõ hành động</strong>
                <p>Dùng động từ như “Cập nhật”, “Thông báo”, “Lưu ý” để người nhận hiểu mục đích ngay.</p>
              </article>
              <article className="admin-notifications__guide-item">
                <strong>Ưu tiên nhóm nhận chính xác</strong>
                <p>Gửi theo vai trò trước, chỉ dùng gửi cá nhân khi nội dung thật sự cần riêng tư.</p>
              </article>
              <article className="admin-notifications__guide-item">
                <strong>Kiểm tra trước khi gửi</strong>
                <p>Form hiện sẽ reset sau khi gửi thành công nên bạn có thể dùng như một chu kỳ gửi nhanh.</p>
              </article>
            </div>
          </div>

          <div className="section-card">
            <div className="admin-notifications__section-head">
              <div>
                <p className="admin-notifications__section-kicker">Recent</p>
                <h3 className="section-title">Lịch sử gần đây</h3>
              </div>
            </div>
            {history.length === 0 ? (
              <div className="empty-state"><p>Chưa có lịch sử thông báo</p></div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
