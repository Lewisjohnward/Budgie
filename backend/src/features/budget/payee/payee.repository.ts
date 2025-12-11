import { Prisma } from "@prisma/client";
import { Payee } from "./payee.types";

export interface PayeeRepository {
  // ──────────────── Payee Retrieval ────────────────

  getPayees(tx: Prisma.TransactionClient, userId: string): Promise<Payee[]>;

  getPayeeByIdAndUserId(
    tx: Prisma.TransactionClient,
    payeeId: string,
    userId: string
  ): Promise<Payee | null>;

  getPayeeByNameAndUserId(
    tx: Prisma.TransactionClient,
    userId: string,
    name: string,
    excludePayeeId?: string
  ): Promise<Payee | null>;

  countPayeesByIdsAndUserId(
    tx: Prisma.TransactionClient,
    payeeIds: string[],
    userId: string
  ): Promise<number>;

  // ──────────────── Payee Mutation ────────────────

  createPayee(
    tx: Prisma.TransactionClient,
    userId: string,
    name: string
  ): Promise<Payee>;

  updatePayee(
    tx: Prisma.TransactionClient,
    payeeId: string,
    data: {
      name?: string;
      defaultCategoryId?: string | null;
      automaticallyCategorisePayee?: boolean;
      includeInPayeeList?: boolean;
    }
  ): Promise<void>;

  updatePayees(
    tx: Prisma.TransactionClient,
    payeeIds: string[],
    data: {
      includeInPayeeList?: boolean;
    }
  ): Promise<void>;

  deletePayees(tx: Prisma.TransactionClient, payeeIds: string[]): Promise<void>;
}
