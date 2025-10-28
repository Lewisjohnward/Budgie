import { useMemo, useReducer, useRef, useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAddCategoryMutation,
  useGetCategoriesQuery,
} from "@/core/api/budgetApiSlice";
import { CategoryT, CategoryGroup } from "@/core/types/NormalizedData";

type SelectCategoryForm = {
  showAddCategoryForm: boolean;
  name: string;
  categoryGroupId: string;
};

//TODO: THIS NEEDS TO MATCH THE BACKEND / DATA ON FE
const AddCategorySchema = z.object({
  name: z.string().min(1, { message: "The category name is required." }),
  //TODO: z.string().uuid()
  categoryGroupId: z.string(),
});

const initialState: State = { status: "idle" };

type State =
  | { status: "idle" }
  | { status: "focused"; input: string; exactMatch: boolean }
  | { status: "filtering"; input: string }
  | { status: "exactMatch"; input: string }
  | { status: "noMatch"; input: string }
  | { status: "selected"; input: string };

type Action =
  | {
      type: "INPUT_CHANGED";
      input: string;
      hasExactMatch: boolean;
      hasResults: boolean;
    }
  | { type: "SELECT"; input: string }
  | { type: "FOCUSED"; input: string; exactMatch: boolean }
  | { type: "RESET" };

function reducer(_state: State, action: Action): State {
  if (action.type === "INPUT_CHANGED") {
    if (action.hasExactMatch) {
      return { status: "exactMatch", input: action.input };
    }
    if (!action.hasResults) {
      return { status: "noMatch", input: action.input };
    }

    return { status: "filtering", input: action.input };
  }
  if (action.type === "RESET") {
    return { status: "idle" };
  }
  if (action.type === "SELECT") {
    return { status: "selected", input: action.input };
  }
  if (action.type === "FOCUSED") {
    return {
      status: "focused",
      input: action.input,
      exactMatch: action.exactMatch,
    };
  }

  return { status: "idle" };
}

// TODO:(lewis 2025-12-04 20:48) currently there are 2 of this in the project
export const usePopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return { isOpen, handleOpen, handleClose };
};

