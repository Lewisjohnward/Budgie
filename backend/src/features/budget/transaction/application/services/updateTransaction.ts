import { Prisma } from "@prisma/client";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";
import {
  TransferTransactionEntity,
  NormalTransactionEntity,
} from "../../transaction.types";

export async function updateTransferTransaction(
  tx: Prisma.TransactionClient,
  transactionId: string,
  data: Record<string, any>
): Promise<TransferTransactionEntity> {
  const updatedTransaction = await transactionRepository.updateTransaction(
    tx,
    transactionId,
    data
  );

  return updatedTransaction as TransferTransactionEntity;
}

export async function updateNormalTransaction(
  tx: Prisma.TransactionClient,
  transactionId: string,
  data: Record<string, any>
): Promise<NormalTransactionEntity> {
  const updatedTransaction = await transactionRepository.updateTransaction(
    tx,
    transactionId,
    data
  );

  return updatedTransaction as NormalTransactionEntity;
}
