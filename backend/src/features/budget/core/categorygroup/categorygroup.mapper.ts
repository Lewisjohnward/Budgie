import { toCategoryGroupDto } from "./mappers/toCategoryGroupDto";
import { toDomainSystemCategoryGroup } from "./mappers/toDomainSystemCategoryGroup";
import { toDomainUserCategoryGroup } from "./mappers/toDomainUserCategoryGroup";

export const categoryGroupMapper = {
  toCategoryGroupDto,

  toDomainUserCategoryGroup,
  toDomainSystemCategoryGroup,
};
