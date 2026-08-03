# NewSky English
Website hỗ trợ hoạt động quản lý và học tập cho trung tâm tiếng Anh `NewSky English`, được xây dựng theo mô hình:
- `Database`: MySQL
- `Backend`: Java Spring Boot
- `Frontend`: ReactJS
Dự án phục vụ các nghiệp vụ chính như quản lý người dùng, khóa học, lớp học, ghi danh, thanh toán mô phỏng, bài tập, bài kiểm tra, bài thi thử và thông báo.

## 1. Công nghệ sử dụng
### Backend
- Java 17
- Spring Boot 3
- Spring Web
- Spring Data JPA
- Spring Security
- JWT
- MySQL
### Frontend
- React 18
- React Router DOM
- Axios
- React Hot Toast
- Recharts
- Lucide React

## 2. Chức năng chính
### Admin
- Quản lý người dùng
- Quản lý khóa học
- Quản lý lớp học
- Quản lý ghi danh
- Quản lý bài kiểm tra
- Quản lý bài thi thử
- Gửi thông báo
### Teacher
- Xem lớp học phụ trách
- Xem học viên theo lớp
- Quản lý bài tập
- Xem bài nộp, chấm điểm và nhận xét
- Gửi thông báo cho học viên liên quan
### Student
- Đăng ký tài khoản, đăng nhập
- Xem khóa học, chọn lớp, gửi yêu cầu ghi danh
- Chọn thanh toán hoặc bỏ qua thanh toán để chờ duyệt
- Làm bài tập, bài kiểm tra, bài thi thử
- Xem kết quả và xem lại bài làm
- Nhận thông báo

## 3. Cấu trúc thư mục
test/
|- backend/     # Spring Boot API
|- frontend/    # ReactJS client
|- database/    # File SQL schema và dữ liệu mẫu

## 4. Tài khoản demo
Sau khi import file `database/defaultdb.sql`, trong dữ liệu mẫu hiện có một số tài khoản để kiểm thử nhanh:
Role Admin: `admin@gmail.com` | `123456`
Role Student: `abc@gmail.com` | `123456`
Role Teacher: `abc1@gmail.com` | `123456`

## 5. Chạy dự án local
### Bước 1: Cài đặt môi trường
Cần có:
- Java JDK 17
- Maven
- Node.js + npm
- MySQL 8.x

### Bước 2: Import database
Tạo database `defaultdb`, sau đó import:
- `database/defaultdb.sql`

### Bước 3: Chạy backend
```bash
cd backend
mvn spring-boot:run
```

Backend mặc định chạy tại: http://localhost:8080

### Bước 4: Chạy frontend
```bash
cd frontend
npm install
npm start
```

Frontend mặc định chạy tại: http://localhost:3000

## 6. Cấu hình quan trọng
### Backend
File cấu hình local:
- `backend/src/main/resources/application.properties`

Cần kiểm tra lại:
- Kết nối MySQL
- `jwt.secret`
- Cấu hình email OTP
- Cấu hình payment demo

### Frontend
Frontend đang gọi API qua:
- `frontend/src/api/axios.js`

Mặc định:
```javascript
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
```

Nếu backend chạy port khác, hãy tạo file `.env` trong thư mục `frontend`:
```env
REACT_APP_API_URL=http://localhost:8080
```

