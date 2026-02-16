import { AddAccountPayload } from "../account.schema";

/**
 * Payload for creating a new account, including the position index.
 */
export type CreateAccountPayloadWithPosition = AddAccountPayload & {
  position: number;
};
