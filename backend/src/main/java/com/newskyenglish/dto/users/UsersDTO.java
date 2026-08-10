package com.newskyenglish.dto.users;

import com.newskyenglish.model.Users;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Gom request/response liên quan đến người dùng và hồ sơ cá nhân.
public class UsersDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotBlank(message = "Họ tên không được để trống")
        @Size(min = 2, max = 100)
        private String name;

        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        private String email;

        @Size(max = 15)
        private String phoneNumber;

        private String address;
        private String avatarUrl;
        private Integer roleId;
        private String experience;
        private String education;
        @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        @Size(min = 2, max = 100)
        private String name;

        @Email(message = "Email không hợp lệ")
        private String email;

        @Size(max = 15)
        private String phoneNumber;

        private String address;
        private String avatarUrl;
        private Integer roleId;
        private Users.Status status;
        private Boolean approved;
        private String experience;
        private String education;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChangePasswordRequest {
        @NotBlank(message = "Thiếu mật khẩu hiện tại")
        private String currentPassword;

        @NotBlank(message = "Thiếu mật khẩu mới")
        @Size(min = 6, message = "Mật khẩu mới phải có ít nhất 6 ký tự")
        private String newPassword;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String name;
        private String email;
        private String phoneNumber;
        private String address;
        private String avatarUrl;
        private Integer roleId;
        private String roleName;
        private Users.Status status;
        private Boolean approved;
        private String experience;
        private String education;
        private Users.PlacementExamType placementExamType;
        private BigDecimal placementScore;
        private Long placementTestSubmissionId;
        private LocalDateTime placementCompletedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response fromEntity(Users user) {
            String roleName = switch (user.getRoleId() != null ? user.getRoleId() : 3) {
                case 1 -> "Admin";
                case 2 -> "Giáo viên";
                default -> "Học viên";
            };

            return Response.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .phoneNumber(user.getPhoneNumber())
                    .address(user.getAddress())
                    .avatarUrl(user.getAvatarUrl())
                    .roleId(user.getRoleId())
                    .roleName(roleName)
                    .status(user.getStatus())
                    .approved(user.getApproved())
                    .experience(user.getExperience())
                    .education(user.getEducation())
                    .placementExamType(user.getPlacementExamType())
                    .placementScore(user.getPlacementScore())
                    .placementTestSubmissionId(user.getPlacementTestSubmissionId())
                    .placementCompletedAt(user.getPlacementCompletedAt())
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())
                    .build();
        }
    }
}

