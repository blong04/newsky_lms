import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  BookOpen,
  CalendarDays,
  CircleCheckBig,
  GraduationCap,
  Headphones,
  Mail,
  MapPinned,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import "./HomePage.css";

// Danh sách điểm mạnh nổi bật để giới thiệu nhanh về trung tâm.
const highlights = [
  { icon: GraduationCap, title: "Lộ trình rõ ràng", description: "Học từ nền tảng đến IELTS, TOEIC theo từng cấp độ cụ thể." },
  { icon: Users, title: "Giảng viên đồng hành", description: "Giáo viên theo sát tiến độ, phản hồi bài tập và hỗ trợ học viên thường xuyên." },
  { icon: CalendarDays, title: "Lịch học linh hoạt", description: "Kết hợp lịch học, bài tập, quiz và thông báo trong cùng một nền tảng." },
];

// Các chương trình tiêu biểu để người dùng mới hiểu trung tâm đang đào tạo gì.
const programs = [
  { label: "Foundation English", detail: "Củng cố ngữ pháp, từ vựng và phản xạ giao tiếp cơ bản." },
  { label: "IELTS Preparation", detail: "Ôn tập theo kỹ năng Listening, Reading, Writing, Speaking với mục tiêu đầu ra rõ ràng." },
  { label: "TOEIC Intensive", detail: "Tối ưu chiến lược làm bài và cải thiện tốc độ xử lý đề thi thực chiến." },
];

// Các chỉ số truyền thông giúp landing page trông đáng tin và giàu ngữ cảnh hơn.
const stats = [
  { value: "500+", label: "Học viên đang theo học" },
  { value: "50+", label: "Giáo viên và trợ giảng" },
  { value: "1000+", label: "Bài quiz và bài tập" },
  { value: "24/7", label: "Theo dõi lịch học, thông báo" },
];

// Thông tin footer được tách riêng để sau này thay bằng dữ liệu thật của trung tâm.
const centerInfo = {
  name: "Trung tâm Anh ngữ NewSky English",
  address: "190 Cao Lỗ, Phường 4, Quận 8, TP.HCM",
  phone: "0912345678",
  email: "newsky@gmail.com",
  mapEmbedUrl: "https://www.google.com/maps?q=Vietnam&z=5&output=embed",
};

