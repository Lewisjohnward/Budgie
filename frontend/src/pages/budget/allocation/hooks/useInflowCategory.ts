import { MappedAllocationData } from "@/core/types/Allocation";

export function useInflowCategory(
  allocationData: MappedAllocationData,
  selectedMonthIndex: number,
) {
  const { categoryGroups, categories, months } = allocationData;

  const inflowGroupId = Object.keys(categoryGroups).find(
    (key) => categoryGroups[key].name === "Inflow",
  )!;

  const assignId = categoryGroups[inflowGroupId].categories[0];
  const assignMonthIds = categories[assignId].months;
  const assignableAmount = months[assignMonthIds[selectedMonthIndex]].available;

  return { inflowGroupId, assignId, assignableAmount };
}
