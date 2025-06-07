import { Decimal } from "@prisma/client/runtime/library";
import { calculateCategoryMonths } from "./calculateCategoryMonths";

const expectDecimalToBe = (received: Decimal, expected: number) =>
  expect(received.toNumber()).toBe(expected);

it("first test", () => {
  const categoryMonths = [
    {
      month: new Date("2025-04-01"),
      activity: new Decimal(0),
      available: new Decimal(0),
    },
    {
      month: new Date("2025-05-01"),
      activity: new Decimal(0),
      available: new Decimal(0),
    },
  ];

  const transactionMonth = new Date("2025-04-01");
  const inflow = new Decimal(10);

  const updatedMonths = calculateCategoryMonths(
    categoryMonths,
    transactionMonth,
    inflow,
  );

  expectDecimalToBe(updatedMonths[0].activity, 10);
  expectDecimalToBe(updatedMonths[0].available, 10);
  expectDecimalToBe(updatedMonths[1].activity, 0);
  expectDecimalToBe(updatedMonths[1].available, 10);
});
