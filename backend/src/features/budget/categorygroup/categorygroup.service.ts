import { CategoryGroupPayload } from "./categorygroup.schema";
import { createCategoryGroup } from "./use-cases/createCategoryGroup";

export const categoryGroupService = {

    createCategoryGroup: (payload: CategoryGroupPayload) => {
        return createCategoryGroup(payload);
      },

};