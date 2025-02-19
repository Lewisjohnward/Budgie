import { AssignedMoney, MonthSelector } from "./components/header/Header";
import { AddCircleIcon, ChevronDownIcon } from "@/core/icons/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/uiLibrary/popover";
import {
  forwardRef,
  ReactNode,
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { PopoverArrow, PopoverPortal } from "@radix-ui/react-popover";
import { Input } from "@/core/components/uiLibrary/input";
import { Button } from "@/core/components/uiLibrary/button";
import { z } from "zod";
import {
  bgGray,
  borderBottom,
  darkBlueBgHoverDark,
  darkBlueText,
} from "@/core/theme/colors";
import Assign from "./components/assign/Assign";
import { Menu } from "../Budget";
import {
  useGetAccountsQuery,
  useGetCategoriesQuery,
} from "@/core/api/budgetApiSlice";
import { normalizedBudgetData } from "./mockData";
import { produce } from "immer";
import useMouseOverTimeout from "@/core/hooks/useMouseOverTimeout";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import { Checkbox } from "@radix-ui/react-checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { Progress } from "@/core/components/uiLibrary/progress";

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "2-digit",
    month: "short",
  });
}

function useAllocation() {
  useEffect(() => {}, []);

  const [allocationData, setAllocationData] = useState(
    produce(normalizedBudgetData, (draft) => {
      Object.values(draft.months).forEach((month) => {
        month.current = false;
      });
    }),
  );

  const [selector, setSelector] = useState(0);
  const [state, setState] = useState();
  const maxSelector = Object.keys(normalizedBudgetData).length - 1;
  const minSelector = 0;

  const { categoryGroups, categories } = allocationData;
  const months = Object.values(normalizedBudgetData.months).map((month, i) => ({
    ...month,
    current: i === selector ? true : false,
    formattedName: formatDate(month.month),
  }));

  const currentMonth = months.find((month) => month.current);

  const derivedCategoryGroups = currentMonth.categoryGroupIds.map(
    (catGroupId) => categoryGroups[catGroupId],
  );

  const categoriesSelector = [
    "All",
    "Underfunded",
    "Money available",
    "Snoozed",
  ];

  const nextMonth = () =>
    setSelector((prev) => (prev + 1 < maxSelector ? prev + 1 : prev));
  const prevMonth = () =>
    setSelector((prev) => (prev - 1 >= minSelector ? prev - 1 : prev));

  const handleAddCategory = (data: AddCategoryFormData) => {
    // addCategory(data);
    // appendedCategoryGroupId.current = data.categoryGroupId;
  };

  return {
    handleAddCategory,
    currentMonth,
    categoriesSelector,
    categoryGroups: derivedCategoryGroups,
    categories,
    nextMonth,
    prevMonth,
  };
}

