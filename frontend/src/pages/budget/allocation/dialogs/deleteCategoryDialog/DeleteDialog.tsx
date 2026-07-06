import { formatCurrency } from "@/utils/formatCurrency";
import { ChevronDown } from "lucide-react";
import { useRef, useState, useEffect, useMemo } from "react";
import { CategorySelectOptions } from "../../hooks/useAllocation/useAllocation";
import { Button } from "@/core/components/uiLibrary/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/core/components/uiLibrary/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/uiLibrary/popover";
import { PopoverPortal } from "@radix-ui/react-popover";
import {
  CategoryBranded,
  CategoryGroupBranded,
} from "@/core/types/NormalizedData";
import { CategoryGroupId, CategoryId } from "../../types/types";
import { DeleteArgs } from "./useDeleteDialog";

export type DeleteState =
  | {
      type: "category";
      categoryId: CategoryId;
      name: string;
      hasAssigned: boolean;
      transactionCount: number;
    }
  | {
      type: "categoryGroup";
      categoryGroupId: CategoryGroupId;
      name: string;
      hasAssigned: boolean;
      transactionCount: number;
      categoryCount: number;
    };

type DeleteDialogProps = {
  open: boolean;
  state: DeleteState | null;
  accept: (args: DeleteArgs) => void;
  cancel: () => void;
  selectOptions: CategorySelectOptions | null;
};

