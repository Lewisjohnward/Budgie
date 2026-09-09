import { useDroppable } from "@dnd-kit/core";

type CategoryGroupDropZoneProps = {
  groupId: string;
  active: boolean;
  enabled: boolean;
};

export function CategoryGroupDropZone({
  groupId,
  enabled,
}: CategoryGroupDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: groupId,
  });

  return (
    <div ref={setNodeRef} className="relative h-0">
      {isOver && enabled && (
        <div className="absolute inset-x-0 top-0 h-1 bg-stone-100" />
      )}
    </div>
  );
}