export function Allocation() {
  const { isLoading: isLoadingAccounts } = useGetAccountsQuery();
  const { isLoading: isLoadingCategories } = useGetCategoriesQuery();
  //

  const {
    categoriesSelector,
    currentMonth,
    categoryGroups,
    categories,
    nextMonth,
    prevMonth,
    handleAddCategory,
  } = useAllocation();

  if (isLoadingCategories || isLoadingAccounts) return "...Loading";
  return (
    <AllocationContainer>
      <HeaderContainer>
        <div className="flex gap-8 py-4">
          <MonthSelector
            prevMonth={prevMonth}
            nextMonth={nextMonth}
            month={currentMonth?.formattedName || "?"}
          />
          <AssignedMoney />
        </div>
        <CategorySelectorContainer>
          {categoriesSelector.map((catSelector) => (
            <Category key={catSelector} text={catSelector} />
          ))}
          <AddCategorySelectorButton />
        </CategorySelectorContainer>
      </HeaderContainer>

      <BodyContainer>
        <WideCategoriesContainer>
          <Menu />
          <div className="flex items-center gap-2 p-2">
            {categoryGroups.length > 0 ? (
              <button>
                <ChevronDownIcon
                  className={clsx(
                    // atLeastOneCategoryGroupExpanded ? "" : "-rotate-90",
                    false ? "" : "-rotate-90",
                    `h-4 w-4 ${darkBlueText}`,
                  )}
                  // onClick={() => toggleDisplayCategories(undefined)}
                  onClick={() => {}}
                />
              </button>
            ) : null}
            <div className={`${darkBlueText} font-thin`}>CATEGORY</div>
          </div>
          {categoryGroups.map((group) => {
            const { categoryIds } = group;
            console.log("hello", categoryIds);
            return (
              <Container key={group.id}>
                <CategoryGroupContainer>
                  <ExpandCategoryGroup
                    // onClick={() => toggleDisplayCategories(group.id)}
                    onClick={() => {}}
                    // open={group.open}
                    open={true}
                  />
                  <Checkbox className="size-3 rounded-[2px] shadow-none" />
                  <CategoryGroupName>{group.name}</CategoryGroupName>
                  <AddCategoryButton
                    id={group.id}
                    handleAddCategory={handleAddCategory}
                  />
                </CategoryGroupContainer>

                <CategoriesContainer
                  display={true}
                  // display={group.open}
                >
                  {categoryIds.length > 0
                    ? categoryIds.map((categoryId) => {
                        const category = categories[categoryId];
                        const { id, name } = category;
                        const activity = category.amounts[currentMonth.month];

                        // const available = assigned - activity;

                        return (
                          <CategoryContent key={id}>
                            {(ref) => (
                              <>
                                <Checkbox className="size-3 rounded-[2px] shadow-none" />
                                <CategoryNameContainer>
                                  <CategoryName>{name}</CategoryName>
                                  <ProgressBar
                                    assigned={0}
                                    activity={activity}
                                    available={0}
                                  />
                                </CategoryNameContainer>
                                <EditAssigned
                                  ref={ref}
                                  // assigned={0.toFixed(2)}
                                  assigned={"0.00"}
                                />
                                <Activity>{activity.toFixed(2)}</Activity>
                                <Available>{"0.00"}</Available>
                              </>
                            )}
                          </CategoryContent>
                        );
                      })
                    : null}
                </CategoriesContainer>
              </Container>
            );
          })}
        </WideCategoriesContainer>
        <AssignContainer>
          <Assign />
        </AssignContainer>
      </BodyContainer>
    </AllocationContainer>
  );
}

function AllocationContainer({ children }: { children: ReactNode }) {
  return <div className="flex-grow flex flex-col">{children}</div>;
}

