import { Modifier } from "@dnd-kit/core";

export const preserveGrabPoint: Modifier = ({
  activatorEvent,
  activeNodeRect,
  draggingNodeRect,
  transform,
}) => {
  if (
    !(activatorEvent instanceof MouseEvent) ||
    !activeNodeRect ||
    !draggingNodeRect
  ) {
    return transform;
  }

  const grabOffsetX = activatorEvent.clientX - activeNodeRect.left;
  const grabOffsetY = activatorEvent.clientY - activeNodeRect.top;

  const overlayOffsetX = draggingNodeRect.left - activeNodeRect.left;
  const overlayOffsetY = draggingNodeRect.top - activeNodeRect.top;

  return {
    ...transform,
    x: transform.x + grabOffsetX - overlayOffsetX,
    y: transform.y + grabOffsetY - overlayOffsetY,
  };
};
