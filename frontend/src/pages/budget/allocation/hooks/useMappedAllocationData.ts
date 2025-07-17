import { useEffect, useState } from "react";
import { produce } from "immer";
import {
  AllocationData,
  MappedAllocationData,
  MappedCategoryGroup,
  MappedMonth,
} from "@/core/types/Allocation";

function mapAllocationData(data: AllocationData): MappedAllocationData {
  return produce(data, (draft) => {
    Object.values(draft.months).forEach((month) => {
      (month as MappedMonth).current = false;
    });
    Object.values(draft.categoryGroups).forEach((group) => {
      (group as MappedCategoryGroup).open = true;
    });
  }) as MappedAllocationData;
}

export function useMappedAllocationData(data?: AllocationData) {
  const [allocationData, setAllocationData] = useState(() =>
    data ? mapAllocationData(data) : ({} as MappedAllocationData),
  );

  useEffect(() => {
    if (data) setAllocationData(mapAllocationData(data));
  }, [data]);

  return { allocationData, setAllocationData };
}
