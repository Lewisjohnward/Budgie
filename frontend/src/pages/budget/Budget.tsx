import { CirclePlus } from "lucide-react";
import Navbar from "./navBar/NavBar";
import { Outlet } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/uiLibrary/popover";
import { PopoverArrow, PopoverPortal } from "@radix-ui/react-popover";
import { Input } from "@/core/components/uiLibrary/input";
import { Button } from "@/core/components/uiLibrary/button";
import {
  useAddCategoryGroupMutation,
  useGetAccountsQuery,
  useGetCategoriesQuery,
} from "@/core/api/budgetApiSlice";
import { ManagePayees } from "@/core/components/ManagePayees/ManagePayees";
import { EditAccount } from "@/core/components/EditAccount/EditAccount";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function BudgetPage() {
  const { isLoading: isLoadingAccounts } = useGetAccountsQuery();
  const { isLoading: isLoadingCategories } = useGetCategoriesQuery();

  if (isLoadingAccounts || isLoadingCategories) {
    return <div className="h-screen bg-blue-400">...Getting data</div>;
  }
  return <BudgetContent />;
}

function BudgetContent() {
  return (
    <main className="flex h-dvh">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <ManagePayees />
      <EditAccount />
    </main>
  );
}

const AddCategoryGroupSchema = z.object({
  name: z.string().min(1, { message: "Category group requires a name" }),
});

type AddCategoryGroupType = z.infer<typeof AddCategoryGroupSchema>;

export function Menu() {
  const [createCategoryGroup, { isLoading, isSuccess }] =
    useAddCategoryGroupMutation();

  const {
    register,
    handleSubmit,
    formState: { isValid },
    reset,
  } = useForm<AddCategoryGroupType>({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(AddCategoryGroupSchema),
  });
  // const handleOpen = (open: boolean) => {
  //   if (!open) reset();
  // };

  const onSubmit = (categoryGroup: AddCategoryGroupType) => {
    console.log(categoryGroup);
    createCategoryGroup(categoryGroup);
    // close();
  };

  return (
    <div className="px-2 py-1 border-b border-r border-b-gray-200 border-r-gray-200">
      <Popover modal={true}>
        <PopoverTrigger>
          <button
            className="flex items-center gap-2 px-2 py-2 text-sky-950 rounded text-sm hover:bg-sky-950/10"
          // onClick={handleClick}
          >
            <CirclePlus size={15} />
            Category Group
          </button>
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            onPointerDownOutside={close}
            avoidCollisions={false}
            side={"bottom"}
            className="w-[200px] p-0 shadow-lg"
          >
            <PopoverArrow className="w-8 h-2 fill-white" />
            <form
              className="px-2 py-2 space-y-2"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Input
                className="shadow-none focus-visible:ring-sky-50"
                placeholder="New Category Group"
                autoComplete="off"
                {...register("name")}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="reset"
                  onClick={close}
                  className="bg-gray-400 hover:bg-gray-400/80"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-sky-900 hover:bg-sky-950/80"
                  disabled={!isValid}
                >
                  Okay
                </Button>
              </div>
            </form>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    </div>
  );
}
