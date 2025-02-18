import { z } from "zod";

export const signupSchema = z.object({
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

const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    return { message: "This field is required" };
  }
  return { message: ctx.defaultError };
};

z.setErrorMap(customErrorMap);

export type SignUpType = z.infer<typeof signupSchema>;