export function DeleteDialog({
  open,
  state,
  accept,
  cancel,
  selectOptions,
}: DeleteDialogProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [input, setInput] = useState("");
  const [visuallySelectedCategoryId, setVisuallySelectedCategoryId] =
    useState("");
  const [selectedInheritingCategoryId, setSelectedInheritingCategoryId] =
    useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);

  const selectedRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      block: "nearest",
    });
  }, [visuallySelectedCategoryId]);

  const normalised = input.toLowerCase().trim();

  const filteredOptions = useMemo(() => {
    if (!selectOptions) return;

    if (!normalised) return selectOptions;
    // If user has already selected a category return all
    if (selectedInheritingCategoryId) return selectOptions;

    return selectOptions
      .map((group) => {
        const groupMatches = group.name.toLowerCase().includes(normalised);

        const filteredCategories = group.categories.filter((c) =>
          c.name.toLowerCase().includes(normalised)
        );

        if (groupMatches) {
          return {
            ...group,
            categories: group.categories,
          };
        }

        if (filteredCategories.length > 0) {
          return {
            ...group,
            categories: filteredCategories,
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [input, selectOptions]);

  useEffect(() => {
    if (selectOptions === null) return;
    if (filteredOptions.length === 0) return;
    if (selectedInheritingCategoryId) return;
    const group = filteredOptions[0];
    if (group?.categories.length === 0) return;
    const category = filteredOptions[0].categories[0];
    setVisuallySelectedCategoryId(category.id);
  }, [input, selectOptions]);

  const flatMap = filteredOptions?.flatMap((group) =>
    group.categories.map((category) => ({
      ...category,
      groupName: group.name,
    }))
  );

  const closeDialog = () => {
    setInput("");
    setSelectedInheritingCategoryId("");
    cancel();
  };

  // Handles selecting category from popover
  const handleSelect = (
    group: CategoryGroupBranded,
    category: CategoryBranded
  ): void => {
    setInput(`${group.name}: ${category.name}`);
    setVisuallySelectedCategoryId(category.id);
    setSelectedInheritingCategoryId(category.id);
    setPopoverOpen(false);
  };

  // Input box onClick handler
  const handleClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): void => {
    if (popoverOpen) {
      // Already open - ignore
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (visuallySelectedCategoryId) {
      requestAnimationFrame(() => {
        inputRef.current?.select();
      });
    }

    setPopoverOpen(true);
  };

  // Input box keyDown handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === "Escape") {
      closeDialog();
    }

    if (
      selectedInheritingCategoryId &&
      (e.key === "Backspace" || e.key === "Delete" || e.key.length === 1)
    ) {
      setSelectedInheritingCategoryId("");
      setVisuallySelectedCategoryId("");
      setInput("");
    }

    if (!popoverOpen) setPopoverOpen(true);

    if (!flatMap || flatMap.length === 0) return;

    const pos = flatMap.findIndex(
      (cat) => cat.id === visuallySelectedCategoryId
    );

    const currentIndex = pos === -1 ? 0 : pos;

    if (e.key === "Enter") {
      e.preventDefault();
      const option = flatMap[currentIndex];

      if (!option) return;

      setInput(`${option.groupName}: ${option.name}`);
      setPopoverOpen(false);
      setSelectedInheritingCategoryId(visuallySelectedCategoryId);
      setVisuallySelectedCategoryId(visuallySelectedCategoryId);

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return;
    }

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      (() => setPopoverOpen(true))();

      let nextIndex;

      if (e.key === "ArrowDown") {
        nextIndex = (currentIndex + 1) % flatMap.length;
      } else {
        nextIndex = (currentIndex - 1 + flatMap.length) % flatMap.length;
      }

      setVisuallySelectedCategoryId(flatMap[nextIndex].id);
    }
  };

  // Input box onChange handler
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInput(e.target.value);
    if (flatMap.length === 0) return;
    setVisuallySelectedCategoryId(flatMap[0].id);
  };

  if (!state || !selectOptions) return;

  const isGroup = state.type === "categoryGroup";

  const categoryHasTransactions = state.transactionCount > 0;
  const categoryHasAssigned = state.hasAssigned;

  const inheritingCategoryView = categoryHasTransactions;
  const reassignAssignedView = !categoryHasTransactions && categoryHasAssigned;

  const isAcceptDisabled = inheritingCategoryView
    ? selectedInheritingCategoryId === ""
    : false;

  const handleAcceptDelete = () => {
    if (!state) return;

    const args: DeleteArgs =
      state.type === "category"
        ? {
            type: "category",
            categoryId: state.categoryId,
            ...(inheritingCategoryView && selectedInheritingCategoryId
              ? {
                  inheritingCategoryId:
                    selectedInheritingCategoryId as CategoryId,
                }
              : {}),
          }
        : {
            type: "categoryGroup",
            categoryGroupId: state.categoryGroupId,
          };

    accept(args);
  };

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="fixed w-[500px] py-4 px-0 bg-white"
        aria-describedby={undefined}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogTitle className="mb-2 px-4">
          {isGroup ? "Delete Category Group" : "Delete Category"}
        </DialogTitle>
        <hr />

        {/* Breakdown section */}
        {inheritingCategoryView && (
          <>
            <div className="px-4 pt-2 overflow-hidden">
              {isGroup ? (
                <p>
                  All <span className="font-bold">[{state.categoryCount}]</span>{" "}
                  categories in the group{" "}
                  <span className="font-bold">{state.name}</span> will be
                  reassigned to the selected category.
                </p>
              ) : (
                <p>
                  Before you can delete the category{" "}
                  <span className="font-bold">{state.name}</span>, you'll need
                  to reassign your past activity to a new category
                </p>
              )}
            </div>

            <div className="px-4 space-y-2">
              <p className="font-bold">Select category</p>
              <Popover
                open={popoverOpen}
                onOpenChange={(open) => {
                  // When the popover closes (due to loss of focus)
                  // select the category at the top if there is input
                  // otherwise do nothing
                  if (!open) {
                    setPopoverOpen(open);
                    if (!selectedInheritingCategoryId) {
                      if (input === "") return;
                      if (!flatMap || flatMap.length === 0) {
                        setInput("");
                        return;
                      }
                      const pos = flatMap.findIndex(
                        (cat) => cat.id === visuallySelectedCategoryId
                      );
                      const currentIndex = pos === -1 ? 0 : pos;
                      const option = flatMap[currentIndex];

                      if (!option) {
                        setInput("");
                        return;
                      }
                      setInput(`${option.groupName}: ${option.name}`);
                      setPopoverOpen(false);
                      setSelectedInheritingCategoryId(
                        visuallySelectedCategoryId
                      );
                      setVisuallySelectedCategoryId(visuallySelectedCategoryId);
                    }
                  }
                }}
              >
                <PopoverTrigger className="w-full" asChild data-popover-trigger>
                  <div
                    className="flex items-center p-1 pr-2 bg-white ring-[1px] focus-visible:ring-sky-700 ring-sky-700 rounded-sm overflow-hidden"
                    onClick={handleClick}
                    // onKeyDown={handleKeyDown}
                  >
                    <input
                      className="px-2 w-full rounded-sm text-ellipsis focus:outline-none focus:ring-0"
                      value={input}
                      onChange={handleOnChange}
                      ref={inputRef}
                      onKeyDown={handleKeyDown}
                      // onBlur={() => setPopoverOpen(false)}
                    />
                    <ChevronDown className="size-4 text-sky-950" />
                  </div>
                </PopoverTrigger>
                <PopoverPortal>
                  <PopoverContent
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    className="w-[475px] rounded-sm shadow-md animate-none"
                    side={"bottom"}
                    onClick={() => console.log(" clicking on the popover")}
                    onWheelCapture={(e) => {
                      // Prevents onScroll from being cancelled higher up the tree (Radix)
                      e.stopPropagation();
                    }}
                  >
                    <div className="p-2">
                      <p className="text-lg font-bold">Plan categories</p>
                    </div>
                    <hr />
                    <div className="p-2 h-[400px] overflow-scroll">
                      <ul>
                        {filteredOptions.map((group) => {
                          return (
                            <li key={group.id}>
                              <div className="py-1">
                                <p className="pl-2 font-bold text-sm">
                                  {group.name}:
                                </p>
                                <div className="space-y-[1px]">
                                  {group.categories.map((category) => {
                                    const isSelected =
                                      category.id ===
                                      visuallySelectedCategoryId;
                                    return (
                                      <div
                                        key={category.id}
                                        role="option"
                                        ref={isSelected ? selectedRef : null}
                                        aria-selected={isSelected}
                                        className={`px-4 py-1 flex justify-between cursor-pointer transition-colors
    ${isSelected ? "bg-stone-200/60" : "hover:bg-stone-200/60"}
  `}
                                        onClick={() =>
                                          handleSelect(group, category)
                                        }
                                      >
                                        <p>{category.name}</p>
                                        <MoneyText value={category.available} />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </PopoverContent>
                </PopoverPortal>
              </Popover>
            </div>

            <div className="px-4">
              <p className="font-bold">
                Here's what will be reassigned to the new category:
              </p>
              <ul>
                <li>
                  All transactions <strong>[{state.transactionCount}]</strong>
                </li>
                <li>All assigned amounts</li>
                <li>Any remaining available amount</li>
              </ul>
            </div>
          </>
        )}
        {reassignAssignedView && (
          <>
            {isGroup ? (
              <div className="px-4 pt-2 space-y-4">
                <p>
                  There is money currently assigned to one or more categories{" "}
                  <span className="font-bold">{state.name}</span>.
                </p>{" "}
                <p>
                  When you delete this category, all assigned amounts will be
                  moved to <span className="font-bold">Ready to Assign.</span>
                </p>
              </div>
            ) : (
              <div className="px-4 pt-2 space-y-4">
                <p>
                  There is money currently assigned to{" "}
                  <span className="font-bold">{state.name}</span>.
                </p>{" "}
                <p>
                  When you delete this category group, all assigned amounts will
                  be moved to{" "}
                  <span className="font-bold">Ready to Assign.</span>
                </p>
              </div>
            )}
          </>
        )}
        <div className="flex justify-end gap-2 px-4">
          <Button className="bg-sky-900 text-md" onClick={closeDialog}>
            Cancel
          </Button>
          <Button
            className="bg-red-400/40 text-md text-red-500"
            onClick={handleAcceptDelete}
            disabled={isAcceptDisabled}
          >
            Delete
          </Button>
        </div>

        {/* Footer note */}
      </DialogContent>
    </Dialog>
  );
}

function MoneyText({ value }: { value: number }) {
  const textColor =
    value < 0 ? "text-red-400" : value > 0 ? "text-green-600" : "text-black ";
  return (
    <p className={`${textColor} `}>
      {formatCurrency(value, { showNegative: true })}
    </p>
  );
}
