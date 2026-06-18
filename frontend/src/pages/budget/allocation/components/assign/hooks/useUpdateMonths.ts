import { type MonthsToUpdate } from "../types/assignTypes";
import { useAllocateToMonthsMutation } from "@/core/api/budget/category/categoryApiSlice";

export const useUpdateMonths = () => {
  const [allocateToMonths] = useAllocateToMonthsMutation();

  const updateMonths = async (monthsToUpdate: MonthsToUpdate[]) => {
    if (!monthsToUpdate || monthsToUpdate.length === 0) return;

    await allocateToMonths({
      assignments: monthsToUpdate.map((m) => ({
        ...m,
        assigned: m.assigned,
      })),
    });
  };

  return { updateMonths };
};
