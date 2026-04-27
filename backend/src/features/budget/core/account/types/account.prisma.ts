import type { Account as PrismaAccount } from "@prisma/client";

/**
 * Represents an account as returned directly by Prisma.
 *
 * This type reflects the database schema for the `Account` table
 * without any domain transformations or branding.
 */
export type Account = PrismaAccount;
