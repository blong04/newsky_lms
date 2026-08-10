const PptxGenJS = require("../.tmp-pptx/node_modules/pptxgenjs");

const pptx = new PptxGenJS();

// Cau hinh co ban cho file slide bao ve.
pptx.layout = "LAYOUT_WIDE";
pptx.author = "OpenAI Codex";
pptx.company = "NewSky English";
pptx.subject = "Slide bao ve luan van NewSky English";
pptx.title = "SlideBaoVe";
pptx.lang = "vi-VN";

const COLORS = {
  primary: "F97373",
  primaryDark: "BE3D3D",
  accent: "FFF1F2",
  ink: "1F2937",
  subtext: "6B7280",
  line: "F4B4B4",
  white: "FFFFFF",
  green: "166534",
  pale: "FFF7F7",
};

function addBackground(slide) {
  slide.background = { color: COLORS.white };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.45,
    fill: { color: COLORS.primary },
    line: { color: COLORS.primary },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 7.05,
    w: 13.333,
    h: 0.45,
    fill: { color: COLORS.accent },
    line: { color: COLORS.accent },
  });
}

function addTitle(slide, title, subtitle) {
  addBackground(slide);
  slide.addText(title, {
    x: 0.55,
    y: 0.7,
    w: 12.2,
    h: 0.55,
    fontFace: "Aptos Display",
    fontSize: 24,
    bold: true,
    color: COLORS.primaryDark,
    margin: 0,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.55,
      y: 1.18,
      w: 12.2,
      h: 0.35,
      fontFace: "Aptos",
      fontSize: 10.5,
      color: COLORS.subtext,
      margin: 0,
    });
  }
}

function addFooter(slide, text = "NewSky English | Slide báo vệ luận văn") {
  slide.addText(text, {
    x: 0.6,
    y: 7.15,
    w: 6.5,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 8,
    color: COLORS.primaryDark,
    margin: 0,
  });
}

function addBulletPanel(slide, x, y, w, h, heading, items) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.06,
    fill: { color: COLORS.pale },
    line: { color: COLORS.line, pt: 1.25 },
  });
  slide.addText(heading, {
    x: x + 0.18,
    y: y + 0.14,
    w: w - 0.36,
    h: 0.28,
    fontFace: "Aptos",
    fontSize: 13,
    bold: true,
    color: COLORS.primaryDark,
    margin: 0,
  });
  slide.addText(items.map((item) => `• ${item}`).join("\n"), {
    x: x + 0.2,
    y: y + 0.48,
    w: w - 0.4,
    h: h - 0.58,
    fontFace: "Aptos",
    fontSize: 11,
    color: COLORS.ink,
    breakLine: false,
    valign: "top",
    margin: 0.03,
    paraSpaceAfterPt: 7,
  });
}

function addCard(slide, x, y, w, h, title, body) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.05,
    fill: { color: COLORS.white },
    line: { color: COLORS.line, pt: 1.1 },
    shadow: { type: "outer", color: "E7A3A3", blur: 1, angle: 45, distance: 1, opacity: 0.12 },
  });
  slide.addText(title, {
    x: x + 0.15,
    y: y + 0.12,
    w: w - 0.3,
    h: 0.24,
    fontFace: "Aptos",
    fontSize: 12,
    bold: true,
    color: COLORS.primaryDark,
    margin: 0,
  });
  slide.addText(body, {
    x: x + 0.15,
    y: y + 0.42,
    w: w - 0.3,
    h: h - 0.52,
    fontFace: "Aptos",
    fontSize: 10,
    color: COLORS.ink,
    margin: 0,
    valign: "top",
  });
}

function addMiniModule(slide, x, y, w, h, text) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.04,
    fill: { color: COLORS.accent },
    line: { color: COLORS.line, pt: 1 },
  });
  slide.addText(text, {
    x: x + 0.06,
    y: y + 0.08,
    w: w - 0.12,
    h: h - 0.16,
    align: "center",
    valign: "mid",
    fontFace: "Aptos",
    fontSize: 10,
    bold: true,
    color: COLORS.ink,
    margin: 0,
  });
}

