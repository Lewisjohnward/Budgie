export function formatCurrency(
  value: number,
  { showPlus = false }: { showPlus?: boolean } = {}
): string {
  const isNegative = value < 0;
  const absValue = Math.abs(value).toFixed(2);
  const formattedValue = `£${absValue}`;

  if (isNegative) return `-${formattedValue}`;
  if (showPlus) return `+${formattedValue}`;
  return formattedValue;
}