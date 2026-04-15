const INFLOW_CATEGORY_GROUP = "Inflow";
const UNCATEGORISED_CATEGORY_GROUP = "Uncategorised";

export const PROTECTED_CATEGORY_GROUP_NAMES = [
  INFLOW_CATEGORY_GROUP,
  UNCATEGORISED_CATEGORY_GROUP,
] as const;

/**
 * Default category groups created when a new user is initialised.
 *
 * These provide the initial budget structure and include pre-defined categories
 * assigned to each group to help users get started.
 */
export const DEFAULT_CATEGORY_GROUPS = [
  {
    name: "Inflow",
    categories: ["Ready to Assign"],
    position: 0,
  },
  {
    name: "Uncategorised",
    categories: ["Uncategorised Transactions"],
    position: 0,
  },
  {
    name: "Bills",
    categories: ["🏠 Rent/Mortgage", "🔌 Utilities"],
    position: 0,
  },
  {
    name: "Other",
    categories: ["❗️ Stuff I forgot to budget for"],
    position: 1,
  },
] as const;
