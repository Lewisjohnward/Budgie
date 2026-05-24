export const CATEGORY_GROUP_NAMES = {
  INFLOW: "Inflow",
  UNCATEGORISED: "Uncategorised",
} as const;

export const PROTECTED_CATEGORY_GROUP_NAMES = [
  CATEGORY_GROUP_NAMES.INFLOW,
  CATEGORY_GROUP_NAMES.UNCATEGORISED,
] as const;

export enum CategoryGroupSource {
  SYSTEM = "SYSTEM",
  USER = "USER",
}

/**
 * Default category groups created for new users.
 */
export const DEFAULT_CATEGORY_GROUPS = [
  {
    name: CATEGORY_GROUP_NAMES.INFLOW,
    categories: ["Ready to Assign"],
    source: CategoryGroupSource.SYSTEM,
    position: null,
  },
  {
    name: CATEGORY_GROUP_NAMES.UNCATEGORISED,
    categories: ["Uncategorised Transactions"],
    source: CategoryGroupSource.SYSTEM,
    position: null,
  },
  {
    name: "Bills",
    categories: ["🏠 Rent/Mortgage", "🔌 Utilities"],
    source: CategoryGroupSource.USER,
    position: 0,
  },
  {
    name: "Other",
    categories: ["❗️ Stuff I forgot to budget for"],
    source: CategoryGroupSource.USER,
    position: 1,
  },
] as const;
