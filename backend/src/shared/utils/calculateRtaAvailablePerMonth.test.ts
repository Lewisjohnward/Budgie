import { Decimal } from "@prisma/client/runtime/library";
import { calculateRtaAvailablePerMonth } from "./calculateRtaAvailablePerMonth";

const expectDecimalToBe = (received: Decimal, expected: number) =>
  expect(received.toNumber()).toBe(expected);

//TODO: CAN REMOVE AVAILABLE SINCE IT'S DERIVED
it("should preserve zeros when all values are initially zero", () => {
  const rtaMonths = [
    {
      month: new Date("2025-03-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-04-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-05-01"),
      activity: new Decimal(0),
    },
  ];

  const assignedNegAvailableByMonth = {
    "2025-03": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
    "2025-04": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
    "2025-05": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
  };

  const updatedRtaMonths = calculateRtaAvailablePerMonth(
    rtaMonths,
    assignedNegAvailableByMonth,
  );

  expectDecimalToBe(updatedRtaMonths[0].available, 0);
  expectDecimalToBe(updatedRtaMonths[1].available, 0);
  expectDecimalToBe(updatedRtaMonths[2].available, 0);
});

it("should propagate negative available from overspent month to future months", () => {
  const rtaMonths = [
    {
      month: new Date("2025-03-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-04-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-05-01"),
      activity: new Decimal(0),
    },
  ];

  const assignedNegAvailableByMonth = {
    "2025-03": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(-10),
    },
    "2025-04": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
    "2025-05": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
  };

  const updatedRtaMonths = calculateRtaAvailablePerMonth(
    rtaMonths,
    assignedNegAvailableByMonth,
  );

  expectDecimalToBe(updatedRtaMonths[0].available, 0);
  expectDecimalToBe(updatedRtaMonths[1].available, -10);
  expectDecimalToBe(updatedRtaMonths[2].available, -10);
});

it("should correctly update when rta month has positive activity", () => {
  const rtaMonths = [
    {
      month: new Date("2025-02-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-03-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-04-01"),
      activity: new Decimal(20),
    },
    {
      month: new Date("2025-05-01"),
      activity: new Decimal(0),
    },
  ];

  const assignedNegAvailableByMonth = {
    "2025-02": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(-10),
    },
    "2025-03": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
    "2025-04": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
    "2025-05": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
  };

  const updatedRtaMonths = calculateRtaAvailablePerMonth(
    rtaMonths,
    assignedNegAvailableByMonth,
  );

  expectDecimalToBe(updatedRtaMonths[0].available, 0);
  expectDecimalToBe(updatedRtaMonths[1].available, -10);
  expectDecimalToBe(updatedRtaMonths[2].available, 10);
  expectDecimalToBe(updatedRtaMonths[3].available, 10);
});

it("should propagate assigned", () => {
  const rtaMonths = [
    {
      month: new Date("2025-03-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-04-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-05-01"),
      activity: new Decimal(0),
    },
  ];

  const assignedNegAvailableByMonth = {
    "2025-03": {
      assigned: new Decimal(5),
      negativeAvailable: new Decimal(0),
    },
    "2025-04": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
    "2025-05": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
  };

  const updatedRtaMonths = calculateRtaAvailablePerMonth(
    rtaMonths,
    assignedNegAvailableByMonth,
  );

  expectDecimalToBe(updatedRtaMonths[0].available, -5);
  expectDecimalToBe(updatedRtaMonths[1].available, -5);
  expectDecimalToBe(updatedRtaMonths[2].available, -5);
});

it("should correctly handle negative available and assigned", () => {
  const rtaMonths = [
    {
      month: new Date("2025-03-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-04-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-05-01"),
      activity: new Decimal(0),
    },
  ];

  const assignedNegAvailableByMonth = {
    "2025-03": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(-10),
    },
    "2025-04": {
      assigned: new Decimal(10),
      negativeAvailable: new Decimal(0),
    },
    "2025-05": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
  };

  const updatedRtaMonths = calculateRtaAvailablePerMonth(
    rtaMonths,
    assignedNegAvailableByMonth,
  );

  expectDecimalToBe(updatedRtaMonths[0].available, 0);
  expectDecimalToBe(updatedRtaMonths[1].available, -20);
  expectDecimalToBe(updatedRtaMonths[2].available, -20);
});

it("should accumulate overspending gradually across multiple months", () => {
  const rtaMonths = [
    {
      month: new Date("2025-03-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-04-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-05-01"),
      activity: new Decimal(0),
    },
  ];

  const assignedNegAvailableByMonth = {
    "2025-03": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(-10),
    },
    "2025-04": {
      assigned: new Decimal(5),
      negativeAvailable: new Decimal(0),
    },
    "2025-05": {
      assigned: new Decimal(5),
      negativeAvailable: new Decimal(0),
    },
  };

  const updatedRtaMonths = calculateRtaAvailablePerMonth(
    rtaMonths,
    assignedNegAvailableByMonth,
  );

  expectDecimalToBe(updatedRtaMonths[0].available, 0);
  expectDecimalToBe(updatedRtaMonths[1].available, -15);
  expectDecimalToBe(updatedRtaMonths[2].available, -20);
});

