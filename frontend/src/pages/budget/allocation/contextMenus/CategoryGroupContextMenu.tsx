import {
  useDeleteCategoryGroupMutation,
  useUpdateCategoryGroupMutation,
} from "@/core/api/budget/categoryGroup/CategoryGroupApiSlice";
import { Button } from "@/core/components/uiLibrary/button";
import { Dialog, DialogContent } from "@/core/components/uiLibrary/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/core/components/uiLibrary/form";
import { Input } from "@/core/components/uiLibrary/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/uiLibrary/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/core/components/uiLibrary/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToggle } from "../components/assign/hooks";
import { CategoryGroupWithMetrics } from "../utils/assembleCategoryGroupViews";
import { CategoryGroupId } from "../types/types";
import { CategoryGroupDeleteState } from "../utils/getCategoryGroupDeleteState";
import { ChevronDown } from "lucide-react";
import { PopoverArrow, PopoverPortal } from "@radix-ui/react-popover";
import { formatCurrency } from "@/utils/formatCurrency";

const CategoryGroupContextSchema = z.object({
  name: z.string().min(1, { message: "Category requires a name" }),
});

export type CategoryGroupContextType = z.infer<
  typeof CategoryGroupContextSchema
>;

type DeleteState = {
  groupName: string;
  categoryCount: number;
  hasAssigned: boolean;
  transactionCount: number;
};

