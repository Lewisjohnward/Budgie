import { type SystemCategories } from "../../category.types";
import { categoryMapper } from "../../category.mapper";
import { type UserId } from "../../../../../../user/auth/auth.types";
import { categoryRepository } from "../../../../../../../shared/repository/categoryRepositoryImpl";
import { SYSTEM_CATEGORY_NAMES } from "../../category.constants";

// TODO:(lewis 2026-07-25 11:18) smell: this is just covering up the fact the db has position Int for category and the schema doesnt have type sys

// enum CategoryOrigin {
//   USER
//   SYSTEM
// }
//
// model Category {
//   id        String @id
//   name      String
//   origin    CategoryOrigin
// }
// enum SystemCategoryType {
//   RTA
//   UNCATEGORISED
// }

export const getSystemCategories = async (
  userId: UserId
): Promise<SystemCategories> => {
  const categories = await categoryRepository.getCategories(userId);

  const rta = categories.find((c) => c.name === SYSTEM_CATEGORY_NAMES.RTA);

  const uncategorised = categories.find(
    (c) => c.name === SYSTEM_CATEGORY_NAMES.UNCATEGORISED
  );

  if (!rta || !uncategorised) {
    throw new Error("Missing system categories");
  }

  return {
    rta: categoryMapper.toDomainSystemCategory(rta),
    uncategorised: categoryMapper.toDomainSystemCategory(uncategorised),
  };
};
