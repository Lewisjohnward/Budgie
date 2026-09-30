import { CollisionDetection, closestCorners } from "@dnd-kit/core";

export const createCollisionDetectionStrategy = (
  containerRef: React.RefObject<HTMLDivElement | null>
): CollisionDetection => {
  return (args) => {
    if (!args.pointerCoordinates) {
      return closestCorners(args);
    }

    const container = containerRef.current;

    if (!container) {
      return closestCorners(args);
    }

    const { x, y } = args.pointerCoordinates;
    const rect = container.getBoundingClientRect();

    const isInside =
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

    if (!isInside) {
      return [];
    }

    const { width, height } = args.collisionRect;

    const collisionRect = {
      ...args.collisionRect,
      left: x - width / 2,
      right: x + width / 2,
      top: y - height / 2,
      bottom: y + height / 2,
    };

    return closestCorners({
      ...args,
      collisionRect,
    });
  };
};
