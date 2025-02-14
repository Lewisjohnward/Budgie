// TODO: HANDLE THE ROUTING ON THE NAVBAR WHEN EACH PAAGE IS OPEN
// TODO: MAYBE SPLIT UP THE NAVBAR COMPONENTS
// TODO: FIX TYPING OF Account component

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/core/components/uiLibrary/dialog";
import { darkBlueText } from "@/core/theme/colors";
import clsx from "clsx";
import { Dot, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsRoute } from "../hooks/useIsRoute";
import { Footer, Header } from "./AddAccountForm";
import { Input } from "@/core/components/uiLibrary/input";
import useMouseOver from "@/core/hooks/useMouseOver";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/core/components/uiLibrary/form";
import { Button } from "@/core/components/uiLibrary/button";
import { Textarea } from "@/core/components/uiLibrary/textarea";
import { Account } from "@/core/types/NormalizedData";
import { Balance } from "./Balance";

export function AccountCard({
  account,
  currency,
}: {
  account: Account;
  currency: any;
}) {
  const { mouseOver, handleMouseEnter, handleMouseLeave } = useMouseOver();
  const isRoute = useIsRoute();

  const editAccountSchema = z.object({
    name: z.string().min(2).max(50),
    notes: z.string().max(255).optional(),
    workingBalance: z.string().transform((val) => Number(val) || 0),
  });

  const form = useForm<z.infer<typeof editAccountSchema>>({
    resolver: zodResolver(editAccountSchema),
    defaultValues: {
      name: "",
    },
  });

  function onSubmit(values: z.infer<typeof editAccountSchema>) {
    console.log(values);
  }

  const active = isRoute(`/budget/account/${account.id}`);
  const hasFundsToAllocate = Math.random() >= 0.5;

  return (
    <Link
      to={`account/${account.id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={clsx(
        // TODO: Would it be better to have selected as a property on the array from server?
        (active || mouseOver) && "bg-white/10",
        "flex justify-between items-center gap-4 pl-4 pr-2 py-2 text-sm rounded",
      )}
    >
      <div
        onClick={(e) => {
          e.preventDefault();
        }}
        className="relative flex justify-center items-center w-5 h-5"
      >
        <Dialog
          onOpenChange={(open) => {
            if (!open) handleMouseLeave();
          }}
        >
          <DialogTrigger asChild>
            {mouseOver ? (
              <Pencil className="w-3 h-3 hover:opacity-30" />
            ) : hasFundsToAllocate ? (
              <Dot size={40} className="absolute" />
            ) : null}
          </DialogTrigger>
          <DialogContent className="flex flex-col px-0 pt-4 pb-0 w-[550px] text-sky-950">
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
                            An adjustment transaction will be created
                            automatically if you change this amount.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                  <Footer>
                    <div className="flex justify-between items-center">
                      <Button
                        variant="destructive"
                        className="bg-opacity-30 text-red-700 hover:text-white"
                        onClick={() => console.log("Hello, World!")}
                      >
                        Delete account
                      </Button>
                      <div className="space-x-2">
                        <Button
                          onClick={() => console.log("Hello, World!")}
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
      </div>
      <div className="relative grow flex justify-between">
        <p>{account.name}</p>
        <Balance balance={account.balance} />
      </div>
    </Link>
  );
}
