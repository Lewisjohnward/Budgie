import { z } from "zod";
import { passwordSchema } from "./passwordSchema";

export const registerUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: passwordSchema,
});
