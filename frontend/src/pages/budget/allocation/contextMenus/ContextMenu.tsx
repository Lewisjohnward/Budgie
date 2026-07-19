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
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const NameSchema = z.object({
  name: z.string().min(1, { message: "Category requires a name" }),
});

export type NameType = z.infer<typeof NameSchema>;

type ContextMenuProps = {
  children: ReactNode;
  name: string;
  onRename: (name: string) => void;
  onDelete: () => void;
};

export function ContextMenu({
  children,
  name,
  onRename,
  onDelete,
}: ContextMenuProps) {
  const [contextMenuOpen, setContextMenuOpen] = useState(false);

  const closeContextMenu = () => setContextMenuOpen(false);
  const openContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    setContextMenuOpen(true);
  };

  const form = useForm<NameType>({
    defaultValues: {
      name,
    },
    resolver: zodResolver(NameSchema),
  });

  const { reset, control, handleSubmit } = form;

  useEffect(() => {
    reset({
      name,
    });
  }, [name]);

  const onSubmit = (name: NameType) => {
    onRename(name.name);
    closeContextMenu();
    reset();
  };

  const handleOpenChange = (open: boolean) => {
    // If context is closed reset input
    if (!open) reset();
  };

  const handleDelete = () => {
    onDelete();
    closeContextMenu();
  };

  return (
    <div onContextMenu={openContextMenu}>
      <Popover open={contextMenuOpen} onOpenChange={handleOpenChange}>
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
                        aria-label="Rename category group"
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
