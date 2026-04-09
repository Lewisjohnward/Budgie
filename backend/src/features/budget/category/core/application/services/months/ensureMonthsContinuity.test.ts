import { categoryRepository } from "../../../../../../../shared/repository/categoryRepositoryImpl";
import { ensureMonthsContinuity } from "./ensureMonthsContinuity";
import { Prisma } from "@prisma/client";
import { ZERO } from "../../../../../../../shared/constants/zero";

jest.mock("../../../../../../shared/repository/categoryRepositoryImpl", () => ({
  categoryRepository: {
    getMostRecentMonths: jest.fn(),
    getAllCategoryIds: jest.fn(),
    getRtaCategoryId: jest.fn(),
    createMonths: jest.fn(),
  },
}));

const mockPrisma = {} as any;

describe("ensureMonthsContinuity", () => {
  const userId = "user-123";
  const rtaCategoryId = "rta-id";

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("should do nothing if months are already up to date", async () => {
    const currentMonth = new Date("2025-08-01T00:00:00.000Z");
    jest.setSystemTime(currentMonth);

    (categoryRepository.getMostRecentMonths as jest.Mock).mockResolvedValue([
      {
        categoryId: "cat-1",
        month: currentMonth,
        available: new Prisma.Decimal(100),
      },
    ]);

    await ensureMonthsContinuity(mockPrisma, userId);

    expect(categoryRepository.createMonths).not.toHaveBeenCalled();
  });

  it("should create a single missing month for all categories", async () => {
    const lastMonth = new Date("2025-07-01T00:00:00.000Z");
    const currentMonth = new Date("2025-08-01T00:00:00.000Z");
    jest.setSystemTime(currentMonth);

    (categoryRepository.getMostRecentMonths as jest.Mock).mockResolvedValue([
      {
        categoryId: rtaCategoryId,
        month: lastMonth,
        available: new Prisma.Decimal(-50),
      },
      {
        categoryId: "cat-2",
        month: lastMonth,
        available: new Prisma.Decimal(100),
      },
      {
        categoryId: "cat-3",
        month: lastMonth,
        available: new Prisma.Decimal(-20),
      }, // Should carry over 0
    ]);

    (categoryRepository.getAllCategoryIds as jest.Mock).mockResolvedValue([
      { id: rtaCategoryId },
      { id: "cat-2" },
      { id: "cat-3" },
    ]);

    (categoryRepository.getRtaCategoryId as jest.Mock).mockResolvedValue(
      rtaCategoryId
    );

    await ensureMonthsContinuity(mockPrisma, userId);

    expect(categoryRepository.createMonths).toHaveBeenCalledTimes(1);
    const createdMonths: Prisma.MonthCreateManyInput[] = (
      categoryRepository.createMonths as jest.Mock
    ).mock.calls[0][1];

    expect(createdMonths).toHaveLength(3);

    // Check RTA carry-over
    expect(createdMonths).toContainEqual({
      categoryId: rtaCategoryId,
      month: new Date("2025-08-01T00:00:00.000Z"),
      activity: ZERO,
      assigned: ZERO,
      available: new Prisma.Decimal(-50),
    });

    // Check positive carry-over
    expect(createdMonths).toContainEqual({
      categoryId: "cat-2",
      month: new Date("2025-08-01T00:00:00.000Z"),
      activity: ZERO,
      assigned: ZERO,
      available: new Prisma.Decimal(100),
    });

    // Check negative carry-over is reset to zero
    expect(createdMonths).toContainEqual({
      categoryId: "cat-3",
      month: new Date("2025-08-01T00:00:00.000Z"),
      activity: ZERO,
      assigned: ZERO,
      available: ZERO,
    });
  });

  it("should create multiple missing months", async () => {
    const lastMonth = new Date("2025-05-01T00:00:00.000Z");
    const currentMonth = new Date("2025-08-01T00:00:00.000Z");
    jest.setSystemTime(currentMonth);

    (categoryRepository.getMostRecentMonths as jest.Mock).mockResolvedValue([
      {
        categoryId: "cat-1",
        month: lastMonth,
        available: new Prisma.Decimal(100),
      },
    ]);

    (categoryRepository.getAllCategoryIds as jest.Mock).mockResolvedValue([
      { id: "cat-1" },
    ]);
    (categoryRepository.getRtaCategoryId as jest.Mock).mockResolvedValue(
      rtaCategoryId
    );

    await ensureMonthsContinuity(mockPrisma, userId);

    expect(categoryRepository.createMonths).toHaveBeenCalledTimes(1);
    const createdMonths: Prisma.MonthCreateManyInput[] = (
      categoryRepository.createMonths as jest.Mock
    ).mock.calls[0][1];

    expect(createdMonths).toHaveLength(3);
    expect(createdMonths.map((m) => m.month)).toEqual([
      new Date("2025-06-01T00:00:00.000Z"),
      new Date("2025-07-01T00:00:00.000Z"),
      new Date("2025-08-01T00:00:00.000Z"),
    ]);
  });
});
