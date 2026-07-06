import { components, paths } from "./schema";

export type ApiBudgetSnapshot =
  paths["/budget/snapshot"]["get"]["responses"]["200"]["content"]["application/json"];

export type ApiCategoryGroup = components["schemas"]["CategoryGroup"];
export type ApiCategory = components["schemas"]["Category"];
export type ApiMonth = components["schemas"]["Month"];
export type ApiMemo = components["schemas"]["Memo"];

export type ApiAccount = components["schemas"]["Account"];
export type ApiPayee = components["schemas"]["Payee"];
export type ApiTransaction = components["schemas"]["Transaction"];

export type ApiMonthKey = string;
