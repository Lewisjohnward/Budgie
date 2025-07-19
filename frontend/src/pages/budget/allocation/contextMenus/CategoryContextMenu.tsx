import {
  useDeleteCategoryMutation,
  useEditCategoryMutation,
} from "@/core/api/budgetApiSlice";
import { Button } from "@/core/components/uiLibrary/button";
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
import { Category } from "@/core/types/NormalizedData";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const CategoryContextSchema = z.object({
  name: z.string().min(1, { message: "Category requires a name" }),
  categoryId: z.string().uuid(),
});

export type CategoryContextType = z.infer<typeof CategoryContextSchema>;

export function CategoryContextMenu({
  category,
  children,
}: {
  category: Category;
  children: ReactNode;
}) {
  const [contextOpen, setContextOpen] = useState(false);
  const [editCategory] = useEditCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const form = useForm<CategoryContextType>({
    defaultValues: {
      name: category.name,
      categoryId: category.id,
    },
    resolver: zodResolver(CategoryContextSchema),
  });

  const { reset, control, handleSubmit } = form;

  const handleOpen = (open: boolean) => {
    if (!open) reset();
  };

  useEffect(() => {
    reset({
      name: category.name,
      categoryId: category.id,
    });
  }, [category.name, category.id]);

  const onSubmit = (updatedCategory: CategoryContextType) => {
    editCategory(updatedCategory);
    closeContextMenu();
    reset();
  };

  const handleDelete = (categoryId: string) => {
    deleteCategory({ categoryId });
  };

  const openContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    setContextOpen(true);
  };

  const closeContextMenu = () => {
    setContextOpen(false);
  };

  return (
    <div onContextMenu={openContextMenu}>
      <Popover open={contextOpen} onOpenChange={handleOpen}>
        <PopoverTrigger className="w-full text-left">{children}</PopoverTrigger>
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
                    onClick={() => handleDelete(category.id)}
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
