import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AddAccountPayload } from "../../dto";
import {
  initialiseAccount,
  selectAccounts,
  validateAccount,
  normalizeData,
  deleteAccountById,
} from "../../utility";
import { paramsSchema } from "../../schemas";

export const getAccounts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // TODO: what about pagination if there's loads of transactions?

  try {
    const accountsWithTransactions = await selectAccounts(req.user?._id!);

    const data = normalizeData({ accounts: accountsWithTransactions });

    res.status(200).json({ ...data });
  } catch (error) {
    next(error);
  }
};

export const addAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, type, balance } = <AddAccountPayload>req.body;

  try {
    const validatedAccount = validateAccount({
      userId: req.user!._id,
      name,
      type,
      balance,
    });

    await initialiseAccount(validatedAccount);

    res.status(200).json({ message: "Account added" });
  } catch (error) {
    next(error);
  }
};

export const editAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // TODO: use req query param to edit transaction
};

export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id;
  try {
    const { accountId } = paramsSchema.parse({ accountId: id });

    await deleteAccountById(accountId, req.user?._id!);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
