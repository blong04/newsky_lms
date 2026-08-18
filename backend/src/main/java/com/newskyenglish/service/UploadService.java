package com.newskyenglish.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.newskyenglish.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
// Tải file (ảnh/audio câu hỏi, chứng chỉ điểm thi...) lên Cloudinary và trả về URL public.
public class UploadService {

    private static final long MAX_FILE_SIZE_BYTES = 15L * 1024 * 1024;

    private final Cloudinary cloudinary;

    // Ảnh/audio đính kèm câu hỏi quiz và mock test (dùng bởi admin).
    public String uploadQuestionMedia(MultipartFile file) {
        return upload(file, "newskyenglish/questions");
    }

    // Ảnh/PDF chứng chỉ điểm thi chính thức học viên tự nộp.
    public String uploadCertificate(MultipartFile file) {
        return upload(file, "newskyenglish/certificates");
    }

    private String upload(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Vui lòng chọn file để tải lên");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("File vượt quá dung lượng cho phép (15MB)");
        }

        // Cloudinary xem file audio là resource_type "video" (dùng chung pipeline xử lý media động);
        // ảnh và PDF đều dùng resource_type "image".
        String contentType = file.getContentType() != null ? file.getContentType() : "";
        String resourceType = contentType.startsWith("audio/") ? "video" : "image";

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", resourceType,
                    "folder", folder
            ));
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new BadRequestException("Tải file lên Cloudinary thất bại: " + e.getMessage());
        }
    }
}
