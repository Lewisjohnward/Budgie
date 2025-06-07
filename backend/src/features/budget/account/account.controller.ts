import { Request, Response, NextFunction } from "express";
import { accountService } from "./account.service";
import { accountSchema, paramsSchema } from "./account.schema";
import { normaliseAccounts } from "./utils/normaliseAccounts";

export const getAccounts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // TODO: what about pagination if there's loads of transactions?

  try {
    const accountsWithTransactions = await accountService.getAccounts(
      req.user?._id!,
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
  next: NextFunction,
) => {
  try {
    const payload = accountSchema.parse({
      userId: req.user?._id,
      ...req.body,
    });

    await accountService.initialiseNewAccount(payload);

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

    await accountService.deleteAccount(accountId, req.user?._id!);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
