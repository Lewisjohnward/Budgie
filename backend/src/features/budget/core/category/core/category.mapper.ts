import { toCategoryDto } from "./mappers/toCategoryDto";
import { toCategorySystemDto } from "./mappers/toCategorySystemDto";
import { toCategoryUserDto } from "./mappers/toCategoryUserDto";
import { toCreateCategoryDto } from "./mappers/toCreateCategoryDto";
import { toDeleteCategoryDto } from "./mappers/toDeleteCategoryDto";
import { toDomainCategoryIds } from "./mappers/toDomainCategoryIds";
import { toDomainMonth } from "./mappers/toDomainMonth";
import { toDomainSystemCategory } from "./mappers/toDomainSystemCategory";
import { toDomainUserCategory } from "./mappers/toDomainUserCategory";
import { toMonthDto } from "./mappers/toMonthDto";
import { toUpdateCategoryDto } from "./mappers/toUpdateCategoryDto";
import {
  mapMonthsByCategoryToDto,
  mapMonthsImproveName,
} from "./mappers/toUpdateMonthsByCategoryDto";

export const categoryMapper = {
  toDomainUserCategory,
  toDomainSystemCategory,
  toDomainCategoryIds,
  toCategoryDto,
  toCategoryUserDto,
  toCategorySystemDto,
  toDomainMonth,
  toMonthDto,
  toCreateCategoryDto,
  toDeleteCategoryDto,
  toUpdateCategoryDto,
  mapMonthsByCategoryToDto,
  mapMonthsImproveName,
};
