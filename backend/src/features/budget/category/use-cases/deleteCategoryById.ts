import { prisma } from "../../../../shared/prisma/client";
import { DeleteCategoryPayload } from "../category.schema";

export const deleteCategoryById = async ({
  userId,
  categoryToDeleteId,
  inheritingCategoryId,
}: DeleteCategoryPayload) => {
  // TODO: THIS WOULD THROW IF USER HAS A CATEGORY WITH SAME NAME IN ANOTHER CATEGORY GROUP?
  const categoryToDelete = await prisma.category.findUnique({
    where: {
      id: categoryToDeleteId,
      userId,
    },
    include: {
      months: {
        orderBy: {
          month: "asc",
        },
      },
      transactions: true,
    },
  });

  if (!categoryToDelete) {
    // TODO: create custom error
    throw new Error("no category found to delete");
  }

  const { months, transactions } = categoryToDelete;

  const monthHasAssignedMoney = !months.every(
    (month) => month.assigned.toNumber() === 0,
  );

  // HANDLE CASE WHEN A CATEGORY HAS NO TRANSACTIONS AND NO ASSIGNED
  if (transactions.length === 0) {
    if (!monthHasAssignedMoney) {
      // TODO: THIS NEEDS TO BE IN A TRANSACTION
      await prisma.month.deleteMany({
        where: {
          categoryId: categoryToDelete.id,
        },
      });

      await prisma.category.delete({
        where: {
          id: categoryToDelete.id,
          userId,
        },
      });
      return;
    } else if (monthHasAssignedMoney) {
      const readyToAssignCategory = await prisma.category.findFirstOrThrow({
        where: {
          name: "Ready to Assign",
          userId,
        },
        include: {
          months: true,
        },
      });

      // CALCULATE CHANGE IN ASSIGNED
      const changeInAssigned = months.reduce(
        (acc, month) => acc + month.assigned.toNumber(),
        0,
      );

      // TODO: THIS NEEDS TO BE IN A TRANSACTION
      await prisma.month.updateMany({
        where: {
          categoryId: readyToAssignCategory.id,
          month: {
            gte: months[0].month,
          },
        },
        data: {
          activity: {
            increment: months.reduce(
              (acc, month) => acc + month.assigned.toNumber(),
              0,
            ),
          },
        },
      });

      await prisma.month.deleteMany({
        where: {
          categoryId: categoryToDelete.id,
        },
      });

      await prisma.category.delete({
        where: {
          id: categoryToDelete.id,
          userId,
        },
      });
      return;
    }
  }

  // if (transactions.length === 0 && monthHasAssignedMoney) {
  //   if (!monthHasAssignedMoney)
  //     await prisma.month.deleteMany({
  //       where: {
  //         categoryId: categoryToDelete.id,
  //       },
  //     });

  //   await prisma.category.delete({
  //     where: {
  //       id: categoryToDelete.id,
  //       userId,
  //     },
  //   });
  // }

  // if (transactions.length > 0 && !inheritingCategoryId) {
  //   // TODO: throw error CATEGORYHASTRANSACTIONSNOINHERITINGCATEGORYERROR

  //   throw new Error("Category has transactions and no inheriting category");
  //   return;
  // }
};