it("should apply activity to reduce overspending from previous months", () => {
  const rtaMonths = [
    {
      month: new Date("2025-03-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-04-01"),
      activity: new Decimal(3),
    },
    {
      month: new Date("2025-05-01"),
      activity: new Decimal(0),
    },
  ];

  const assignedNegAvailableByMonth = {
    "2025-03": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(-10),
    },
    "2025-04": {
      assigned: new Decimal(5),
      negativeAvailable: new Decimal(0),
    },
    "2025-05": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
  };

  const updatedRtaMonths = calculateRtaAvailablePerMonth(
    rtaMonths,
    assignedNegAvailableByMonth,
  );

  expectDecimalToBe(updatedRtaMonths[0].available, 0);
  expectDecimalToBe(updatedRtaMonths[1].available, -12);
  expectDecimalToBe(updatedRtaMonths[2].available, -12);
});
it("should start overspending only from the future month", () => {
  const rtaMonths = [
    {
      month: new Date("2025-03-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-04-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-05-01"),
      activity: new Decimal(0),
    },
  ];

  const assignedNegAvailableByMonth = {
    "2025-03": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
    "2025-04": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(-5),
    },
    "2025-05": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
  };

  const updated = calculateRtaAvailablePerMonth(
    rtaMonths,
    assignedNegAvailableByMonth,
  );

  expectDecimalToBe(updated[0].available, 0);
  expectDecimalToBe(updated[1].available, 0);
  expectDecimalToBe(updated[2].available, -5);
});

it("Should cancel out when previous month has rta + activity and assigned", () => {
  const rtaMonths = [
    {
      month: new Date("2025-03-01"),
      activity: new Decimal(10),
    },
    {
      month: new Date("2025-04-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-05-01"),
      activity: new Decimal(0),
    },
  ];

  const assignedNegAvailableByMonth = {
    "2025-03": {
      assigned: new Decimal(10),
      negativeAvailable: new Decimal(0),
    },
    "2025-04": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
    "2025-05": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
  };

  const updated = calculateRtaAvailablePerMonth(
    rtaMonths,
    assignedNegAvailableByMonth,
  );

  expectDecimalToBe(updated[0].available, 0);
  expectDecimalToBe(updated[1].available, 0);
  expectDecimalToBe(updated[2].available, 0);
});

it("should correctly update available when month has positive activity", () => {
  const rtaMonths = [
    {
      month: new Date("2025-03-01"),
      activity: new Decimal(10),
    },
    {
      month: new Date("2025-04-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-05-01"),
      activity: new Decimal(0),
    },
  ];

  const assignedNegAvailableByMonth = {
    "2025-03": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
    "2025-04": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
    "2025-05": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
  };

  const updatedRtaMonths = calculateRtaAvailablePerMonth(
    rtaMonths,
    assignedNegAvailableByMonth,
  );

  expectDecimalToBe(updatedRtaMonths[0].available, 10);
  expectDecimalToBe(updatedRtaMonths[1].available, 10);
  expectDecimalToBe(updatedRtaMonths[2].available, 10);
});

it("should handle assigned when there is no ready to assign available", () => {
  const rtaMonths = [
    {
      month: new Date("2025-03-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-04-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-05-01"),
      activity: new Decimal(0),
    },
  ];

  const assignedNegAvailableByMonth = {
    "2025-03": {
      assigned: new Decimal(10),
      negativeAvailable: new Decimal(0),
    },
    "2025-04": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
    "2025-05": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
  };

  const updated = calculateRtaAvailablePerMonth(
    rtaMonths,
    assignedNegAvailableByMonth,
  );

  expectDecimalToBe(updated[0].available, -10);
  expectDecimalToBe(updated[1].available, -10);
  expectDecimalToBe(updated[2].available, -10);
});

it("should handle mutiple months with assigned when there is no ready to assign available", () => {
  const rtaMonths = [
    {
      month: new Date("2025-03-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-04-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-05-01"),
      activity: new Decimal(0),
    },
  ];

  const assignedNegAvailableByMonth = {
    "2025-03": {
      assigned: new Decimal(10),
      negativeAvailable: new Decimal(0),
    },
    "2025-04": {
      assigned: new Decimal(10),
      negativeAvailable: new Decimal(0),
    },
    "2025-05": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
  };

  const updated = calculateRtaAvailablePerMonth(
    rtaMonths,
    assignedNegAvailableByMonth,
  );

  expectDecimalToBe(updated[0].available, -10);
  expectDecimalToBe(updated[1].available, -20);
  expectDecimalToBe(updated[2].available, -20);
});

