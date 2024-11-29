import { logOut } from "@/core/auth/authSlice";
import { useAppDispatch } from "@/core/hooks/reduxHooks";
import Navbar from "./allocation/components/navBar/NavBar";
import { useGetDataQuery } from "@/core/api/budgetApiSlice";
import { Outlet } from "react-router-dom";

export default function BudgetPage() {
  return <BudgetContent />;
}

function BudgetContent() {
  const dispatch = useAppDispatch();
  const { data, isSuccess, isLoading } = useGetDataQuery();

  if (isLoading) return <div>loading baby</div>;

  if (isSuccess) {
    console.log("budget content - is success block");
    // console.log(data);

    // console.log("accounts", data.data.accounts);
    // console.log("budgets", data.budgets);
  }

  function logout() {
    dispatch(logOut());
  }

  return (
    <main className="flex h-dvh">
      <Navbar logout={logout} />
      <div className="flex-grow">
        <Outlet />
      </div>
    </main>
  );
}

export function Menu() {
  return (
    <div className="px-2">
      <div>menu component budget</div>
    </div>
  );
}
