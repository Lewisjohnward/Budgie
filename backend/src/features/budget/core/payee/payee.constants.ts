export const SYSTEM_PAYEE_NAMES = [
  "Manual Balance Adjustment",
  "Starting Balance",
] as const;

export type SystemPayeeName = (typeof SYSTEM_PAYEE_NAMES)[number];

export const PAYEE_ORIGIN = ["USER", "SYSTEM"] as const;

export type PayeeOrigin = (typeof PAYEE_ORIGIN)[number];
