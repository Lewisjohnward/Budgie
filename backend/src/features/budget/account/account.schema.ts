import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";

export const deleteAccountSchema = z.object({
  userId: z.string().uuid(),
  accountId: z.string().uuid({ message: "Invalid UUID format" }),
});

export const toggleAccountCloseSchema = z.object({
  userId: z.string().uuid(),
  accountId: z.string().uuid({ message: "Invalid UUID format" }),
});

export const editAccountSchema = z.object({
  userId: z.string().uuid(),
  accountId: z.string().uuid({ message: "Invalid UUID format" }),
  updates: z
    .object({
      name: z
        .string()
        .nonempty({ message: "Account name cannot be empty" })
        .optional(),
      balance: z
        .preprocess((val) => {
          if (val === undefined || val === null || val === "") return undefined;
          return new Decimal(val as any);
        }, z.instanceof(Decimal))
        .optional(),
    })
    .refine(
      (data) => {
        const definedCount = Object.values(data).filter(
          (value) => value !== undefined
        ).length;

        return definedCount === 1;
      },
      {
        message: "Exactly one field must be provided for update",
      }
    ),
});

export const AccountTypeEnum = z.enum(["BANK", "CREDIT_CARD"]);

export const addAccountSchema = z.object({
  userId: z.string().uuid(),
  name: z
    .string()
    .trim()
    .min(1, { message: "Account name is required" })
    .max(50, { message: "Account name cannot exceed 50 characters" }),
  type: AccountTypeEnum,
  balance: z.preprocess((val) => {
    try {
      // convert to Decimal
      const dec = new Decimal(val as any);
      return dec.isNaN() ? new Decimal(0) : dec;
    } catch {
      // invalid input -> default to 0
      return new Decimal(0);
    }
  }, z.instanceof(Decimal)),
});

export type AddAccountInput = z.input<typeof addAccountSchema>;
export type AddAccountPayload = z.output<typeof addAccountSchema>;
export type DeleteAccountPayload = z.output<typeof deleteAccountSchema>;
export type EditAccountPayload = z.output<typeof editAccountSchema>;
export type ToggleAccountPayload = z.output<typeof toggleAccountCloseSchema>;
