import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { OperationMode } from "../../../../../../../../shared/enums/operation-mode";
import { categoryRepository } from "../../../../../../../../shared/repository/categoryRepositoryImpl";
import { asAccountId } from "../../../../../account/account.types";
import {
  DomainNormalTransaction,
  asTransactionId,
} from "../../../../../transaction/transaction.types";
import { categoryService } from "../../../category.service";
import { asCategoryId, DomainMonth } from "../../../category.types";
import { recalculateCategoryMonthsForTransactions } from "./recalculateForCategoryMonthsForTransactions";

jest.mock("../../../category.service", () => ({
  categoryService: {
    months: {
      getMonthsForCategoriesStartingFrom: jest.fn(),
    },
  },
}));

jest.mock(
  "../../../../../../../../shared/repository/categoryRepositoryImpl",
  () => ({
    categoryRepository: {
      updateMonths: jest.fn(),
    },
  })
);

describe("recalculateCategoryMonthsForTransactions", () => {
  const prisma = {} as Prisma.TransactionClient;
  const categoryId = asCategoryId("category-1");

  const transaction: DomainNormalTransaction = {
    id: asTransactionId("transaction-1"),
    type: "normal",
    accountId: asAccountId("account-1"),
    categoryId,
    date: new Date("2025-06-15T00:00:00.000Z"),
    inflow: new Decimal(100),
    outflow: new Decimal(0),
    memo: "",
  };

  const juneMonth = {
    id: "month-1",
    categoryId,
    month: new Date("2025-06-01T00:00:00.000Z"),
    activity: new Decimal(0),
    assigned: new Decimal(0),
    available: new Decimal(0),
  };

  const julyMonth = {
    id: "month-2",
    categoryId,
    month: new Date("2025-07-01T00:00:00.000Z"),
    activity: new Decimal(0),
    assigned: new Decimal(0),
    available: new Decimal(0),
  };

  const augustMonth = {
    id: "month-3",
    categoryId,
    month: new Date("2025-08-01T00:00:00.000Z"),
    activity: new Decimal(0),
    assigned: new Decimal(0),
    available: new Decimal(100),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    jest
      .mocked(categoryService.months.getMonthsForCategoriesStartingFrom)
      .mockResolvedValue([juneMonth, julyMonth, augustMonth] as DomainMonth[]);
  });

  it("should only persist and return months whose values changed", async () => {
    const result = await recalculateCategoryMonthsForTransactions(
      prisma,
      [transaction],
      OperationMode.Add
    );

    // June's activity and availability change.
    // July's availability changes.
    // August remains unchanged.
    expect(categoryRepository.updateMonths).toHaveBeenCalledTimes(1);

    const persistedMonths = jest.mocked(categoryRepository.updateMonths).mock
      .calls[0][1];

    expect(persistedMonths).toEqual([
      {
        ...juneMonth,
        activity: new Decimal(100),
        available: new Decimal(100),
      },
      {
        ...julyMonth,
        available: new Decimal(100),
      },
    ]);

    expect(result).toEqual(persistedMonths);
  });

  it("should return immediately when there are no transactions", async () => {
    const result = await recalculateCategoryMonthsForTransactions(
      prisma,
      [],
      OperationMode.Add
    );

    expect(result).toEqual([]);

    expect(
      categoryService.months.getMonthsForCategoriesStartingFrom
    ).not.toHaveBeenCalled();

    expect(categoryRepository.updateMonths).not.toHaveBeenCalled();
  });

  it("should fetch category months starting from the earliest transaction month regardless of transaction order", async () => {
    const juneTransaction = {
      ...transaction,
      id: asTransactionId("transaction-june"),
      date: new Date("2025-06-15T00:00:00.000Z"),
    };

    const augustTransaction = {
      ...transaction,
      id: asTransactionId("transaction-august"),
      date: new Date("2025-08-15T00:00:00.000Z"),
    };

    const julyTransaction = {
      ...transaction,
      id: asTransactionId("transaction-july"),
      date: new Date("2025-07-15T00:00:00.000Z"),
    };

    const transactions = [augustTransaction, julyTransaction, juneTransaction];

    await recalculateCategoryMonthsForTransactions(
      prisma,
      transactions,
      OperationMode.Add
    );

    expect(
      categoryService.months.getMonthsForCategoriesStartingFrom
    ).toHaveBeenCalledWith(
      prisma,
      [categoryId],
      new Date("2025-06-01T00:00:00.000Z")
    );
  });
});
