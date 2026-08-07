import { Button } from "@/core/components/uiLibrary/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/core/components/uiLibrary/form";
import { Input } from "@/core/components/uiLibrary/input";
import { cn } from "@/core/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ContextTarget } from "../hooks/useAllocation/useAllocation";

const NameSchema = z.object({
  name: z.string().min(1, { message: "Category requires a name" }),
});

export type NameType = z.infer<typeof NameSchema>;

type ContextMenuProps = {
  open: boolean;
  item: ContextTarget | null;
  position: {
    x: number;
    y: number;
  };
  canRename: (target: ContextTarget, name: string) => boolean;
  onRename: (target: ContextTarget, name: string) => void;
  onDelete: (target: ContextTarget) => void;
  onClose: () => void;
};

export function ContextMenu({
  open,
  item,
  position,
  canRename,
  onRename,
  onDelete,
  onClose,
}: ContextMenuProps) {
  const initialName = item?.name ?? "";

  const form = useForm<NameType>({
    defaultValues: {
      name: initialName,
    },
    resolver: zodResolver(NameSchema),
  });

  const { reset, control, handleSubmit, watch } = form;
  const name = watch("name");
  const isValidName = item ? canRename(item, name) : false;

  useEffect(() => {
    reset({
      name: initialName,
    });
  }, [initialName]);

  const onSubmit = (name: NameType) => {
    if (!isValidName || item === null) return;
    onRename(item, name.name);
    onClose();
    reset();
  };

  const handleDelete = () => {
    if (item === null) return;
    onDelete(item);
    onClose();
  };

  const menuRef = useRef<HTMLDivElement>(null);

  // Handle pointer down outside
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (menuRef.current && !menuRef.current.contains(target)) {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open, onClose]);

  // Handle escape
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        left: position.x + 30,
        // TODO:(lewis 2026-08-07 09:10) this is a magic number, needs to be derived
        top: position.y - 26,
      }}
      className="z-50 w-96 px-4 py-2 space-y-2 rounded-md bg-white shadow-lg"
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      aria-label="Rename category group"
                      className={cn(
                        "focus-visible:ring-sky-700 shadow-none rounded-[2px]",
                        !isValidName &&
                          "border-red-200 rounded-bl-none rounded-br-none"
                      )}
                      placeholder="New category name"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />

            {!isValidName && (
              <div className="bg-red-300 border-red-300 rounded-b-[2px] px-2 py-1">
                <p className="text-sm text-black">
                  A group with this name already exists
                </p>
              </div>
            )}
          </div>
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
                onClick={onClose}
                className="bg-blue-400"
                variant={"destructive"}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600"
                variant={"destructive"}
                disabled={!isValidName}
              >
                OK
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
