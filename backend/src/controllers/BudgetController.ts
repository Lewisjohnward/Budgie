import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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

  return;
};
