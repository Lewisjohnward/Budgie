import { AccountDto, type DomainAccount } from "../account.types";

/**
 * Maps a domain account entity into a DTO representation for API responses.
 *
 * @param account - The domain account entity.
 * @returns A DTO-safe account object for client consumption.
 */
export const toAccountDto = (account: DomainAccount): AccountDto => {
  return {
    id: account.id,
    name: account.name,
    position: account.position,
    open: account.open,
    type: account.type,
    balance: Number(account.balance),
    deletable: account.deletable,
  };
};
