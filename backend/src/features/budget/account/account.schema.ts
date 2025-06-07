import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";
import { CategoryGroup, Transaction } from "../../../shared/types/db";

export const paramsSchema = z.object({
  accountId: z.string().uuid({ message: "Invalid UUID format" }),
});

export const AccountTypeEnum = z.enum(["BANK", "CREDIT_CARD"]);

export const accountSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1, { message: "Account name is required" }),
  type: AccountTypeEnum,
  balance: z.preprocess(
    (val) => new Decimal(val as any),
    z.instanceof(Decimal),
  ),
});

export type AccountPayload = z.infer<typeof accountSchema>;

type Account = Prisma.AccountGetPayload<{
  include: {
    transactions: {
      include: { category: { include: { categoryGroup: true } } };
    };
  };
}>;

export type NormalizedAccounts = {
  accounts: { [key: string]: NormalizedAccount };
  transactions: { [key: string]: NormalizedTransaction };
  categories: { [key: string]: NormalizedCategory };
  categoryGroups: { [key: string]: NormalizedCategoryGroup };
};

type NormalizedCategory = {
  id: string;
  userId: string;
  name: string;
  categoryGroupId: string | null;
};

type NormalizedAccount = Omit<Account, "transactions" | "balance"> & {
  transactions: string[];
  balance: number;
};

type NormalizedTransaction = Omit<
  Transaction,
  "category" | "inflow" | "outflow"
> & {
  category: string | null;
  inflow: number;
  outflow: number;
};

type NormalizedCategoryGroup = Omit<CategoryGroup, "categories">;