function addActor(slide, x, y, label) {
  slide.addShape(pptx.ShapeType.ellipse, {
    x: x + 0.22,
    y,
    w: 0.48,
    h: 0.48,
    line: { color: COLORS.primaryDark, pt: 1.5 },
    fill: { color: COLORS.white, transparency: 100 },
  });
  slide.addShape(pptx.ShapeType.line, {
    x: x + 0.46,
    y: y + 0.48,
    w: 0,
    h: 0.42,
    line: { color: COLORS.primaryDark, pt: 1.4 },
  });
  slide.addShape(pptx.ShapeType.line, {
    x: x + 0.12,
    y: y + 0.64,
    w: 0.68,
    h: 0,
    line: { color: COLORS.primaryDark, pt: 1.4 },
  });
  slide.addShape(pptx.ShapeType.line, {
    x: x + 0.46,
    y: y + 0.9,
    w: -0.24,
    h: 0.4,
    line: { color: COLORS.primaryDark, pt: 1.4 },
  });
  slide.addShape(pptx.ShapeType.line, {
    x: x + 0.46,
    y: y + 0.9,
    w: 0.24,
    h: 0.4,
    line: { color: COLORS.primaryDark, pt: 1.4 },
  });
  slide.addText(label, {
    x,
    y: y + 1.38,
    w: 0.95,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 10.5,
    bold: true,
    align: "center",
    color: COLORS.ink,
    margin: 0,
  });
}

function addUseCase(slide, x, y, w, h, label) {
  slide.addShape(pptx.ShapeType.ellipse, {
    x,
    y,
    w,
    h,
    fill: { color: COLORS.accent },
    line: { color: COLORS.primaryDark, pt: 1.1 },
  });
  slide.addText(label, {
    x: x + 0.08,
    y: y + 0.08,
    w: w - 0.16,
    h: h - 0.16,
    fontFace: "Aptos",
    fontSize: 10,
    align: "center",
    valign: "mid",
    color: COLORS.ink,
    margin: 0,
  });
}

function addLine(slide, x, y, w, h = 0) {
  slide.addShape(pptx.ShapeType.line, {
    x,
    y,
    w,
    h,
    line: { color: COLORS.primaryDark, pt: 1 },
  });
}

// Slide 1
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 1.1,
    fill: { color: COLORS.primary },
    line: { color: COLORS.primary },
  });
  slide.addText("BÁO CÁO LUẬN VĂN TỐT NGHIỆP", {
    x: 0.7,
    y: 0.24,
    w: 12,
    h: 0.35,
    fontFace: "Aptos Display",
    fontSize: 24,
    bold: true,
    color: COLORS.white,
    align: "center",
    margin: 0,
  });
  slide.addText("XÂY DỰNG WEBSITE HỖ TRỢ TRUNG TÂM TIẾNG ANH NEWSKY ENGLISH", {
    x: 0.9,
    y: 1.6,
    w: 11.5,
    h: 1,
    fontFace: "Aptos Display",
    fontSize: 24,
    bold: true,
    color: COLORS.primaryDark,
    align: "center",
    valign: "mid",
    margin: 0,
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.3,
    y: 3.0,
    w: 10.7,
    h: 2.2,
    fill: { color: COLORS.pale },
    line: { color: COLORS.line, pt: 1.2 },
  });
  slide.addText(
    "Sinh viên thực hiện: [Điền họ tên - MSSV]\nKhoa: Công nghệ Thông tin - Đại học Công nghệ Sài Gòn (STU)\nGiảng viên hướng dẫn: ThS. Phạm Ngọc Hoài\nThời gian bảo vệ: Tháng 08/2026",
    {
      x: 1.7,
      y: 3.45,
      w: 9.9,
      h: 1.35,
      fontFace: "Aptos",
      fontSize: 15,
      color: COLORS.ink,
      align: "center",
      valign: "mid",
      margin: 0,
      breakLine: false,
      paraSpaceAfterPt: 12,
    }
  );
  slide.addText("Website quản lý đào tạo, học tập và đánh giá cho trung tâm tiếng Anh", {
    x: 1.2,
    y: 5.6,
    w: 10.9,
    h: 0.32,
    fontFace: "Aptos",
    fontSize: 12,
    italic: true,
    color: COLORS.subtext,
    align: "center",
    margin: 0,
  });
  addFooter(slide, "NewSky English | Slide 1");
}

