import { numberToCurrency } from "@/core/lib/numberToCurrency";

type AccountInfoProps = {
  balance: number;
};

export function AccountInfo({ balance }: AccountInfoProps) {
  const color = balance >= 0 ? "text-green-600" : "text-red-600";
  const formattedBalance = numberToCurrency(balance);

  return (
    <div>
      <p className={`${color} font-semibold`}>{formattedBalance}</p>
      <p className="text-gray-600">Balance</p>
    </div>
  );
}
