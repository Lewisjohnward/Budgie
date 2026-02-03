import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";

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
    z.instanceof(Decimal)
  ),
});

export type AddAccountPayload = z.output<typeof addAccountSchema>;
export type DeleteAccountPayload = z.output<typeof deleteAccountSchema>;
export type EditAccountPayload = z.output<typeof editAccountSchema>;
