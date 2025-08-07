import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useEditMonthMutation } from "@/core/api/budgetApiSlice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Month, MonthSchema } from "@/core/types/MonthSchema";

export const EditAssigned = forwardRef<
  HTMLInputElement,
  { assigned: number; monthId: string }
>(({ assigned, monthId }, ref) => {
  const [editMonth] = useEditMonthMutation();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const currency = "£";

  const { register, handleSubmit, reset, getValues, setValue } = useForm<Month>(
    {
      defaultValues: {
        assigned: "",
        monthId,
      },
      resolver: zodResolver(MonthSchema),
    },
  );

  const valueWithCurrency = `${assigned.toFixed(2)}`;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    setIsFocused(true);
    setValue("assigned", assigned.toFixed(2));

    e.target.select();
  };

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.select();
    }
  }, [isFocused]);

  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, [
    inputRef,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const onSubmit = (updatedValue: Month) => {
    if (Number(updatedValue.assigned) === Number(assigned)) return;
    editMonth(updatedValue);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex justify-end">
      <input
        className="w-full px-1 text-right border border-transparent rounded focus:border-sky-950 hover:border-sky-950 focus:outline-none focus:ring-0 placeholder:text-black"
        placeholder={valueWithCurrency}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        {...register("assigned", { required: "Username is required" })}
        onBlur={handleSubmit(onSubmit)}
        ref={(e) => {
          register("assigned").ref(e);
          inputRef.current = e;
        }}
      />
    </form>
  );
});

function Available({ value }: { value: number }) {
  const style =
    value < 0
      ? "bg-rose-300 text-red-950"
      : value > 0
        ? "bg-green-200"
        : "bg-slate-200 text-slate-500";

  return <span className={`${style} rounded-lg`}>{value.toFixed(2)}</span>;
}
