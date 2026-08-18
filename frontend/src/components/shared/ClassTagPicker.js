import { useEffect, useMemo, useRef, useState } from "react";
import "./ClassTagPicker.css";

// Dropdown chọn nhiều lớp dạng checkbox-list, chỉ gợi ý lớp cùng loại đề
// (examType) với bài kiểm tra/bài thi thử đang tạo. Thay cho lưới nút hoặc
// chip rời rạc khi số lớp đã gắn lớn - toàn bộ thao tác gói gọn trong 1 dropdown.
export default function ClassTagPicker({ classes = [], examType, selectedIds = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  const selectedSet = useMemo(() => new Set(selectedIds.map(Number)), [selectedIds]);

  const matchingClasses = useMemo(() => (
    classes.filter((item) => !examType || item.examType === examType)
  ), [classes, examType]);

  const filteredClasses = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return matchingClasses.filter((item) => !keyword || item.name.toLowerCase().includes(keyword));
  }, [matchingClasses, search]);

  // Đóng dropdown khi bấm ra ngoài.
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggleClass = (classId) => {
    const normalizedId = Number(classId);
    const nextIds = selectedSet.has(normalizedId)
      ? selectedIds.filter((id) => Number(id) !== normalizedId)
      : [...selectedIds.map(Number), normalizedId];
    onChange(nextIds);
  };

  const summaryLabel = selectedIds.length > 0
    ? `${selectedIds.length} lớp đã chọn`
    : "Chưa gắn lớp — bấm để chọn";

  return (
    <div className="class-dropdown" ref={containerRef}>
      <button type="button" className="class-dropdown__trigger" onClick={() => setOpen((current) => !current)}>
        <span>{summaryLabel}</span>
        <span className="class-dropdown__caret">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="class-dropdown__panel">
          <input
            className="class-dropdown__search"
            placeholder="Tìm lớp theo tên..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            autoFocus
          />
          <div className="class-dropdown__list">
            {filteredClasses.length === 0 ? (
              <p className="class-dropdown__empty">
                {matchingClasses.length === 0
                  ? `Không có lớp nào thuộc loại ${examType || "này"} trong hệ thống`
                  : "Không tìm thấy lớp khớp từ khóa"}
              </p>
            ) : (
              filteredClasses.map((item) => (
                <label key={item.id} className="class-dropdown__option">
                  <input
                    type="checkbox"
                    checked={selectedSet.has(Number(item.id))}
                    onChange={() => toggleClass(item.id)}
                  />
                  <span>{item.name}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
