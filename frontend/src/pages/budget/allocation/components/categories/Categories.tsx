import {
  useAddCategoryMutation,
  useGetCategoriesQuery,
} from "@/core/api/budgetApiSlice";
import { Checkbox } from "@/core/components/uiLibrary/checkbox";
import { Progress } from "@/core/components/uiLibrary/progress";
import { AddCircleIcon, ChevronDownIcon } from "@/core/icons/icons";
import { borderBottom, darkBlueText } from "@/core/theme/colors";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/uiLibrary/popover";
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
import { PopoverArrow, PopoverPortal } from "@radix-ui/react-popover";
import { Input } from "@/core/components/uiLibrary/input";
import { Button } from "@/core/components/uiLibrary/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CategoriesDataMapped,
  MappedCategoryGroups,
} from "@/core/types/NormalizedData";

function useCategories() {
  const { data } = useGetCategoriesQuery();

  const [state, setState] = useState<CategoriesDataMapped | null>(null);

  useEffect(() => {
    if (data != null) {
      const mappedData = {
        ...data,
        categoryGroups: Object.fromEntries(
          Object.entries(data?.categoryGroups).map(([key, value]) => [
            key,
            { ...value, open: true },
          ]),
        ),
      };
      setState(mappedData);
    }
  }, [data]);

  let categories = {};
  let categoryGroups: MappedCategoryGroups[] = [];
  let atLeastOneCategoryExpanded = false;
  if (state != null) {
    categories = state.categories;
    categoryGroups = Object.values(state?.categoryGroups);
    atLeastOneCategoryExpanded = categoryGroups.some((group) => group.open);
  }

  const toggleDisplayCategories = (id: string | undefined) => {
    if (id === undefined) {
      setState((prevState) => ({
        ...prevState,
        categoryGroups: Object.keys(prevState.categoryGroups).reduce<
          Record<string, (typeof prevState.categoryGroups)[string]>
        >((acc, key) => {
          acc[key] = {
            ...prevState.categoryGroups[key],
            open: !atLeastOneCategoryExpanded,
          };
          return acc;
        }, {}),
      }));
    } else {
      const categoryToUpdate = state.categoryGroups[id];

      const updatedCategory = {
        ...categoryToUpdate,
        open: !categoryToUpdate.open,
      };

      setState((prevState) => ({
        ...prevState,
        categoryGroups: {
          ...prevState.categoryGroups,
          [id]: updatedCategory,
        },
      }));
    }
  };
  return {
    toggleDisplayCategories,
    categories,
    categoryGroups,
    atLeastOneCategoryExpanded,
  };
}

export default function Categories() {
  const {
    atLeastOneCategoryExpanded,
    toggleDisplayCategories,
    categoryGroups,
    categories,
  } = useCategories();

  return (
    <div>
      <div className="flex items-center gap-2 py-2 px-2">
        {categoryGroups.length > 0 ? (
          <button>
            <ChevronDownIcon
              className={clsx(
                atLeastOneCategoryExpanded ? "" : "-rotate-90",
                `h-4 w-4 ${darkBlueText}`,
              )}
              onClick={() => toggleDisplayCategories(undefined)}
            />
          </button>
        ) : null}
        <div className={`${darkBlueText} font-thin`}>CATEGORY</div>
      </div>
      {categoryGroups.map((group) => {
        return (
          <Category key={group.id}>
            <CategoryHeader
              id={group.id}
              name={group.name}
              display={group.open}
              toggleSubCategories={() => toggleDisplayCategories(group.id)}
            />
            <SubCategories display={group.open}>
              {group.categories.length > 0
                ? group.categories.map((categoryId) => {
                    const { id, name, assigned, activity } =
                      categories[categoryId];

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

const AddCategorySchema = z.object({
  categoryGroupId: z.string(),
  name: z.string().min(1),
});

type AddCategoryFormData = z.infer<typeof AddCategorySchema>;

function CategoryHeader({
  id,
  name,
  display,
  toggleSubCategories,
}: {
  id: string;
  name: string;
  display: boolean;
  toggleSubCategories: () => void;
}) {
  const [addCategory] = useAddCategoryMutation();
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
    addCategory(data);
    close();
    reset();
  };

  return (
    <div className={`group flex items-center gap-2 px-2 bg-gray-400/20`}>
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
        <Popover open={displayAddCategory} modal={true}>
          <PopoverTrigger>
            <button onClick={open}>
              <AddCircleIcon
                className={`${darkBlueText} invisible group-hover:visible`}
              />
            </button>
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
