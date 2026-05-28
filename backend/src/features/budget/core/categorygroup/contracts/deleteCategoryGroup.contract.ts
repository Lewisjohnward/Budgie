import {
  type CategoryId,
  type DomainMonth,
} from "../../category/core/category.types";
import { type DomainNormalTransaction } from "../../transaction/transaction.types";
import { type CategoryGroupId } from "../categoryGroup.types";

/**
 * Result returned after deleting a category group, including affected categories, transaction reassignments, and updated months.
 */
export type DeleteCategoryGroupResult = {
  deletedCategoryGroupId: CategoryGroupId;
  deletedCategoryIds: CategoryId[];

  updatedTransactions: DomainNormalTransaction[];

  updatedMonths: DomainMonth[];
};
