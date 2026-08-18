import { useState } from "react";
import toast from "react-hot-toast";
import { uploadService } from "../../services/uploadService";
import "./MediaUploadInput.css";

// Ô nhập URL media (ảnh/audio/PDF) - hỗ trợ vừa nhập tay URL có sẵn,
// vừa upload file thật lên Cloudinary rồi tự điền URL vào ô.
// `onUpload` mặc định dùng endpoint câu hỏi (admin); truyền riêng khi cần
// endpoint khác (VD: chứng chỉ điểm thi của student).
export default function MediaUploadInput({
  value,
  onChange,
  accept,
  placeholder,
  onUpload = uploadService.uploadQuestionMedia,
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setUploading(true);
    try {
      const result = await onUpload(file);
      onChange(result.url);
      toast.success("Tải file lên thành công");
    } catch (error) {
      toast.error(error.response?.data?.message || "Tải file lên thất bại");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="media-upload-input">
      <input
        className="media-upload-input__text"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      <label className={`btn btn-ghost btn-sm media-upload-input__btn ${uploading ? "media-upload-input__btn--busy" : ""}`}>
        {uploading ? "Đang tải..." : "Tải file lên"}
        <input
          type="file"
          accept={accept}
          hidden
          disabled={uploading}
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}
