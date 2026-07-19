import { type Request, type Response, type NextFunction } from "express";
import { seeds } from "./test.seeds";
import { prisma } from "../shared/prisma/client";

export const reset = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await prisma.$executeRawUnsafe(`
  TRUNCATE TABLE
    "Transaction",
    "Month",
    "Category",
    "CategoryGroup",
    "Account",
    "Payee",
    "MonthMemo",
    "User"
  RESTART IDENTITY CASCADE;
`);

    res.json({
      message: "database reset",
    });
  } catch (error) {
    next(error);
  }
};

export const seed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const seedName = req.params.seedName;
    const seedFn = seeds[seedName as keyof typeof seeds];

    if (!seedFn) {
      res.status(404).json({
        message: `Unknown seed: ${seedName}`,
      });
      return;
    }

    const credentials = await prisma.$transaction(async (tx) => {
      return await seedFn(tx);
    });

    res.json({
      message: `Seeded '${seedName}'`,
      credentials,
    });
  } catch (error) {
    next(error);
  }
};
