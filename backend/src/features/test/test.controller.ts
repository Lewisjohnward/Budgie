import { Request, Response, NextFunction } from "express";
import { prisma } from "../../shared/prisma/client";
import { seedDeleteCategoryBase } from "./scenarios/seedDeleteCategoryBase";
import { seedLogin } from "./scenarios/auth/login";

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

const scenarios = {
  login: seedLogin,
  "delete-category-base": seedDeleteCategoryBase,
} as const;

export const seed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { scenario } = req.params;
    const seedScenario = scenarios[scenario as keyof typeof scenarios];

    if (!seedScenario) {
      res.status(404).json({
        message: `Unknown test scenario: ${scenario}`,
      });
      return;
    }

    const credentials = await prisma.$transaction(async (tx) => {
      return await seedScenario(tx);
    });

    res.json({
      message: `Seeded '${scenario}'`,
      credentials,
    });
  } catch (error) {
    next(error);
  }
};
