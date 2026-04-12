import type { User as PrismaUser } from "@prisma/client";

/**
 * ============================
 * Prisma payloads (DB shapes)
 * ============================
 *
 * This type represent data as it comes directly from Prisma
 */

/**
 * Represents a user record as stored in the database.
 *
 * This type is a direct alias for the Prisma-generated `User` model,
 * including all fields defined in the Prisma schema.
 */
export type User = PrismaUser;
