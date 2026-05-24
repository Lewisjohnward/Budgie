import { cn } from "@/core/lib/utils";
import { ReactNode } from "react";
import { CategoryGroupId } from "../../../types/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  children: ReactNode;
  className?: string;
  id?: CategoryGroupId;
};

export function CategoryGridRow({ children, className, id }: Props) {
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
        "py-2 px-2 grid grid-cols-[30px_20fr_3fr_3fr_3fr] gap-x-2 border bg-white",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
