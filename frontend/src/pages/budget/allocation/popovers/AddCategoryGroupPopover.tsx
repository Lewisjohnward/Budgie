import { useAddCategoryGroupMutation } from "@/core/api/budgetApiSlice";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/uiLibrary/popover";
import { PopoverArrow, PopoverPortal } from "@radix-ui/react-popover";
import { Input } from "@/core/components/uiLibrary/input";
import { Button } from "@/core/components/uiLibrary/button";
import { z } from "zod";

const AddCategoryGroupSchema = z.object({
  name: z.string().min(1, { message: "Category group requires a name" }),
});

type AddCategoryGroupType = z.infer<typeof AddCategoryGroupSchema>;

export function AddCategoryGroupPopover({ children }: { children: ReactNode }) {
  const [displayPopover, setDisplayPopover] = useState(false);
  const [addCategoryGroup] = useAddCategoryGroupMutation();

  const {
    register,
    handleSubmit,
    formState: { isValid },
    reset,
  } = useForm<AddCategoryGroupType>({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(AddCategoryGroupSchema),
  });

  const togglePopover = () => setDisplayPopover((prev) => !prev);

  const close = () => {
    reset();
    togglePopover();
  };

  const onSubmit = (categoryGroup: AddCategoryGroupType) => {
    addCategoryGroup(categoryGroup);
    togglePopover();
    reset();
  };

  return (
    <div className="px-2 py-1 border-b border-r border-b-gray-200 border-r-gray-200">
      <Popover open={displayPopover} modal={true}>
        <PopoverTrigger onClick={togglePopover}>{children}</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            onPointerDownOutside={close}
            avoidCollisions={false}
            side={"bottom"}
            className="w-[200px] p-0 shadow-lg"
          >
            <PopoverArrow className="w-8 h-2 fill-white" />
            <form
              className="px-2 py-2 space-y-2"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Input
                className="shadow-none focus-visible:ring-sky-50"
                placeholder="New Category Group"
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
  );
}
