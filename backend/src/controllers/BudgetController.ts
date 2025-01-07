import { Request, Response, NextFunction } from "express";
import { AccountType, CategoryType, PrismaClient } from "@prisma/client";
import { z } from "zod";
import { AddAccountInput, TransactionPayload } from "../dto";
import { accountSchema, transactionSchema } from "../schemas";
import {
  initialiseAccount,
  insertTransaction,
  normalizeData,
  selectAccounts,
  userOwnsAccount,
  validateAccount,
} from "../utility";

const prisma = new PrismaClient();
export const data = async (req: Request, res: Response) => {
  // Be mindful of the amount of data you're fetching.
  // If your User has a lot of related data (e.g., many Budgets, Accounts, Categories, and Transactions), this query could return a lot of data. Use pagination or filtering if necessary to reduce the response size.

  // Error Handling: Ensure you handle cases
  // where the user might not exist (e.g., when no user is found for the given userId).

  // TODO: Need to remove password from being returned

  const data = await prisma.user.findUnique({
    where: { id: req.user?._id }, // Use the user ID to find the specific user
    include: {
      // budgets: {
      //   include: {
      //     categories: {
      //       include: {
      //         transactions: true, // Include transactions for each category
      //       },
      //     },
      //     transactions: true, // Include transactions for the budget
      //   },
      // },
      accounts: {
        include: {
          transactions: true, // Include transactions for each account
        },
      },
    },
  });

  const user = await prisma.user.findUnique({
    select: {
      id: true,
      email: true,
    },
    where: { id: req.user?._id },
  });

  const accounts = await prisma.account.findMany({
    where: { userId: req.user?._id },
    include: {
      transactions: true,
    },
  });

  console.log(user);
  console.log(accounts);

  // const categories = await prisma.category.findMany({
  //   where: {}
  // })

  // res.status(200).json({ data });

  res.status(200).json({ user, accounts });
};

export const getAccounts = async (req: Request, res: Response) => {
  // TODO: what about pagination if there's loads of transactions?

  try {
    const accountsWithTransactions = await selectAccounts(req.user?._id!);

    const data = normalizeData({ accounts: accountsWithTransactions });

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: "There has been an error" });
  }
  return;
};

export const addAccount = async (req: Request, res: Response) => {
  const { name, type, balance } = <AddAccountPayload>req.body;

  if (!name || !type || !balance) {
    res.status(400).json({ message: "Malformed data" });
    return;
  }

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
  // TODO: use req query param to edit transaction
};

export const editTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // TODO: use req query param to edit transaction
};

export const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // TODO: use req query param to delete transaction
};

export const addTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // TODO: need to calculate new account balance on addition

  const { accountId, categoryId, date, inflow, outflow, payee, memo } = <
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
      payee,
      memo,
    });

    // TODO: this can probably go into middleware before account routes?
    await userOwnsAccount(
      accountId,
      // TODO: remove the !
      req.user!._id,
    );

    await insertTransaction(validTransaction);
    res.status(200).json({ message: "Transaction added" });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Malformed data" });
      return;
    }
    res.status(503).json({ message: "there has been an error" });
    return;
  }
};
