export const numberToCurrency = (value: number) => {
  const val = value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const currency = "£";

  return `${currency} ${val}`;
};
