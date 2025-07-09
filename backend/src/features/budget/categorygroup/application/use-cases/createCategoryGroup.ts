import { prisma } from "../../../../../shared/prisma/client";
import { CategoryGroupPayload } from "../../categorygroup.schema";

export const createCategoryGroup = async (
  categoryGroup: CategoryGroupPayload,
) => {
  const newCategoryGroup = await prisma.categoryGroup.create({
    data: categoryGroup,
  });
};
