import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/core/lib/utils";

type CategoryGroupDropZoneProps = {
  groupId: string;
  active: boolean;
  enabled: boolean;
};

export function CategoryGroupDropZone({
  groupId,
  active,
  enabled,
}: CategoryGroupDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: groupId,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        active ? "h-0" : "h-0",
        isOver && enabled && "h-10 bg-stone-100"
      )}
    />
  );
}
