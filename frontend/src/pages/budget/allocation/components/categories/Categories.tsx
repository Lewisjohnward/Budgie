import { useGetCategoriesQuery } from "@/core/api/budgetApiSlice";
import { Checkbox } from "@/core/components/uiLibrary/checkbox";
import { Progress } from "@/core/components/uiLibrary/progress";
import { AddCircleIcon, ChevronDownIcon } from "@/core/icons/icons";
import { borderBottom, darkBlueText } from "@/core/theme/colors";
import clsx from "clsx";
import {
  forwardRef,
  ReactNode,
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

function useCategories() {
  const { data } = useGetCategoriesQuery();

  const mappedData = {
    ...data,
    categories: Object.fromEntries(
      Object.entries(data?.categories).map(([key, value]) => [
        key,
        { ...value, open: true },
      ]),
    ),
  };

  const [state, setState] = useState(mappedData);

  const subCategories = state.subCategories;
  const categories = Object.values(state.categories);

  const atLeastOneCategoryExpanded = categories.some(
    (category) => category.open,
  );

  const toggleDisplaySubcategories = (id: string | undefined) => {
    if (id === undefined) {
      setState((prevState) => ({
        ...prevState,
        categories: Object.keys(prevState.categories).reduce<
          Record<string, (typeof prevState.categories)[string]>
        >((acc, key) => {
          acc[key] = {
            ...prevState.categories[key],
            open: !atLeastOneCategoryExpanded,
          };
          return acc;
        }, {}),
      }));
    } else {
      const categoryToUpdate = state.categories[id];

      const updatedCategory = {
        ...categoryToUpdate,
        open: !categoryToUpdate.open,
      };

      setState((prevState) => ({
        ...prevState,
        categories: {
          ...prevState.categories,
          [id]: updatedCategory,
        },
      }));
    }
  };
  return {
    toggleDisplaySubcategories,
    categories,
    subCategories,
    atLeastOneCategoryExpanded,
  };
}

export default function Categories() {
  const {
    atLeastOneCategoryExpanded,
    toggleDisplaySubcategories,
    categories,
    subCategories,
  } = useCategories();

  return (
    <div>
      <div className="flex items-center gap-2 py-2 px-2">
        <button>
          <ChevronDownIcon
            className={clsx(
              atLeastOneCategoryExpanded ? "" : "-rotate-90",
              `h-4 w-4 ${darkBlueText}`,
            )}
            onClick={() => toggleDisplaySubcategories(undefined)}
          />
        </button>
        <div className={`${darkBlueText} font-thin`}>CATEGORY</div>
      </div>

      {categories.map((category) => {
        return (
          <Category key={category.id}>
            <CategoryHeader
              name={category.name}
              display={category.open}
              toggleSubCategories={() =>
                toggleDisplaySubcategories(category.id)
              }
            />
            <SubCategories display={category.open}>
              {category.subCategories.length > 0
                ? category.subCategories.map((subCategoryId) => {
                    const { id, name, assigned, activity } =
                      subCategories[subCategoryId];

                    const available = assigned - activity;

                    return (
                      <SubCategoryContent key={id}>
                        {(ref) => (
                          <>
                            <Checkbox className="size-3 rounded-[2px] shadow-none" />
                            <SubCategoryNameContainer>
                              <SubCategoryName>{name}</SubCategoryName>
                              <ProgressBar
                                assigned={assigned}
                                activity={activity}
                                available={available}
                              />
                            </SubCategoryNameContainer>
                            <EditAssigned
                              ref={ref}
                              assigned={assigned.toFixed(2)}
                            />
                            <Activity>{activity.toFixed(2)}</Activity>
                            <Available>{available.toFixed(2)}</Available>
                          </>
                        )}
                      </SubCategoryContent>
                    );
                  })
                : null}
            </SubCategories>
          </Category>
        );
      })}
    </div>
  );
}

function Category({ children }: { children: ReactNode }) {
  return <div className="min-w-[600px]">{children}</div>;
}

function CategoryHeader({
  name,
  display,
  toggleSubCategories,
}: {
  name: string;
  display: boolean;
  toggleSubCategories: () => void;
}) {
  const [hover, setHover] = useState(false);

  const handleMouseEnter = () => setHover(true);
  const handleMouseExit = () => setHover(false);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseExit}
      className={`flex items-center gap-2 px-2 bg-gray-400/20`}
    >
      <button className="w-4" onClick={toggleSubCategories}>
        <ChevronDownIcon
          className={clsx(
            display ? "rotate-0" : "-rotate-90",
            `h-4 w-4 ${darkBlueText}`,
          )}
        />
      </button>

      <Checkbox className="size-3 rounded-[2px] shadow-none" />
      <div className="flex-grow flex-shrink basis-48 flex items-center gap-4 py-2">
        <p className={`${darkBlueText} font-bold`}>{name}</p>
        {hover && (
          <button>
            <AddCircleIcon className={`${darkBlueText}`} />
          </button>
        )}
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

function SubCategories({
  children,
  display,
}: {
  children: ReactNode;
  display: boolean;
}) {
  if (display) return children;
  return null;
}

function SubCategoryName({ children }: { children: ReactNode }) {
  return children;
}

function SubCategoryNameContainer({ children }: { children: ReactNode }) {
  return (
    <div className="flex-grow basis-48 text-ellipsis whitespace-nowrap">
      {children}
    </div>
  );
}

function SubCategoryContent({
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
      className={`flex items-center gap-2 py-2 pl-8 pr-2 border-b ${borderBottom} focus-within:bg-gray-100/80`}
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
  return <p className="flex-1 text-right">{children}</p>;
}

function Available({ children }: { children: ReactNode }) {
  return <p className="flex-1 text-right">{children}</p>;
}
