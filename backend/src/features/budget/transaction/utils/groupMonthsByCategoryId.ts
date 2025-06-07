/**
 * Groups an array of `Month` records by their `categoryId`.
 *
 * - Returns a mapping of `categoryId` to an array of corresponding `Month` entries.
 * - Useful for organizing months by category for bulk operations or summaries.
 *
 * @param categoryMonths - An array of `Month` objects, each with a `categoryId`.
 * @returns A record mapping each `categoryId` to an array of `Month` instances.
 */

import { Month } from "@prisma/client";
import { groupBy } from "./groupBy";

export function groupMonthsByCategoryId(categoryMonths: Month[]) {
  return groupBy(categoryMonths, (categoryMonths) => categoryMonths.categoryId);
}
