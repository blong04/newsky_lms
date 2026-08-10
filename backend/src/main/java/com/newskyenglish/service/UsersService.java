package com.newskyenglish.service;

import com.newskyenglish.dto.users.UsersDTO;
import com.newskyenglish.exception.BadRequestException;
import com.newskyenglish.exception.ForbiddenException;
import com.newskyenglish.exception.ResourceNotFoundException;
import com.newskyenglish.model.Users;
import com.newskyenglish.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
// Quản lý CRUD người dùng và các thao tác hồ sơ cơ bản trong hệ thống.
public class UsersService {

    private final UsersRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    // Lấy danh sách người dùng theo bộ lọc tìm kiếm để frontend không phải tự lọc cục bộ.
    public List<UsersDTO.Response> getAll(String keyword, Integer roleId, Users.Status status) {
        String normalizedKeyword = normalizeKeyword(keyword);

        return userRepository.findAll().stream()
                .filter(user -> matchesKeyword(user, normalizedKeyword))
                .filter(user -> roleId == null || roleId.equals(user.getRoleId()))
                .filter(user -> status == null || status == user.getStatus())
                .map(UsersDTO.Response::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy chi tiết một người dùng theo id.
    public UsersDTO.Response getById(Long id, String authorizationHeader) {
        ensureSelfOrAdmin(id, authorizationHeader);
        return UsersDTO.Response.fromEntity(findUser(id));
    }

    @Transactional
    // Tạo mới tài khoản nội bộ từ màn quản trị người dùng.
    public UsersDTO.Response create(UsersDTO.CreateRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("Email không được để trống");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã tồn tại");
        }

        Integer selectedRoleId = request.getRoleId() != null ? request.getRoleId() : 3;
        String rawPassword = request.getPassword() != null && !request.getPassword().isBlank()
                ? request.getPassword()
                : "123456";
        validatePassword(rawPassword);

        Users user = Users.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(rawPassword))
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .avatarUrl(request.getAvatarUrl())
                .roleId(selectedRoleId)
                .approved(true)
                .status(Users.Status.active)
                .experience(request.getExperience())
                .education(request.getEducation())
                .build();

        return UsersDTO.Response.fromEntity(userRepository.save(user));
    }

    @Transactional
    // Cập nhật các trường hồ sơ và trạng thái của người dùng.
    public UsersDTO.Response update(Long id, UsersDTO.UpdateRequest request, String authorizationHeader) {
        Users user = findUser(id);
        boolean admin = isAdmin(authorizationHeader);
        ensureSelfOrAdmin(id, authorizationHeader);

        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(user.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã tồn tại");
        }

        if (!admin && (request.getRoleId() != null || request.getStatus() != null || request.getApproved() != null)) {
            throw new ForbiddenException("Bạn không có quyền cập nhật thông tin quản trị");
        }

        if (request.getName() != null) user.setName(request.getName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getRoleId() != null) user.setRoleId(request.getRoleId());
        if (request.getStatus() != null) user.setStatus(request.getStatus());
        if (request.getApproved() != null) user.setApproved(request.getApproved());
        if (request.getExperience() != null) user.setExperience(request.getExperience());
        if (request.getEducation() != null) user.setEducation(request.getEducation());

        return UsersDTO.Response.fromEntity(userRepository.save(user));
    }

    @Transactional
    // Đổi mật khẩu sau khi kiểm tra mật khẩu hiện tại hợp lệ.
    public void changePassword(Long id, UsersDTO.ChangePasswordRequest request, String authorizationHeader) {
        ensureSelf(id, authorizationHeader);
        Users user = findUser(id);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu hiện tại không đúng");
        }
        validatePassword(request.getNewPassword());

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    // Xóa một tài khoản người dùng khỏi hệ thống.
    public void delete(Long id) {
        Users user = findUser(id);
        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    // Lấy danh sách giáo viên đang chờ admin phê duyệt tài khoản.
    public List<UsersDTO.Response> getPendingTeachers() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRoleId() == 2 && !Boolean.TRUE.equals(user.getApproved()))
                .map(UsersDTO.Response::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    // Đánh dấu một giáo viên đã được admin phê duyệt.
    public void approveTeacher(Long id) {
        Users user = findUser(id);
        user.setApproved(true);
        userRepository.save(user);
    }

    @Transactional
    // Từ chối hồ sơ giáo viên bằng cách xóa tài khoản chờ duyệt.
    public void rejectTeacher(Long id) {
        userRepository.delete(findUser(id));
    }

    // Helper tìm user hoặc ném lỗi 404 nếu không tồn tại.
    public Users findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
    }

    // Tài nguyên hồ sơ chỉ cho phép chính chủ hoặc admin truy cập.
    private void ensureSelfOrAdmin(Long targetUserId, String authorizationHeader) {
        Long currentUserId = currentUserService.extractUserId(authorizationHeader);
        if (currentUserId.equals(targetUserId) || isAdmin(authorizationHeader)) {
            return;
        }
        throw new ForbiddenException("Bạn không có quyền truy cập người dùng này");
    }

    // Đổi mật khẩu chỉ cho phép chính chủ thực hiện.
    private void ensureSelf(Long targetUserId, String authorizationHeader) {
        Long currentUserId = currentUserService.extractUserId(authorizationHeader);
        if (!currentUserId.equals(targetUserId)) {
            throw new ForbiddenException("Bạn chỉ có thể đổi mật khẩu của chính mình");
        }
    }

    // Kiểm tra nhanh role admin từ JWT hiện tại.
    private boolean isAdmin(String authorizationHeader) {
        return Integer.valueOf(1).equals(currentUserService.extractRoleId(authorizationHeader));
    }

    // Chuẩn hóa từ khóa tìm kiếm để so khớp tên và email nhất quán.
    private String normalizeKeyword(String keyword) {
        return keyword == null ? "" : keyword.trim().toLowerCase(Locale.ROOT);
    }

    // Kiểm tra người dùng có khớp từ khóa theo tên hoặc email hay không.
    private boolean matchesKeyword(Users user, String normalizedKeyword) {
        if (normalizedKeyword.isBlank()) {
            return true;
        }

        String name = user.getName() == null ? "" : user.getName().toLowerCase(Locale.ROOT);
        String email = user.getEmail() == null ? "" : user.getEmail().toLowerCase(Locale.ROOT);
        return name.contains(normalizedKeyword) || email.contains(normalizedKeyword);
    }

    // Mật khẩu mới/tạo tài khoản phải đủ tối thiểu 6 ký tự.
    private void validatePassword(String password) {
        if (password == null || password.length() < 6) {
            throw new BadRequestException("Mật khẩu phải có ít nhất 6 ký tự");
        }
    }
}

