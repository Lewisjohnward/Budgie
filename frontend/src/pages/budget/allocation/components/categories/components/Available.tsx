import { formatCurrency } from "@/utils/formatCurrency";

export function Available({ value }: { value: number }) {
  const style =
    value < 0
      ? "bg-rose-300"
      : value > 0
        ? "bg-green-200"
        : "bg-slate-200 text-slate-500";

  const formatted = formatCurrency(value);

  return <span className={`px-1 ${style} rounded-lg`}>{formatted}</span>;
}
