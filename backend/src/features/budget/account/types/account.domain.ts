import { Decimal } from "@prisma/client/runtime/library";
import { Brand } from "../../../../shared/types/brand";
import { UserId } from "../../../user/auth/auth.types";

/**
 * Strongly-typed Account ID.
 * Used to prevent mixing with other string IDs in the domain.
 */
export type AccountId = Brand<string, "AccountId">;
export const asAccountId = (id: string) => id as AccountId;

/**
 * Supported account types in the system.
 */
export type AccountType = "BANK" | "CREDIT_CARD";

/**
 * Represents a user-owned account in the domain.
 * All fields are readonly to enforce immutability.
 */
export type DomainAccount = Readonly<{
  id: AccountId;
  name: string;
  position: number;
  userId: UserId;
  open: boolean;
  type: AccountType;
  balance: Decimal;
  deletable: boolean;
}>;
