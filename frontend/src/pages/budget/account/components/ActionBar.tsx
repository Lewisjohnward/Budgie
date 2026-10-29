import { Ellipsis, X } from "lucide-react";
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
import { useBudgetSnapshot } from "../../allocation/hooks/useAllocation/useCategories";
import { useMemo } from "react";
import { CategoryUserBranded } from "@/core/types/NormalizedData";
import { CategoryGroupId } from "../../allocation/types/types";

type CategoryGroupView = {
  categories: CategoryUserBranded[];
  id: CategoryGroupId;
  name: string;
  position: number;
};

type ActionBarProps = {
  rowCount: number;
  display: boolean;
  cancel: () => void;
};

export function ActionBar({ rowCount, display, cancel }: ActionBarProps) {
  const { data } = useBudgetSnapshot();

  const categoryGroupView: CategoryGroupView[] = useMemo(() => {
    const categoryGroups = Object.values(data.categoryGroups.user);
    const categoriesByGroup = new Map<CategoryGroupId, CategoryUserBranded[]>();

    for (const category of Object.values(data.categories.user)) {
      const groupId = category.categoryGroupId;
      const groupCategories = categoriesByGroup.get(groupId) ?? [];

      groupCategories.push(category);
      categoriesByGroup.set(groupId, groupCategories);
    }

    return Object.values(categoryGroups).map((categoryGroup) => ({
      ...categoryGroup,
      categories: categoriesByGroup.get(categoryGroup.id) ?? [],
    }));
  }, [data.categoryGroups.user, data.categories.user]);

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
            {categoryGroupView.map((categoryGroup) => {
              return (
                <DropdownMenuGroup key={categoryGroup.id}>
                  <DropdownMenuGroup>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <span>{categoryGroup.name}</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          {categoryGroup.categories.map((category) => (
                            <DropdownMenuItem key={category.id}>
                              <span>{category.name}</span>
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
        </DropdownMenu>
      </DialogContent>
    </Dialog>
  );
}
