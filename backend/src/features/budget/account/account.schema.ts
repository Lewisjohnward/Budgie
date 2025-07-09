import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";
import { CategoryGroup, Transaction } from "../../../shared/types/db";

export const deleteAccountSchema = z.object({
  userId: z.string().uuid(),
  accountId: z.string().uuid({ message: "Invalid UUID format" }),
});

export const editAccountSchema = z.object({
  userId: z.string().uuid(),
  accountId: z.string().uuid({ message: "Invalid UUID format" }),

  name: z
    .string()
    .nonempty({ message: "Account name cannot be empty" })
    .optional(),
  balanceAdjustment: z
    .preprocess((val) => {
      if (val === undefined || val === null || val === "") return undefined;
      return new Decimal(val as any);
    }, z.instanceof(Decimal))
    .optional(),
});

export const AccountTypeEnum = z.enum(["BANK", "CREDIT_CARD"]);

export const addAccountSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1, { message: "Account name is required" }),
  type: AccountTypeEnum,
  balance: z.preprocess(
    (val) => new Decimal(val as any),
    z.instanceof(Decimal),
  ),
});

export type AddAccountPayload = z.infer<typeof addAccountSchema>;
export type DeleteAccountPayload = z.infer<typeof deleteAccountSchema>;
export type EditAccountSchema = z.infer<typeof editAccountSchema>;

type Account = Prisma.AccountGetPayload<{
  include: {
    transactions: {
      include: { category: { include: { categoryGroup: true } } };
    };
  };
}>;

export type NormalisedAccounts = {
  accounts: { [key: string]: NormalisedAccount };
  transactions: { [key: string]: NormalisedTransaction };
  categories: { [key: string]: NormalisedCategory };
  categoryGroups: { [key: string]: NormalisedCategoryGroup };
};

type NormalisedCategory = {
  id: string;
  userId: string;
  name: string;
  categoryGroupId: string | null;
};

type NormalisedAccount = Omit<Account, "transactions" | "balance"> & {
  transactions: string[];
  balance: number;
};

type NormalisedTransaction = Omit<
  Transaction,
  "category" | "inflow" | "outflow"
> & {
  category: string | null;
  inflow: number;
  outflow: number;
};

type NormalisedCategoryGroup = Omit<CategoryGroup, "categories">;
