// Chuyển mảng object thành map theo id số để tra cứu nhanh ở page.
export const buildMapByNumericField = (items, keyField) => (
  (items || []).reduce((result, item) => {
    const targetId = Number(item[keyField]);
    if (!Number.isNaN(targetId)) {
      result[targetId] = item;
    }
    return result;
  }, {})
);
