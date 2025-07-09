import { CategoryGroupPayload } from "./categorygroup.schema";
import { createCategoryGroup } from "./application/use-cases/createCategoryGroup";

export const categoryGroupUseCase = {

    createCategoryGroup: (payload: CategoryGroupPayload) => {
        return createCategoryGroup(payload);
      },

};