export function CategoryGroupContextMenu({
  categoryGroup,
  getCategoryGroupDeleteState,
  children,
  selectors,
}: {
  categoryGroup: CategoryGroupWithMetrics;
  selectors: any;
  getCategoryGroupDeleteState: (
    categoryGroupId: CategoryGroupId
  ) => CategoryGroupDeleteState;
  children: ReactNode;
}) {
  const [contextOpen, setContextOpen] = useState(false);
  const [updateCategoryGroup] = useUpdateCategoryGroupMutation();
  const [deleteCategoryGroup] = useDeleteCategoryGroupMutation();

  const form = useForm<CategoryGroupContextType>({
    defaultValues: {
      name: categoryGroup.name,
    },
    resolver: zodResolver(CategoryGroupContextSchema),
  });

  const { reset, control, handleSubmit } = form;

  useEffect(() => {
    reset({
      name: categoryGroup.name,
    });
  }, [categoryGroup.name, categoryGroup.id]);

  const handleOpen = (open: boolean) => {
    if (!open) reset();
  };

  const onSubmit = (updatedCategoryGroup: CategoryGroupContextType) => {
    updateCategoryGroup({
      categoryGroupId: categoryGroup.id,
      name: updatedCategoryGroup.name,
    });
    closeContextMenu();
    reset();
  };
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
  const [selectOptions, setSelectOptions] = useState<any>(null);

  const { value: open, toggle } = useToggle(false);
  const handleDelete = () => {
    const state = getCategoryGroupDeleteState(categoryGroup.id);

    if (state.canDelete)
      deleteCategoryGroup({ categoryGroupId: categoryGroup.id });
    toggle();
    setContextOpen(false);
    console.log("state:", state);
    const selectionOptions = selectors.getCategorySelectOptions({
      type: "categoryGroup",
      id: categoryGroup.id,
    });
    setSelectOptions(selectionOptions);

    setDeleteState({
      hasAssigned: state.hasAssigned,
      transactionCount: state.transactionCount,
      categoryCount: state.categoryCount,
      groupName: categoryGroup.name,
    });
  };

  const acceptDelete = () => {
    deleteCategoryGroup({ categoryGroupId: categoryGroup.id });
  };

  const openContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    setContextOpen(true);
  };

  const closeContextMenu = () => {
    setContextOpen(false);
  };

  const cancelDeleteModal = () => {
    toggle();
  };

  return (
    <div onContextMenu={openContextMenu}>
      <ConfirmDeleteModal
        open={open}
        toggle={toggle}
        state={deleteState}
        accept={acceptDelete}
        cancel={cancelDeleteModal}
        selectOptions={selectOptions}
      ></ConfirmDeleteModal>

      <Popover open={contextOpen} onOpenChange={handleOpen}>
        <PopoverTrigger className="w-full text-left cursor-auto">
          {children}
        </PopoverTrigger>
        <PopoverContent
          onPointerDownOutside={closeContextMenu}
          className="w-96 px-4 py-2 space-y-2"
        >
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        className="focus-visible:ring-sky-700 shadow-none"
                        placeholder="New category name"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />
              <div className="flex justify-between">
                <div className="space-x-2">
                  <Button
                    type="button"
                    onClick={handleDelete}
                    className="bg-red-200 text-red-400 hover:text-white"
                    variant={"destructive"}
                  >
                    Delete
                  </Button>
                </div>
                <div className="space-x-2">
                  <Button
                    type="button"
                    onClick={closeContextMenu}
                    className="bg-blue-400"
                    variant={"destructive"}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600"
                    variant={"destructive"}
                  >
                    OK
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function ConfirmDeleteModal({
  open,
  toggle,
  state,
  accept,
  cancel,
  selectOptions,
}: {
  open: boolean;
  toggle: () => void;
  state: DeleteState | null;
  accept: () => void;
  cancel: () => void;
  selectOptions: any;
}) {
  const [input, setInput] = useState("");
  const [isFocussed, setIsFocussed] = useState(false);

  const handleFocus = () => setIsFocussed(true);
  const handleBlur = () => setIsFocussed(false);

  if (!state) return;

  return (
    <Dialog open={open} onOpenChange={toggle}>
      <DialogContent
        className="
            fixed
            w-[500px]
            py-4
          px-0
            bg-white
          gap-2
          "
      >
        <div className="px-4 font-semibold text-lg mb-2">
          Delete Category Group
        </div>
        <hr />

        {/* Breakdown section */}
        {state.transactionCount > 0 && (
          <>
            <div className="px-4 pt-2 overflow-hidden">
              All <span className="font-bold">[{state.categoryCount}]</span>{" "}
              categories in the group{" "}
              <span className="font-bold">{state.groupName}</span> will be
              reassigned to the selected category.
            </div>

            <div className="px-4 space-y-2">
              <p className="font-bold">Select category</p>
              <Popover open={isFocussed}>
                <PopoverTrigger className="w-full" asChild>
                  <div className="flex items-center p-1 pr-2 bg-white ring-[1px] focus-visible:ring-sky-700 ring-sky-700 rounded-sm overflow-hidden">
                    <input
                      className="px-2 w-full rounded-sm text-ellipsis focus:outline-none focus:ring-0"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                    <ChevronDown className="size-4 text-sky-950" />
                  </div>
                </PopoverTrigger>
                <PopoverPortal>
                  <PopoverContent
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    // onPointerDownOutside={handlePointerDownOutside}
                    className="w-[475px] rounded-sm overflow-scroll shadow-md animate-none"
                  >
                    <div className="p-2">
                      <p className="text-lg font-bold">Plan categories</p>
                    </div>
                    <hr />
                    <div className="p-2">
                      <ul>
                        {selectOptions.map((i) => {
                          return (
                            <li>
                              <div>
                                {i.groupName}
                                {i.categories.map((c) => {
                                  return (
                                    <div className="flex justify-between">
                                      <div>{c.name}</div>
                                      <div>{formatCurrency(c.available)}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </PopoverContent>
                </PopoverPortal>
              </Popover>

              {/* <Select> */}
              {/*   <SelectTrigger className="w-full"> */}
              {/*     <SelectValue placeholder="" /> */}
              {/*   </SelectTrigger> */}
              {/*   <SelectContent className="w-full bg-red-400"> */}
              {/*     <SelectGroup> */}
              {/*       <SelectLabel>Fruits</SelectLabel> */}
              {/*       <SelectItem value="apple">Apple</SelectItem> */}
              {/*       <SelectItem value="banana">Banana</SelectItem> */}
              {/*       <SelectItem value="blueberry">Blueberry</SelectItem> */}
              {/*       <SelectLabel>Fruits</SelectLabel> */}
              {/*       <SelectItem value="grapes">Grapes</SelectItem> */}
              {/*       <SelectItem value="pineapple">Pineapple</SelectItem> */}
              {/*     </SelectGroup> */}
              {/*   </SelectContent> */}
              {/* </Select> */}
            </div>

            <div className="px-4">
              <p className="font-bold">
                Here's what will be reassigned to the new category:
              </p>
              <ul>
                <li>
                  All transactions{" "}
                  <span className="font-bold">[{state.transactionCount}]</span>
                </li>
                <li>All assigned amounts</li>
                <li>Any remaining available amount</li>
              </ul>
            </div>
          </>
        )}
        {state.hasAssigned && state.transactionCount === 0 && (
          <div className="px-4 pt-2 space-y-4">
            <p>
              There is money currently assigned to{" "}
              <span className="font-bold">test</span>.
            </p>{" "}
            <p>
              When you delete this category group, all assigned amounts will be
              moved to <span className="font-bold">Ready to Assign.</span>
            </p>
          </div>
        )}
        <div className="flex justify-end gap-2 px-4">
          <Button className="bg-sky-900 text-md" onClick={cancel}>
            Cancel
          </Button>
          <Button
            className="bg-red-400/40 text-md text-red-500"
            onClick={accept}
          >
            Delete
          </Button>
        </div>

        {/* Footer note */}
      </DialogContent>
    </Dialog>
  );
}
