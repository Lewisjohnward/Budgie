import { ArrowDown, ArrowUp, CirclePlus } from "lucide-react";
import { useParams } from "react-router-dom";
import {
  useAddTransactionMutation,
  useGetAccountsQuery,
} from "@/core/api/budgetApiSlice";
import { MyTable } from "./components/Table";
import { ReactNode, useMemo, useState } from "react";
import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/uiLibrary/table";
import clsx from "clsx";
import { Transaction } from "@/core/types/NormalizedData";
import { Button } from "@/core/components/uiLibrary/button";
import { Input } from "@/core/components/uiLibrary/input";
import { DatePickerDemo } from "@/core/components/uiLibrary/datePicker";

export function Account() {
  // TODO: GET TRANSACTION DATA
  const { data, isLoading, isError } = useGetAccountsQuery();
  const [addTransaction] = useAddTransactionMutation();

  if (isLoading) return <div>...loading</div>;
  if (isError) return <div>...error</div>;
  if (!data) return <div>There has been an error</div>;

  const { accountId } = useParams();

  if (isLoading) return <div>loading</div>;

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
    balance: chosenAccount.balance,
    // clearedBalance: 0,
    // unclearedBalance: 0,
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

  const handleOpenAddTransaction = () => {
    setAddingTransaction(true);
  };

  const [addingTransaction, setAddingTransaction] = useState(false);

  // TODO: remove the ! for unassigned below

  return (
    <div className="space-y-2 pt-4">
      <Container>
        <AccountName>{account!.name}</AccountName>
      </Container>
      <Separator />
      <Container>
        <Balance balance={account.balance} />
      </Container>
      <Separator />
      <Container>
        <AddTransactionButton onClick={handleOpenAddTransaction} />
      </Container>
      <MyTable
        transactions={account!.transactions}
        addingTransaction={addingTransaction}
      />
    </div>
  );
}

// COMPONENTS
function Balance({ balance }: { balance: number }) {
  const color = balance > 0 ? "text-green-600" : "text-red-600";
  const formattedBalance = balance.toFixed(2);

  return (
    <div>
      <p className={`${color} font-semibold`}>£{formattedBalance}</p>
      <p className="text-gray-600">Balance</p>
    </div>
  );
}

function AccountName({ children }: { children: ReactNode }) {
  return <h1 className="font-bold text-2xl tracking-tight">{children}</h1>;
}

function Container({ children }: { children: ReactNode }) {
  return <div className="px-4 py-2">{children}</div>;
}

function Separator() {
  return <div className="h-[1px] bg-black/20" />;
}

function AddTransactionButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="flex items-center gap-2 px-2 py-2 text-sky-950 border border-sky-950/40 rounded text-sm hover:bg-sky-950/10"
      onClick={onClick}
    >
      <CirclePlus size={15} />
      Add Transaction
    </button>
  );
}