export const useSelectCategory = () => {
  const ref = useRef<HTMLInputElement>(null);
  const popover = usePopover();
  const { data } = useGetCategoriesQuery();
  const { months, categories, categoryGroups: allCategoryGroups } = data;

  const allCategoriesArray: CategoryT[] = Object.values(categories);

  const [inputState, dispatchReducer] = useReducer(reducer, initialState);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const input = inputState.status !== "idle" ? inputState.input : "";

  const handleSelect = (value: string) => {
    dispatchReducer({
      type: "INPUT_CHANGED",
      input: value,
      hasExactMatch: true,
      hasResults: true,
    });
  };

  const reset = () => {
    dispatchReducer({
      type: "RESET",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (value === "") {
      dispatchReducer({ type: "RESET" });
      setHighlightedIndex(-1);
      return;
    }

    const categoryGroupsArray = Object.values(
      allCategoryGroups
    ) as CategoryGroup[];

    // If the category is the only one remaining in the filtered list and it's spelled exactly, auto-complete with group name
    // const filteredCategories = allCategoriesArray.filter((c) =>
    //   c.name.toLowerCase().includes(value.toLowerCase())
    // );

    // if (
    //   filteredCategories.length === 1 &&
    //   filteredCategories[0].name.toLowerCase() === value.toLowerCase()
    // ) {
    //   const singleCategory = filteredCategories[0];
    //   // Find the category group that contains this category
    //   const categoryGroup = categoryGroupsArray.find((group) =>
    //     group.categories.includes(singleCategory.id)
    //   );
    //
    //   if (categoryGroup) {
    //     // Auto-complete with "CategoryGroup: Category" format
    //     value = `${categoryGroup.name}: ${singleCategory.name}`;
    //   }
    // }

    // Check for exact match in "CategoryGroup: Category" format
    const hasExactMatch = categoryGroupsArray.some((group) =>
      group.categories.some((categoryId: string) => {
        const category = categories[categoryId];
        const fullName = `${group.name}: ${category.name}`;
        return fullName === value;
      })
    );

    // Check for partial matches in category names or full format
    const hasResults =
      allCategoriesArray.some((c) =>
        c.name.toLowerCase().includes(value.toLowerCase())
      ) ||
      categoryGroupsArray.some((group) =>
        group.categories.some((categoryId: string) => {
          const category = categories[categoryId];
          const fullName = `${group.name}: ${category.name}`;
          return fullName.toLowerCase().includes(value.toLowerCase());
        })
      );

    if (hasResults) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }

    dispatchReducer({
      type: "INPUT_CHANGED",
      input: value,
      hasExactMatch,
      hasResults,
    });
  };

  // remove protected categories
  const categoryGroups = useMemo(() => {
    return Object.values(allCategoryGroups).filter(
      (group) => group.name !== "Uncategorised"
    );
  }, [allCategoryGroups]);

  const extendableCategoryGroups = useMemo(() => {
    return categoryGroups.filter((group) => group.name !== "Inflow");
  }, [categoryGroups]);
  ////

  const filteredCategoryIds = useMemo(() => {
    if (inputState.status === "idle" || inputState.status === "focused") {
      return new Set(allCategoriesArray.map((c) => c.id));
    }
    const filtered = allCategoriesArray.filter((c) =>
      c.name.toLowerCase().includes(input.toLowerCase())
    );
    return new Set(filtered.map((c) => c.id));
  }, [input, inputState.status, allCategoriesArray]);

  // Flat list of filtered category IDs for keyboard navigation
  const flatFilteredCategoryIds = useMemo(() => {
    const ids: string[] = [];
    categoryGroups.forEach((group) => {
      group.categories.forEach((categoryId: string) => {
        if (filteredCategoryIds.has(categoryId)) {
          ids.push(categoryId);
        }
      });
    });
    return ids;
  }, [categoryGroups, filteredCategoryIds]);

  const currentMonthByCategoryId = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();

    // TODO:(lewis 2025-12-03 14:30) needs typing
    const map = new Map();
    allCategoriesArray.forEach((category) => {
      const currentMonth = category.months
        .map((monthId) => months[monthId])
        .find((obj) => {
          const date = new Date(obj.month);
          return (
            date.getFullYear() === currentYear &&
            date.getMonth() === now.getMonth()
          );
        });
      map.set(category.id, currentMonth);
    });
    return map;
  }, [categories, months]);

  // to add a category /////
  const [createCategory, { isLoading, isSuccess }] = useAddCategoryMutation();
  const form = useForm<SelectCategoryForm>({
    defaultValues: {
      showAddCategoryForm: false,
      name: "",
      categoryGroupId: "",
    },
    resolver: zodResolver(AddCategorySchema),
  });

  const isCreatingCategory = form.watch("showAddCategoryForm");

  const handleToggleAddCategoryForm = () => {
    form.setValue("showAddCategoryForm", !isCreatingCategory);
    if (isCreatingCategory) form.reset();
  };

  const onSubmit = (category: z.infer<typeof AddCategorySchema>) => {
    createCategory(category);
  };
  /////
  console.log(inputState.status);

  const focus = () => {
    ref.current?.focus();
  };

  const handleFocus = () => {
    // Only enter focused state if we have a valid selected/exact match category
    if (input !== "") {
      const exactMatch =
        inputState.status === "exactMatch" ||
        (inputState.status === "focused" && inputState.exactMatch);
      dispatchReducer({ type: "FOCUSED", input, exactMatch });
    }
    setHighlightedIndex(-1); // Reset highlight on focus
    popover.handleOpen();
  };

  const handleBlur = () => {
    // If a category is highlighted, select it
    if (highlightedIndex >= 0) {
      const categoryId = flatFilteredCategoryIds[highlightedIndex];
      const category = categories[categoryId];
      const categoryGroupsArray = Object.values(
        allCategoryGroups
      ) as CategoryGroup[];
      const categoryGroup = categoryGroupsArray.find((group) =>
        group.categories.includes(categoryId)
      );
      if (categoryGroup) {
        handleSelect(`${categoryGroup.name}: ${category.name}`);
        setHighlightedIndex(-1);
      }
      return;
    }
    popover.handleClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!popover.isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const nextIndex = prev + 1;
        return nextIndex < flatFilteredCategoryIds.length ? nextIndex : prev;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const nextIndex = prev - 1;
        return nextIndex >= 0 ? nextIndex : -1;
      });
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      const categoryId = flatFilteredCategoryIds[highlightedIndex];
      const category = categories[categoryId];
      const categoryGroupsArray = Object.values(
        allCategoryGroups
      ) as CategoryGroup[];
      const categoryGroup = categoryGroupsArray.find((group) =>
        group.categories.includes(categoryId)
      );
      if (categoryGroup) {
        handleSelect(`${categoryGroup.name}: ${category.name}`);
        popover.handleClose();
      }
    }
  };

  // Derive highlighted selection and also set local input state accordingly
  const getHighlightedSelection = () => {
    if (highlightedIndex < 0) return null;
    const categoryId = flatFilteredCategoryIds[highlightedIndex];
    const category = categories[categoryId];
    const categoryGroupsArray = Object.values(
      allCategoryGroups
    ) as CategoryGroup[];
    const categoryGroup = categoryGroupsArray.find((group) =>
      group.categories.includes(categoryId)
    );
    if (!categoryGroup || !category) return null;
    // update local input state to selected string
    handleSelect(`${categoryGroup.name}: ${category.name}`);
    setHighlightedIndex(-1);
    return { groupName: categoryGroup.name, category } as const;
  };

  return {
    // put inside input
    inputState,
    input,
    ref,
    isIdle: inputState.status === "idle",
    isFocused: inputState.status === "focused",
    isFiltering: inputState.status === "filtering",
    isNoMatch: inputState.status === "noMatch",
    isExactMatch:
      inputState.status === "exactMatch" ||
      (inputState.status === "focused" && inputState.exactMatch),
    handleSelect,
    handleInputChange,
    handleFocus,
    handleBlur,
    handleKeyDown,
    getHighlightedSelection,
    highlightedIndex,
    flatFilteredCategoryIds,
    reset,
    focus,
    currentMonthByCategoryId,
    categoryGroups,
    categories,
    filteredCategoryIds,
    popover,
    // create category
    addCategory: {
      isCreating: isCreatingCategory,
      toggle: handleToggleAddCategoryForm,
      onSubmit,
      isLoading,
      extendableCategoryGroups,
      // TODO:(lewis 2025-12-03 14:32) dont expose entire form
      form,
    },
  };
};

export type SelectCategoryModel = ReturnType<typeof useSelectCategory>;
