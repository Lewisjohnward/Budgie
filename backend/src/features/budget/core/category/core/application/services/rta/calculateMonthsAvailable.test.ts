import { type PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { categoryRepository } from "../../../../../../../../shared/repository/categoryRepositoryImpl";
import { categoryService } from "../../../category.service";
import { type CategoryId, type DomainMonth } from "../../../category.types";
import { type UserId } from "../../../../../../../user/auth/auth.types";
import { calculateMonthsAvailable } from "./calculateMonthsAvailable";

describe("calculateMonthsAvailable", () => {
  const prisma = {} as PrismaClient;
  const userId = "test-user-id" as UserId;
  const rtaCategoryId = "rta-category-id" as CategoryId;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createMonth = (
    id: string,
    month: string,
    activity: number,
    available: number
  ): DomainMonth =>
    ({
      id,
      month: new Date(`${month}-01T00:00:00.000Z`),
      activity: new Decimal(activity),
      available: new Decimal(available),
    }) as DomainMonth;

  const setup = (rtaMonths: DomainMonth[]) => {
    jest
      .spyOn(categoryService.months, "getAllMonthsForCategories")
      .mockResolvedValue([]);

    jest
      .spyOn(categoryService.months, "getAllRtaMonths")
      .mockResolvedValue(rtaMonths);

    const updateMonthsSpy = jest
      .spyOn(categoryRepository, "updateMonths")
      .mockResolvedValue(undefined);

    return updateMonthsSpy;
  };

  it("returns an empty array and does not update months when availability is unchanged", async () => {
    const rtaMonths = [
      createMonth("month-1", "2025-01", 100, 100),
      createMonth("month-2", "2025-02", 50, 150),
    ];

    const updateMonthsSpy = setup(rtaMonths);

    const result = await calculateMonthsAvailable(
      prisma,
      userId,
      rtaCategoryId
    );

    expect(result).toEqual([]);
    expect(updateMonthsSpy).not.toHaveBeenCalled();
  });

  it("updates and returns only months whose availability has changed", async () => {
    const rtaMonths = [
      createMonth("month-1", "2025-01", 100, 100),
      createMonth("month-2", "2025-02", 60, 150),
    ];

    const updateMonthsSpy = setup(rtaMonths);

    const result = await calculateMonthsAvailable(
      prisma,
      userId,
      rtaCategoryId
    );

    expect(result.map((month) => month.id)).toEqual(["month-2"]);
    expect(result[0].available.equals(new Decimal(160))).toBe(true);

    expect(updateMonthsSpy).toHaveBeenCalledTimes(1);
    expect(updateMonthsSpy).toHaveBeenCalledWith(prisma, [
      expect.objectContaining({
        id: "month-2",
        available: new Decimal(160),
      }),
    ]);
  });

  it("updates and returns subsequent months when an earlier month's change affects their availability", async () => {
    const rtaMonths = [
      createMonth("month-1", "2025-01", 110, 100),
      createMonth("month-2", "2025-02", 60, 150),
    ];

    const updateMonthsSpy = setup(rtaMonths);

    const result = await calculateMonthsAvailable(
      prisma,
      userId,
      rtaCategoryId
    );

    expect(result).toHaveLength(2);

    expect(result.map((month) => month.id)).toEqual(["month-1", "month-2"]);

    expect(result[0].available.equals(new Decimal(110))).toBe(true);
    expect(result[1].available.equals(new Decimal(170))).toBe(true);

    expect(updateMonthsSpy).toHaveBeenCalledTimes(1);
    expect(updateMonthsSpy).toHaveBeenCalledWith(prisma, result);
  });
});