// Slide 2
{
  const slide = pptx.addSlide();
  addTitle(slide, "Mục đích của đề tài", "Slide 2");
  addBulletPanel(slide, 0.7, 1.8, 6, 4.8, "Mục tiêu chính", [
    "Xây dựng hệ thống hỗ trợ quản lý hoạt động đào tạo cho trung tâm tiếng Anh.",
    "Số hóa các nghiệp vụ quan trọng: người dùng, khóa học, lớp học, ghi danh, thanh toán và đánh giá.",
    "Hỗ trợ học viên học tập trực tuyến, làm bài tập, bài kiểm tra và bài thi thử.",
    "Giúp giáo viên và quản trị viên theo dõi tiến độ, kết quả và thông tin học viên thuận tiện hơn.",
  ]);
  addBulletPanel(slide, 6.95, 1.8, 5.65, 4.8, "Giá trị đạt được", [
    "Tập trung dữ liệu và giảm thao tác thủ công trong quản lý.",
    "Chuẩn hóa quy trình từ đăng ký học đến theo dõi kết quả.",
    "Tạo nền tảng mở rộng cho thanh toán thật, báo cáo và mobile app về sau.",
    "Phù hợp làm sản phẩm học tập thực tế cho đồ án tốt nghiệp.",
  ]);
  addFooter(slide, "NewSky English | Slide 2");
}

// Slide 3
{
  const slide = pptx.addSlide();
  addTitle(slide, "Phạm vi của đề tài", "Slide 3");
  addBulletPanel(slide, 0.7, 1.75, 4.05, 4.9, "Phạm vi chức năng", [
    "Quản lý người dùng theo vai trò Admin, Teacher, Student.",
    "Quản lý khóa học, lớp học, ghi danh và thanh toán mô phỏng.",
    "Quản lý bài tập, bài kiểm tra, bài thi thử và kết quả học tập.",
    "Gửi và nhận thông báo trong hệ thống.",
  ]);
  addBulletPanel(slide, 4.95, 1.75, 4.05, 4.9, "Phạm vi kỹ thuật", [
    "Cơ sở dữ liệu MySQL cho lưu trữ tập trung.",
    "Backend Java Spring Boot cung cấp REST API.",
    "Frontend ReactJS xây dựng giao diện cho từng nhóm người dùng.",
    "Xác thực bằng JWT và phân quyền theo vai trò.",
  ]);
  addBulletPanel(slide, 9.2, 1.75, 3.4, 4.9, "Giới hạn hiện tại", [
    "Chưa tích hợp thanh toán trực tuyến thật.",
    "Chưa có mobile app riêng.",
    "Kiểm thử tải và kiểm thử bảo mật mới ở mức cơ bản.",
  ]);
  addFooter(slide, "NewSky English | Slide 3");
}

