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
import { calculateBarColors } from "./utils/calculateBarColors";

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
          <CategoryGridRow>
            {categoryGroups.length > 0 ? (
              <ExpandButton
                open={expandCategoryGroups.atLeastOneGroupOpen}
                onClick={expandCategoryGroups.expandAllCategoryGroups}
              />
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
          </CategoryGridRow>

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
                      <ExpandButton
                        open={categoryGroup.open}
                        onClick={() =>
                          expandCategoryGroups.expandCategoryGroup(
                            categoryGroup.id,
                          )
                        }
                      />
                      <div className="flex min-w-0 items-center gap-2">
                        <Checkbox className="size-3 rounded-[2px] shadow-none" />
                        <p className={`${darkBlueText} font-bold truncate`}>
                          {categoryGroup.name}
                        </p>
                        <AddCategoryPopover id={categoryGroup.id}>
                          <AddCircleIcon
                            className={`${darkBlueText} invisible group-hover:visible`}
                          />
                        </AddCategoryPopover>
                      </div>
                      <CategoryCell>
                        <span className="px-2">
                        </span>
                      </CategoryCell>
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
  return <div className="flex flex-col h-full">{children}</div>;
}

function FlexContainer({ children }: { children: ReactNode }) {
  return <div className="overflow-scroll flex h-full">{children}</div>;
}

function WideCategoriesContainer({ children }: { children: ReactNode }) {
  return <div className="xl:basis-3/4 overflow-scroll"> {children}</div>;
}

function AssignContainer({ children }: { children: ReactNode }) {
  return (
    <div
      className={`hidden xl:flex flex-col basis-1/4 h-full p-4 bg-gray-200 overflow-y-scroll`}
    >
      {children}
    </div>
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
    <div className="py-2 px-2 grid grid-cols-[30px_20fr_3fr_3fr_3fr] gap-x-2 border-t">
      {children}
    </div>
  );
}

function CategoryCell({ children }: { children: ReactNode }) {
  return <div className="px-1 text-right whitespace-nowrap">{children}</div>;
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

  const { activity, available, assigned } = month;
  const values = calculateBarColors({ activity, available, assigned });

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
            <div className="w-5/6">
              <div className="flex justify-between items-center gap-8">
              <p className="truncate">{category.name}</p>
                <div className="flex gap-2">
                  <p className="text-sm font-[500] text-gray-600 whitespace-nowrap">
                    {values.message?.important ?? ""}
                  </p>
                  {values.message?.text && (
                    <p className="text-sm text-gray-600 whitespace-nowrap">
                      {values.message.text ?? ""}
                    </p>
                  )}
                </div>
              </div>
              <ProgressBar
                spent={values.green}
                available={values.lightGreen}
                overspent={values.red}
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

function ExpandButton({ open, onClick }: { open: any; onClick: any }) {
  return (
    <button onClick={onClick}>
      <ChevronDownIcon
        className={clsx(
          open ? "" : "-rotate-90",
          `m-auto h-4 w-4 ${darkBlueText}`,
        )}
      />
    </button>
  );
}
