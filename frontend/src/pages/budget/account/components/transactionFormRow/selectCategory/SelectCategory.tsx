import { ChevronDown, CirclePlus, ChevronLeft, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/uiLibrary/popover";
import { PopoverArrow, PopoverPortal } from "@radix-ui/react-popover";
import { Separator } from "@/pages/budget/account/components/Separator";
import { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { CategoryT } from "@/core/types/NormalizedData";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/core/components/uiLibrary/form";
import { Input } from "@/core/components/uiLibrary/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/uiLibrary/select";
import { Button } from "@/core/components/uiLibrary/button";
import { AddCircleIcon } from "@/core/icons/icons";
import { SelectCategoryModel } from "./useSelectCategory";
import clsx from "clsx";

type SelectCategoryProps = {
  selectCategory: SelectCategoryModel;
};

// TODO:(lewis 2025-12-11 13:19) bug when confirming non existing category and refocusing the input

export function SelectCategory({ selectCategory }: SelectCategoryProps) {
  const {
    inputState,
    ref,
    input,
    isFiltering,
    isIdle,
    isFocused,
    isNoMatch,
    isExactMatch,
    handleInputChange,
    handleFocus,
    handleBlur,
    handleKeyDown,
    getHighlightedSelection,
    highlightedIndex,
    flatFilteredCategoryIds,
    popover,
    currentMonthByCategoryId,
    categoryGroups,
    categories,
    filteredCategoryIds,
    addCategory,
    handleSelect,
  } = selectCategory;

  const form = useFormContext();
  const selectedLabel = form.watch("categoryName");
  const selectedCategoryId = form.watch("categoryId");

  const handlePointerDownOutside = (e: Event) => {
    // Don't close if clicking the input
    if (ref.current?.contains(e.target as Node)) {
      e.preventDefault();
      return;
    }
    popover.handleClose();
  };

  console.log("input state", inputState);

  return (
    <Popover
      open={popover.isOpen}
      onOpenChange={(open) => {
        // Don't reset if the input is focused (user clicked input while in create mode)
        if (!open && document.activeElement !== ref.current) {
          addCategory.form.reset();
        }
      }}
    >
      <PopoverTrigger className="w-full" asChild>
        <div className="flex items-center pr-2 bg-white ring-[1px] focus-visible:ring-sky-700 ring-sky-700 rounded-sm overflow-hidden">
          <input
            className="px-2 w-full rounded-sm text-ellipsis focus:outline-none focus:ring-0"
            placeholder="Category"
            onFocus={handleFocus}
            ref={ref}
            value={input}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // Commit highlighted selection via parent handleSelectCategory
                const result = getHighlightedSelection();
                if (result) {
                  e.preventDefault();
                  handleSelect(result.groupName, result.category);
                  return;
                } else {
                  e.preventDefault();
                  handleSelect();
                  return;
                }
              }

              // Delegate navigation keys to the hook
              handleKeyDown(e);

              if (e.key === "Tab") {
                handleBlur();
              }
            }}
          />
          <ChevronDown className="size-4 text-sky-950" />
        </div>
      </PopoverTrigger>
      <PopoverPortal>
        {addCategory.isCreating ? (
          <PopoverContent
            onOpenAutoFocus={(e) => e.preventDefault()}
            onPointerDownOutside={handlePointerDownOutside}
            className="w-[400px] overflow-scroll"
          >
            <PopoverArrow className="w-8 h-2 fill-white" />
            <div className="flex items-center gap-2 px-4 py-3">
              <button onClick={addCategory.toggle}>
                <ChevronLeft className="size-4 text-sky-950" />
              </button>
              <p className="font-bold text-sky-950">Add Category</p>
            </div>
            <Separator />
            <div className="px-4 py-2">
              <Form {...addCategory.form}>
                <form
                  onSubmit={addCategory.form.handleSubmit(addCategory.onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={addCategory.form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sky-950">
                          Category Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="focus-visible:ring-sky-700 shadow-none"
                            placeholder="New category name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-center" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addCategory.form.control}
                    name="categoryGroupId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sky-950">
                          In Category Group
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="focus:ring-sky-700 shadow-none">
                              <SelectValue placeholder="Choose a category group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {addCategory.extendableCategoryGroups.map(
                              (categoryGroup) => (
                                <SelectItem value={categoryGroup.id}>
                                  {categoryGroup.name}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={addCategory.toggle}
                      className="w-[80px] bg-sky-700/10 text-sky-700 border border-sky-700 hover:bg-sky-700/30"
                    >
                      cancel
                    </Button>
                    <Button
                      type="submit"
                      className="w-[80px] bg-sky-700 text-white hover:bg-sky-800"
                    >
                      Submit
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </PopoverContent>
        ) : (
          <PopoverContent
            onOpenAutoFocus={(e) => e.preventDefault()}
            onPointerDownOutside={handlePointerDownOutside}
            avoidCollisions={false}
            side={"bottom"}
            className="w-[500px] h-[300px] p-0 overflow-scroll shadow-lg text-sm"
          >
            <PopoverArrow className="w-8 h-2 fill-white" />

            <CreateCategoryButton
              input={input}
              isExactMatch={isExactMatch}
              onClick={addCategory.toggle}
            />
            <div>
              <div className="py-2">
                {/* {isNoMatch && <p>there is no match</p>} */}
                {selectedLabel !== "" &&
                  inputState.status !== "filtering" &&
                  inputState.status !== "noMatch" && (
                    <div>
                      <p className="px-4 font-bold">Selected</p>
                      <button
                        onClick={() => {
                          // need to reselect the categry
                        }}
                        className="w-full px-8 py-[4px] bg-gray-100 text-left"
                      >
                        {selectedLabel}
                      </button>
                    </div>
                  )}
                {categoryGroups.map((categoryGroup) => {
                  // Filter categories in this group based on input
                  const filteredCategories = categoryGroup.categories.filter(
                    (categoryId) => filteredCategoryIds.has(categoryId)
                  );

                  // Only show the group if it has matching categories
                  if (filteredCategories.length === 0) return null;

                  return (
                    <div key={categoryGroup.id}>
                      <CategoryGroup>{categoryGroup.name}</CategoryGroup>
                      {filteredCategories.map((categoryId) => {
                        const category = categories[categoryId];
                        const currentMonthObj =
                          currentMonthByCategoryId.get(categoryId);
                        const currentIndex =
                          flatFilteredCategoryIds.indexOf(categoryId);
                        const isHighlighted = currentIndex === highlightedIndex;
                        const isSelected = selectedCategoryId === categoryId;

                        return (
                          <CategoryContainer
                            key={categoryId}
                            onClick={() => {
                              handleSelect(categoryGroup.name, category);
                            }}
                            isHighlighted={isHighlighted}
                            isSelected={isSelected}
                          >
                            <Category>{category.name}</Category>
                            <div className="flex items-center gap-2">
                              <CategoryAllocation
                                value={currentMonthObj?.available ?? 0}
                              />
                            </div>
                          </CategoryContainer>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        )}
      </PopoverPortal>
    </Popover>
  );
}

function CategoryGroup({ children }: { children: ReactNode }) {
  return (
    <div className="px-4">
      <p className="font-bold">{children}</p>
    </div>
  );
}

function CategoryContainer({
  onClick,
  children,
  isHighlighted,
  isSelected,
}: {
  onClick: () => void;
  children: ReactNode;
  isHighlighted?: boolean;
  isSelected?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full flex justify-between px-8 py-[5px] cursor-pointer relative",
        isHighlighted
          ? "bg-gray-100"
          : isSelected
            ? "bg-gray-100"
            : "hover:bg-gray-100"
      )}
    >
      {isSelected && (
        <Check className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-sky-700" />
      )}
      {children}
    </button>
  );
}

function Category({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

function CategoryAllocation({ value }: { value: number }) {
  const textColor =
    value < 0 ? "text-red-400" : value > 0 ? "text-green-600" : "text-black ";
  return <p className={`${textColor} `}>£{value.toFixed(2)}</p>;
}

type CreateCategoryButtonProps = {
  input: string;
  isExactMatch: boolean;
  onClick: () => void;
};

function CreateCategoryButton({
  input,
  isExactMatch,
  onClick,
}: CreateCategoryButtonProps) {
  return (
    <div>
      <div className="p-1">
        <button
          className="flex items-center gap-2 h-[35px] px-4 py-2 text-left text-sky-700 hover:text-sky-600"
          onClick={onClick}
        >
          <CirclePlus size={15} />
          {input === "" || isExactMatch
            ? "New Category"
            : `Create "${input}" Category`}
        </button>
      </div>
      <Separator />
    </div>
  );
}
