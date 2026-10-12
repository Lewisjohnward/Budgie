import { ApiPayee } from "@/core/types/exported-types";
import { PayeeBranded } from "@/core/types/NormalizedData";
import { asPayeeId, asCategoryId } from "@/pages/budget/allocation/types/types";

export const mapPayee = (payee: ApiPayee): PayeeBranded => ({
  id: asPayeeId(payee.id),
  name: payee.name,
  origin: payee.origin,
  defaultCategoryId: payee.defaultCategoryId
    ? asCategoryId(payee.defaultCategoryId)
    : null,
  includeInPayeeList: payee.includeInPayeeList,
  automaticallyCategorisePayee: payee.automaticallyCategorisePayee,
});
