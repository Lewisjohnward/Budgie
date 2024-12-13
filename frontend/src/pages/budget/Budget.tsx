import Navbar from "./navBar/NavBar";
import { Outlet } from "react-router-dom";

export default function BudgetPage() {
  return <BudgetContent />;
}

function BudgetContent() {
  // const { data, isSuccess, isLoading } = useGetDataQuery();

  // if (isLoading) return <div>loading baby</div>;
  //
  // if (isSuccess) {
  //   console.log("budget content - is success block");
  //   // console.log(data);
  //
  //   // console.log("accounts", data.data.accounts);
  //   // console.log("budgets", data.budgets);
  // }


  return (
    <main className="flex h-dvh">
      <Navbar />
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
