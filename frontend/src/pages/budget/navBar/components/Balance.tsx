import { numberToCurrency } from "@/core/lib/numberToCurrency";

export function Balance({ balance }: { balance: number }) {
  const textColor = balance >= 0 ? "text-white" : "text-red-600";
  const bgColor = balance >= 0 ? "bg-transparent" : "bg-white";
  const formattedBalance = numberToCurrency(balance);

  return (
    <p className={`min-w-max rounded px-2 ${textColor} ${bgColor}`}>
      {formattedBalance}
    </p>
  );
}