// Slide 4
{
  const slide = pptx.addSlide();
  addTitle(slide, "Vấn đề nghiệp vụ", "Slide 4");
  addCard(slide, 0.75, 1.8, 3.9, 1.45, "1. Người dùng", "Đăng ký, đăng nhập, phân quyền và cập nhật thông tin cá nhân.");
  addCard(slide, 4.75, 1.8, 3.9, 1.45, "2. Đào tạo", "Quản lý khóa học, lớp học, phân công giáo viên và danh sách học viên.");
  addCard(slide, 8.75, 1.8, 3.8, 1.45, "3. Ghi danh", "Học viên chọn lớp phù hợp, gửi yêu cầu ghi danh và xử lý thanh toán.");
  addCard(slide, 0.75, 3.55, 3.9, 1.45, "4. Đánh giá", "Bài tập, bài kiểm tra và bài thi thử giúp theo dõi năng lực học viên.");
  addCard(slide, 4.75, 3.55, 3.9, 1.45, "5. Chấm điểm", "Giáo viên xem bài nộp, nhập điểm và nhận xét cho học viên.");
  addCard(slide, 8.75, 3.55, 3.8, 1.45, "6. Thông báo", "Admin/Teacher gửi thông báo, người dùng xem và cập nhật trạng thái đã đọc.");
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.5,
    y: 5.45,
    w: 10.3,
    h: 0.8,
    fill: { color: COLORS.accent },
    line: { color: COLORS.line, pt: 1 },
  });
  slide.addText("Bài toán chính của đề tài là liên kết được toàn bộ quy trình quản lý - học tập - đánh giá trong một hệ thống thống nhất, dễ dùng và dễ mở rộng.", {
    x: 1.8,
    y: 5.68,
    w: 9.7,
    h: 0.3,
    fontFace: "Aptos",
    fontSize: 12,
    bold: true,
    align: "center",
    color: COLORS.primaryDark,
    margin: 0,
  });
  addFooter(slide, "NewSky English | Slide 4");
}

// Slide 5
{
  const slide = pptx.addSlide();
  addTitle(slide, "Sơ đồ chức năng", "Slide 5");
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.0,
    y: 1.25,
    w: 3.2,
    h: 0.62,
    fill: { color: COLORS.primary },
    line: { color: COLORS.primaryDark, pt: 1.2 },
  });
  slide.addText("NewSky English", {
    x: 5.0,
    y: 1.42,
    w: 3.2,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 14,
    bold: true,
    color: COLORS.white,
    align: "center",
    margin: 0,
  });
  const modules = [
    ["Quản lý\nngười dùng", 0.75],
    ["Quản lý\nkhóa học", 2.55],
    ["Quản lý\nlớp học", 4.35],
    ["Quản lý\nbài tập", 6.15],
    ["Quản lý\nbài kiểm tra", 7.95],
    ["Quản lý\nbài thi thử", 9.75],
    ["Quản lý\nthông báo", 11.55],
  ];
  modules.forEach(([label, x]) => {
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 2.55,
      w: 1.25,
      h: 0.9,
      fill: { color: COLORS.pale },
      line: { color: COLORS.line, pt: 1 },
    });
    slide.addText(label, {
      x: x + 0.05,
      y: 2.79,
      w: 1.15,
      h: 0.34,
      fontFace: "Aptos",
      fontSize: 9,
      align: "center",
      bold: true,
      color: COLORS.ink,
      margin: 0,
    });
    addLine(slide, 6.6, 1.87, x + 0.625 - 6.6, 0.68);
  });
  addMiniModule(slide, 0.7, 4.0, 2.15, 0.55, "Đăng ký / Đăng nhập");
  addMiniModule(slide, 0.7, 4.7, 2.15, 0.55, "Xem & sửa thông tin");
  addMiniModule(slide, 2.55, 4.0, 2.15, 0.55, "Tìm kiếm khóa học");
  addMiniModule(slide, 2.55, 4.7, 2.15, 0.55, "Xem chi tiết");
  addMiniModule(slide, 4.4, 4.0, 2.15, 0.55, "Phân công giáo viên");
  addMiniModule(slide, 4.4, 4.7, 2.15, 0.55, "Xem lịch học");
  addMiniModule(slide, 6.25, 4.0, 2.15, 0.55, "Làm bài tập");
  addMiniModule(slide, 6.25, 4.7, 2.15, 0.55, "Xem kết quả");
  addMiniModule(slide, 8.1, 4.0, 2.15, 0.55, "Làm bài kiểm tra");
  addMiniModule(slide, 8.1, 4.7, 2.15, 0.55, "Chấm điểm");
  addMiniModule(slide, 9.95, 4.0, 2.15, 0.55, "Làm bài thi thử");
  addMiniModule(slide, 9.95, 4.7, 2.15, 0.55, "Xem kết quả");
  addMiniModule(slide, 11.18, 4.0, 1.95, 0.55, "Gửi thông báo");
  addMiniModule(slide, 11.18, 4.7, 1.95, 0.55, "Nhận thông báo");
  slide.addText("Sơ đồ chức năng thể hiện các nhóm nghiệp vụ chính của hệ thống, làm cơ sở cho thiết kế use case và phân rã chức năng ở các chương sau.", {
    x: 0.9,
    y: 6.0,
    w: 11.9,
    h: 0.35,
    fontFace: "Aptos",
    fontSize: 10.5,
    color: COLORS.subtext,
    italic: true,
    margin: 0,
  });
  addFooter(slide, "NewSky English | Slide 5");
}

