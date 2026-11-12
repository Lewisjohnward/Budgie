export function formatCurrency(
  value: number,
  {
    showPlus = false,
    showNegative = true,
    locale = "en-GB",
    includeSpace = false,
  }: {
    showPlus?: boolean;
    showNegative?: boolean;
    locale?: string;
    includeSpace?: boolean;
  } = {}
): string {
  const formattedValue = Math.abs(value).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const currency = `£${includeSpace ? " " : ""}${formattedValue}`;

  if (value < 0) {
    return showNegative ? `-${currency}` : currency;
  }

  if (value > 0 && showPlus) {
    return `+${currency}`;
  }

  return currency;
}
