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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CategoryActionTarget } from "../hooks/useAllocation/useAllocation";

const NameSchema = z.object({
  name: z.string().min(1, { message: "Category requires a name" }),
});

export type NameType = z.infer<typeof NameSchema>;

type ContextMenuProps = {
  target: CategoryActionTarget;
  position: {
    x: number;
    y: number;
  };
  menuRef: React.MutableRefObject<HTMLDivElement | null>;
  overlayRef: React.MutableRefObject<HTMLDivElement | null>;
  canRename: (target: CategoryActionTarget, name: string) => boolean;
  onRename: (target: CategoryActionTarget, name: string) => void;
  onDelete: (target: CategoryActionTarget) => void;
  onClose: () => void;
};

export function ContextMenu({
  target,
  menuRef,
  overlayRef,
  position,
  canRename,
  onRename,
  onDelete,
  onClose,
}: ContextMenuProps) {
  const duplicateMessage =
    target.type === "category"
      ? "A category with this name already exists"
      : "A group with this name already exists";

  const renameLabel =
    target.type === "category" ? "Rename category" : "Rename category group";

  const form = useForm<NameType>({
    defaultValues: {
      name: target.name,
    },
    resolver: zodResolver(NameSchema),
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { isDirty },
  } = form;

  const name = watch("name");
  const canRenameTarget = canRename(target, name);
  const canSubmit = isDirty && canRenameTarget && name !== "";

  const onSubmit = (data: NameType) => {
    if (!canSubmit) return;

    onRename(target, data.name);
    onClose();
  };

  const handleDelete = () => {
    onDelete(target);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 cursor-default" ref={overlayRef} />
      <div
        ref={menuRef}
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
        }}
        className="relative z-50 w-96 space-y-2 rounded-md border border-slate-200 bg-white px-4 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.18),0_4px_10px_rgba(0,0,0,0.10)]"
      >
        <div
          className="
          absolute
          -left-2
          top-1/2
          h-0
          w-0
          -translate-y-1/2
          border-y-[10px]
          border-y-transparent
          border-r-[10px]
          border-r-white
        "
        />

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
                        aria-label={renameLabel}
                        className={cn(
                          "focus-visible:ring-sky-700 shadow-none rounded-[2px]",
                          !canRenameTarget &&
                            "border-red-200 rounded-bl-none rounded-br-none"
                        )}
                        placeholder={renameLabel}
                        autoFocus
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />

              {!canRenameTarget && (
                <div className="bg-red-300 border-red-300 rounded-b-[2px] px-2 py-1">
                  <p className="text-sm text-black">{duplicateMessage}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <div className="space-x-2">
                <Button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-200 text-red-400 hover:text-white"
                  variant="destructive"
                >
                  Delete
                </Button>
              </div>

              <div className="space-x-2">
                <Button
                  type="button"
                  onClick={onClose}
                  className="bg-blue-400"
                  variant="destructive"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="bg-blue-600"
                  variant="destructive"
                  disabled={!canSubmit}
                >
                  OK
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
