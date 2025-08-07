import { CategoryCell, ExpandButton } from "./";
import { darkBlueText } from "@/core/theme/colors";

interface CategoryTableHeaderProps {
  showExpandButton: boolean;
  open: boolean;
  onClick: () => void;
}

export function CategoryTableHeader({
  showExpandButton,
  open,
  onClick,
}: CategoryTableHeaderProps) {
  return (
    <>
      {showExpandButton ? (
        <ExpandButton open={open} onClick={onClick} />
      ) : null}
      <div className={`${darkBlueText} font-[300]`}>CATEGORY</div>
      <CategoryCell>
        <span className="text-sky-950 font-[300]">ASSIGNED</span>
      </CategoryCell>
      <CategoryCell>
        <span className="text-sky-950 font-[300]">ACTIVITY</span>
      </CategoryCell>
      <CategoryCell>
        <span className="text-sky-950 font-[400]">AVAILABLE</span>
      </CategoryCell>
    </>
  );
}
