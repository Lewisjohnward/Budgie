import { useMemo, useReducer, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CategoryUserBranded,
  CategorySystemBranded,
  CategoryGroupSystemBranded,
  CategoryGroupUserBranded,
  MonthBranded,
} from "@/core/types/NormalizedData";
import { useCreateCategoryMutation } from "@/core/api/budget/category/categoryApiSlice";
import {
  asCategoryGroupId,
  CategoryId,
} from "@/pages/budget/allocation/types/types";
import { useBudgetSnapshot } from "@/pages/budget/allocation/hooks/useAllocation/useCategories";

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

export type CategoryBranded = CategorySystemBranded | CategoryUserBranded;
type CategoryGroupBranded =
  | CategoryGroupUserBranded
  | CategoryGroupSystemBranded;

export const useSelectCategory = () => {
  const ref = useRef<HTMLInputElement>(null);
  const popover = usePopover();
  const { data } = useBudgetSnapshot();

  const {
    months,
    categories: { user, rta, uncategorised },
    categoryGroups: {
      user: userCategoryGroups,
      inflow,
      uncategorised: uncategorisedGroup,
    },
  } = data;

  const categoriesArray = useMemo<CategoryBranded[]>(
    () => [...Object.values(user), rta, uncategorised],
    [user, rta, uncategorised]
  );

  const categoryGroupsArray = useMemo<CategoryGroupBranded[]>(
    () => [...Object.values(userCategoryGroups), inflow, uncategorisedGroup],
    [userCategoryGroups, inflow, uncategorisedGroup]
  );

  const categoryGroupById = useMemo(
    () => new Map(categoryGroupsArray.map((group) => [group.id, group])),
    [categoryGroupsArray]
  );

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
    const value = e.target.value;

    if (value === "") {
      dispatchReducer({ type: "RESET" });
      setHighlightedIndex(-1);
      return;
    }

    const normalizedValue = value.toLowerCase();

    // Check for an exact match in "CategoryGroup: Category" format.
    const hasExactMatch = categoryGroupsArray.some((group) =>
      categoriesArray.some(
        (category) =>
          category.categoryGroupId === group.id &&
          `${group.name}: ${category.name}` === value
      )
    );

    // Check for partial matches in category names or full names.
    const hasResults = categoriesArray.some((category) => {
      const categoryGroup = categoryGroupById.get(category.categoryGroupId);

      const categoryNameMatches = category.name
        .toLowerCase()
        .includes(normalizedValue);

      const fullNameMatches = categoryGroup
        ? `${categoryGroup.name}: ${category.name}`
          .toLowerCase()
          .includes(normalizedValue)
        : false;

      return categoryNameMatches || fullNameMatches;
    });

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

  const categoryGroups = useMemo(() => {
    return categoryGroupsArray.filter(
      (group) => group.name !== "Uncategorised"
    );
  }, [categoryGroupsArray]);

  const extendableCategoryGroups = useMemo(() => {
    return categoryGroups.filter((group) => group.name !== "Inflow");
  }, [categoryGroups]);

  const filteredCategoryIds = useMemo(() => {
    if (inputState.status === "idle" || inputState.status === "focused") {
      return new Set(categoriesArray.map((category) => category.id));
    }

    const normalizedInput = input.toLowerCase();

    const filtered = categoriesArray.filter((category) => {
      const categoryGroup = categoryGroupById.get(category.categoryGroupId);

      const categoryNameMatches = category.name
        .toLowerCase()
        .includes(normalizedInput);

      const fullNameMatches = categoryGroup
        ? `${categoryGroup.name}: ${category.name}`
          .toLowerCase()
          .includes(normalizedInput)
        : false;

      return categoryNameMatches || fullNameMatches;
    });

    return new Set(filtered.map((category) => category.id));
  }, [input, inputState.status, categoriesArray, categoryGroupById]);

  // Flat list of filtered category IDs for keyboard navigation
  const flatFilteredCategoryIds = useMemo(() => {
    const ids: string[] = [];

    categoryGroups.forEach((group) => {
      categoriesArray.forEach((category) => {
        if (
          category.categoryGroupId === group.id &&
          filteredCategoryIds.has(category.id)
        ) {
          ids.push(category.id);
        }
      });
    });

    return ids;
  }, [categoryGroups, categoriesArray, filteredCategoryIds]);

  const currentMonthByCategoryId = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const map = new Map<CategoryId, MonthBranded | undefined>();

    Object.values(months).forEach((month) => {
      const date = new Date(month.month);

      if (
        date.getFullYear() === currentYear &&
        date.getMonth() === currentMonth
      ) {
        map.set(month.categoryId, month);
      }
    });

    return map;
  }, [months]);

  // to add a category /////
  const [createCategory, { isLoading }] = useCreateCategoryMutation();
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
    createCategory({
      name: category.name,
      categoryGroupId: asCategoryGroupId(category.categoryGroupId),
    });
  };
  /////

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

      const category = categoriesArray.find(
        (category) => category.id === categoryId
      );

      if (!category) return;

      const categoryGroup = categoryGroupById.get(category.categoryGroupId);

      if (category && categoryGroup) {
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

      const category = categoriesArray.find(
        (category) => category.id === categoryId
      );

      if (!category) return;

      const categoryGroup = categoryGroupById.get(category.categoryGroupId);

      if (category && categoryGroup) {
        handleSelect(`${categoryGroup.name}: ${category.name}`);
        popover.handleClose();
      }
    }
  };

  // Derive highlighted selection and also set local input state accordingly
  const getHighlightedSelection = () => {
    if (highlightedIndex < 0) return null;

    const categoryId = flatFilteredCategoryIds[highlightedIndex];

    const category = categoriesArray.find(
      (category) => category.id === categoryId
    );

    if (!category) return null;

    const categoryGroup = categoryGroupById.get(category.categoryGroupId);

    if (!categoryGroup) return null;

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
    categories: categoriesArray,
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
