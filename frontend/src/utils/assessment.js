// Gom toàn bộ cách đọc classIds/classId từ backend mới và cũ về một chuẩn dùng chung.
export const getLinkedClassIds = (item) => {
  const classIds = Array.isArray(item?.classIds)
    ? item.classIds.map((classId) => Number(classId)).filter(Boolean)
    : [];

  if (classIds.length > 0) {
    return Array.from(new Set(classIds));
  }

  const fallbackClassId = Number(item?.classId);
  return Number.isFinite(fallbackClassId) && fallbackClassId > 0 ? [fallbackClassId] : [];
};

// Lấy class đầu tiên để giữ tương thích với những chỗ UI cũ vẫn cần một giá trị đại diện.
export const getPrimaryClassId = (item) => getLinkedClassIds(item)[0] || null;

// Kiểm tra item có được gắn với ít nhất một lớp trong tập class id đang xét hay không.
export const hasAnyLinkedClass = (item, availableClassIds) => (
  getLinkedClassIds(item).some((classId) => availableClassIds.has(Number(classId)))
);

// Chuẩn hóa payload classIds khi người dùng chọn nhiều lớp hoặc chỉ một lớp.
export const normalizeClassIdsPayload = (classIds, fallbackClassId) => {
  const normalizedClassIds = [
    ...(Array.isArray(classIds) ? classIds : []),
    fallbackClassId,
  ]
    .map((classId) => Number(classId))
    .filter((classId) => Number.isFinite(classId) && classId > 0);

  return Array.from(new Set(normalizedClassIds));
};
