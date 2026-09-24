import { cn } from "@/core/lib/utils";
import { ReactNode } from "react";
import { CategoryGroupId } from "../../../types/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  children: ReactNode;
  isSelected?: boolean;
  className?: string;
  id?: CategoryGroupId;
  "aria-label"?: string;
  onClick?: React.MouseEventHandler;
  onContextMenu?: React.MouseEventHandler;
};

export function CategoryGridRow({
  children,
  isSelected,
  className,
  id,
  "aria-label": ariaLabel,
  onClick,
  onContextMenu,
}: Props) {
  const sortable = id
    ? useSortable({
      id,
      data: {
        type: "group",
      },
    })
    : null;

  const style = sortable
    ? {
      transform: CSS.Transform.toString(sortable.transform),
      transition: sortable.transition,
      opacity: sortable.isDragging ? 0.4 : 1,
    }
    : undefined;

  return (
    <div
      ref={sortable?.setNodeRef}
      {...sortable?.attributes}
      {...sortable?.listeners}
      className={cn(
        "py-2 px-2 grid grid-cols-[30px_20fr_3fr_3fr_3fr] gap-x-2 border",
        isSelected ? "bg-blue-100" : "bg-white",
        className
      )}
      style={style}
      role="row"
      aria-label={ariaLabel}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {children}
    </div>
  );
}