// Slide 6
{
  const slide = pptx.addSlide();
  addTitle(slide, "Sơ đồ Use-Case tổng quát", "Slide 6");
  addActor(slide, 0.55, 2.2, "Admin");
  addActor(slide, 11.75, 1.55, "Student");
  addActor(slide, 11.75, 4.2, "Teacher");
  addUseCase(slide, 4.65, 1.55, 3.75, 0.6, "Quản lý người dùng");
  addUseCase(slide, 4.65, 2.35, 3.75, 0.6, "Quản lý khóa học");
  addUseCase(slide, 4.65, 3.15, 3.75, 0.6, "Quản lý lớp học");
  addUseCase(slide, 4.65, 3.95, 3.75, 0.6, "Quản lý bài tập / bài kiểm tra");
  addUseCase(slide, 4.65, 4.75, 3.75, 0.6, "Quản lý bài thi thử / thông báo");
  addLine(slide, 1.52, 2.55, 3.25, -0.55);
  addLine(slide, 1.52, 2.7, 3.25, -0.05);
  addLine(slide, 1.52, 2.9, 3.25, 0.45);
  addLine(slide, 1.52, 3.1, 3.25, 0.95);
  addLine(slide, 1.52, 3.3, 3.25, 1.45);
  addLine(slide, 8.42, 1.85, 3.2, -0.05);
  addLine(slide, 8.42, 2.65, 3.2, -0.55);
  addLine(slide, 8.42, 3.45, 3.2, 1.0);
  addLine(slide, 8.42, 4.25, 3.2, 0.25);
  addLine(slide, 8.42, 5.05, 3.2, -0.35);
  slide.addText("Admin quản lý dữ liệu hệ thống. Student tập trung vào học tập, ghi danh và xem kết quả. Teacher phụ trách lớp học, chấm điểm và hỗ trợ học viên.", {
    x: 1.05,
    y: 6.0,
    w: 11.2,
    h: 0.35,
    fontFace: "Aptos",
    fontSize: 10.5,
    color: COLORS.subtext,
    italic: true,
    margin: 0,
    align: "center",
  });
  addFooter(slide, "NewSky English | Slide 6");
}

// Slide 7
{
  const slide = pptx.addSlide();
  addTitle(slide, "Sơ đồ ER / Lược đồ quan hệ chính", "Slide 7");
  addBulletPanel(slide, 0.7, 1.8, 3.0, 4.6, "Nhóm người dùng", [
    "roles",
    "users",
    "notifications",
    "notification_receivers",
  ]);
  addBulletPanel(slide, 3.95, 1.8, 3.0, 4.6, "Nhóm đào tạo", [
    "courses",
    "classes",
    "schedules",
    "enrollments",
    "payments",
  ]);
  addBulletPanel(slide, 7.2, 1.8, 2.8, 4.6, "Nhóm bài tập", [
    "assignments",
    "question_groups",
    "questions",
    "assignment_submissions",
  ]);
  addBulletPanel(slide, 10.2, 1.8, 2.4, 4.6, "Nhóm đánh giá", [
    "quizzes",
    "mock_tests",
    "quiz_classes",
    "test_classes",
    "quiz_submissions",
    "mock_test_submissions",
  ]);
  slide.addText("Quan hệ nổi bật: roles 1-n users, courses 1-n classes, users n-n classes qua enrollments, assessments n-n classes qua bảng trung gian, questions thuộc question_groups.", {
    x: 0.85,
    y: 6.05,
    w: 11.85,
    h: 0.45,
    fontFace: "Aptos",
    fontSize: 10.5,
    color: COLORS.ink,
    margin: 0,
  });
  addFooter(slide, "NewSky English | Slide 7");
}

