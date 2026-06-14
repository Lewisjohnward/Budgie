import {
  toCategoryGroupSystemDto,
  toCategoryGroupUserDto,
} from "./mappers/toCategoryGroupDto";
import { toDeleteCategoryGroupDto } from "./mappers/toDeleteCategoryGroupDto";
import { toDomainSystemCategoryGroup } from "./mappers/toDomainSystemCategoryGroup";
import { toDomainUserCategoryGroup } from "./mappers/toDomainUserCategoryGroup";
import { toCreateCategoryGroupDto } from "./mappers/toCreateCategoryGroupDto";

export const categoryGroupMapper = {
  toCategoryGroupUserDto,
  toCategoryGroupSystemDto,

  toDomainUserCategoryGroup,
  toDomainSystemCategoryGroup,

  toCreateCategoryGroupDto,
  toDeleteCategoryGroupDto,
};
