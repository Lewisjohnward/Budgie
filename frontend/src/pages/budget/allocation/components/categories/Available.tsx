export function Available({ value }: { value: number }) {
  const currency = "£";
  const style =
    value < 0
      ? "bg-rose-300 text-red-950"
      : value > 0
        ? "bg-green-200"
        : "bg-slate-200 text-slate-500";

  return (
    <span className={`px-2 ${style} rounded-lg`}>
      {currency} {value.toFixed(2)}
    </span>
  );
}
