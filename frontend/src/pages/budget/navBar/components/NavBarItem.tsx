import useMouseOver from "@/core/hooks/useMouseOver";
import { cn } from "@/core/lib/utils";
import clsx from "clsx";
import { Link } from "react-router-dom";

type NavBarItemProps = {
  to: string;
  selected: boolean;
  icon: React.ReactNode;
  text: string;
  open: boolean;
  className?: string;
};

export function NavbarItem({
  to,
  selected,
  className,
  icon,
  text,
  open,
}: NavBarItemProps) {
  const { mouseOver, handleMouseOver } = useMouseOver();

  return (
    <Link
      to={to}
      onMouseOver={handleMouseOver}
      className={cn(
        clsx(
          selected && "bg-white/10 cursor-auto",
          "w-full flex items-center gap-2 rounded px-4 py-2 h-10 hover:bg-white/10 select-none",
          className,
        ),
      )}
    >
      <div
        className={clsx(mouseOver && !selected && "animate-shake", "min-w-fit")}
      >
        {icon}
      </div>
      <p className="min-w-max">{open && text}</p>
    </Link>
  );
}
