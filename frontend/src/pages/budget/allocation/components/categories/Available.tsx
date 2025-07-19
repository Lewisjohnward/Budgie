export function Available({ value }: { value: number }) {
  const style =
    value < 0
      ? "bg-rose-300 text-red-950"
      : value > 0
        ? "bg-green-200"
        : "bg-slate-200 text-slate-500";

  return <span className={`${style} rounded-lg`}>{value.toFixed(2)}</span>;
}
