import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/core/components/uiLibrary/dialog";
import { useAppDispatch, useAppSelector } from "@/core/hooks/reduxHooks";
import { selectDialogOpen, toggleDialog } from "@/core/store/managePayeesSlice";

export function ManagePayees() {
  const dispatch = useAppDispatch();
  const dialogOpen = useAppSelector(selectDialogOpen);
  const handleCloseDialog = () => {
    dispatch(toggleDialog());
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="h-[600px] w-[1000px]">
        <DialogHeader>
          <DialogTitle>Manage Payees</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
