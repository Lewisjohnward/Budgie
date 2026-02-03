import { type Transaction as PrismaTransaction } from "@prisma/client";

/**
 * Represents a transaction record as stored in the database.
 *
 * This type is a direct alias for the Prisma-generated `Transaction` model,
 * including all fields defined in the Prisma schema.
 */
export type Transaction = PrismaTransaction;