it("should update available based on future assigned", () => {
  const rtaMonths = [
    {
      month: new Date("2025-03-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-04-01"),
      activity: new Decimal(2000),
    },
    {
      month: new Date("2025-05-01"),
      activity: new Decimal(0),
    },
  ];

  const assignedNegAvailableByMonth = {
    "2025-03": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
    "2025-04": {
      assigned: new Decimal(200),
      negativeAvailable: new Decimal(0),
    },
    "2025-05": {
      assigned: new Decimal(100),
      negativeAvailable: new Decimal(0),
    },
  };

  const updated = calculateRtaAvailablePerMonth(
    rtaMonths,
    assignedNegAvailableByMonth,
  );

  expectDecimalToBe(updated[0].available, 0);
  expectDecimalToBe(updated[1].available, 1700);
  expectDecimalToBe(updated[2].available, 1700);
});

it("should update available based on future assigned and handle assigned in future when no money available", () => {
  const rtaMonths = [
    {
      month: new Date("2025-03-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-04-01"),
      activity: new Decimal(200),
    },
    {
      month: new Date("2025-05-01"),
      activity: new Decimal(0),
    },
  ];

  const assignedNegAvailableByMonth = {
    "2025-03": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
    "2025-04": {
      assigned: new Decimal(200),
      negativeAvailable: new Decimal(0),
    },
    "2025-05": {
      assigned: new Decimal(100),
      negativeAvailable: new Decimal(0),
    },
  };

  const updated = calculateRtaAvailablePerMonth(
    rtaMonths,
    assignedNegAvailableByMonth,
  );

  expectDecimalToBe(updated[0].available, 0);
  expectDecimalToBe(updated[1].available, 0);
  expectDecimalToBe(updated[2].available, -100);
});

it("should handle assigned in the future subtracting from past activity", () => {
  const rtaMonths = [
    {
      month: new Date("2025-03-01"),
      activity: new Decimal(100),
    },
    {
      month: new Date("2025-04-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-05-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-06-01"),
      activity: new Decimal(0),
    },
  ];

  const assignedNegAvailableByMonth = {
    "2025-03": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
    "2025-04": {
      assigned: new Decimal(100),
      negativeAvailable: new Decimal(0),
    },
    "2025-05": {
      assigned: new Decimal(100),
      negativeAvailable: new Decimal(0),
    },
    "2025-06": {
      assigned: new Decimal(0),
      negativeAvailable: new Decimal(0),
    },
  };

  const updated = calculateRtaAvailablePerMonth(
    rtaMonths,
    assignedNegAvailableByMonth,
  );

  expectDecimalToBe(updated[0].available, 0);
  expectDecimalToBe(updated[1].available, 0);
  expectDecimalToBe(updated[2].available, -100);
  expectDecimalToBe(updated[3].available, -100);
});

it("should handle various assigned in the future subtracting from past activity", () => {
  const rtaMonths = [
    {
      month: new Date("2025-03-01"),
      activity: new Decimal(100),
    },
    {
      month: new Date("2025-04-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-05-01"),
      activity: new Decimal(0),
    },
  ];

  const assignedNegAvailableByMonth = {
    "2025-03": {
      assigned: new Decimal(33),
      negativeAvailable: new Decimal(0),
    },
    "2025-04": {
      assigned: new Decimal(33),
      negativeAvailable: new Decimal(0),
    },
    "2025-05": {
      assigned: new Decimal(33),
      negativeAvailable: new Decimal(0),
    },
  };

  const updated = calculateRtaAvailablePerMonth(
    rtaMonths,
    assignedNegAvailableByMonth,
  );

  expectDecimalToBe(updated[0].available, 1);
  expectDecimalToBe(updated[1].available, 1);
  expectDecimalToBe(updated[2].available, 1);
});

it("temp", () => {
  const rtaMonths = [
    {
      month: new Date("2025-03-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-04-01"),
      activity: new Decimal(0),
    },
    {
      month: new Date("2025-05-01"),
      activity: new Decimal(0),
    },
  ];

  const assignedNegAvailableByMonth = {
    "2025-03": {
      assigned: new Decimal(33),
      negativeAvailable: new Decimal(0),
    },
    "2025-04": {
      assigned: new Decimal(33),
      negativeAvailable: new Decimal(0),
    },
    "2025-05": {
      assigned: new Decimal(33),
      negativeAvailable: new Decimal(0),
    },
  };

  const updated = calculateRtaAvailablePerMonth(
    rtaMonths,
    assignedNegAvailableByMonth,
  );

  expectDecimalToBe(updated[0].available, -33);
  expectDecimalToBe(updated[1].available, -66);
  expectDecimalToBe(updated[2].available, -99);
});
