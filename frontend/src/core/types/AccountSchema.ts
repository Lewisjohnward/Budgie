import { z } from "zod";

export const AccountTypeEnum = z.enum(["BANK", "CREDIT_CARD"]);

// TODO: this needs to be shared between fe and be
export const AccountSchema = z.object({
  name: z.string().min(1, { message: "Account name is required" }),
  type: AccountTypeEnum,
  balance: z
    .string()
    .refine((val) => val.trim() !== "", {
      message: "Cannot be empty",
    })
    .transform((val) => Number(val) || 0),
});

export type AddAccountPayload = z.infer<typeof AccountSchema>;
