import { PrismaClient } from "@prisma/client";
import { CategoryGroupPayload } from "../../../schemas/CategorySchema";

const prisma = new PrismaClient();

export const createCategoryGroup = async (
  categoryGroup: CategoryGroupPayload,
) => {
  const newCategoryGroup = await prisma.categoryGroup.create({
    data: categoryGroup,
  });
};
