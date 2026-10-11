import { PrismaClient } from "@prisma/client";
import { categoryRepository } from "../../../../../../../../shared/repository/categoryRepositoryImpl";
import { type UserId } from "../../../../../../../user/auth/auth.types";
import { insertMissingMonths } from "./insertMissingMonths";

describe("insertMissingMonths", () => {
  const prisma = {} as PrismaClient;
  const userId = "test-user-id" as UserId;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    {
      description: "the transaction is in the earliest existing month",
      earliestMonth: new Date("2025-11-01T00:00:00.000Z"),
      transactionDate: new Date("2025-11-15T12:00:00.000Z"),
    },
    {
      description: "the transaction is after the earliest existing month",
      earliestMonth: new Date("2025-11-01T00:00:00.000Z"),
      transactionDate: new Date("2025-12-15T12:00:00.000Z"),
    },
  ])(
    "does not create months when $description",
    async ({ earliestMonth, transactionDate }) => {
      const getEarliestPastMonthSpy = jest
        .spyOn(categoryRepository, "getEarliestPastMonth")
        .mockResolvedValue(earliestMonth);

      const getAllCategoryIdsSpy = jest.spyOn(
        categoryRepository,
        "getAllCategoryIds"
      );

      const createMonthsSpy = jest.spyOn(categoryRepository, "createMonths");

      const result = await insertMissingMonths(prisma, userId, transactionDate);

      expect(result).toEqual([]);

      expect(getEarliestPastMonthSpy).toHaveBeenCalledWith(prisma, userId);

      expect(getAllCategoryIdsSpy).not.toHaveBeenCalled();
      expect(createMonthsSpy).not.toHaveBeenCalled();
    }
  );
});
