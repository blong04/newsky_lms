import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import "../admin/Admin.css";
import "./Student.css";
import "./Notifications.css";

const TYPE_ICON = {
  course: "📚",
  schedule: "📅",
  assignment: "📋",
  system: "⚙️",
  announcement: "📣",
};

export default function StudentNotifications() {
  // State danh sách thông báo và điều kiện lọc.
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/notifications/my").catch(() => ({ data: { data: [] } }))
      .then((response) => setNotifications(response.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  const filteredNotifications = useMemo(() => notifications.filter((item) => {
    if (filter === "unread") {
      return !item.read;
    }
    if (filter === "assignment") {
      return item.type === "assignment";
    }
    if (filter === "schedule") {
      return item.type === "schedule";
    }
    return true;
  }), [notifications, filter]);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
    } catch {
      // no-op
    }
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    } catch {
      // no-op
    }
  };

  return (
    <div className="admin-page fade-in student-notifications">
      <section className="student-notifications__hero">
        <div>
          <p className="student-notifications__eyebrow">Inbox</p>
          <h1>
            Thông báo
            {unreadCount > 0 && <span className="notif-count-badge">{unreadCount}</span>}
          </h1>
          <p className="student-notifications__subtitle">Thông báo từ giáo viên và admin được gom lại để bạn không bỏ lỡ nội dung quan trọng.</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={markAllRead}>✅ Đánh dấu tất cả đã đọc</button>
        )}
      </section>

      {/* Bộ lọc nhanh theo trạng thái và loại thông báo. */}
      <div className="teacher-tabs student-notifications__tabs">
        {[
          { key: "all", label: `Tất cả (${notifications.length})` },
          { key: "unread", label: `Chưa đọc (${unreadCount})` },
          { key: "assignment", label: "📋 Bài tập" },
          { key: "schedule", label: "📅 Lịch học" },
        ].map((item) => (
          <button key={item.key} className={`ttab ${filter === item.key ? "active" : ""}`} onClick={() => setFilter(item.key)}>
            {item.label}
          </button>
        ))}
      </div>

      <section className="section-card">
        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state"><p>Không có thông báo nào</p></div>
        ) : (
          filteredNotifications.map((notification) => (
            <article
              key={notification.id}
              className={`notif-item ${!notification.read ? "unread" : ""} ${!notification.read ? "student-notifications__item--clickable" : ""}`}
              onClick={() => !notification.read && markRead(notification.id)}
            >
              <div className="notif-icon">{TYPE_ICON[notification.type] || "🔔"}</div>
              <div className="student-notifications__content">
                <div className="student-notifications__head">
                  <p className={`student-notifications__title ${!notification.read ? "student-notifications__title--unread" : ""}`}>
                    {notification.title}
                  </p>
                  <span className="student-notifications__time">
                    {notification.createdAt
                      ? new Date(notification.createdAt).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </span>
                </div>
                <p className="student-notifications__body">{notification.content}</p>
              </div>
              {!notification.read && <div className="notif-dot" />}
            </article>
          ))
        )}
      </section>
    </div>
  );
}
