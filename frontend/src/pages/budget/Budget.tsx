import { useNavigate } from "react-router-dom";
import { logOut } from "@/core/auth/authSlice";
import { useAppDispatch } from "@/core/hooks/reduxHooks";
import Navbar from "./components/navBar/NavBar";
import Header from "./components/header/Header";
import Body from "./components/categories/Categories";
import { ReactNode } from "react";
import { bgGray, borderBottom } from "@/core/theme/colors";
import Assign from "./components/assign/Assign";

export default function BudgetPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function logout(): void {
    dispatch(logOut());
    navigate("/login", { replace: true });
  }

  return <BudgetContent />;
}

function BudgetContent() {
  return (
    <BudgetLayout
      navBar={<Navbar />}
      header={<Header />}
      menu={<Menu />}
      categories={<Body />}
      assign={<Assign />}
    />
  );
}

function BudgetLayout({
  navBar,
  header,
  menu,
  categories,
  assign,
}: {
  navBar: ReactNode;
  header: ReactNode;
  menu?: ReactNode;
  categories: ReactNode;
  assign: ReactNode;
}) {
  return (
    <main className="flex h-dvh">
      {navBar}
      <div className="flex-grow flex flex-col">
        <div className={`px-4 py-2 border-b ${borderBottom}`}>{header}</div>
        <div className="overflow-hidden flex-grow flex">
          <div className="flex-grow-2 flex flex-col">
            <div className="border-r border-r-gray-300">
              <div className="py-2 border-b border-b-gray-200">{menu}</div>
              {categories}
            </div>
          </div>
          <div
            className={`overflow-scroll hidden flex-grow xl:flex p-4 ${bgGray}`}
          >
            {assign}
          </div>
        </div>
      </div>
    </main>
  );
}

function Menu() {
  return (
    <div className="px-2">
      <div>menu component budget</div>
    </div>
  );
}
