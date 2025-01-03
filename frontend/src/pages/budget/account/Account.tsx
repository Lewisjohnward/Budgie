import { CirclePlus } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import { MyTable } from "./components/Table";
import {
  useAddTransactionMutation,
  useGetAccountsQuery,
} from "@/core/api/budgetApiSlice";

export type Transaction = {
  id: string;
  accountId: string;
  categoryId: string;
  budgetId: string;
  date: string;
  payee: string;
  memo: string;
  outflow: number;
  inflow: number;
  cleared: boolean;
  // TODO: don't need these two
  createdAt: string;
  updatedAt: string;
};

export type Account = {
  name: string;
  clearedBalance?: number;
  unclearedBalance?: number;
  transactions: Transaction[];
};

export function Account() {
  // TODO: GET TRANSACTION DATA
  const { data, isLoading, isError } = useGetAccountsQuery();
  const [addTransaction] = useAddTransactionMutation();

  if (isLoading) return <div>...loading</div>;
  if (isError) return <div>...error</div>;

  const { accountId } = useParams();

  const location = useLocation();
  console.log("I am remounted");

  if (isLoading) return <div>loading</div>;
  console.log("data", data);

  const [chosenAccount] = Object.values(data.data.accounts).filter(
    ({ id }) => id === accountId,
  );

  console.log(chosenAccount);

  // return <div>temp</div>;

  const transactions = Object.values(data.data.transactions)
    .filter((transaction) => transaction.accountId === accountId)
    .map((transaction) => {
      const category = data.data.categories[transaction.categoryId];
      return { ...transaction, category };
    });

  const account = {
    name: chosenAccount.name,
    clearedBalance: 0,
    unclearedBalance: 0,
    transactions,
    // transactions: formattedTransactions
  };

  const handleSubmitTransaction = async () => {
  };

  // TODO: remove the ! for unassigned below

  return (
    <div className="h-full flex flex-col space-y-2">
      <div className="p-4 font-bold text-2xl tracking-tight">
        {account!.name}
      </div>
      <div className="h-[1px] bg-black/20" />
      <div className="px-4">
        <p>Balance</p>
      </div>
      <div className="h-[1px] bg-black/20" />
      <div className="px-2">
        <button
          className="flex items-center gap-2 hover:bg-sky-950/10 px-4 py-2 rounded"
          onClick={handleSubmitTransaction}
        >
          <CirclePlus className="text-sky-950" size={20} />
          Add Transaction
        </button>
      </div>
      <MyTable transactions={account!.transactions} />
    </div>
  );
}
