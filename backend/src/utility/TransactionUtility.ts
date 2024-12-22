import { PrismaClient } from "@prisma/client";
import { TransactionPayload } from "../dto";

const prisma = new PrismaClient();

export const isValidISODate = (isoString: string) => {
  const date = new Date(isoString);
  return !isNaN(date.getTime());
};

export const insertTransaction = async (transaction: TransactionPayload) => {
  const insertedTransaction = await prisma.transaction.create({
    data: { ...transaction },
  });
};