function BodyContainer({ children }: { children: ReactNode }) {
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

function Category({ text }: { text: string }) {
  return (
    <button
      className={`px-2 py-1 ${bgGray} rounded hover:${darkBlueBgHoverDark}`}
    >
      <p className="text-xs">{text}</p>
    </button>
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

function CategoryGroupContainer({ children }: { children: ReactNode }) {
  return (
    <div className={`group flex items-center gap-0 pl-2 bg-gray-400/20`}>
      <div className="flex-grow flex-shrink basis-56 flex items-center gap-4 py-2">
        {children}
      </div>
      <div className="flex-1 text-right">
        <p>Assigned</p>
      </div>
      <div className="flex-1 text-right">
        <p>Activity</p>
      </div>
      <div className="flex-1 text-right">
        <p>Available</p>
      </div>
    </div>
  );
}

function CategoryGroupName({ children }: { children: ReactNode }) {
  return <p className={`${darkBlueText} font-bold`}>{children}</p>;
}

const AddCategorySchema = z.object({
  categoryGroupId: z.string(),
  name: z.string().min(1),
});

type AddCategoryFormData = z.infer<typeof AddCategorySchema>;

function AddCategoryButton({
  id,
  handleAddCategory,
}: {
  id: string;
  handleAddCategory: (data: AddCategoryFormData) => void;
}) {
  const [displayAddCategory, setDisplayAddCategory] = useState(false);
  const close = () => {
    setDisplayAddCategory(false);
    reset();
  };
  const open = () => setDisplayAddCategory(true);

  const {
    register,
    handleSubmit,
    formState: { isValid },
    reset,
  } = useForm<AddCategoryFormData>({
    defaultValues: {
      categoryGroupId: id,
    },
    resolver: zodResolver(AddCategorySchema),
  });

  const createCategory = (data: AddCategoryFormData) => {
    handleAddCategory(data);
    close();
    reset();
  };

  return (
    <Popover open={displayAddCategory} modal={true}>
      <PopoverTrigger onClick={open}>
        <AddCircleIcon
          className={`${darkBlueText} invisible group-hover:visible`}
        />
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          onPointerDownOutside={close}
          avoidCollisions={false}
          side={"right"}
          className="w-[200px] p-0 shadow-lg"
        >
          <PopoverArrow className="w-8 h-2 fill-white" />
          <form
            className="px-2 py-2 space-y-2"
            onSubmit={handleSubmit(createCategory)}
          >
            <Input
              className="shadow-none focus-visible:ring-sky-950"
              placeholder="New Category"
              autoComplete="off"
              {...register("name")}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="reset"
                onClick={close}
                className="bg-gray-400 hover:bg-gray-400/80"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-sky-900 hover:bg-sky-950/80"
                disabled={!isValid}
              >
                Okay
              </Button>
            </div>
          </form>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
}

function ExpandCategoryGroup({
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

function CategoryName({ children }: { children: ReactNode }) {
  return children;
}

function CategoryNameContainer({ children }: { children: ReactNode }) {
  return (
    <div className="flex-grow basis-48 text-ellipsis whitespace-nowrap">
      {children}
    </div>
  );
}

function CategoryContent({
  children,
}: {
  children: (ref: RefObject<HTMLInputElement>) => ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleInputFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className={`flex items-center gap-4 py-2 pl-10 pr-2 border-b ${borderBottom} focus-within:bg-gray-100/80`}
      onClick={handleInputFocus}
    >
      {children(inputRef)}
    </div>
  );
}

const EditAssigned = forwardRef<HTMLInputElement, { assigned: string }>(
  ({ assigned }, ref) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [value, setValue] = useState(43);
    const [isFocused, setIsFocused] = useState(false);
    const currency = "£";

    const valueWithCurrency = `${currency} ${assigned}`;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement, Element>) => {
      setIsFocused(true);
      e.target.select();
    };

    useEffect(() => {
      if (isFocused && inputRef.current) {
        inputRef.current.select();
      }
    }, [isFocused]);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, [
      inputRef,
    ]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };

    // TODO: only allow numbers in input react hook form?
    // TODO: When clicking on the subcategory focus the assigned

    return (
      <div className="flex-1 flex justify-end p-[1px]">
        <input
          ref={inputRef}
          className="w-3/4 px-1 text-right border border-transparent rounded focus:border-sky-950 hover:border-sky-950 focus:outline-none focus:ring-0 placeholder:text-black"
          placeholder={valueWithCurrency}
          value={isFocused ? assigned : ""}
          onChange={(e) => setValue(+e.target.value)}
          onFocus={handleFocus}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
        />
      </div>
    );
  },
);

function ProgressBar({
  assigned,
  activity,
  available,
}: {
  assigned: number;
  activity: number;
  available: number;
}) {
  // If assigned === available and activity === 0, solid green
  //

  // if assigned ===  0 full gray
  // overspent - red on the right
  // partially spend - hashed line until remaining/overspent
  // fully funded full green

  // const spent = (activity / assigned) * 100;
  // let availablet = 100 - spent;
  // if (spent > 100) {
  //   overspent = spent - 100; // Overspent percentage
  // } else {
  //   overspent = 0; // No overspending
  // }

  const subCategory = {
    spent: 33,
    available: 33,
    overspent: 34,
  };

  return (
    <div className="relative h-[5px] border border-gray-400 rounded-sm">
      <Progress className="h-full bg-gray-200 rounded" />
      <div className="absolute top-0 left-0 h-full w-full flex rounded">
        <Progress
          className="h-full bg-green-200 rounded-r"
          style={{ width: `${subCategory?.spent}%` }}
        />
        <Progress
          className="h-full bg-green-400 rounded-l-[3px]  rounded-r-[3px]"
          style={{ width: `${subCategory?.available}%` }}
        />
        <Progress
          className="h-full bg-red-400 rounded-l-none rounded-r"
          style={{ width: `${subCategory?.overspent}%` }}
        />
      </div>
    </div>
  );
}

function Activity({ children }: { children: ReactNode }) {
  return <p className="flex-1 text-right">£{children}</p>;
}

function Available({ children }: { children: ReactNode }) {
  return <p className="flex-1 text-right">£{children}</p>;
}
