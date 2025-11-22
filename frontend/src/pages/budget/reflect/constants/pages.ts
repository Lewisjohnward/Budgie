export const REFLECT_PAGES = {
  "spending-breakdown": {
    title: "Spending Breakdown",
    path: "spending-breakdown",
  },
  "spending-trends": {
    title: "Spending Trends",
    path: "spending-trends",
  },
  "budget-vs-actual": {
    title: "Budget vs Actual",
    path: "budget-vs-actual",
  },
  "category-deep-dive": {
    title: "Category Deep Dive",
    path: "category-deep-dive",
  },
} as const;

export type ReflectPageKey = keyof typeof REFLECT_PAGES;
