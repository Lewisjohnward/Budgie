import { Pencil } from "lucide-react";
import { ReactNode } from "react";
import { FaRegCreditCard, FaRegMoneyBillAlt } from "react-icons/fa";
import { Button } from "@/core/components/uiLibrary/button";

type AccountHeaderProps = {
  name: string;
  type: "BANK" | "CREDIT_CARD" | "ALL_ACCOUNTS";
  showEditButton: boolean;
  onEdit: () => void;
};

export function AccountHeader({
  name,
  type,
  showEditButton,
  onEdit,
}: AccountHeaderProps) {
  return (
    <div className="flex justify-between">
      <div className="space-y-2">
        <AccountName>{name}</AccountName>
        {type === "BANK" && <BankType />}
        {type === "CREDIT_CARD" && <CreditCardType />}
      </div>
      {showEditButton && (
        <Button
          onClick={onEdit}
          className="bg-blue-700/20 hover:bg-blue-700/30 shadow-none"
        >
          <Pencil className="text-blue-800" />
        </Button>
      )}
    </div>
  );
}

function BankType() {
  return (
    <div className="flex items-center gap-[5px]">
      <FaRegMoneyBillAlt className="text-gray-600" />
      <p className="text-sm text-gray-600">Bank Account</p>
    </div>
  );
}

function CreditCardType() {
  return (
    <div className="flex items-center gap-[5px]">
      <FaRegCreditCard className="text-gray-600" />
      <p className="text-sm text-gray-600">Credit Card</p>
    </div>
  );
}

function AccountName({ children }: { children: ReactNode }) {
  return <h1 className="font-bold text-2xl tracking-wide">{children}</h1>;
}
