import { z } from "zod";

export const AccountTypeEnum = z.enum(["BANK", "CREDIT_CARD"]);

export const accountSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1, { message: "Account name is required" }),
  type: AccountTypeEnum,
  balance: z.coerce.number(),
});
