import { components, paths } from "./schema";

export type ApiBudgetSnapshot =
  paths["/budget/snapshot"]["get"]["responses"]["200"]["content"]["application/json"];

export type ApiCategoryGroup = components["schemas"]["CategoryGroup"];
export type ApiPayee = components["schemas"]["Payee"];
