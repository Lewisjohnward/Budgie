import { toCategoryGroupDto } from "./mappers/toCategoryGroupDto";
import { toDomainCategoryGroup } from "./mappers/toDomainCategoryGroup";
import { toDomainSystemCategoryGroup } from "./mappers/toDomainSystemCategoryGroup";
import { toDomainUserCategoryGroup } from "./mappers/toDomainUserCategoryGroup";

export const categoryGroupMapper = {
  toCategoryGroupDto,

  toDomainCategoryGroup,
  toDomainUserCategoryGroup,
  toDomainSystemCategoryGroup,
};
