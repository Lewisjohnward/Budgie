import { Checkbox } from "@/core/components/uiLibrary/checkbox";
import { Progress } from "@/core/components/uiLibrary/progress";
import { AddCircleIcon, ChevronDownIcon } from "@/core/icons/icons";
import { bgGray, borderBottom, darkBlueText } from "@/core/theme/colors";
import clsx from "clsx";

import { forwardRef, HTMLAttributes, ReactNode, useRef, useState } from "react";

const data: Data = {
  entities: {
    categories: {
      1: { id: 1, name: "Bills", open: true, subCategories: [1, 2] },
      2: { id: 2, name: "Needs", open: true, subCategories: [3, 4] },
      3: { id: 3, name: "Wants", open: true, subCategories: [5, 6, 7, 8] },
    },
    subCategories: {
      1: { id: 1, name: "Rent", assigned: 200, activity: 50, available: 20 },
      2: {
        id: 2,
        name: "Utilities",
        assigned: 100,
        activity: 30,
        available: 10,
      },
      3: {
        id: 3,
        name: "Groceries",
        assigned: 300,
        activity: 80,
        available: 50,
      },
      4: {
        id: 4,
        name: "Retirement",
        assigned: 150,
        activity: 60,
        available: 40,
      },
      5: { id: 5, name: "Hobbies", assigned: 50, activity: 20, available: 10 },
      6: {
        id: 6,
        name: "Budgie subscription",
        assigned: 75,
        activity: 25,
        available: 15,
      },
      7: {
        id: 7,
        name: "Other",
        assigned: 75,
        activity: 25,
        available: 15,
      },
      8: {
        id: 8,
        name: "Left overs",
        assigned: 75,
        activity: 25,
        available: 15,
      },
    },
  },
  result: [1, 2, 3],
};

type Category = {
  id: number;
  name: string;
  open: boolean;
  subCategories: number[];
};

type SubCategory = {
  id: number;
  name: string;
  assigned: number;
  activity: number;
  available: number;
};

type Entities = {
  categories: { [key: string]: Category };
  subCategories: Record<string | number, SubCategory>;
};

type Data = {
  entities: Entities;
  result: number[];
};

function useCategories(data: Data) {
  const [state, setState] = useState(data);

  const subCategories = state.entities.subCategories;
  const categories = Object.values(state.entities.categories);

  const atLeastOneCategoryExpanded = categories.some(
    (category) => category.open,
  );

  const toggleDisplaySubcategories = (id: number | undefined) => {
    if (id === undefined) {
      setState((prevState) => ({
        ...prevState,
        entities: {
          ...prevState.entities,
          categories: Object.keys(prevState.entities.categories).reduce<
            Record<string, (typeof prevState.entities.categories)[string]>
          >((acc, key) => {
            acc[key] = {
              ...prevState.entities.categories[key],
              open: !atLeastOneCategoryExpanded,
            };
            return acc;
          }, {}),
        },
      }));
    } else {
      const categoryToUpdate = state.entities.categories[id];

      const updatedCategory = {
        ...categoryToUpdate,
        open: !categoryToUpdate.open,
      };

      setState((prevState) => ({
        ...prevState,
        entities: {
          ...prevState.entities,
          categories: {
            ...prevState.entities.categories,
            [id]: updatedCategory,
          },
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
  } = useCategories(data);

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
          // TODO: FLATTEN CATEGORY?
          <Category key={category.id}>
            <CategoryHeader
              name={category.name}
              display={category.open}
              toggleSubCategories={() =>
                toggleDisplaySubcategories(category.id)
              }
            />
            <SubCategories display={category.open}>
              {category.subCategories.map((subCat) => {
                const { id, name, assigned, activity } = subCategories[subCat];

                const available = assigned - activity;

                const inputRef = useRef<HTMLInputElement | null>(null);

                const handleInputFocus = () => {
                  inputRef.current?.focus();
                };

                return (
                  <SubCategoryContent onClick={handleInputFocus} key={id}>
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
                      ref={inputRef}
                      assigned={assigned.toFixed(2)}
                    />
                    <Activity>{activity.toFixed(2)}</Activity>
                    <Available>{available.toFixed(2)}</Available>
                  </SubCategoryContent>
                );
              })}
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
  ...props
}: {
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex items-center gap-2 py-2 pl-8 pr-2 border-b ${borderBottom} focus-within:bg-gray-100/80`}
      {...props}
    >
      {children}
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
