export const calculateBillableDays = (pickup, ret) => {
  const start = new Date(pickup);
  const end = new Date(ret);
  const diffMs = end - start;
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
};