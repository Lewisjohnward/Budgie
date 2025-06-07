import { Request, Response, NextFunction } from "express";
import {
  duplicateTransactionsSchema,
  editTransactionArraySchema,
  transactionSchema,
} from "./transaction.schema";
import { accountService } from "../account/account.service";
import { transactionService } from "./transaction.service";

export const addTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // TODO: need to calculate new account balance on addition

  // IF NO CATEGORY ASSIGN TO THIS NEEDS A CATEGORY
  try {
    const transactionPayload = transactionSchema.parse(req.body);

    // TODO: - remove? insert where id = userId
    await accountService.checkUserOwnsAccount(
      transactionPayload.accountId,
      // TODO: remove the !
      req.user!._id,
    );

    await transactionService.insertTransaction(
      req.user?._id!,
      transactionPayload,
    );
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

    await transactionService.updateTransactions(
      req.user!._id,
      validatedTransactions,
    );

    res.status(200).json({ message: "Transactions updated" });
  } catch (error) {
    next(error);
  }
};

export const deleteTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { transactionIds } = req.body;

  if (!transactionIds || transactionIds.length === 0) {
    res.status(400).json({ message: "No ids provided" });
    return;
  }

  try {
    // need to check to make sure that client is giving uuids[]
    await transactionService.deleteTransactions(req.user?._id!, transactionIds);

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
  try {
    const duplicateTransactionsPayload = duplicateTransactionsSchema.parse(
      req.body,
    );

    await transactionService.insertDuplicateTransactions(
      req.user!._id,
      duplicateTransactionsPayload.transactionIds,
    );
    res.status(200).json({ message: "Transaction duplicated" });
  } catch (error) {
    next(error);
  }
};
