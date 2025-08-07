import Navbar from "./navBar/NavBar";
import { Outlet } from "react-router-dom";
import {
  useGetAccountsQuery,
  useGetCategoriesQuery,
} from "@/core/api/budgetApiSlice";
import { ManagePayees } from "@/core/components/ManagePayees/ManagePayees";
import { EditAccount } from "@/core/components/EditAccount/EditAccount";

export default function BudgetPage() {
  const {
    isLoading: isLoadingAccounts,
    isError: isErrorAccounts,
    isUninitialized: isUninitializedAccounts,
  } = useGetAccountsQuery();
  const {
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
    isUninitialized: isUninitializedCategories,
  } = useGetCategoriesQuery();

  if (
    isLoadingAccounts ||
    isLoadingCategories ||
    isUninitializedAccounts ||
    isUninitializedCategories
  ) {
    return <div className="h-screen bg-blue-400">...Getting data</div>;
  }

  if (isErrorAccounts || isErrorCategories) {
    return <div className="h-screen bg-red-400">Error getting data</div>;
  }

  return (
    <main className="flex h-dvh">
      <Navbar />
      <div className="flex-grow overflow-scroll">
        <Outlet />
      </div>
      <ManagePayees />
      <EditAccount />
      {/* TODO: CONFIRMCATEGORYGROUPDELETE */}
      {/* TODO: CONFIRMCATEGORYDELETE */}
    </main>
  );
}

//TODO: the border is too thick above CATEGORY

// TODO: NEED TO TEST WHAT IT LOOKS LIKE WITHOUT CATEGORIES
// TODO: NEED TO TEST WHAT IT LOOKS LIKE WITHOUT CATEGORY GROUPS
// TODO: NEED TO TEST WHAT IT LOOKS LIKE WHEN CATEGORIES OVERFLOW VERTICAL
