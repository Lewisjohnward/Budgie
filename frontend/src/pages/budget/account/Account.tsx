import { mockAccounts } from "@/mockData";
import { useLocation, useParams } from "react-router-dom";

type Transaction = {
  id: string;
  accountId: string;
  categoryId: string;
  budgetId: string;
  date: string;
  payee: string;
  memo: string;
  outflow: string;
  inflow: string;
  cleared: boolean;
  // TODO: don't need these two
  createdAt: string;
  updatedAt: string;
};

type Account = {
  name: string;
  clearedBalance?: number;
  unclearedBalance?: number;
  transactions: Transaction[];
};

export function Account() {
  const { accountId } = useParams();
  const location = useLocation();
  console.log(location.pathname);

  let transactions: Transaction[] = [];
  let account: Account;

  if (accountId) {
    const foundAccount = mockAccounts.find((acc) => acc.id === accountId);
    if (!foundAccount) {
      return <h1>Account not found</h1>;
    }

    account = {
      name: foundAccount.name,
      clearedBalance: 0,
      unclearedBalance: 0,
      transactions: foundAccount.transactions,
    };
  } else if (location.pathname === "/budget/account/all") {
    transactions = mockAccounts.flatMap((account) => account.transactions);

    account = {
      name: "All accounts",
      clearedBalance: 0,
      unclearedBalance: 0,
      transactions,
    };
  }

  return (
    <>
      <div className="p-4">
        <div className="font-bold text-2xl tracking-tight">{account!.name}</div>
      </div>
      <div className="w-full h-[1px] bg-black/20" />
    </>
  );
}
