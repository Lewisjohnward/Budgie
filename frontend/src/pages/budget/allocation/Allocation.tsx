import { AssignedMoney, MonthSelector } from "./components/header/Header";
import { AddCircleIcon, ChevronDownIcon } from "@/core/icons/icons";
import { ReactNode, useRef } from "react";
import {
  bgGray,
  borderBottom,
  darkBlueBgHoverDark,
  darkBlueText,
} from "@/core/theme/colors";
import Assign from "./components/assign/Assign";
import useMouseOverTimeout from "@/core/hooks/useMouseOverTimeout";
import clsx from "clsx";
import { useAllocation } from "./hooks/useAllocation";
import { CategoryContextMenu } from "./contextMenus/CategoryContextMenu";
import { Category } from "@/core/types/NormalizedData";
import { CategoryGroupContextMenu } from "./contextMenus/CategoryGroupContextMenu";
import { AddCategoryPopover } from "./popovers/AddCategoryPopover";
import { AddCategoryGroupPopover } from "./popovers/AddCategoryGroupPopover";
import { ProgressBar } from "./components/categories/ProgressBar";
import { EditAssigned } from "./components/categories/EditAssigned";
import { Available } from "./components/categories/Available";
import { Checkbox } from "@/core/components/uiLibrary/checkbox";
import { MappedMonth } from "@/core/types/Allocation";
import { CirclePlus } from "lucide-react";

export default function Allocation() {
  const {
    month,
    categoriesSelector,
    categoryGroups,
    categories,
    expandCategoryGroups,
    months,
    assignableAmount,
    uncategorisedGroup,
  } = useAllocation();

  return (
    <AllocationContainer>
      <HeaderContainer>
        <div className="flex gap-16 py-4">
          <MonthSelector month={month} />
          <AssignedMoney amount={assignableAmount} />
        </div>
        <CategorySelectorContainer>
          {categoriesSelector.map((catSelector) => (
            <CategorySelector key={catSelector} text={catSelector} />
          ))}
          <AddCategorySelectorButton />
        </CategorySelectorContainer>
      </HeaderContainer>

      <FlexContainer>
        <WideCategoriesContainer>
          <AddCategoryGroupPopover>
            <AddCategoryGroupButton />
          </AddCategoryGroupPopover>
          <div className="flex items-center gap-2 p-2">
            {categoryGroups.length > 0 ? (
              <button>
                <ChevronDownIcon
                  className={clsx(
                    expandCategoryGroups.atLeastOneGroupOpen
                      ? ""
                      : "-rotate-90",
                    `h-4 w-4 ${darkBlueText}`,
                  )}
                  onClick={expandCategoryGroups.expandAllCategoryGroups}
                />
              </button>
            ) : null}
            <div className={`${darkBlueText} font-thin`}>CATEGORY</div>
          </div>

          <CategoriesContainer display={uncategorisedGroup.display}>
            <CategoryGridRow>
              <EmptyCell />
              <div className="flex items-center gap-4">
                <Checkbox className="size-3 rounded-[2px] shadow-none" />
                <p>Uncategorised Transactions</p>
              </div>
              <p className="px-[5px] text-right">-</p>
              <CategoryCell>
                {uncategorisedGroup.month.activity.toFixed(2)}
              </CategoryCell>
              <CategoryCell>
                {uncategorisedGroup.month.available.toFixed(2)}
              </CategoryCell>
            </CategoryGridRow>
          </CategoriesContainer>

          {categoryGroups.map((categoryGroup) => {
            return (
              <Container key={categoryGroup.id}>
                <CategoryGroupContextMenu categoryGroup={categoryGroup}>
                  <div className="group bg-gray-400/20">
                    <CategoryGridRow>
                      <ExpandCategoryGroupButton
                        onClick={() =>
                          expandCategoryGroups.expandCategoryGroup(
                            categoryGroup.id,
                          )
                        }
                        open={categoryGroup.open}
                      />
                      <div className="w-3/4 flex min-w-0 items-center gap-2">
                        <Checkbox className="size-3 rounded-[2px] shadow-none" />
                        <CategoryGroupName>
                          {categoryGroup.name}
                        </CategoryGroupName>
                        <AddCategoryPopover id={categoryGroup.id}>
                          <AddCircleIcon
                            className={`${darkBlueText} invisible group-hover:visible`}
                          />
                        </AddCategoryPopover>
                      </div>
                      <CategoryCell>{categoryGroup.assigned}</CategoryCell>
                      <CategoryCell>{categoryGroup.activity}</CategoryCell>
                      <CategoryCell>{categoryGroup.available}</CategoryCell>
                    </CategoryGridRow>
                  </div>
                </CategoryGroupContextMenu>

                <CategoriesContainer display={categoryGroup.open}>
                  {categoryGroup.categories.map((cat) => {
                    const category = categories[cat];
                    const m = months[category.months[month.index]];

                    return (
                      <CategoryRow key={m.id} category={category} month={m} />
                    );
                  })}
                </CategoriesContainer>
              </Container>
            );
          })}
        </WideCategoriesContainer>
        <AssignContainer>
          <Assign />
        </AssignContainer>
      </FlexContainer>
    </AllocationContainer>
  );
}

