import { forwardRef, useEffect, useRef, useState } from "react";
import { useEditMonthMutation } from "@/core/api/budgetApiSlice";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MonthSchema } from "@/core/types/MonthSchema";
import { MonthId } from "../../../types/types";
import { useAllocateToMonthsMutation } from "@/core/api/budget/category/categoryApiSlice";

type AssignedAmountFieldProps = {
  assigned: number;
  monthId: MonthId;
};

type MonthForm = {
  assigned: string;
};

/**
 * Inline editor for a monthly "assigned" value.
 *
 * Displays the value in currency format when inactive (e.g. £12.00),
 * and switches to a raw numeric input when focused.
 *
 * Behavior:
 * - Focus → switches to editable numeric value and selects text
 * - Blur → submits value if changed
 * - Enter → submits and exits edit mode
 * - Escape → cancels edit
 *
 * The component is controlled externally via `assigned` and `monthId`.
 */
export const AssignedAmountField = forwardRef<
  HTMLInputElement,
  AssignedAmountFieldProps
>(({ assigned, monthId }, ref) => {
  const [allocateToMonths] = useAllocateToMonthsMutation();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isFocused, setIsFocused] = useState(false);
  const currency = "£";

  const { control, handleSubmit, reset } = useForm<MonthForm>({
    defaultValues: {
      assigned: String(assigned.toFixed(2)),
    },
    resolver: zodResolver(MonthSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    reset({ assigned: String(assigned.toFixed(2)) });
  }, [assigned, reset]);

  const onSubmit = (data: MonthForm) => {
    const next = Number(data.assigned);
    const prev = assigned;

    if (next === prev) return;

    allocateToMonths({
      assignments: [
        {
          monthId,
          assigned: next,
        },
      ],
    });

    reset({ assigned: String(next) });
    setIsFocused(false);
  };

  const format = (v: string) => `${currency} ${Number(v || 0).toFixed(2)}`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex justify-end">
      <Controller
        name="assigned"
        control={control}
        render={({ field }) => (
          <input
            {...field}
            ref={(el) => {
              field.ref(el);
              inputRef.current = el;
              if (typeof ref === "function") ref(el);
              else if (ref) ref.current = el;
            }}
            onClick={() => console.log(field.value)}
            className="w-full px-1 bg-transparent text-right border border-transparent rounded focus:border-sky-950 focus:bg-white hover:border-sky-950 focus:outline-none focus:ring-0 text-black"
            value={isFocused ? field.value : format(field.value)}
            onFocus={(e) => {
              setIsFocused(true);

              field.onChange(String(assigned.toFixed(2)));

              requestAnimationFrame(() => {
                e.target.value = String(assigned.toFixed(2));
                e.target.select();
              });
            }}
            onBlur={() => {
              setIsFocused(false);
              field.onBlur();
              handleSubmit(onSubmit)();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();

                setIsFocused(false);
                inputRef.current?.blur();
              }

              if (e.key === "Escape") {
                setIsFocused(false);
                inputRef.current?.blur();
              }
            }}
            onChange={(e) => {
              field.onChange(e.target.value);
            }}
          />
        )}
      />
    </form>
  );
});
