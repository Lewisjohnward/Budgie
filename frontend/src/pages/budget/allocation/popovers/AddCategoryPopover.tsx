import { useAddCategoryMutation } from "@/core/api/budgetApiSlice";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { AddCategoryFormData, AddCategorySchema } from "../types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/uiLibrary/popover";
import { PopoverArrow, PopoverPortal } from "@radix-ui/react-popover";
import { Input } from "@/core/components/uiLibrary/input";
import { Button } from "@/core/components/uiLibrary/button";

export function AddCategoryPopover({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const [displayPopover, setDisplayPopover] = useState(false);
  const [createCategory] = useAddCategoryMutation();

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

  const togglePopover = () => setDisplayPopover((prev) => !prev);

  const close = () => {
    togglePopover();
    reset();
  };

  const onSubmit = (data: AddCategoryFormData) => {
    createCategory(data);
    togglePopover();
    reset();
  };

  return (
    <Popover open={displayPopover} modal={true}>
      <PopoverTrigger onClick={togglePopover}>{children}</PopoverTrigger>
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
            onSubmit={handleSubmit(onSubmit)}
          >
            <Input
              className="shadow-none focus-visible:ring-sky-50"
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
