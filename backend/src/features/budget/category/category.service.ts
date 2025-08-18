import { checkUserOwnsCategory } from "./application/services/assertUserOwnsCategory";
import { checkCategoryNameIsUniqueInGroup } from "./application/services/checkCategoryNameIsUniqueInGroup";
import { getNextCategoryPosition } from "./application/services/getNextCategoryPosition";
import { initialiseCategories } from "./application/services/initialiseCategories";
import { isCategoryProtected } from "./application/services/isCategoryProtected";
import { createMonthsForCategory } from "./application/services/months/createMonthsForCategory";
import { insertMissingMonths } from "./application/services/months/insertMissingMonths";
import { ensureMonthsContinuity } from "./application/services/months/ensureMonthsContinuity";
import { recalculateCategoryMonthsForTransactions } from "./application/services/months/recalculateForTransactions";
import { calculateMonthsAvailable } from "./application/services/rta/calculateMonthsAvailable";
import { updateMonthsActivityForTransactions } from "./application/services/rta/updateMonthsActivityForTransactions";

export const categoryService = {
  rta: {
    calculateMonthsAvailable,
    updateMonthsActivityForTransactions,
  },
  months: {
    recalculateCategoryMonthsForTransactions,
    insertMissingMonths,
    createMonthsForCategory,
    ensureMonthsContinuity,
  },
  categories: {
    initialiseCategories,
    checkUserOwnsCategory,
    checkCategoryNameIsUniqueInGroup,
    getNextCategoryPosition,
    isCategoryProtected,
  },
};
