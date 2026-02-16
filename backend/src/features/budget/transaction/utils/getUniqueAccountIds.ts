import { type AccountId } from "../../account/account.types";

/**
 * Extracts all unique, non-null account IDs from a list of transactions.
 */
export function getUniqueAccountIds(
  txs: Array<{ accountId?: AccountId | null }>
): AccountId[] {
  return [
    ...new Set(
      txs.map((tx) => tx.accountId).filter((id): id is AccountId => id != null)
    ),
  ];
}
