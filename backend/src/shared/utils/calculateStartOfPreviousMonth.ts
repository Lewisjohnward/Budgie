export function calculateStartOfPreviousMonth(date: Date) {
  const startOfPreviousMonth = new Date(date);
  startOfPreviousMonth.setMonth(startOfPreviousMonth.getMonth() - 1);
  return startOfPreviousMonth;
}
