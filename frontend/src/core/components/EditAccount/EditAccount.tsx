import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/core/components/uiLibrary/dialog";
import { useAppDispatch, useAppSelector } from "@/core/hooks/reduxHooks";
import {
  selectEditAccount,
  selectEditingAccount,
  toggleEditAccount,
} from "@/core/slices/dialogSlice";
import { darkBlueText } from "@/core/theme/colors";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/core/components/uiLibrary/form";
import { Button } from "@/core/components/uiLibrary/button";
import { Textarea } from "@/core/components/uiLibrary/textarea";
import { Input } from "../uiLibrary/input";
import { useDeleteAccountMutation } from "@/core/api/budgetApiSlice";
import { useNavigate } from "react-router-dom";

export function EditAccount() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [deleteAccount, { isSuccess }] = useDeleteAccountMutation();
  const dialogOpen = useAppSelector(selectEditAccount);
  const editingAccount = useAppSelector(selectEditingAccount);
  const handleCloseDialog = () => dispatch(toggleEditAccount(null));

  const editAccountSchema = z.object({
    name: z.string().min(2).max(50),
    notes: z.string().max(255).optional(),
    workingBalance: z.string().transform((val) => Number(val) || 0),
  });

  const form = useForm<z.infer<typeof editAccountSchema>>({
    resolver: zodResolver(editAccountSchema),
    defaultValues: {
      name: editingAccount?.name,
      workingBalance: editingAccount?.balance,
    },
  });

  useEffect(() => {
    if (editingAccount) {
      form.reset({
        name: editingAccount.name,
        workingBalance: editingAccount.balance,
      });
    }
  }, [editingAccount]);

  useEffect(() => {
    if (isSuccess) {
      handleCloseDialog();
      navigate("/budget/account/all");
    }
  }, [isSuccess]);

  const onSubmit = (values: z.infer<typeof editAccountSchema>) => {
    console.log(values);
  };

  const handleDeleteAccount = async () => {
    try {
      if (editingAccount != null)
        await deleteAccount({ accountId: editingAccount.id });
    } catch (error) {
      console.log("there has been an error", error);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        className="flex flex-col px-0 pt-4 pb-0 w-[550px] text-sky-950"
      >
        <DialogHeader>
          <Header>
            <DialogTitle className={`text-xl text-center ${darkBlueText}`}>
              Edit Account
            </DialogTitle>
          </Header>
        </DialogHeader>
        <div className="flex flex-col grow">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grow flex flex-col justify-between"
            >
              <div className="h-[400px] px-4 space-y-4 overflow-scroll">
                <h2 className="font-bold">Account information</h2>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Nickname</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="shadow-none focus-visible:ring-sky-950"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="shadow-none focus:border-sky-950"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workingBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Working Balance</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="shadow-none focus-visible:ring-sky-950"
                        />
                      </FormControl>
                      <FormDescription>
                        An adjustment transaction will be created automatically
                        if you change this amount.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
              <Footer>
                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="destructive"
                    className="bg-opacity-30 text-red-700 hover:text-white"
                    onClick={handleDeleteAccount}
                  >
                    Delete account
                  </Button>
                  <div className="space-x-2">
                    <Button
                      type="button"
                      onClick={handleCloseDialog}
                      className="bg-sky-950 bg-opacity-30 text-sky-950 hover:bg-opacity-60 hover:bg-sky-950"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-sky-950 bg-opacity-80 hover:bg-opacity-100 hover:bg-sky-950"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </Footer>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Header({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4">
      {children}
      <Separator />
    </div>
  );
}

export function Footer({ children }: { children: ReactNode }) {
  return (
    <>
      <Separator />
      <div className="p-4">{children}</div>
    </>
  );
}

function Separator() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300 dark:border-gray-800" />
      </div>
    </div>
  );
}
