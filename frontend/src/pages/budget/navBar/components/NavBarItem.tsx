import useMouseOver from "@/core/hooks/useMouseOver";
import { cn } from "@/core/lib/utils";
import clsx from "clsx";
import { Link } from "react-router-dom";

export type NavBarItemProps = {
  to: string;
  selected: boolean;
  icon: React.ReactNode;
  text: string;
  displayText: boolean;
  className?: string;
};

export function NavbarItem({
  to,
  selected,
  className,
  icon,
  text,
  displayText,
}: NavBarItemProps) {
  const { mouseOver, handleMouseOver } = useMouseOver();
  console.log(displayText);

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
        data-testid="icon-container"
        className={clsx(mouseOver && !selected && "animate-shake", "min-w-fit")}
      >
        {icon}
      </div>
      {displayText && (
        <p data-testid="link-text" className="min-w-max">
          {text}
        </p>
      )}
    </Link>
  );
}
