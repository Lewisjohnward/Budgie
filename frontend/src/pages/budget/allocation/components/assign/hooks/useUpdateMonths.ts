import { useEditMonthMutation } from "@/core/api/budgetApiSlice";
import { MonthsToUpdate } from "../types/assignTypes";

export const useUpdateMonths = () => {
  const [editMonth] = useEditMonthMutation();

  const updateMonths = async (monthsToUpdate: MonthsToUpdate[]) => {
    if (!monthsToUpdate || monthsToUpdate.length === 0) return;

    console.log("monthsToUpdate:", monthsToUpdate);
    await editMonth({
      assignments: monthsToUpdate.map((m) => ({
        ...m,
        assigned: m.assigned,
      })),
    });
  };

  return { updateMonths };
};
