export function Balance({ balance }: { balance: number }) {
  const textColor = balance > 0 ? "text-white" : "text-red-600";
  const bgColor = balance > 0 ? "bg-transparent" : "bg-white";

  return (
    <p className={`min-w-max rounded px-2 ${textColor} ${bgColor}`}>
      £{balance.toFixed(2)}
    </p>
  );
}
