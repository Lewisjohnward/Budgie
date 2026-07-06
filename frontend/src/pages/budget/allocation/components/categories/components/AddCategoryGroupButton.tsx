import { CirclePlus } from "lucide-react";
import { forwardRef } from "react";

export const AddCategoryGroupButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function AddCategoryGroupButton(props, ref) {
  return (
    <button
      ref={ref}
      type="button"
      {...props}
      className="flex items-center gap-2 px-2 py-2 text-sky-950 rounded text-sm hover:bg-sky-950/10"
    >
      <CirclePlus size={15} />
      <span>Category Group</span>
    </button>
  );
});
