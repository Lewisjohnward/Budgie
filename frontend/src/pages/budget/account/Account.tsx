import { CirclePlus } from "lucide-react";
import { useParams } from "react-router-dom";
import {
  useAddTransactionMutation,
  useGetAccountsQuery,
} from "@/core/api/budgetApiSlice";
import { MyTable } from "./components/Table";

export function Account() {
  // TODO: GET TRANSACTION DATA
  const { data, isLoading, isError } = useGetAccountsQuery();
  const [addTransaction] = useAddTransactionMutation();

  if (isLoading) return <div>...loading</div>;
  if (isError) return <div>...error</div>;
  if (!data) return <div>There has been an error</div>;

  const { accountId } = useParams();

  if (isLoading) return <div>loading</div>;

  console.log(data);

  const [chosenAccount] = Object.values(data.accounts).filter(
    ({ id }) => id === accountId,
  );

  const transactions = Object.values(data.transactions)
    .filter((transaction) => transaction.accountId === accountId)
    .map((transaction) => {
      const category = data.categories[transaction.categoryId];
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
    const dummyTransaction = {
      accountId,
      // categoryId, doesn't need to be sent, by default will be this needs a category
      // date, default is today
      // inflow: 0.31,
      outflow: 5.69,
      // payee, not needed
      // TODO: FIX BUG BELOW
      // date: "2024-12-31", SENDING THIS will pass zod but fail db BUG!!!
      date: "2025-01-03T00:00:00.000Z",
      memo: "Sainsbury's hyper cheese bargs",
    };
    const result = await addTransaction(dummyTransaction);
    console.log(result);
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
          className="flex items-center gap-2 px-2 py-2 text-sky-950 border border-sky-950/40 rounded text-sm hover:bg-sky-950/10"
          onClick={handleSubmitTransaction}
        >
          <CirclePlus size={15} />
          Add Transaction
        </button>
      </div>
      <MyTable transactions={account!.transactions} />
    </div>
  );
}
