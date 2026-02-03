import { Prisma } from "@prisma/client";
import { db, type PayeeId } from "./payee.types";
import { type CategoryId } from "../category/category.types";
import { type UserId } from "../../user/auth/auth.types";

export interface PayeeRepository {
  // ──────────────── Payee Retrieval ────────────────

  getPayees(tx: Prisma.TransactionClient, userId: UserId): Promise<db.Payee[]>;

  getPayeeByIdAndUserId(
    tx: Prisma.TransactionClient,
    payeeId: PayeeId,
    userId: UserId
  ): Promise<db.Payee | null>;

  /**
   * Finds a payee by name for a specific user.
   *
   * Optionally ignores a specific payee ID, used when checking for duplicates during updates.
   */
  getPayeeByNameAndUserId(
    tx: Prisma.TransactionClient,
    userId: UserId,
    name: string,
    excludePayeeId?: PayeeId
  ): Promise<db.Payee | null>;

  countPayeesByIdsAndUserId(
    tx: Prisma.TransactionClient,
    payeeIds: PayeeId[],
    userId: UserId
  ): Promise<number>;

  // ──────────────── Payee Mutation ────────────────

  createPayee(
    tx: Prisma.TransactionClient,
    userId: UserId,
    name: string
  ): Promise<db.Payee>;

  updatePayee(
    tx: Prisma.TransactionClient,
    payeeId: PayeeId,
    data: {
      name?: string;
      defaultCategoryId?: CategoryId | null;
      automaticallyCategorisePayee?: boolean;
      includeInPayeeList?: boolean;
    }
  ): Promise<void>;

  updatePayees(
    tx: Prisma.TransactionClient,
    payeeIds: PayeeId[],
    data: {
      includeInPayeeList?: boolean;
    }
  ): Promise<void>;

  deletePayees(
    tx: Prisma.TransactionClient,
    payeeIds: PayeeId[]
  ): Promise<void>;
}
