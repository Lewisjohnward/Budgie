import { UpdatedTransaction } from "../../../schemas";

export const updateTransactions = async (
  userId: string,
  updatedTransaction: UpdatedTransaction,
) => {
  const { id: id, ...fields } = updatedTransaction;

  return;

  // await prisma.transaction.update({
  //   where: {
  //     id: id,
  //     account: {
  //       userId,
  //     },
  //   },
  //   data: {
  //     ...fields,
  //   },
  // });
};
