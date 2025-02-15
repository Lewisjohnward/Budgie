import { z } from "zod";

export const registerUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(
      12,
      "Password must be at least 12 characters long and contain at least one number or symbol",
    )
    .max(64, "Password must be no more than 64 characters long")
    .regex(
      /(?=.*[0-9!@#$%^&*()_+{}[\]:;<>,.?/~`-])/,
      "Password must contain at least one number or symbol",
    ),
});
