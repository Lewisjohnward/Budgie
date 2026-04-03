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

export const editAccountSchema = z
  .object({
    userId: z.string().uuid(),
    accountId: z.string().uuid({ message: "Invalid UUID format" }),

    name: z
      .string()
      .nonempty({ message: "Account name cannot be empty" })
      .optional(),

    balance: z
      .preprocess(
        (val) => {
          if (val === undefined || val === null || val === "") return undefined;

          try {
            return new Decimal(val as any);
          } catch {
            return NaN; // force failure in refine
          }
        },
        z.any().refine((val) => val instanceof Decimal && !val.isNaN(), {
          message: "Balance must be a valid number",
        })
      )
      .optional(),
  })
  .refine(
    (data) => {
      const definedCount = [data.name, data.balance].filter(
        (v) => v !== undefined
      ).length;

      return definedCount >= 1;
    },
    {
      message: "Provide exactly one of: name or balance",
    }
  );

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
