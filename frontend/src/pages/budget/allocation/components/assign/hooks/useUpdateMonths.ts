import { useEditMonthMutation } from "@/core/api/budgetApiSlice";
import { MonthsToUpdate } from "../types/assignTypes";

export const useUpdateMonths = () => {
  const [editMonth] = useEditMonthMutation();

  const updateMonths = async (monthsToUpdate: MonthsToUpdate[]) => {
    if (!monthsToUpdate || monthsToUpdate.length === 0) return;

    await editMonth({ assignments: monthsToUpdate });
  };

  return { updateMonths };
};
