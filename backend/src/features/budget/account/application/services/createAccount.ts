import { Prisma } from "@prisma/client";
import { accountRepository } from "../../../../../shared/repository/accountRepositoryImpl";
import { DomainAccount } from "../../account.types";
import { accountMapper } from "../../account.mapper";
import { ZERO } from "../../../../../shared/constants/zero";
import { AddAccountPayload } from "../../account.schema";
import { accountService } from "../../account.service";

/**
 * Creates a new account within an existing database transaction.
 *
 * Determines the next available position for the account based on its type,
 * persists the account with an initial balance of zero, and maps it to a domain model.
 *
 * @param tx - Prisma transaction client
 * @param payload - Data required to create the account
 *
 * @returns The created account as a domain entity
 *
 * @throws {Error} Propagates any database or mapping errors
 */
export const createAccount = async (
  tx: Prisma.TransactionClient,
  payload: AddAccountPayload
): Promise<DomainAccount> => {
  try {
    const nextPosition = await accountService.getNextPosition(
      tx,
      payload.userId,
      payload.type
    );

    const row = await accountRepository.createAccount(tx, {
      ...payload,
      balance: ZERO,
      position: nextPosition,
    });

    return accountMapper.toDomainAccount(row);
  } catch (error) {
    throw error;
  }
};
