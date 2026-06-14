import { toCategoryDto } from "./mappers/toCategoryDto";
import { toCreateCategoryDto } from "./mappers/toCreateCategoryDto";
import { toDeleteCategoryDto } from "./mappers/toDeleteCategoryDto";
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
  toCreateCategoryDto,
  toDeleteCategoryDto,
  mapMonthsByCategoryToDto,
  mapMonthsImproveName,
};
