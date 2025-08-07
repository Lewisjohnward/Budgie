import { useEditMonthMutation } from "@/core/api/budgetApiSlice";
import { MonthsToUpdate } from "../types/assignTypes";

export const useUpdateMonths = () => {
  const [editMonth] = useEditMonthMutation();

  const updateMonths = async (monthsToUpdate: MonthsToUpdate[]) => {
    if (!monthsToUpdate || monthsToUpdate.length === 0) return;

    for (const action of monthsToUpdate) {
      await editMonth({
        assigned: action.assigned.toString(),
        monthId: action.monthId,
      });
    }
  };

  return { updateMonths };
};
