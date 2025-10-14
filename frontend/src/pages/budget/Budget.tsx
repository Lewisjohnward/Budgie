import Navbar from "./navBar/NavBar";
import { Outlet } from "react-router-dom";
import {
  useGetAccountsQuery,
  useGetCategoriesQuery,
} from "@/core/api/budgetApiSlice";
import { ManagePayees } from "@/core/components/ManagePayees/ManagePayees";
import { EditAccount } from "@/core/components/EditAccount/EditAccount";

export default function BudgetPage() {
  const { isLoading: isLoadingAccounts } = useGetAccountsQuery();
  const { isLoading: isLoadingCategories } = useGetCategoriesQuery();

  if (isLoadingAccounts || isLoadingCategories) {
    return <div className="h-screen bg-blue-400">...Getting data</div>;
  }
    return <main className="flex h-dvh">
      <Navbar />
      <div className="flex-grow overflow-scroll">
        <Outlet />
      </div>
      <ManagePayees />
      <EditAccount />
    </main>
}
