import { AddAccountPayload } from "../account.schema";
import { AccountType } from "../account.types";

/**
 * Payload for creating a new account, including the position index.
 */
export type CreateAccountPayloadWithPosition = AddAccountPayload & {
  position: number;
};

/**
 * Represents a user-owned account in the domain.
 * All fields are readonly to enforce immutability.
 */
export type AccountDto = Readonly<{
  id: string;
  name: string;
  position: number;
  open: boolean;
  type: AccountType;
  balance: number;
  deletable: boolean;
}>;
