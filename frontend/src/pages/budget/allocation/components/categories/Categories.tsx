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
  const [addCategory] = useAddCategoryMutation();

  const [state, setState] = useState<CategoriesDataMapped | null>(null);
  const appendedCategoryGroupId = useRef<string | null>(null);

  useEffect(() => {
    if (data === null || data === undefined) return;

    const previousOpenState =
      state != null
        ? Object.values(state?.categoryGroups).map((group) => group.open)
        : [];

    const mappedData = {
      ...data,
      categoryGroups: Object.fromEntries(
        Object.entries(data?.categoryGroups).map(([key, value], i) => {
          const open =
            previousOpenState[i] ||
            appendedCategoryGroupId.current === key ||
            appendedCategoryGroupId.current === null;

          return [key, { ...value, open }];
        }),
      ),
    };
    appendedCategoryGroupId.current = null;
    setState(mappedData);
  }, [data]);

  let categories = {};
  let categoryGroups: MappedCategoryGroups[] = [];
  let atLeastOneCategoryGroupExpanded = false;
  if (state != null) {
    categories = state.categories;
    categoryGroups = Object.values(state?.categoryGroups);
    atLeastOneCategoryGroupExpanded = categoryGroups.some(
      (group) => group.open,
    );
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
            open: !atLeastOneCategoryGroupExpanded,
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

  const handleAddCategory = (data: AddCategoryFormData) => {
    addCategory(data);
    appendedCategoryGroupId.current = data.categoryGroupId;
  };

  return {
    toggleDisplayCategories,
    categories,
    categoryGroups,
    atLeastOneCategoryGroupExpanded,
    handleAddCategory,
    addCategorygroup: () => { },
  };
}

export default function Categories() {
  const {
    atLeastOneCategoryGroupExpanded,
    toggleDisplayCategories,
    categoryGroups,
    categories,
    handleAddCategory,
    addCategoryGroup,
  } = useCategories();

  return (
  );
}
