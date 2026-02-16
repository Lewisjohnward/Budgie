export const SYSTEM_PAYEE_NAMES = [
  "Manual Balance Adjustment",
  "Starting Balance",
] as const;

export type SystemPayeeName = (typeof SYSTEM_PAYEE_NAMES)[number];
