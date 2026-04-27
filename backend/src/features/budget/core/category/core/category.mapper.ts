import { toDomainCategory } from "./mappers/toDomainCategory";
import { toDomainMonth } from "./mappers/toDomainMonth";
import { toMonthDto } from "./mappers/toMonthDto";
import {
  mapMonthsByCategoryToDto,
  mapMonthsImproveName,
} from "./mappers/toUpdateMonthsByCategoryDto";

export const categoryMapper = {
  toDomainCategory,
  toDomainMonth,
  toMonthDto,
  mapMonthsByCategoryToDto,
  mapMonthsImproveName,
};
