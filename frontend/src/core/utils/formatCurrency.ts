export function formatCurrency(
  value: number,
  {
    showPlus = false,
    showNegative = true,
  }: { showPlus?: boolean; showNegative?: boolean } = {}
): string {
  const absValue = Math.abs(value).toFixed(2);
  const formattedValue = `£${absValue}`;

  if (value < 0) {
    return showNegative ? `-${formattedValue}` : formattedValue;
  }

  if (value > 0) {
    return showPlus ? `+${formattedValue}` : formattedValue;
  }

  return formattedValue;
}
