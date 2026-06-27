import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/core/components/uiLibrary/dialog";

type DeleteCategoryDialogProps = {
  open: boolean;
  toggle: () => void;
  categoryName: string;
  transactionCount: number;
};

const buttonStyles = `py-1 px-2 w-full flex justify-between text-black rounded whitespace-nowrap hover:bg-gray-300/80 transition-colors`;

export function DeleteCategoryDialog({
  open,
  toggle,
  categoryName,
  transactionCount,
}: DeleteCategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={toggle}>
      <DialogContent className="px-0 py-2">
        <DialogHeader className="py-2">
          <DialogTitle className="px-4 py-2 border-b">
            Delete Category
          </DialogTitle>
          <DialogDescription className="px-4 py-2 text-sm font-[500]">
            Before you can delete the category{" "}
            <span className="font-bold">{categoryName}</span>, you'll need to
            reassign your past activity to a new category.
          </DialogDescription>

          <div className="px-4">
            <p className="text-lg font-semibold leading-none tracking-tight">
              Here's what will be reassigned to the new category:
            </p>
            <ul className="list-disc list-inside">
              <li>All transactions [{transactionCount}]</li>
              <li>All assigned amounts</li>
              <li>Any remaining available amount</li>
            </ul>
          </div>
        </DialogHeader>
        <div className="px-4 flex justify-end gap-4 p-2">
          <button className="px-3 py-1 bg-blue-400/50 rounded">Cancel</button>
          <button className="px-3 py-1 bg-red-400 rounded">Delete</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteCategoryDialogTemp({
  open,
  toggle,
  categoryName,
  transactionCount,
}: DeleteCategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={toggle}>
      <DialogContent className="p-0">
        <DialogHeader className="py-2">
          <DialogTitle className="px-4 py-2 border-b">
            Delete Category
          </DialogTitle>
          <DialogDescription className="px-4 py-2 text-sm font-[500]">
            There is money currently assigned to{" "}
            <span className="font-bold">{categoryName}</span>.
          </DialogDescription>

          <div className="px-4">
            <p className="text-lg font-semibold leading-none tracking-tight">
              Here's what will be reassigned to the new category:
            </p>
            <p>
              When you delete this category, all assigned amounts will be moved
              to <span>Ready to Assign</span>
            </p>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
