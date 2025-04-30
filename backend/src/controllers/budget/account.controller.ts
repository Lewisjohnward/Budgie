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

// DONE
export const getAccounts = async (req: Request, res: Response) => {
  // TODO: what about pagination if there's loads of transactions?

  try {
    const accountsWithTransactions = await selectAccounts(req.user?._id!);

    const data = normalizeData({ accounts: accountsWithTransactions });

    res.status(200).json({ ...data });
  } catch (error) {
    res.status(500).json({ message: "There has been an error" });
  }
  return;
};

// DONE
export const addAccount = async (req: Request, res: Response) => {
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
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Malformed data" });
      return;
    }
    res.status(500).json({ message: "Error adding account" });
  }
};

export const editAccount = async (req: Request, res: Response) => {
  // TODO: use req query param to edit transaction
};

export const deleteAccount = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const { accountId } = paramsSchema.parse({ accountId: id });

    await deleteAccountById(accountId, req.user?._id!);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: "Error deleting account" });
  }
};
