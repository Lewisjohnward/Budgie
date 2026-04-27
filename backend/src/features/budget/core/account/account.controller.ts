import { Request, Response, NextFunction } from "express";
import {
  addAccountSchema,
  deleteAccountSchema,
  editAccountSchema,
  toggleAccountCloseSchema,
} from "./account.schema";
import { normaliseAccounts } from "./utils/normaliseAccounts";
import { accountUseCase } from "./account.useCase";

/**
 * Retrieves all accounts for the current user, including their transactions.
 * The response is normalised for consumption by the frontend.
 */
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

/**
 * Creates a new account for the current user.
 * The payload is validated and normalized before being passed to the use case.
 */
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

/**
 * Updates an existing account with new values.
 * The account ID is provided as a URL parameter.
 * Supports updating multiple fields at once via the validated payload.
 */
export const editAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accountId = req.params.id;

    const payload = editAccountSchema.parse({
      userId: req.user?._id,
      accountId,
      ...req.body,
    });

    await accountUseCase.editAccount(payload);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes an account for the current user.
 * The account ID is provided as a URL parameter.
 */
export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accountId = req.params.id;
    const payload = deleteAccountSchema.parse({
      userId: req.user?._id,
      accountId,
    });

    await accountUseCase.deleteAccount(payload);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

/**
 * Toggles the "closed" state of an account.
 * If the account is open, it will be closed (balance zeroed and a zeroing transaction added).
 * If the account is closed, it will be reopened.
 * The account ID is provided as a URL parameter.
 */
export const toggleAccountClose = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?._id!;
  const accountId = req.params.id;
  try {
    const payload = toggleAccountCloseSchema.parse({
      userId,
      accountId,
    });

    await accountUseCase.toggleAccountOpen(payload);

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
