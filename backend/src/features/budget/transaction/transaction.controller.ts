import { Request, Response, NextFunction } from "express";
import {
  deleteTransactionsSchema,
  duplicateTransactionsSchema,
  editSingleTransactionSchema,
  editBulkTransactionsSchema,
  insertTransactionSchema,
} from "./transaction.schema";
import { transactionUseCase } from "./transaction.useCase";

/**
 * Inserts a single transaction.
 */
export const insertTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id!;
    const payload = insertTransactionSchema.parse(req.body);
    await transactionUseCase.insertTransaction({
      ...payload,
      userId,
    });
    res.status(200).json({ message: "Transaction added" });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes one or more transactions.
 */
export const deleteTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = deleteTransactionsSchema.parse({
      userId: req.user?._id,
      ...req.body,
    });

    await transactionUseCase.deleteTransactions(payload);

    res.status(200).json({ message: "Success" });
  } catch (error) {
    next(error);
  }
};

/**
 * Duplicates one or more transactions.
 */
export const duplicateTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = duplicateTransactionsSchema.parse({
      userId: req.user?._id,
      ...req.body,
    });

    await transactionUseCase.duplicateTransactions(payload);

    res.status(200).json({ message: "Transaction duplicated" });
  } catch (error) {
    next(error);
  }
};

/**
 * Updates a single transaction with new values.
 * The transaction ID is provided as a URL parameter.
 */
export const editSingleTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transactionId = req.params.id;
    const payload = editSingleTransactionSchema.parse({
      userId: req.user?._id,
      ...req.body,
    });

    await transactionUseCase.editTransaction(
      req.user?._id!,
      transactionId,
      payload
    );

    res.status(200).json({ message: "Transaction updated" });
  } catch (error) {
    next(error);
  }
};

/**
 * Updates multiple transactions in bulk with the same field values.
 * This is for applying the same change to many transactions at once, e.g., changing the category for all.
 */
export const editTransactionsBulk = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = editBulkTransactionsSchema.parse({
      userId: req.user?._id,
      ...req.body,
    });

    await transactionUseCase.editTransactions(payload);

    res.status(200).json({ message: "Transactions updated" });
  } catch (error) {
    next(error);
  }
};
