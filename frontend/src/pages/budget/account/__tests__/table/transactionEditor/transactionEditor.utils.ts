import { CreateTransactionInput } from "@/core/api/budget/transaction/types";
import {
  ApiAccount,
  ApiBudgetSnapshot,
  ApiMemo,
  ApiMonth,
  ApiPayee,
  ApiTransaction,
  CreateTransactionResponse,
} from "@/core/types/exported-types";

export function calculateCreateTransactionResult(
  snapshot: ApiBudgetSnapshot,
  request: CreateTransactionInput
): CreateTransactionResponse {
  const { accountId, transferAccountId, payeeId, payeeName, categoryId } =
    request;

  const date = request.date ?? new Date().toISOString();
  const memo = request.memo?.trim() ?? "";

  const inflow = Number(request.inflow ?? "0");
  const outflow = Number(request.outflow ?? "0");

  if (!Number.isFinite(inflow) || !Number.isFinite(outflow)) {
    throw new Error("Transaction amounts must be valid numbers");
  }

  if ((request.inflow === undefined) === (request.outflow === undefined)) {
    throw new Error("Provide exactly one of inflow or outflow");
  }

  const sourceAccount = snapshot.accounts[accountId];

  if (!sourceAccount) {
    throw new Error(`Account not found: ${accountId}`);
  }

  const updatedAccounts: Record<string, ApiAccount> = {
    [sourceAccount.id]: {
      ...sourceAccount,
      balance: sourceAccount.balance + inflow - outflow,
    },
  };

  const createdMonths: Record<string, ApiMonth> = {};
  const updatedMonths: Record<string, ApiMonth> = {};
  const createdMemos: ApiMemo[] = [];

  const monthKey = date.slice(0, 7);

  function getOrCreateMonth(targetCategoryId: string): ApiMonth {
    const existingMonth = Object.values(snapshot.months).find(
      (month) =>
        month.categoryId === targetCategoryId && month.month === monthKey
    );

    if (existingMonth) {
      return (
        updatedMonths[existingMonth.id] ??
        (updatedMonths[existingMonth.id] = {
          ...existingMonth,
        })
      );
    }

    const newMonth: ApiMonth = {
      id: crypto.randomUUID(),
      categoryId: targetCategoryId,
      month: monthKey,
      activity: 0,
      assigned: 0,
      available: 0,
    };

    createdMonths[newMonth.id] = newMonth;

    return newMonth;
  }

  function updateMonthActivity(targetCategoryId: string, amount: number) {
    const month = getOrCreateMonth(targetCategoryId);

    month.activity += amount;
    month.available += amount;
  }

  function getOrCreatePayee(): {
    payeeId: string | null;
    createdPayee?: ApiPayee;
  } {
    if (payeeId) {
      if (!snapshot.payees[payeeId]) {
        throw new Error(`Payee not found: ${payeeId}`);
      }

      return { payeeId };
    }

    if (!payeeName?.trim()) {
      return { payeeId: null };
    }

    const normalizedName = payeeName.trim();

    const existingPayee = Object.values(snapshot.payees).find(
      (payee) =>
        payee.name.trim().toLowerCase() === normalizedName.toLowerCase()
    );

    if (existingPayee) {
      return { payeeId: existingPayee.id };
    }

    const newPayee: ApiPayee = {
      id: crypto.randomUUID(),
      name: normalizedName,
      origin: "USER",
      defaultCategoryId: null,
      includeInPayeeList: true,
      automaticallyCategorisePayee: false,
    };

    return {
      payeeId: newPayee.id,
      createdPayee: newPayee,
    };
  }

  const resolvedPayee = transferAccountId
    ? { payeeId: null as string | null }
    : getOrCreatePayee();

  let createdTransactions: CreateTransactionResponse["created"]["transactions"];

  if (transferAccountId) {
    if (transferAccountId === accountId) {
      throw new Error("Cannot transfer money to the same account");
    }

    if (payeeId || payeeName || categoryId) {
      throw new Error("Transfers cannot specify a payee or category");
    }

    const destinationAccount = snapshot.accounts[transferAccountId];

    if (!destinationAccount) {
      throw new Error(`Destination account not found: ${transferAccountId}`);
    }

    const sourceTransactionId = crypto.randomUUID();
    const destinationTransactionId = crypto.randomUUID();

    const sourceTransaction: ApiTransaction = {
      type: "transfer",
      id: sourceTransactionId,
      accountId,
      payeeId: null,
      date,
      memo,
      inflow,
      outflow,
      transferAccountId,
      transferTransactionId: destinationTransactionId,
    };

    const destinationTransaction: ApiTransaction = {
      type: "transfer",
      id: destinationTransactionId,
      accountId: transferAccountId,
      payeeId: null,
      date,
      memo,
      inflow: outflow,
      outflow: inflow,
      transferAccountId: accountId,
      transferTransactionId: sourceTransactionId,
    };

    updatedAccounts[destinationAccount.id] = {
      ...destinationAccount,
      balance: destinationAccount.balance + outflow - inflow,
    };

    createdTransactions = {
      type: "transfer",
      source: sourceTransaction,
      destination: destinationTransaction,
    };
  } else {
    const resolvedCategoryId =
      categoryId ??
      (resolvedPayee.payeeId
        ? snapshot.payees[resolvedPayee.payeeId]?.automaticallyCategorisePayee
          ? snapshot.payees[resolvedPayee.payeeId].defaultCategoryId
          : null
        : null) ??
      snapshot.categories.uncategorised.id;

    const transaction: ApiTransaction = {
      type: "normal",
      id: crypto.randomUUID(),
      accountId,
      categoryId: resolvedCategoryId,
      payeeId: resolvedPayee.payeeId,
      date,
      memo,
      inflow,
      outflow,
    };

    updateMonthActivity(resolvedCategoryId, inflow - outflow);

    createdTransactions = {
      type: "normal",
      transaction,
    };
  }

  // Create the monthly memo if one does not already exist.
  if (!snapshot.memosByMonth[monthKey]) {
    createdMemos.push({
      id: crypto.randomUUID(),
      month: monthKey,
      content: "",
    });
  }

  return {
    created: {
      transactions: createdTransactions,
      ...(resolvedPayee.createdPayee
        ? { payee: resolvedPayee.createdPayee }
        : {}),
      memos: createdMemos,
      months: createdMonths,
    },
    updated: {
      accounts: updatedAccounts,
      months: updatedMonths,
    },
  };
}
