import { MappedAllocationData } from "@/core/types/Allocation";

export function useInflowCategory(
  allocationData: MappedAllocationData,
  selectedMonthIndex: number,
) {
  const { categoryGroups, categories, months } = allocationData;

  const inflowGroupId = Object.keys(categoryGroups).find(
    (key) => categoryGroups[key].name === "Inflow",
  )!;

  const rtaCategoryId = categoryGroups[inflowGroupId].categories[0];
  const rtaMonthIds = categories[rtaCategoryId].months;
  const assignableAmount = months[rtaMonthIds[selectedMonthIndex]].available;

  return { inflowGroupId, assignableAmount };
}
