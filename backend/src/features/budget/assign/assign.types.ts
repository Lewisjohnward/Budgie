import { type CategoryId, type MonthDto } from "../category/category.types";

/**
 * Maps each categoryId to its corresponding array of months
 */
export type CategoryMonthsMap = Record<CategoryId, MonthDto[]>;
