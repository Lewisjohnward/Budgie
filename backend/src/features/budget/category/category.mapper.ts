import { toDomainCategory } from "./mappers/toDomainCategory";
import { toDomainMonth } from "./mappers/toDomainMonth";
import { toMonthDto } from "./mappers/toMonthDto";
import { mapMonthsByCategoryToDto } from "./mappers/toUpdateMonthsByCategoryDto";

export const categoryMapper = {
  toDomainCategory,
  toDomainMonth,
  toMonthDto,
  mapMonthsByCategoryToDto,
};
