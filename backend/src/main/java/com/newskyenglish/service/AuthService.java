package com.newskyenglish.service;

import com.newskyenglish.dto.auth.AuthResponse;
import com.newskyenglish.dto.auth.LoginRequest;
import com.newskyenglish.dto.auth.RegisterRequest;
import com.newskyenglish.dto.users.UsersDTO;
import com.newskyenglish.exception.BadRequestException;
import com.newskyenglish.model.Users;
import com.newskyenglish.repository.UsersRepository;
import com.newskyenglish.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
// Xử lý luồng đăng nhập và đăng ký tài khoản cho người dùng mới.
public class AuthService {

    private final UsersRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    // Xác thực tài khoản và trả về JWT kèm thông tin người dùng đăng nhập.
    public AuthResponse login(LoginRequest request) {
        Users user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Sai email hoặc mật khẩu"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Sai email hoặc mật khẩu");
        }
        if (user.getStatus() != Users.Status.active) {
            throw new BadRequestException("Tài khoản đã bị khóa");
        }
        if (user.getRoleId() == 2 && !Boolean.TRUE.equals(user.getApproved())) {
            throw new BadRequestException("Tài khoản đang chờ phê duyệt");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRoleId());
        return AuthResponse.builder()
                .token(token)
                .user(UsersDTO.Response.fromEntity(user))
                .build();
    }

    @Transactional
    // Tạo tài khoản mới theo role được gửi từ form đăng ký.
    public void register(RegisterRequest request) {
        validateNumericPassword(request.getPassword());
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã tồn tại");
        }

        Integer selectedRoleId = request.getRoleId() != null ? request.getRoleId() : 3;
        Users user = Users.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roleId(selectedRoleId)
                .approved(selectedRoleId != 2)
                .status(Users.Status.active)
                .build();

        userRepository.save(user);
    }

    // Trả thông điệp đăng ký phù hợp với từng role, nhất là giáo viên cần duyệt.
    public String getRegisterSuccessMessage(Integer roleId) {
        return roleId != null && roleId == 2
                ? "Đăng ký thành công! Vui lòng chờ admin phê duyệt."
                : "Đăng ký thành công!";
    }

    // Đảm bảo mật khẩu đăng ký chỉ gồm đúng 4 chữ số.
    private void validateNumericPassword(String password) {
        if (password == null || !password.matches("\\d{4}")) {
            throw new BadRequestException("Mật khẩu phải gồm đúng 4 chữ số");
        }
    }
}