function AllocationContainer({ children }: { children: ReactNode }) {
  return <div className="flex-grow flex flex-col">{children}</div>;
}

function FlexContainer({ children }: { children: ReactNode }) {
  return <div className="flex">{children}</div>;
}

function WideCategoriesContainer({ children }: { children: ReactNode }) {
  return <div className="flex-grow-2"> {children}</div>;
}

function AssignContainer({ children }: { children: ReactNode }) {
  return (
    <div className={`hidden flex-grow xl:flex p-4 ${bgGray}`}>{children}</div>
  );
}

function HeaderContainer({ children }: { children: ReactNode }) {
  return <div className={`px-4 py-2 border-b ${borderBottom}`}>{children}</div>;
}

function CategorySelectorContainer({ children }: { children: ReactNode }) {
  return <div className="gap-2 hidden md:flex"> {children}</div>;
}

function CategorySelector({ text }: { text: string }) {
  return (
    <button
      className={`px-2 py-1 ${bgGray} rounded hover:${darkBlueBgHoverDark}`}
    >
      <p className="text-xs">{text}</p>
    </button>
  );
}

function AddCategoryGroupButton() {
  return (
    <button className="flex items-center gap-2 px-2 py-2 text-sky-950 rounded text-sm hover:bg-sky-950/10">
      <CirclePlus size={15} />
      <span>Category Group</span>
    </button>
  );
}

function ExpandCategoryGroupButton({
  onClick,
  open,
}: {
  onClick: () => void;
  open: boolean;
}) {
  return (
    <button className="w-4" onClick={onClick}>
      <ChevronDownIcon
        className={clsx(
          open ? "rotate-0" : "-rotate-90",
          `h-4 w-4 ${darkBlueText}`,
        )}
      />
    </button>
  );
}

function CategoriesContainer({
  children,
  display,
}: {
  children: ReactNode;
  display: boolean;
}) {
  if (display) return children;
  return null;
}

function CategoryGridRow({ children }: { children: ReactNode }) {
  return (
    <div className="py-2 px-2 grid grid-cols-[20px_1fr_80px_80px_80px] gap-x-2 border-t">
      {children}
    </div>
  );
}

function CategoryCell({ children }: { children: ReactNode }) {
  return <div className="px-1 text-right">{children}</div>;
}

function EmptyCell() {
  return <div></div>;
}

function CategoryRow({
  category,
  month,
}: {
  category: Category;
  month: MappedMonth;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.focus();
  };
  return (
    <CategoryContextMenu category={category}>
      <div
        onClick={handleClick}
        className="focus-within:bg-gray-100/80 cursor-pointer"
      >
        <CategoryGridRow>
          <EmptyCell />
          <div className="flex items-center min-w-0 gap-4">
            <Checkbox className="size-3 rounded-[2px] shadow-none" />
            <div className="w-3/4">
              <p className="truncate">{category.name}</p>
              <ProgressBar
                activity={month.activity}
                available={month.available}
              />
            </div>
          </div>
          <EditAssigned
            ref={inputRef}
            assigned={month.assigned}
            monthId={month.id}
          />
          <CategoryCell>{month.activity.toFixed(2)}</CategoryCell>
          <CategoryCell>
            <Available value={month.available} />
          </CategoryCell>
        </CategoryGridRow>
      </div>
    </CategoryContextMenu>
  );
}

function AddCategorySelectorButton() {
  const { mouseOver, handleMouseOver } = useMouseOverTimeout();

  return (
    <button onMouseOver={handleMouseOver}>
      <AddCircleIcon
        className={clsx(
          mouseOver ? "rotate-180" : "",
          `h-4 w-4 ${darkBlueText} transition duration-500`,
        )}
      />
    </button>
  );
}

/////// CATEGORIES ALLOCATION

function Container({ children }: { children: ReactNode }) {
  return <div className="min-w-[600px]">{children}</div>;
}

function CategoryGroupName({ children }: { children: ReactNode }) {
  return <p className={`${darkBlueText}font-bold truncate`}>{children}</p>;
}
