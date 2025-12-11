import { Request, Response, NextFunction } from "express";
import {
  deleteTransactionSchema,
  duplicateTransactionsSchema,
  editTransactionArraySchema,
  editSingleTransactionSchema,
  editBulkTransactionsSchema,
  transactionSchema,
} from "./transaction.schema";
import { transactionUseCase } from "./transaction.useCase";

export const addTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transactionPayload = transactionSchema.parse(req.body);

    await transactionUseCase.insertTransaction(
      req.user?._id!,
      transactionPayload
    );
    res.status(200).json({ message: "Transaction added" });
  } catch (error) {
    next(error);
  }
};

export const editTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = editTransactionArraySchema.parse({
      userId: req.user?._id,
      ...req.body,
    });

    await transactionUseCase.updateTransactions(payload);

    res.status(200).json({ message: "Transactions updated" });
  } catch (error) {
    next(error);
  }
};

export const deleteTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = deleteTransactionSchema.parse({
      userId: req.user?._id,
      ...req.body,
    });

    await transactionUseCase.deleteTransactions(payload);

    res.status(200).json({ message: "Success" });
  } catch (error) {
    next(error);
  }
};

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
 * Updates a single transaction with partial fields.
 * Transaction ID comes from URL parameter (req.params.id).
 */

export const editSingleTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transactionId = req.params.id;
    const payload = editSingleTransactionSchema.parse(req.body);

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
 * Currently supports updating categoryId and accountId.
 */

export const editTransactionsBulk = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = editBulkTransactionsSchema.parse(req.body);

    await transactionUseCase.editTransactions(req.user?._id!, payload);

    res.status(200).json({ message: "Transactions updated" });
  } catch (error) {
    next(error);
  }
};
