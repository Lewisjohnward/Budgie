import { Link } from "react-router-dom";
import { IoCloseOutline } from "react-icons/io5";
import clsx from "clsx";

import { BirdIcon } from "@/core/icons/icons";
import useMouseOverTimeout from "@/core/hooks/useMouseOverTimeout";

export default function AccountSettingsHeader() {
  const { mouseOver, handleMouseOver } = useMouseOverTimeout();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 px-4 py-2 shadow-md">
      <Link
        to="/budget/allocation"
        className="w-fit flex items-center gap-4 text-sky-700"
        onMouseEnter={handleMouseOver}
      >
        <BirdIcon
          className={clsx(mouseOver && "animate-shake", "h-8 w-8")}
          data-testid="icon"
        />
        <span className="hidden sm:inline">Back to Plan</span>
        <span className="inline sm:hidden">Plan</span>
      </Link>
      <h1 className="hidden sm:inline text-center text-xl font-[500]">
        Account settings
      </h1>
      <div className="flex justify-end items-center">
        <Link
          to="/budget/allocation"
          className="flex items-center gap-4 text-sky-700"
        >
          <IoCloseOutline size={25} />
        </Link>
      </div>
    </div>
  );
}
