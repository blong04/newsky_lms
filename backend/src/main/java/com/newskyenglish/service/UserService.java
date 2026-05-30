package com.newskyenglish.service;

import com.newskyenglish.dto.user.UserDTO;
import com.newskyenglish.exception.BadRequestException;
import com.newskyenglish.exception.ResourceNotFoundException;
import com.newskyenglish.model.User;
import com.newskyenglish.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
// Quản lý CRUD người dùng và các thao tác hồ sơ cơ bản trong hệ thống.
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    // Lấy toàn bộ người dùng và chuyển sang DTO an toàn cho frontend.
    public List<UserDTO.Response> getAll() {
        return userRepository.findAll().stream()
                .map(UserDTO.Response::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy chi tiết một người dùng theo id.
    public UserDTO.Response getById(Long id) {
        return UserDTO.Response.fromEntity(findUser(id));
    }

    @Transactional
    // Tạo mới tài khoản nội bộ từ màn quản trị người dùng.
    public UserDTO.Response create(UserDTO.CreateRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("Email không được để trống");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã tồn tại");
        }

        Integer selectedRoleId = request.getRoleId() != null ? request.getRoleId() : 3;
        String rawPassword = request.getPassword() != null && !request.getPassword().isBlank()
                ? request.getPassword()
                : "1234";
        validateNumericPassword(rawPassword);

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(rawPassword))
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .avatarUrl(request.getAvatarUrl())
                .roleId(selectedRoleId)
                .approved(selectedRoleId != 2)
                .status(User.Status.active)
                .ieltsScore(request.getIeltsScore())
                .toeicScore(request.getToeicScore())
                .satScore(request.getSatScore())
                .specialization(request.getSpecialization())
                .experience(request.getExperience())
                .education(request.getEducation())
                .build();

        return UserDTO.Response.fromEntity(userRepository.save(user));
    }

    @Transactional
    // Cập nhật các trường hồ sơ và trạng thái của người dùng.
    public UserDTO.Response update(Long id, UserDTO.UpdateRequest request) {
        User user = findUser(id);

        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(user.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã tồn tại");
        }

        if (request.getName() != null) user.setName(request.getName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getRoleId() != null) user.setRoleId(request.getRoleId());
        if (request.getStatus() != null) user.setStatus(request.getStatus());
        if (request.getApproved() != null) user.setApproved(request.getApproved());
        if (request.getIeltsScore() != null) user.setIeltsScore(request.getIeltsScore());
        if (request.getToeicScore() != null) user.setToeicScore(request.getToeicScore());
        if (request.getSatScore() != null) user.setSatScore(request.getSatScore());
        if (request.getSpecialization() != null) user.setSpecialization(request.getSpecialization());
        if (request.getExperience() != null) user.setExperience(request.getExperience());
        if (request.getEducation() != null) user.setEducation(request.getEducation());

        return UserDTO.Response.fromEntity(userRepository.save(user));
    }

    @Transactional
    // Đổi mật khẩu sau khi kiểm tra mật khẩu hiện tại hợp lệ.
    public void changePassword(Long id, UserDTO.ChangePasswordRequest request) {
        User user = findUser(id);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu hiện tại không đúng");
        }
        validateNumericPassword(request.getNewPassword());

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    // Xóa một tài khoản người dùng khỏi hệ thống.
    public void delete(Long id) {
        User user = findUser(id);
        userRepository.delete(user);
    }

    // Helper tìm user hoặc ném lỗi 404 nếu không tồn tại.
    public User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
    }

    // Mật khẩu mới/tạo tài khoản phải gồm đúng 4 chữ số.
    private void validateNumericPassword(String password) {
        if (password == null || !password.matches("\\d{4}")) {
            throw new BadRequestException("Mật khẩu phải gồm đúng 4 chữ số");
        }
    }
}
