import { Decimal } from "@prisma/client/runtime/library";
import { calculateCategoryMonths } from "./month.domain";

describe("calculateCategoryMonths", () => {
  it("should add funds to the first month and carry forward available", () => {
    const categoryMonths = [
      {
        month: new Date("2025-04-01"),
        activity: new Decimal(0),
        assigned: new Decimal(0),
        available: new Decimal(0),
      },
      {
        month: new Date("2025-05-01"),
        assigned: new Decimal(0),
        activity: new Decimal(0),
        available: new Decimal(0),
      },
    ];

    const changeInAssigned = new Decimal(10);

    const updatedMonths = calculateCategoryMonths(
      categoryMonths,
      changeInAssigned,
    );

    expect(updatedMonths[0].assigned.toFixed(2)).toBe("10.00");
    expect(updatedMonths[0].activity.toFixed(2)).toBe("0.00");
    expect(updatedMonths[0].available.toFixed(2)).toBe("10.00");
    expect(updatedMonths[1].assigned.toFixed(2)).toBe("0.00");
    expect(updatedMonths[1].activity.toFixed(2)).toBe("0.00");
    expect(updatedMonths[1].available.toFixed(2)).toBe("10.00");
  });

  it("should increase available in both months when funds are assigned", () => {
    const categoryMonths = [
      {
        month: new Date("2025-04-01"),
        activity: new Decimal(0),
        assigned: new Decimal(0),
        available: new Decimal(20),
      },
      {
        month: new Date("2025-05-01"),
        assigned: new Decimal(0),
        activity: new Decimal(0),
        available: new Decimal(20),
      },
    ];

    const changeInAssigned = new Decimal(10);

    const updatedMonths = calculateCategoryMonths(
      categoryMonths,
      changeInAssigned,
    );

    expect(updatedMonths[0].assigned.toFixed(2)).toBe("10.00");
    expect(updatedMonths[0].activity.toFixed(2)).toBe("0.00");
    expect(updatedMonths[0].available.toFixed(2)).toBe("30.00");
    expect(updatedMonths[1].assigned.toFixed(2)).toBe("0.00");
    expect(updatedMonths[1].activity.toFixed(2)).toBe("0.00");
    expect(updatedMonths[1].available.toFixed(2)).toBe("30.00");
  });

  it("should reduce assigned and available when unassigning", () => {
    const categoryMonths = [
      {
        month: new Date("2025-04-01"),
        activity: new Decimal(0),
        assigned: new Decimal(10),
        available: new Decimal(30),
      },
      {
        month: new Date("2025-05-01"),
        assigned: new Decimal(0),
        activity: new Decimal(0),
        available: new Decimal(30),
      },
    ];

    const changeInAssigned = new Decimal(-10);

    const updatedMonths = calculateCategoryMonths(
      categoryMonths,
      changeInAssigned,
    );

    expect(updatedMonths[0].assigned.toFixed(2)).toBe("0.00");
    expect(updatedMonths[0].activity.toFixed(2)).toBe("0.00");
    expect(updatedMonths[0].available.toFixed(2)).toBe("20.00");
    expect(updatedMonths[1].assigned.toFixed(2)).toBe("0.00");
    expect(updatedMonths[1].activity.toFixed(2)).toBe("0.00");
    expect(updatedMonths[1].available.toFixed(2)).toBe("20.00");
  });

  it("should update available across multiple months when unassigning", () => {
    const categoryMonths = [
      {
        month: new Date("2025-04-01"),
        activity: new Decimal(0),
        assigned: new Decimal(10),
        available: new Decimal(30),
      },
      {
        month: new Date("2025-05-01"),
        assigned: new Decimal(0),
        activity: new Decimal(0),
        available: new Decimal(30),
      },
      {
        month: new Date("2025-06-01"),
        assigned: new Decimal(0),
        activity: new Decimal(-10),
        available: new Decimal(20),
      },
    ];

    const changeInAssigned = new Decimal(-10);

    const updatedMonths = calculateCategoryMonths(
      categoryMonths,
      changeInAssigned,
    );

    expect(updatedMonths[0].assigned.toFixed(2)).toBe("0.00");
    expect(updatedMonths[0].activity.toFixed(2)).toBe("0.00");
    expect(updatedMonths[0].available.toFixed(2)).toBe("20.00");
    expect(updatedMonths[1].assigned.toFixed(2)).toBe("0.00");
    expect(updatedMonths[1].activity.toFixed(2)).toBe("0.00");
    expect(updatedMonths[1].available.toFixed(2)).toBe("20.00");
    expect(updatedMonths[2].assigned.toFixed(2)).toBe("0.00");
    expect(updatedMonths[2].activity.toFixed(2)).toBe("-10.00");
    expect(updatedMonths[2].available.toFixed(2)).toBe("10.00");
  });

  it("should handle unassignment when future months have negative available", () => {
    const categoryMonths = [
      {
        month: new Date("2025-04-01"),
        assigned: new Decimal(10),
        activity: new Decimal(20),
        available: new Decimal(30),
      },
      {
        month: new Date("2025-05-01"),
        assigned: new Decimal(0),
        activity: new Decimal(-40),
        available: new Decimal(-10),
      },
    ];

    const changeInAssigned = new Decimal(-10);

    const updatedMonths = calculateCategoryMonths(
      categoryMonths,
      changeInAssigned,
    );

    expect(updatedMonths[0].assigned.toFixed(2)).toBe("0.00");
    expect(updatedMonths[0].activity.toFixed(2)).toBe("20.00");
    expect(updatedMonths[0].available.toFixed(2)).toBe("20.00");
    expect(updatedMonths[1].assigned.toFixed(2)).toBe("0.00");
    expect(updatedMonths[1].activity.toFixed(2)).toBe("-40.00");
    expect(updatedMonths[1].available.toFixed(2)).toBe("-20.00");
  });

  it("should not change future available when available is zeroed", () => {
    const categoryMonths = [
      {
        month: new Date("2025-04-01"),
        assigned: new Decimal(0),
        activity: new Decimal(-30),
        available: new Decimal(-30),
      },
      {
        month: new Date("2025-05-01"),
        assigned: new Decimal(0),
        activity: new Decimal(0),
        available: new Decimal(0),
      },
      {
        month: new Date("2025-06-01"),
        assigned: new Decimal(0),
        activity: new Decimal(0),
        available: new Decimal(0),
      },
    ];

    const changeInAssigned = new Decimal(30);

    const updatedMonths = calculateCategoryMonths(
      categoryMonths,
      changeInAssigned,
    );

    expect(updatedMonths[0].assigned.toFixed(2)).toBe("30.00");
    expect(updatedMonths[0].activity.toFixed(2)).toBe("-30.00");
    expect(updatedMonths[0].available.toFixed(2)).toBe("0.00");
    expect(updatedMonths[1].assigned.toFixed(2)).toBe("0.00");
    expect(updatedMonths[1].activity.toFixed(2)).toBe("0.00");
    expect(updatedMonths[1].available.toFixed(2)).toBe("0.00");
    expect(updatedMonths[2].assigned.toFixed(2)).toBe("0.00");
    expect(updatedMonths[2].activity.toFixed(2)).toBe("0.00");
    expect(updatedMonths[2].available.toFixed(2)).toBe("0.00");
  });

  it("should correctly update future available when crossing zero from negative", () => {
    const categoryMonths = [
      {
        month: new Date("2025-04-01"),
        assigned: new Decimal(0),
        activity: new Decimal(-25),
        available: new Decimal(-25),
      },
      {
        month: new Date("2025-05-01"),
        assigned: new Decimal(0),
        activity: new Decimal(0),
        available: new Decimal(0),
      },
      {
        month: new Date("2025-06-01"),
        assigned: new Decimal(0),
        activity: new Decimal(0),
        available: new Decimal(0),
      },
    ];

    const changeInAssigned = new Decimal(30);

    const updatedMonths = calculateCategoryMonths(
      categoryMonths,
      changeInAssigned,
    );

    expect(updatedMonths[0].assigned.toFixed(2)).toBe("30.00");
    expect(updatedMonths[0].activity.toFixed(2)).toBe("-25.00");
    expect(updatedMonths[0].available.toFixed(2)).toBe("5.00");
    expect(updatedMonths[1].assigned.toFixed(2)).toBe("0.00");
    expect(updatedMonths[1].activity.toFixed(2)).toBe("0.00");
    expect(updatedMonths[1].available.toFixed(2)).toBe("5.00");
    expect(updatedMonths[2].assigned.toFixed(2)).toBe("0.00");
    expect(updatedMonths[2].activity.toFixed(2)).toBe("0.00");
    expect(updatedMonths[2].available.toFixed(2)).toBe("5.00");
  });

  it("should correctly update future months when crossing zero to negative", () => {
    const categoryMonths = [
      {
        month: new Date("2025-04-01"),
        assigned: new Decimal(4.25),
        activity: new Decimal(-4.24),
        available: new Decimal(0.01),
      },
      {
        month: new Date("2025-05-01"),
        assigned: new Decimal(0),
        activity: new Decimal(0),
        available: new Decimal(0.01),
      },
    ];

    const changeInAssigned = new Decimal(-4.25);

    const updatedMonths = calculateCategoryMonths(
      categoryMonths,
      changeInAssigned,
    );

    expect(updatedMonths[0].assigned.toFixed(2)).toBe("0.00");
    expect(updatedMonths[0].activity.toFixed(2)).toBe("-4.24");
    expect(updatedMonths[0].available.toFixed(2)).toBe("-4.24");
    expect(updatedMonths[1].assigned.toFixed(2)).toBe("0.00");
    expect(updatedMonths[1].activity.toFixed(2)).toBe("0.00");
    expect(updatedMonths[1].available.toFixed(2)).toBe("0.00");
  });

  it("should correctly update future available when staying positive", () => {
    const categoryMonths = [
      {
        month: new Date("2025-04-01"),
        assigned: new Decimal(10),
        activity: new Decimal(-9),
        available: new Decimal(1),
      },
      {
        month: new Date("2025-05-01"),
        assigned: new Decimal(0),
        activity: new Decimal(0),
        available: new Decimal(1),
      },
    ];

    const changeInAssigned = new Decimal(-1);

    const updatedMonths = calculateCategoryMonths(
      categoryMonths,
      changeInAssigned,
    );

    expect(updatedMonths[0].assigned.toFixed(2)).toBe("9.00");
    expect(updatedMonths[0].activity.toFixed(2)).toBe("-9.00");
    expect(updatedMonths[0].available.toFixed(2)).toBe("0.00");
    expect(updatedMonths[1].assigned.toFixed(2)).toBe("0.00");
    expect(updatedMonths[1].activity.toFixed(2)).toBe("0.00");
    expect(updatedMonths[1].available.toFixed(2)).toBe("0.00");
  });
});
