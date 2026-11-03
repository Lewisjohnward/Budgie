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
import {
  CategorySystemBranded,
  CategoryUserBranded,
} from "@/core/types/NormalizedData";
import {
  CategoryGroupId,
  CategoryId,
  TransactionId,
} from "../../allocation/types/types";
import { useEditBulkTransactionsMutation } from "@/core/api/budget/transaction/transactionApiSlice";

type CategoryGroupView = {
  categories: (CategoryUserBranded | CategorySystemBranded)[];
  id: CategoryGroupId;
  name: string;
  position: number;
};

type ActionBarProps = {
  selectedTransactionIds: TransactionId[];
  rowCount: number;
  display: boolean;
  cancel: () => void;
};

export function ActionBar({
  selectedTransactionIds,
  rowCount,
  display,
  cancel,
}: ActionBarProps) {
  const { data } = useBudgetSnapshot();

  const [editBulkTransactions, { isLoading }] =
    useEditBulkTransactionsMutation();

  const categoryGroupView: CategoryGroupView[] = useMemo(() => {
    const categoryGroups = Object.values(data.categoryGroups.user);

    const inflowGroup = data.categoryGroups.inflow;
    const rtaCategory = data.categories.rta;

    const categoriesByGroup = new Map<CategoryGroupId, CategoryUserBranded[]>();

    for (const category of Object.values(data.categories.user)) {
      const groupId = category.categoryGroupId;
      const groupCategories = categoriesByGroup.get(groupId) ?? [];

      groupCategories.push(category);
      categoriesByGroup.set(groupId, groupCategories);
    }

    const userGroups = categoryGroups.map((categoryGroup, i) => ({
      ...categoryGroup,
      position: i + 1,
      categories: categoriesByGroup.get(categoryGroup.id) ?? [],
    }));

    const groups: CategoryGroupView[] = [
      ...userGroups,
      {
        ...inflowGroup,
        categories: [rtaCategory],
        position: 0,
      },
    ];

    return groups.sort((a, b) => a.position - b.position);
  }, [
    data.categoryGroups.user,
    data.categoryGroups.inflow,
    data.categories.user,
    data.categories.rta,
  ]);

  const handleBulkCategorise = async (categoryId: CategoryId) => {
    try {
      await editBulkTransactions({
        transactionIds: selectedTransactionIds,
        updates: {
          categoryId,
        },
      }).unwrap();

      cancel();
    } catch (error) {
      console.error("Failed to bulk categorise transactions:", error);
    }
  };

  return (
    <Dialog open={display} modal={false}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-w-fit flex items-center px-2 h-12 bg-sky-950 border-none rounded-xl text-white shadow-none [&>button:last-child]:hidden"
        position="bc"
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
            <Button
              disabled={isLoading}
              className="bg-transparent hover:bg-white/10 focus-visible:ring-white"
            >
              <MdMoveToInbox />
              Categorise
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56">
            <DropdownMenuArrow className="fill-white" width={10} height={10} />

            {categoryGroupView.map((categoryGroup) => (
              <DropdownMenuGroup key={categoryGroup.id}>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <span>{categoryGroup.name}</span>
                  </DropdownMenuSubTrigger>

                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {categoryGroup.categories.map((category) => (
                        <DropdownMenuItem
                          key={category.id}
                          disabled={isLoading}
                          onSelect={() => handleBulkCategorise(category.id)}
                        >
                          <span>{category.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuGroup>
            ))}
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
