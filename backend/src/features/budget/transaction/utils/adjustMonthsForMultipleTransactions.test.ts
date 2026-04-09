import { Month, Transaction } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { OperationMode } from "../../../../shared/enums/operation-mode";
import { adjustMonthsForMultipleTransactions } from "../../category/core/domain/month.domain";

type TxStub = Pick<Transaction, "inflow" | "outflow" | "date">;
type MonthStub = Pick<Month, "month" | "activity" | "available" | "assigned">;

const expectDecimalToBe = (received: Decimal, expected: number) =>
  expect(received.toNumber()).toBe(expected);

describe("adjustMonthsTxToDelete", () => {
  describe("delete", () => {
    it("should adjust activity and available when deleting inflow transaction", () => {
      const txs: TxStub[] = [
        {
          inflow: new Decimal(100),
          outflow: new Decimal(0),
          date: new Date("2025-06-01T00:00:00Z"),
        },
      ];

      const months = [
        {
          month: new Date("2025-06-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(100),
          available: new Decimal(100),
        },
        {
          month: new Date("2025-07-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(0),
          available: new Decimal(100),
        },
      ];

      const updatedMonths = adjustMonthsForMultipleTransactions(
        txs,
        months,
        OperationMode.Delete
      );

      expectDecimalToBe(updatedMonths[0].activity, 0);
      expectDecimalToBe(updatedMonths[0].available, 0);
      expectDecimalToBe(updatedMonths[1].activity, 0);
      expectDecimalToBe(updatedMonths[1].available, 0);
    });

    it("should adjust activity and available when deleting inflow transaction with assigned", () => {
      const txs: TxStub[] = [
        {
          inflow: new Decimal(100),
          outflow: new Decimal(0),
          date: new Date("2025-06-01T00:00:00Z"),
        },
      ];

      const months = [
        {
          month: new Date("2025-06-01T00:00:00Z"),
          assigned: new Decimal(100),
          activity: new Decimal(100),
          available: new Decimal(200),
        },
        {
          month: new Date("2025-07-01T00:00:00Z"),
          assigned: new Decimal(20),
          activity: new Decimal(0),
          available: new Decimal(220),
        },
      ];

      const updatedMonths = adjustMonthsForMultipleTransactions(
        txs,
        months,
        OperationMode.Delete
      );

      expectDecimalToBe(updatedMonths[0].activity, 0);
      expectDecimalToBe(updatedMonths[0].available, 100);
      expectDecimalToBe(updatedMonths[1].activity, 0);
      expectDecimalToBe(updatedMonths[1].available, 120);
    });

    // this one is where i changed it!!
    it("should adjust activity and available when deleting outflow transaction with assigned", () => {
      const txs: TxStub[] = [
        {
          inflow: new Decimal(0),
          outflow: new Decimal(100),
          date: new Date("2025-06-01T00:00:00Z"),
        },
      ];

      const months = [
        {
          month: new Date("2025-06-01T00:00:00Z"),
          assigned: new Decimal(200),
          activity: new Decimal(-100),
          available: new Decimal(100),
        },
        {
          month: new Date("2025-07-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(0),
          available: new Decimal(100),
        },
      ];

      const updatedMonths = adjustMonthsForMultipleTransactions(
        txs,
        months,
        OperationMode.Delete
      );

      expectDecimalToBe(updatedMonths[0].activity, 0);
      expectDecimalToBe(updatedMonths[0].available, 200);
      expectDecimalToBe(updatedMonths[1].activity, 0);
      expectDecimalToBe(updatedMonths[1].available, 200);
    });

    it("should adjust activity and available when deleting outflow transaction", () => {
      const txs: TxStub[] = [
        {
          inflow: new Decimal(0),
          outflow: new Decimal(100),
          date: new Date("2025-06-01T00:00:00Z"),
        },
      ];

      const months: MonthStub[] = [
        {
          month: new Date("2025-06-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(-100),
          available: new Decimal(-100),
        },
        {
          month: new Date("2025-07-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(0),
          available: new Decimal(0),
        },
      ];

      const updatedMonths = adjustMonthsForMultipleTransactions(
        txs,
        months,
        OperationMode.Delete
      );

      expectDecimalToBe(updatedMonths[0].activity, 0);
      expectDecimalToBe(updatedMonths[0].available, 0);
      expectDecimalToBe(updatedMonths[1].activity, 0);
      expectDecimalToBe(updatedMonths[1].available, 0);
    });
    it("handle delete", () => {
      const txs: TxStub[] = [
        {
          inflow: new Decimal(0),
          outflow: new Decimal(40),
          date: new Date("2025-06-01T00:00:00Z"),
        },
      ];

      const months: MonthStub[] = [
        {
          month: new Date("2025-06-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(-40),
          available: new Decimal(-40),
        },
        {
          month: new Date("2025-07-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(-40),
          available: new Decimal(-40),
        },
        {
          month: new Date("2025-08-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(-10),
          available: new Decimal(-10),
        },
        {
          month: new Date("2025-09-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(0),
          available: new Decimal(0),
        },
      ];

      const updatedMonths = adjustMonthsForMultipleTransactions(
        txs,
        months,
        OperationMode.Delete
      );

      expectDecimalToBe(updatedMonths[0].activity, 0);
      expectDecimalToBe(updatedMonths[0].available, 0);

      expectDecimalToBe(updatedMonths[1].activity, -40);
      expectDecimalToBe(updatedMonths[1].available, -40);

      expectDecimalToBe(updatedMonths[2].activity, -10);
      expectDecimalToBe(updatedMonths[2].available, -10);

      expectDecimalToBe(updatedMonths[3].activity, 0);
      expectDecimalToBe(updatedMonths[3].available, 0);
    });

    it("should adjust activity and available when deleting outflow transaction complex", () => {
      const txs: TxStub[] = [
        {
          inflow: new Decimal(0),
          outflow: new Decimal(100),
          date: new Date("2025-06-01T00:00:00Z"),
        },
      ];

      const months: MonthStub[] = [
        {
          month: new Date("2025-06-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(-200),
          available: new Decimal(-200),
        },
        {
          month: new Date("2025-07-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(0),
          available: new Decimal(0),
        },
      ];

      const updatedMonths = adjustMonthsForMultipleTransactions(
        txs,
        months,
        OperationMode.Delete
      );

      expectDecimalToBe(updatedMonths[0].activity, -100);
      expectDecimalToBe(updatedMonths[0].available, -100);
      expectDecimalToBe(updatedMonths[1].activity, 0);
      expectDecimalToBe(updatedMonths[1].available, 0);
    });

    it("should only adjust activity and available from tx month forward", () => {
      const txs: TxStub[] = [
        {
          inflow: new Decimal(0),
          outflow: new Decimal(100),
          date: new Date("2025-07-01T00:00:00Z"),
        },
      ];

      const months: MonthStub[] = [
        {
          month: new Date("2025-06-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(-200),
          available: new Decimal(-200),
        },
        {
          month: new Date("2025-07-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(0),
          available: new Decimal(0),
        },
      ];

      const updatedMonths = adjustMonthsForMultipleTransactions(
        txs,
        months,
        OperationMode.Delete
      );

      expectDecimalToBe(updatedMonths[0].activity, -200);
      expectDecimalToBe(updatedMonths[0].available, -200);
      expectDecimalToBe(updatedMonths[1].activity, 100);
      expectDecimalToBe(updatedMonths[1].available, 100);
    });

    it("should propagate inflow deletion effects across multiple months", () => {
      const txs: TxStub[] = [
        {
          inflow: new Decimal(10),
          outflow: new Decimal(0),
          date: new Date("2025-06-01T00:00:00Z"),
        },
      ];

      const months: MonthStub[] = [
        {
          month: new Date("2025-06-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(10),
          available: new Decimal(10),
        },
        {
          month: new Date("2025-07-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(-10),
          available: new Decimal(0),
        },
        {
          month: new Date("2025-08-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(-10),
          available: new Decimal(-10),
        },
      ];

      const updatedMonths = adjustMonthsForMultipleTransactions(
        txs,
        months,
        OperationMode.Delete
      );

      expectDecimalToBe(updatedMonths[0].activity, 0);
      expectDecimalToBe(updatedMonths[0].available, 0);
      expectDecimalToBe(updatedMonths[1].activity, -10);
      expectDecimalToBe(updatedMonths[1].available, -10);
      expectDecimalToBe(updatedMonths[2].activity, -10);
      expectDecimalToBe(updatedMonths[2].available, -10);
    });

    it("should delete inflow when equal outflow in the same month", () => {
      const txs: TxStub[] = [
        {
          inflow: new Decimal(10),
          outflow: new Decimal(0),
          date: new Date("2025-06-01T00:00:00Z"),
        },
      ];

      const months: MonthStub[] = [
        {
          month: new Date("2025-06-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(0),
          available: new Decimal(0),
        },
        {
          month: new Date("2025-07-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(0),
          available: new Decimal(0),
        },
        {
          month: new Date("2025-08-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(0),
          available: new Decimal(0),
        },
      ];

      const updatedMonths = adjustMonthsForMultipleTransactions(
        txs,
        months,
        OperationMode.Delete
      );

      expectDecimalToBe(updatedMonths[0].activity, -10);
      expectDecimalToBe(updatedMonths[0].available, -10);
      expectDecimalToBe(updatedMonths[1].activity, 0);
      expectDecimalToBe(updatedMonths[1].available, 0);
      expectDecimalToBe(updatedMonths[2].activity, 0);
      expectDecimalToBe(updatedMonths[2].available, 0);
    });

    it("should delete outflow when equal inflow in same month", () => {
      const txs: TxStub[] = [
        {
          inflow: new Decimal(0),
          outflow: new Decimal(10),
          date: new Date("2025-06-01T00:00:00Z"),
        },
      ];

      const months: MonthStub[] = [
        {
          month: new Date("2025-06-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(0),
          available: new Decimal(0),
        },
        {
          month: new Date("2025-07-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(0),
          available: new Decimal(0),
        },
        {
          month: new Date("2025-08-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(0),
          available: new Decimal(0),
        },
      ];

      const updatedMonths = adjustMonthsForMultipleTransactions(
        txs,
        months,
        OperationMode.Delete
      );

      expectDecimalToBe(updatedMonths[0].activity, 10);
      expectDecimalToBe(updatedMonths[0].available, 10);
      expectDecimalToBe(updatedMonths[1].activity, 0);
      expectDecimalToBe(updatedMonths[1].available, 10);
      expectDecimalToBe(updatedMonths[2].activity, 0);
      expectDecimalToBe(updatedMonths[2].available, 10);
    });

    it("should delete inflow when availability is already negative", () => {
      const txs: TxStub[] = [
        {
          inflow: new Decimal(10),
          outflow: new Decimal(0),
          date: new Date("2025-06-01T00:00:00Z"),
        },
      ];

      const months: MonthStub[] = [
        {
          month: new Date("2025-06-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(-10),
          available: new Decimal(-10),
        },
        {
          month: new Date("2025-07-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(0),
          available: new Decimal(0),
        },
      ];

      const updatedMonths = adjustMonthsForMultipleTransactions(
        txs,
        months,
        OperationMode.Delete
      );

      expectDecimalToBe(updatedMonths[0].activity, -20);
      expectDecimalToBe(updatedMonths[0].available, -20);
      expectDecimalToBe(updatedMonths[1].activity, 0);
      expectDecimalToBe(updatedMonths[1].available, 0);
    });

    it("should delete outflow that causes availability to go above zero", () => {
      const txs: TxStub[] = [
        {
          inflow: new Decimal(0),
          outflow: new Decimal(10),
          date: new Date("2025-06-01T00:00:00Z"),
        },
      ];

      const months: MonthStub[] = [
        {
          month: new Date("2025-06-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(-5),
          available: new Decimal(-5),
        },
        {
          month: new Date("2025-07-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(0),
          available: new Decimal(0),
        },
      ];

      const updatedMonths = adjustMonthsForMultipleTransactions(
        txs,
        months,
        OperationMode.Delete
      );

      expectDecimalToBe(updatedMonths[0].activity, 5);
      expectDecimalToBe(updatedMonths[0].available, 5);
      expectDecimalToBe(updatedMonths[1].activity, 0);
      expectDecimalToBe(updatedMonths[1].available, 5);
    });
    it("should correctly handle deleting transactions in past ", () => {
      const txs: TxStub[] = [
        {
          inflow: new Decimal(0),
          outflow: new Decimal(300),
          date: new Date("2025-06-01T00:00:00Z"),
        },
      ];

      const months: MonthStub[] = [
        {
          month: new Date("2025-06-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(-300),
          available: new Decimal(-300),
        },
        {
          month: new Date("2025-07-01T00:00:00Z"),
          assigned: new Decimal(25),
          activity: new Decimal(-250),
          available: new Decimal(-225),
        },
      ];

      const updatedMonths = adjustMonthsForMultipleTransactions(
        txs,
        months,
        OperationMode.Delete
      );

      expectDecimalToBe(updatedMonths[0].activity, 0);
      expectDecimalToBe(updatedMonths[0].available, 0);
      expectDecimalToBe(updatedMonths[1].activity, -250);
      expectDecimalToBe(updatedMonths[1].available, -225);
    });
  });

  describe("add", () => {
    it("should adjust activity and available when adding inflow transaction", () => {
      const txs: TxStub[] = [
        {
          inflow: new Decimal(100),
          outflow: new Decimal(0),
          date: new Date("2025-06-01T00:00:00Z"),
        },
      ];

      const months = [
        {
          month: new Date("2025-06-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(0),
          available: new Decimal(0),
        },
        {
          month: new Date("2025-07-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(0),
          available: new Decimal(0),
        },
      ];

      const updatedMonths = adjustMonthsForMultipleTransactions(
        txs,
        months,
        OperationMode.Add
      );

      expectDecimalToBe(updatedMonths[0].activity, 100);
      expectDecimalToBe(updatedMonths[0].available, 100);
      expectDecimalToBe(updatedMonths[1].activity, 0);
      expectDecimalToBe(updatedMonths[1].available, 100);
    });
    it("should correctly add inflow tx in past", () => {
      const txs: TxStub[] = [
        {
          inflow: new Decimal(200),
          outflow: new Decimal(0),
          date: new Date("2025-06-01T00:00:00Z"),
        },
      ];

      const months = [
        {
          month: new Date("2025-06-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(0),
          available: new Decimal(300),
        },
        {
          month: new Date("2025-07-01T00:00:00Z"),
          assigned: new Decimal(250),
          activity: new Decimal(-250),
          available: new Decimal(300),
        },
      ];

      const updatedMonths = adjustMonthsForMultipleTransactions(
        txs,
        months,
        OperationMode.Add
      );

      expectDecimalToBe(updatedMonths[0].activity, 200);
      expectDecimalToBe(updatedMonths[0].available, 500);
      expectDecimalToBe(updatedMonths[1].activity, -250);
      expectDecimalToBe(updatedMonths[1].available, 500);
    });
    it("should correctly outflow add tx in past", () => {
      const txs: TxStub[] = [
        {
          inflow: new Decimal(0),
          outflow: new Decimal(300),
          date: new Date("2025-06-01T00:00:00Z"),
        },
      ];

      const months = [
        {
          month: new Date("2025-06-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(0),
          available: new Decimal(300),
        },
        {
          month: new Date("2025-07-01T00:00:00Z"),
          assigned: new Decimal(250),
          activity: new Decimal(-250),
          available: new Decimal(300),
        },
      ];

      const updatedMonths = adjustMonthsForMultipleTransactions(
        txs,
        months,
        OperationMode.Add
      );

      expectDecimalToBe(updatedMonths[0].activity, -300);
      expectDecimalToBe(updatedMonths[0].available, 0);
      expectDecimalToBe(updatedMonths[1].activity, -250);
      expectDecimalToBe(updatedMonths[1].available, 0);
    });
    it("fix the single transaction bug", () => {
      const txs: TxStub[] = [
        {
          inflow: new Decimal(0),
          outflow: new Decimal(40),
          date: new Date("2025-06-01T00:00:00Z"),
        },
      ];

      const months = [
        {
          month: new Date("2025-06-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(40),
          available: new Decimal(40),
        },
        {
          month: new Date("2025-07-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(-40),
          available: new Decimal(0),
        },
        {
          month: new Date("2025-08-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(-10),
          available: new Decimal(-10),
        },
        {
          month: new Date("2025-09-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(0),
          available: new Decimal(0),
        },
      ];

      const updatedMonths = adjustMonthsForMultipleTransactions(
        txs,
        months,
        OperationMode.Add
      );

      expectDecimalToBe(updatedMonths[0].activity, 0);
      expectDecimalToBe(updatedMonths[0].available, 0);

      expectDecimalToBe(updatedMonths[1].activity, -40);
      expectDecimalToBe(updatedMonths[1].available, -40);

      expectDecimalToBe(updatedMonths[2].activity, -10);
      expectDecimalToBe(updatedMonths[2].available, -10);

      expectDecimalToBe(updatedMonths[3].activity, 0);
      expectDecimalToBe(updatedMonths[3].available, 0);
    });
    it("another", () => {
      const txs: TxStub[] = [
        {
          inflow: new Decimal(0),
          outflow: new Decimal(40),
          date: new Date("2025-07-01T00:00:00Z"),
        },
      ];

      const months = [
        {
          month: new Date("2025-07-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(-40),
          available: new Decimal(0),
        },
        {
          month: new Date("2025-08-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(-10),
          available: new Decimal(-10),
        },
        {
          month: new Date("2025-09-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(0),
          available: new Decimal(0),
        },
      ];

      const updatedMonths = adjustMonthsForMultipleTransactions(
        txs,
        months,
        OperationMode.Add
      );

      expectDecimalToBe(updatedMonths[0].activity, -80);
      expectDecimalToBe(updatedMonths[0].available, -40);

      expectDecimalToBe(updatedMonths[1].activity, -10);
      expectDecimalToBe(updatedMonths[1].available, -10);

      expectDecimalToBe(updatedMonths[2].activity, 0);
      expectDecimalToBe(updatedMonths[2].available, 0);
    });
    it("another inflow", () => {
      const txs: TxStub[] = [
        {
          inflow: new Decimal(40),
          outflow: new Decimal(0),
          date: new Date("2025-07-01T00:00:00Z"),
        },
      ];

      const months = [
        {
          month: new Date("2025-07-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(-40),
          available: new Decimal(0),
        },
        {
          month: new Date("2025-08-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(-10),
          available: new Decimal(-10),
        },
        {
          month: new Date("2025-09-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(0),
          available: new Decimal(0),
        },
      ];

      const updatedMonths = adjustMonthsForMultipleTransactions(
        txs,
        months,
        OperationMode.Add
      );

      expectDecimalToBe(updatedMonths[0].activity, 0);
      expectDecimalToBe(updatedMonths[0].available, 40);

      expectDecimalToBe(updatedMonths[1].activity, -10);
      expectDecimalToBe(updatedMonths[1].available, 30);

      expectDecimalToBe(updatedMonths[2].activity, 0);
      expectDecimalToBe(updatedMonths[2].available, 30);
    });
    it("another inflow", () => {
      const txs: TxStub[] = [
        {
          inflow: new Decimal(100),
          outflow: new Decimal(0),
          date: new Date("2025-07-01T00:00:00Z"),
        },
      ];

      const months = [
        {
          month: new Date("2025-07-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(-40),
          available: new Decimal(0),
        },
        {
          month: new Date("2025-08-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(-10),
          available: new Decimal(-10),
        },
        {
          month: new Date("2025-09-01T00:00:00Z"),
          assigned: new Decimal(0),
          activity: new Decimal(0),
          available: new Decimal(0),
        },
      ];

      const updatedMonths = adjustMonthsForMultipleTransactions(
        txs,
        months,
        OperationMode.Add
      );

      expectDecimalToBe(updatedMonths[0].activity, 60);
      expectDecimalToBe(updatedMonths[0].available, 100);

      expectDecimalToBe(updatedMonths[1].activity, -10);
      expectDecimalToBe(updatedMonths[1].available, 90);

      expectDecimalToBe(updatedMonths[2].activity, 0);
      expectDecimalToBe(updatedMonths[2].available, 90);
    });

    describe("multiple transactions", () => {
      it("handles multiple transactions", () => {
        const txs: TxStub[] = [
          {
            inflow: new Decimal(100),
            outflow: new Decimal(0),
            date: new Date("2025-07-01T00:00:00Z"),
          },
          {
            inflow: new Decimal(30),
            outflow: new Decimal(0),
            date: new Date("2025-07-01T00:00:00Z"),
          },
        ];

        const months = [
          {
            month: new Date("2025-07-01T00:00:00Z"),
            assigned: new Decimal(0),
            activity: new Decimal(-40),
            available: new Decimal(0),
          },
          {
            month: new Date("2025-08-01T00:00:00Z"),
            assigned: new Decimal(0),
            activity: new Decimal(-10),
            available: new Decimal(-10),
          },
          {
            month: new Date("2025-09-01T00:00:00Z"),
            assigned: new Decimal(0),
            activity: new Decimal(0),
            available: new Decimal(0),
          },
        ];

        const updatedMonths = adjustMonthsForMultipleTransactions(
          txs,
          months,
          OperationMode.Add
        );

        expectDecimalToBe(updatedMonths[0].activity, 90);
        expectDecimalToBe(updatedMonths[0].available, 130);

        expectDecimalToBe(updatedMonths[1].activity, -10);
        expectDecimalToBe(updatedMonths[1].available, 120);

        expectDecimalToBe(updatedMonths[2].activity, 0);
        expectDecimalToBe(updatedMonths[2].available, 120);
      });
      it("handles multiple transactions", () => {
        const txs: TxStub[] = [
          {
            inflow: new Decimal(100),
            outflow: new Decimal(0),
            date: new Date("2025-07-01T00:00:00Z"),
          },
          {
            inflow: new Decimal(0),
            outflow: new Decimal(20),
            date: new Date("2025-08-01T00:00:00Z"),
          },
        ];

        const months = [
          {
            month: new Date("2025-07-01T00:00:00Z"),
            assigned: new Decimal(0),
            activity: new Decimal(-40),
            available: new Decimal(0),
          },
          {
            month: new Date("2025-08-01T00:00:00Z"),
            assigned: new Decimal(0),
            activity: new Decimal(-10),
            available: new Decimal(-10),
          },
          {
            month: new Date("2025-09-01T00:00:00Z"),
            assigned: new Decimal(0),
            activity: new Decimal(0),
            available: new Decimal(0),
          },
        ];

        const updatedMonths = adjustMonthsForMultipleTransactions(
          txs,
          months,
          OperationMode.Add
        );

        expectDecimalToBe(updatedMonths[0].activity, 60);
        expectDecimalToBe(updatedMonths[0].available, 100);

        expectDecimalToBe(updatedMonths[1].activity, -30);
        expectDecimalToBe(updatedMonths[1].available, 70);

        expectDecimalToBe(updatedMonths[2].activity, 0);
        expectDecimalToBe(updatedMonths[2].available, 70);
      });
    });
  });
});
