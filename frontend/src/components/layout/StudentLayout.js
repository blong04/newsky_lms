import React, { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ProfileModal from "../shared/ProfileModal";
import toast from "react-hot-toast";
import "./Layout.css";

const navItems = [
  { to: "/student",              label: "Dashboard",        end: true },
  { to: "/student/courses",      label: "Khóa học"          },
  { to: "/student/schedule",     label: "Lớp & Lịch học"    },
  { to: "/student/exercises",    label: "Bài tập & Kiểm tra"},
  { to: "/student/tests",        label: "Bài thi thử"       },
  { to: "/student/results",      label: "Kết quả"           },  
  { to: "/student/notifications",label: "Thông báo"         },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileTab, setProfileTab] = useState("info");
  const [dropdown, setDropdown] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    // Học viên mới phải hoàn thành placement trước khi vào các màn chức năng khác.
    if (!user || user.roleId !== 3) {
      return;
    }

    // Cho phép học viên đi qua toàn bộ luồng placement, gồm cả màn chọn đề và màn làm bài.
    const isPlacementRoute = location.pathname === "/student/placement";
    const isPlacementTestRoute =
      location.pathname.startsWith("/student/test/")
      && new URLSearchParams(location.search).get("mode") === "placement";

    if (!user.placementCompletedAt && !isPlacementRoute && !isPlacementTestRoute) {
      navigate("/student/placement", { replace: true });
    }
  }, [location.pathname, location.search, navigate, user]);

  const handleLogout = () => {
    logout();
    toast.success("Đã đăng xuất");
    navigate("/");
  };

  const openProfile = (tab = "info") => {
    setProfileTab(tab);
    setShowProfile(true);
    setDropdown(false);
  };

  return (
    <div className={`layout ${collapsed ? "collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {!collapsed && <span className="logo-text">NewSky English</span>}
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main-wrapper">
        <header className="top-header">
          <h2 className="page-heading">Học viên</h2>
          <div className="header-right">
            <span className="welcome-text">{user?.name}</span>
            <div className="avatar-dropdown-wrap" ref={dropRef}>
              <div className="header-avatar" onClick={() => setDropdown(d => !d)}>
                {user?.avatarUrl
                  ? <img src={user.avatarUrl} alt="" />
                  : <span>{user?.name?.charAt(0)?.toUpperCase()}</span>}
              </div>
              {dropdown && (
                <div className="avatar-dropdown">
                  <div className="dropdown-user-info">
                    <div className="dropdown-avatar">
                      {user?.avatarUrl
                        ? <img src={user.avatarUrl} alt="" />
                        : user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="dropdown-name">{user?.name}</p>
                      <p className="dropdown-role">Học viên</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item" onClick={() => openProfile("info")}>
                    Thông tin cá nhân
                  </button>
                  <button className="dropdown-item" onClick={() => openProfile("password")}>
                    Đổi mật khẩu
                  </button>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="content-area"><Outlet /></main>
      </div>

      {showProfile && (
        <ProfileModal initialTab={profileTab} onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
}
