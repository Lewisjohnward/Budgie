import { Decimal } from "@prisma/client/runtime/library";
import { z } from "zod";

export const decimalFromString = (fieldName: string) =>
  z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      try {
        return new Decimal(val.trim());
      } catch {
        throw new Error(`Invalid ${fieldName} value: ${val}`);
      }
    });

export const singleNonZeroAmountRequired =
  <T extends { inflow?: Decimal; outflow?: Decimal }>() =>
    (data: T) => {
      const inflowProvided = data.inflow !== undefined;
      const outflowProvided = data.outflow !== undefined;

      // At least one provided
      if (!inflowProvided && !outflowProvided) return false;
      // At most one provided
      if (inflowProvided && outflowProvided) return false;

      // If provided, must be non-zero
      if (inflowProvided && data.inflow!.isZero()) return false;
      if (outflowProvided && data.outflow!.isZero()) return false;

      return true;
    };

export const singleNonZeroAmountOptional =
  <T extends { inflow?: Decimal; outflow?: Decimal }>() =>
    (data: T) => {
      const inflowProvided = data.inflow !== undefined;
      const outflowProvided = data.outflow !== undefined;

      // At most one provided
      if (inflowProvided && outflowProvided) return false;

      // If provided, must be non-zero
      if (inflowProvided && data.inflow!.isZero()) return false;
      if (outflowProvided && data.outflow!.isZero()) return false;

      return true;
    };
// create: undefined | uuid
export const categoryIdCreate = z.string().uuid();

export const memo = z
  .string()
  .max(100)
  .transform((val) => val.trim());

export const payeeName = z
  .string()
  .transform((val) => val.trim())
  .pipe(z.string().min(1).max(50));

export const dateFromIso = (fieldName: string) =>
  z
    .string()
    .datetime({ offset: true })
    .transform((val) => {
      const d = new Date(val);
      if (Number.isNaN(d.getTime())) {
        throw new Error(`Invalid ${fieldName} value: ${val}`);
      }
      return d;
    })
    .refine(
      (d) => {
        const now = new Date();
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setFullYear(now.getFullYear() - 1);
        return d >= twelveMonthsAgo && d <= now;
      },
      { message: `${fieldName} must be within the last 12 months` }
    );

export const dateNotInFuture = (data: { date?: Date }) =>
  !data.date || data.date <= new Date();