// Slide 8
{
  const slide = pptx.addSlide();
  addTitle(slide, "Công nghệ và kỹ thuật sử dụng", "Slide 8");
  addBulletPanel(slide, 0.7, 1.8, 3.95, 4.8, "Backend", [
    "Java 17, Spring Boot 3",
    "Spring Web, Spring Data JPA",
    "Spring Security, JWT",
    "Thiết kế theo controller - service - repository - dto",
  ]);
  addBulletPanel(slide, 4.8, 1.8, 3.95, 4.8, "Frontend", [
    "React 18, React Router DOM",
    "Axios cho giao tiếp API",
    "Tách page, service, hook, utils",
    "CSS theo từng màn hình, giao diện đồng bộ tone đỏ cam",
  ]);
  addBulletPanel(slide, 8.9, 1.8, 3.75, 4.8, "Database & kỹ thuật", [
    "MySQL 8.x",
    "Thiết kế dữ liệu theo nhóm nghiệp vụ",
    "Phân quyền theo vai trò",
    "Mô hình client-server, RESTful API",
  ]);
  addFooter(slide, "NewSky English | Slide 8");
}

// Slide 9
{
  const slide = pptx.addSlide();
  addTitle(slide, "Các hạn chế còn tồn tại", "Slide 9");
  addBulletPanel(slide, 0.8, 1.9, 5.95, 4.7, "Hạn chế hiện tại", [
    "Thanh toán trực tuyến mới ở mức mô phỏng, chưa tích hợp cổng thật như VNPay hoặc MoMo.",
    "Chưa có bộ kiểm thử tự động đầy đủ cho backend và frontend.",
    "Chưa xây dựng các báo cáo phân tích chuyên sâu về doanh thu và tiến độ học viên.",
    "Khả năng tối ưu tải lớn và bảo mật production cần tiếp tục hoàn thiện.",
  ]);
  addBulletPanel(slide, 6.95, 1.9, 5.55, 4.7, "Hướng hoàn thiện", [
    "Tích hợp thanh toán thật và xác thực giao dịch.",
    "Mở rộng thông báo qua email/SMS.",
    "Bổ sung báo cáo thống kê, mobile app hoặc PWA.",
    "Nâng cao kiểm thử, logging và giám sát hệ thống.",
  ]);
  addFooter(slide, "NewSky English | Slide 9");
}

// Slide 10
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 7.5,
    fill: { color: COLORS.pale },
    line: { color: COLORS.pale },
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.05,
    y: 1.25,
    w: 11.2,
    h: 4.7,
    fill: { color: COLORS.white },
    line: { color: COLORS.line, pt: 1.2 },
  });
  slide.addText("XIN CHÂN THÀNH CẢM ƠN", {
    x: 1.7,
    y: 2.2,
    w: 9.9,
    h: 0.7,
    fontFace: "Aptos Display",
    fontSize: 28,
    bold: true,
    color: COLORS.primaryDark,
    align: "center",
    margin: 0,
  });
  slide.addText("Kính cảm ơn Hội đồng đã lắng nghe và theo dõi phần trình bày.\nRất mong nhận được ý kiến đóng góp để đề tài được hoàn thiện hơn.", {
    x: 2.0,
    y: 3.15,
    w: 9.2,
    h: 1.0,
    fontFace: "Aptos",
    fontSize: 16,
    color: COLORS.ink,
    align: "center",
    valign: "mid",
    margin: 0,
  });
  slide.addText("NewSky English", {
    x: 4.55,
    y: 5.15,
    w: 4.2,
    h: 0.35,
    fontFace: "Aptos",
    fontSize: 14,
    bold: true,
    color: COLORS.primaryDark,
    align: "center",
    margin: 0,
  });
}

pptx.writeFile({ fileName: "C:/wamp64/www/test/SlideBaoVe.pptx" });
