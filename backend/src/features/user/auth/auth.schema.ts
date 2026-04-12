import { z } from "zod";

/**
 * Base password validation schema enforcing security rules:
 * - 12–64 characters
 * - Must include at least one number or symbol
 */
const basePasswordSchema = z
  .string()
  .min(
    12,
    "Password must be at least 12 characters long and contain at least one number or symbol"
  )
  .max(64, "Password must be no more than 64 characters long")
  .regex(
    /(?=.*[0-9!@#$%^&*()_+{}[\]:;<>,.?/~`-])/,
    "Password must contain at least one number or symbol"
  );

export const passwordSchema = basePasswordSchema;

/**
 * Validation schema for user registration.
 *
 * Requires a valid email and a strong password.
 */
export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: passwordSchema,
});

/**
 * Payload type inferred from registerSchema.
 */
export type RegisterPayload = z.infer<typeof registerSchema>;

/**
 * Validation schema for password change requests.
 *
 * Ensures:
 * - Current password is provided
 * - New password meets security requirements
 * - New password differs from current password
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: basePasswordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

/**
 * Validation schema for login requests.
 *
 * Requires a valid email and non-empty password.
 */
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginPayload = z.infer<typeof loginSchema>;
