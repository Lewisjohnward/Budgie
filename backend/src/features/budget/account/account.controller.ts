import { Request, Response, NextFunction } from "express";
import {
  addAccountSchema,
  deleteAccountSchema,
  editAccountSchema,
} from "./account.schema";
import { normaliseAccounts } from "./utils/normaliseAccounts";
import { accountUseCase } from "./account.useCase";

export const getAccounts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO: what about pagination if there's loads of transactions?

  try {
    const accountsWithTransactions = await accountUseCase.getAccounts(
      req.user?._id!
    );

    const data = normaliseAccounts({ accounts: accountsWithTransactions });

    res.status(200).json({ ...data });
  } catch (error) {
    next(error);
  }
};

export const addAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = addAccountSchema.parse({
      userId: req.user?._id,
      ...req.body,
    });

    await accountUseCase.createAccount(payload);

    res.status(200).json({ message: "Account added" });
  } catch (error) {
    next(error);
  }
};

export const editAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //TODO: NEED TO CHECK THAT USER IS EITHER UPDATING NAME OR ADJUSTING BALANCE, OTHERWISE WASTE OF TIME

    const payload = editAccountSchema.parse({
      userId: req.user?._id,
      ...req.body,
    });

    await accountUseCase.editAccount(payload);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = deleteAccountSchema.parse({
      userId: req.user?._id,
      ...req.body,
    });

    await accountUseCase.deleteAccount(payload);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
