import { z } from "zod";

export const paramsSchema = z.object({
  accountId: z.string().uuid({ message: "Invalid UUID format" }),
});
