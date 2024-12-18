import { Request, Response, NextFunction } from "express";
import { AccountType, PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

export const data = async (req: Request, res: Response, next: NextFunction) => {
  // Be mindful of the amount of data you're fetching.
  // If your User has a lot of related data (e.g., many Budgets, Accounts, Categories, and Transactions), this query could return a lot of data. Use pagination or filtering if necessary to reduce the response size.

  // Error Handling: Ensure you handle cases
  // where the user might not exist (e.g., when no user is found for the given userId).

  // TODO: Need to remove password from being returned

  const data = await prisma.user.findUnique({
    where: { id: req.user?._id }, // Use the user ID to find the specific user
    include: {
      budgets: {
        include: {
          categories: {
            include: {
              transactions: true, // Include transactions for each category
            },
          },
          transactions: true, // Include transactions for the budget
        },
      },
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

  const AccountTypeEnum = z.enum(["BANK", "CREDIT_CARD"]);

export const accountSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1, { message: "Account name is required" }),
  type: AccountTypeEnum,
  balance: z.coerce.number(),
});

export const addAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {

  const { name, type, balance } = req.body;

  if (!name || !type || !balance) {
    res.status(400).json({ message: "Malformed data" });
    return;
  }

  try {
    const validatedAccount = accountSchema.parse({
      userId: req.user!._id,
      name,
      type,
      balance,
    });

    await prisma.account.create({
      data: {
        ...validatedAccount,
      },
    });

    res.status(200).json({ message: "Account added" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Malformed data" });
      return;
    }
    res.status(400).json({ message: "Error adding account" });
  }
};
