import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/core/components/uiLibrary/dialog";
import { useAppDispatch, useAppSelector } from "@/core/hooks/reduxHooks";
import {
  selectManagePayees,
  toggleManagePayees,
} from "@/core/slices/dialogSlice";
import { MdOutlineManageAccounts } from "react-icons/md";

export function ManagePayees() {
  const dispatch = useAppDispatch();
  const dialogOpen = useAppSelector(selectManagePayees);
  const handleCloseDialog = () => dispatch(toggleManagePayees());

  //TODO: THIS SHOULDN'T BE IN CORE

  return (
    <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="h-[600px] w-[1000px] flex flex-col">
        <DialogHeader className="flex flex-row items-center gap-2">
          <MdOutlineManageAccounts className="text-sky-950" />
          <DialogTitle className="text-sky-950">Manage Payees</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
