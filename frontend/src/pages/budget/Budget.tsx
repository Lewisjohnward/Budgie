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

  const handleClick = async () => {
  };

  return (
    <div className="px-2">
      <Popover modal={true}>
        <PopoverTrigger>
          <button
            className="flex items-center gap-2 px-2 py-2 text-sky-950 rounded text-sm hover:bg-sky-950/10"
            onClick={handleClick}
          >
            <CirclePlus size={15} />
            Category Group
          </button>
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent side={"bottom"} className="w-[200px] p-0 shadow-lg">
            <PopoverArrow className="w-8 h-2 fill-white" />
            <div className="px-2 py-2 space-y-2">
              <Input
                className="shadow-none focus-visible:ring-sky-950"
                placeholder="New Category Group"
              />
              <div className="flex justify-end gap-2">
                <Button className="bg-gray-400/80 hover:bg-gray-400/60">
                  Cancel
                </Button>
                <Button className="bg-sky-900 hover:bg-sky-950/80">Okay</Button>
              </div>
            </div>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    </div>
  );
}
