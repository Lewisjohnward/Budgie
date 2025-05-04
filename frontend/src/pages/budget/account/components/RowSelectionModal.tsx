import { Ellipsis, X } from "lucide-react";
import { useGetCategoriesQuery } from "@/core/api/budgetApiSlice";
import { Button } from "@/core/components/uiLibrary/button";
import { MdMoveToInbox } from "react-icons/md";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/core/components/uiLibrary/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/core/components/uiLibrary/dropdown-menu";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";

export function SelectionModal({
  rowCount,
  display,
  cancel,
}: {
  rowCount: number;
  display: boolean;
  cancel: () => void;
}) {
  const { data } = useGetCategoriesQuery();
  if (!data) return <div>There has been an error</div>;

  const categoryGroups = Object.values(data.categoryGroups);
  const categories = data.categories;

  return (
    <Dialog open={display} modal={false}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-w-fit flex items-center px-2 h-12 bg-sky-950 border-none rounded-xl text-white shadow-none [&>button:last-child]:hidden"
        position={"bc"}
      >
        <DialogTitle className="sr-only">Row selection modal</DialogTitle>
        <Button
          onClick={cancel}
          className="bg-transparent hover:bg-white/10 focus-visible:ring-white"
        >
          <X />
          {`${rowCount} Transactions`}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-transparent hover:bg-white/10 focus-visible:ring-white">
              <MdMoveToInbox />
              Categorise
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuArrow className="fill-white" width={10} height={10} />
            {categoryGroups.map((categoryGroup) => {
              return (
                <DropdownMenuGroup>
                  <DropdownMenuGroup>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <span>{categoryGroup.name}</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          {categoryGroup.categories.map((categoryId) => (
                            <DropdownMenuItem>
                              <span>{categories[categoryId].name}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </DropdownMenuGroup>
                </DropdownMenuGroup>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-transparent hover:bg-white/10 focus-visible:ring-white">
              <Ellipsis />
              More
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {categoryGroups.map((categoryGroup) => {
              return (
                <DropdownMenuGroup>
                  <DropdownMenuGroup>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <span>{categoryGroup.name}</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal></DropdownMenuPortal>
                    </DropdownMenuSub>
                  </DropdownMenuGroup>
                </DropdownMenuGroup>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </DialogContent>
    </Dialog>
  );
}
