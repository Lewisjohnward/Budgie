import { components, paths, operations } from "./generated";

// Paths
type ApiPath = keyof paths;

export const API_PATHS = {
  budgetSnapshot: "/budget/snapshot",
  categories: "/budget/categories",
  category: "/budget/categories/{categoryId}",
  categoryGroup: "/budget/category-groups/{categoryGroupId}",
  memo: "/budget/memo/{id}",
} as const satisfies Record<string, ApiPath>;

// Entities
export type ApiCategoryGroupUser = components["schemas"]["CategoryGroupUser"];
export type ApiCategoryGroupSystem =
  components["schemas"]["CategoryGroupSystem"];

export type ApiCategoryUser = components["schemas"]["CategoryUser"];
export type ApiCategorySystem = components["schemas"]["CategorySystem"];

export type ApiMonth = components["schemas"]["Month"];
export type ApiMemo = components["schemas"]["Memo"];

export type ApiAccount = components["schemas"]["Account"];
export type ApiPayee = components["schemas"]["Payee"];
export type ApiTransaction = components["schemas"]["Transaction"];
export type ApiTransactionNormal = components["schemas"]["TransactionNormal"];

export type ApiMonthKey = string;

// Snapshot response
export type ApiBudgetSnapshot =
  paths["/budget/snapshot"]["get"]["responses"]["200"]["content"]["application/json"];

// Category responses
export type CreateCategoryResponse =
  components["schemas"]["CreateCategoryResponse"];
export type UpdateCategoryResponse =
  components["schemas"]["UpdateCategoryResponse"];
export type DeleteCategoryResponse =
  components["schemas"]["DeleteCategoryResponse"];
export type CategoryPositionPatch =
  components["schemas"]["CategoryPositionPatch"];

// Category group responses
export type CreateCategoryGroupResponse =
  components["schemas"]["CreateCategoryGroupResponse"];
export type UpdateCategoryGroupResponse =
  components["schemas"]["UpdateCategoryGroupResponse"];
export type DeleteCategoryGroupResponse =
  components["schemas"]["DeleteCategoryGroupResponse"];
export type CategoryGroupPositionPatch =
  components["schemas"]["CategoryGroupPositionPatch"];

// Memo
export type EditMemoResponse = components["schemas"]["EditMemoResponse"];
export type EditMemoRequest =
  operations["editMemo"]["requestBody"]["content"]["application/json"];
