import { Request, Response, NextFunction } from "express";
import { DeleteTransactionPayload, TransactionPayload } from "../../dto";
import {
  duplicateTransactionsSchema,
  editTransactionArraySchema,
  transactionSchema,
} from "../../schemas";
import {
  deleteTransactions,
  insertduplicateTransactions,
  insertTransaction,
  updateTransactions,
  userOwnsAccount,
} from "../../utility";
import { z } from "zod";

export const addTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // TODO: need to calculate new account balance on addition

  // IF NO CATEGORY ASSIGN TO THIS NEEDS A CATEGORY

  const { accountId, categoryId, date, inflow, outflow, payeeId, memo } = <
    TransactionPayload
  >req.body;

  if (!inflow && !outflow) {
    res.status(400).json({ message: "Malformed data" });
    return;
  }

  try {
    const validTransaction = transactionSchema.parse({
      accountId,
      categoryId,
      date,
      inflow,
      outflow,
      payeeId,
      memo,
    });

    // TODO: - remove? insert where id = userId
    await userOwnsAccount(
      accountId,
      // TODO: remove the !
      req.user!._id,
    );

    await insertTransaction(req.user?._id!, validTransaction);
    res.status(200).json({ message: "Transaction added" });
  } catch (error) {
    next(error);
  }
};

export const editTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedTransactions = editTransactionArraySchema.parse(req.body);

    // TODO: MAYBE WRAP IN A TRANSACTION??
    for (const transaction of validatedTransactions) {
      await updateTransactions(req.user?._id!, transaction);
    }

    res.status(200).json({ message: "Transaction updated" });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { transactionIds } = <DeleteTransactionPayload>req.body;

  if (!transactionIds || transactionIds.length === 0) {
    res.status(400).json({ message: "No id provided" });
    return;
  }

  try {
    await deleteTransactions(req.user?._id!, transactionIds);

    res.status(200).json({ message: "Success" });
  } catch (error) {
    next(error);
  }
};

export const duplicateTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { transactionIds } = req.body;

  try {
    const validatedTransactionIds =
      duplicateTransactionsSchema.parse(transactionIds);

    await insertduplicateTransactions(req.user!._id, validatedTransactionIds);
    res.status(200).json({ message: "Transaction dupliacated" });
  } catch (error) {
    next(error);
  }
};
