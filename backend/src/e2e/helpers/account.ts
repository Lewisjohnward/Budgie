import { type Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { accountService } from "../../features/budget/core/account/account.service";
import { type DomainAccount } from "../../features/budget/core/account/account.types";
import { type UserId } from "../../features/user/auth/auth.types";

type CreateBankAccountOptions = {
  name: string;
  balance: number;
};

export const createBankAccount = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  { name, balance }: CreateBankAccountOptions
): Promise<DomainAccount> => {
  const account = await accountService.createAndInitialiseAccount(tx, {
    userId: userId,
    name,
    type: "BANK",
    balance: new Decimal(balance),
  });

  return account;
};
