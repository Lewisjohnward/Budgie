export const SYSTEM_CATEGORY_NAMES = {
  RTA: "Ready to Assign",
  UNCATEGORISED: "Uncategorised Transactions",
} as const;

export type SystemCategoryName =
  (typeof SYSTEM_CATEGORY_NAMES)[keyof typeof SYSTEM_CATEGORY_NAMES];
