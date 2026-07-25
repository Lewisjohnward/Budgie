import { getCategory } from "./application/services/getCategory";
import { getNextCategoryPosition } from "./application/services/getNextCategoryPosition";
import { initialiseCategories } from "./application/services/initialiseCategories";
import { createMonthsForCategory } from "./application/services/months/createMonthsForCategory";
import { insertMissingMonths } from "./application/services/months/insertMissingMonths";
import { ensureMonthsContinuity } from "./application/services/months/ensureMonthsContinuity";
import { recalculateCategoryMonthsForTransactions } from "./application/services/months/recalculateForCategoryMonthsForTransactions";
import { getMonth } from "./application/services/months/getMonth";
import { getAllMonthsForCategories } from "./application/services/months/getAllMonthsForCategories";
import { getMonthsForCategoriesStartingFrom } from "./application/services/months/getMonthsForCategoriesStartingFrom";
import { getAllRtaMonths } from "./application/services/months/getAllRtaMonths";
import { getMostRecentMonths } from "./application/services/months/getMostRecentMonths";
import { calculateMonthsAvailable } from "./application/services/rta/calculateMonthsAvailable";
import { updateMonthsActivityForTransactions } from "./application/services/rta/updateMonthsActivityForTransactions";
import { getRtaCategoryId } from "./application/services/rta/getRtaCategoryId";
import { getUncategorisedCategoryId } from "./application/services/getUncategorisedCategoryId";
import { createCategory } from "./application/services/createCategory";
import { ensureUserOwnsCategories } from "./application/services/ensureUserOwnsCategories";
import { getMonthsForCategories } from "./application/services/months/getMonthsForCategories";
import { getMonths } from "./application/services/months/getMonths";
import { getCategoryIdsByCategoryGroupId } from "./application/services/getCategoryIdsByCategoryGroupId";
import { getModifiableCategory } from "./application/services/getModifiableCategory";
import { renameCategory } from "./application/services/renameCategory";
import { moveCategory } from "./application/services/moveCategory";
import { createCategoryWithMonths } from "./application/services/createCategoryWithMonths";
import { getUserCategories } from "./application/services/getUserCategories";
import { getSystemCategories } from "./application/services/getSystemCategories";

export const categoryService = {
  rta: {
    calculateMonthsAvailable,
    updateMonthsActivityForTransactions,
    getRtaCategoryId,
  },
  months: {
    getMonth,
    getMonths,
    getAllMonthsForCategories,
    getMonthsForCategoriesStartingFrom,
    getAllRtaMonths,
    getMostRecentMonths,
    recalculateCategoryMonthsForTransactions,
    insertMissingMonths,
    createMonthsForCategory,
    ensureMonthsContinuity,
    getMonthsForCategories,
  },
  categories: {
    createCategory,
    createCategoryWithMonths,
    getCategory,
    getUserCategories,
    getSystemCategories,
    getUncategorisedCategoryId,
    getCategoryIdsByCategoryGroupId,
    renameCategory,
    getModifiableCategory,
    initialiseCategories,
    getNextCategoryPosition,
    ensureUserOwnsCategories,
    moveCategory,
  },
};
