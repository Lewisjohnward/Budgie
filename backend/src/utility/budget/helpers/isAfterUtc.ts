export const isAfterUtc = (a: Date, b: Date) => {
  const d1 = new Date(a);
  const d2 = new Date(b);

  d1.setUTCHours(0, 0, 0, 0);
  d2.setUTCHours(0, 0, 0, 0);

  return d1 > d2;
};
