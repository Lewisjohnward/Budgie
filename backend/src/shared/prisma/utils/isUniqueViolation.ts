import { Prisma } from "@prisma/client";

/**
 * Prisma helper: detects unique constraint violations (P2002)
 */
export const isUniqueViolation = (
  e: unknown
): e is Prisma.PrismaClientKnownRequestError => {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"
  );
};
