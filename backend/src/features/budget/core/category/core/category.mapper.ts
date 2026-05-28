import { toCategoryDto } from "./mappers/toCategoryDto";
import { toDomainCategory } from "./mappers/toDomainCategory";
import { toDomainCategoryIds } from "./mappers/toDomainCategoryIds";
import { toDomainMonth } from "./mappers/toDomainMonth";
import { toMonthDto } from "./mappers/toMonthDto";
import {
  mapMonthsByCategoryToDto,
  mapMonthsImproveName,
} from "./mappers/toUpdateMonthsByCategoryDto";

export const categoryMapper = {
  toDomainCategory,
  toDomainCategoryIds,
  toCategoryDto,
  toDomainMonth,
  toMonthDto,
  mapMonthsByCategoryToDto,
  mapMonthsImproveName,
};
