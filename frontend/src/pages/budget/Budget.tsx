import Navbar from "./navBar/NavBar";
import { Outlet } from "react-router-dom";
import { useGetCategoriesQuery } from "@/core/api/budgetApiSlice";
import { ManagePayees } from "@/core/components/ManagePayees/ManagePayees";
import { EditAccount } from "@/core/components/EditAccount/EditAccount";
import { useGetBudgetSnapshotQuery } from "@/core/api/budget/budgetSnapshotSlice";

export default function BudgetPage() {
  const {
    isLoading: isLoadingCategories,
    isUninitialized: isUninitializedCategories,
  } = useGetCategoriesQuery();

  const {
    isLoading: isLoadingAppSnapshot,
    isError: isErrorAppSnapshot,
    isUninitialized: isUnitializedAppSnapshot,
  } = useGetBudgetSnapshotQuery();

  if (
    isLoadingAppSnapshot ||
    isLoadingCategories ||
    isUnitializedAppSnapshot ||
    isUninitializedCategories
  ) {
    return <div className="h-screen bg-blue-400">...Getting data</div>;
  }

  if (
    // isErrorAccounts
    //   || isErrorCategories ||
    isErrorAppSnapshot
  ) {
    return <div className="h-screen bg-red-400">Error getting data</div>;
  }

  return (
    <main className="flex h-dvh">
      <Navbar />
      <div className="flex-1 min-h-0">
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