export default function HomePage({ dashboardRoute, user }) {
  // Đổi CTA chính theo trạng thái đăng nhập để tránh buộc người dùng đăng nhập lại.
  const primaryCta = user
    ? { to: dashboardRoute, label: "Vào bảng điều khiển" }
    : { to: "/login", label: "Đăng nhập hệ thống" };

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-header-shell">
          <Link to="/" className="home-brand">
            <div>
              <strong>NewSky English</strong>
              <span>English Center Management Platform</span>
            </div>
          </Link>

          {/* Cụm nút CTA cho khách mới hoặc người dùng đã có tài khoản. */}
          <div className="home-header-actions">
            <Link to="/login" className="home-link-button">Đăng nhập</Link>
            <Link to="/register" className="home-primary-button">Đăng ký</Link>
          </div>
        </div>
      </header>

      <main className="home-main">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>Hệ sinh thái học tập và quản lý trung tâm tiếng Anh hiện đại</span>
            </div>

            <h1>NewSky English giúp việc học tiếng Anh trở nên rõ ràng, có lộ trình và dễ theo dõi hơn.</h1>
            <p>
              Từ tuyển sinh, xếp lớp, giao bài tập, làm quiz đến theo dõi kết quả,
              mọi trải nghiệm của học viên, giáo viên và admin đều được kết nối trên một nền tảng thống nhất.
            </p>

            <div className="hero-stats-grid">
              {stats.map((stat) => (
                <article key={stat.label} className="hero-stat-card">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              ))}
            </div>
          </div>

          {/* Khối mô tả trải nghiệm học tập để tạo điểm nhấn thị giác ngay phần đầu trang. */}
          <aside className="hero-panel">
            <div className="hero-panel-card hero-panel-main">
              <span className="panel-kicker">Lộ trình học tập</span>
              <h2>Học viên luôn biết lớp nào đang học, bài nào cần làm và mục tiêu nào cần chinh phục.</h2>
              <div className="panel-feature-list">
                <div><CircleCheckBig size={18} /> Lịch học theo lớp</div>
                <div><CircleCheckBig size={18} /> Bài tập và phản hồi từ giáo viên</div>
                <div><CircleCheckBig size={18} /> Quiz và kết quả được lưu tập trung</div>
              </div>
            </div>

            <div className="hero-panel-grid">
              <div className="hero-panel-card">
                <BookOpen size={20} />
                <strong>Nội dung học</strong>
                <span>Bài học, quiz và assignment được tổ chức mạch lạc theo từng lớp.</span>
              </div>
              <div className="hero-panel-card">
                <Headphones size={20} />
                <strong>Luyện kỹ năng</strong>
                <span>Hỗ trợ reading, listening, writing và chấm điểm theo luồng học tập.</span>
              </div>
            </div>
          </aside>
        </section>

        <section className="highlights-section">
          <div className="section-heading">
            <span>Vì sao chọn NewSky English</span>
            <h2>Không chỉ là cổng đăng nhập, đây là một không gian vận hành trung tâm được thiết kế logic hơn.</h2>
          </div>

          <div className="highlights-grid">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="highlight-card">
                  <div className="highlight-icon"><Icon size={22} /></div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="programs-section">
          <div className="section-heading">
            <span>Chương trình đào tạo</span>
            <h2>Các lộ trình học nổi bật mà trung tâm có thể triển khai và quản lý ngay trên hệ thống.</h2>
          </div>

          <div className="programs-list">
            {programs.map((program, index) => (
              <article key={program.label} className="program-card">
                <div className="program-order">0{index + 1}</div>
                <div>
                  <h3>{program.label}</h3>
                  <p>{program.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="trust-section">
          <div className="trust-copy">
            <span>Quản lý tập trung</span>
            <h2>Mỗi vai trò có một trải nghiệm phù hợp hơn với công việc của mình.</h2>
            <p>
              Admin theo dõi lớp học và tuyển sinh, giáo viên quản lý assignment và thông báo,
              học viên xem lịch học, làm quiz và nhận kết quả ngay trên hệ thống.
            </p>
          </div>

          <div className="trust-points">
            <article>
              <ShieldCheck size={20} />
              <div>
                <strong>Phân quyền rõ ràng</strong>
                <span>Luồng quản trị, giáo viên và học viên được tách riêng để dễ sử dụng.</span>
              </div>
            </article>
            <article>
              <Users size={20} />
              <div>
                <strong>Tương tác liên tục</strong>
                <span>Thông báo, duyệt đăng ký, giao bài tập và cập nhật kết quả đều liền mạch.</span>
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="home-footer-shell">
          <div className="footer-info-column">
            <div className="footer-intro">
              <div className="footer-brand">
                <div>
                  <strong>{centerInfo.name}</strong>
                  <span>Nền tảng hỗ trợ quản lý và học tập tiếng Anh tại NewSky English.</span>
                </div>
              </div>
            </div>

            <div className="footer-contact-list">
              <article className="footer-contact-item">
                <Building2 size={18} />
                <div>
                  <span>{centerInfo.name}</span>
                </div>
              </article>
              <article className="footer-contact-item">
                <MapPinned size={18} />
                <div>
                  <span>{centerInfo.address}</span>
                </div>
              </article>
              <article className="footer-contact-item">
                <Phone size={18} />
                <div>
                  <span>{centerInfo.phone}</span>
                </div>
              </article>
              <article className="footer-contact-item">
                <Mail size={18} />
                <div>
                  <span>{centerInfo.email}</span>
                </div>
              </article>
            </div>
          </div>

          {/* Khối bản đồ để hiển thị vị trí tổng quan của trung tâm ở cuối trang. */}
          <div className="footer-map-column">
            <div className="footer-map-copy">
              <span>Bản đồ</span>
            </div>
            <div className="footer-map-frame">
              <iframe
                title="NewSky English location"
                src={centerInfo.mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 NewSky English. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
