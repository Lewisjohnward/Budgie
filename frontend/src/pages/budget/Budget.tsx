import { CirclePlus } from "lucide-react";
import Navbar from "./navBar/NavBar";
import { Outlet } from "react-router-dom";

export default function BudgetPage() {
  return <BudgetContent />;
}

function BudgetContent() {
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
      <button
        className="flex items-center gap-2 px-2 py-2 text-sky-950 rounded text-sm hover:bg-sky-950/10"
        onClick={() => {}}
      >
        <CirclePlus size={15} />
        Category Group
      </button>
    </div>
  );
}
