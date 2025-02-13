import { FieldError, UseFormRegister } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/core/components/uiLibrary/input";
import { darkBlueBg, darkBlueText } from "@/core/theme/colors";
import { Button } from "@/core/components/uiLibrary/button";
import { useAddAccountMutation } from "@/core/api/budgetApiSlice";
import { ArrowRight, ChevronLeft, CreditCard } from "lucide-react";
import clsx from "clsx";
import { BankIcon, TickIcon } from "@/core/icons/icons";
import { ReactNode } from "react";
import { AccountSchema, AccountTypeEnum } from "@/core/types/AccountSchema";

export type FormData = {
  name: string;
  type: "BANK" | "CREDIT_CARD";
  balance: number;
  showSelection: boolean;
  selectOption: string;
};

type ValidNames = "name" | "type" | "balance";

export type ValidLabels =
  | "Give it a nickname"
  | "What type of account are you adding?"
  | "What is your current account balance?";

const accountTypeMapper = {
  BANK: {
    icon: <BankIcon />,
    text: "Bank Account",
  },
  CREDIT_CARD: {
    icon: <CreditCard />,
    text: "Credit Account",
  },
};

export type FormFieldProps = {
  type: string;
  name: ValidNames;
  label: ValidLabels;
  register: UseFormRegister<FormData>;
  error: FieldError | undefined;
  isDirty: boolean | undefined;
};

const FormField: React.FC<FormFieldProps> = ({
  type,
  label,
  name,
  register,
  error,
  isDirty,
}) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={name} className="text-sm font-bold text-sky-950">
      {label}
    </label>
    <div className="flex items-center border rounded pr-2 border-sky-800/40 focus-within:border-transparent focus-within:ring-1 focus-within:ring-sky-950">
      <Input
        id={name}
        type={type}
        className={clsx(
          "border-0 py-6 shadow-transparent focus-visible:ring-0",
        )}
        {...register(name)}
      />
      {isDirty && !error && <TickIco />}
    </div>
  </div>
);

export function AddAccountForm({ close }: { close: () => void }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, dirtyFields },
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      showSelection: false,
    },
    mode: "onChange",
    resolver: zodResolver(AccountSchema),
  });
  const [addAccount] = useAddAccountMutation();

  const onSubmit = async (data: FormData) => {
    addAccount(data);
    close();
  };

  const showSelection = watch("showSelection");
  const accountType = watch("type");

  return (
    <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
      {showSelection ? (
        <>
          <Header>
            <div
              className={`relative px-8 flex justify-center items-center ${darkBlueText}`}
            >
              <Button
                variant={"ghost"}
                size={"icon-sm"}
                className="absolute left-5 hover:bg-transparent rounded-full"
                onClick={() => setValue("showSelection", !showSelection)}
              >
                <ChevronLeft
                  aria-label="back-arrow"
                  className="text-sky-950"
                  onClick={() => setValue("showSelection", !showSelection)}
                />
              </Button>
              <h1 className="text-lg font-bold">Select Account Type</h1>
            </div>
          </Header>
          <div className="p-2 space-y-2">
            {AccountTypeEnum.options.map((type) => (
              <Button
                aria-label={accountTypeMapper[type].text}
                key={type}
                variant="outline"
                className={`flex w-full justify-between py-6 ${darkBlueText} text-lg shadow-none border-sky-800/20`}
                onClick={() => {
                  setValue("type", type);
                  setValue("showSelection", !showSelection);
                }}
              >
                {accountTypeMapper[type].text}
                <span className="opacity-60">
                  {accountTypeMapper[type].icon}
                </span>
              </Button>
            ))}
          </div>
        </>
      ) : (
        <>
          <Header>
            <h1 className={`text-xl font-bold text-center ${darkBlueText}`}>
              Add Account
            </h1>
          </Header>
          <div className="grow p-4 space-y-4">
            <p className="text-sm text-gray-700">
              <span className="font-bold">Let's get started!</span> No need to
              worry—if you change your mind, you can always alter the
              information later.
            </p>
            <FormField
              type="text"
              name="name"
              label="Give it a nickname"
              register={register}
              error={errors.name}
              isDirty={dirtyFields.name}
            />
            <div className="space-y-2">
              <label className="text-sm font-bold text-sky-950">
                What type of account are you adding?
              </label>
              <Button
                type="button"
                className="w-full pl-3 pr-2 py-6 text-left border border-sky-800/40 focus-visible:ring-sky-950"
                variant={"ghost"}
                onClick={() => setValue("showSelection", !showSelection)}
                data-testid="select-account-type"
              >
                <p className="w-full font-normal text-left">
                  {!accountType
                    ? "Select account type..."
                    : accountTypeMapper[accountType].text}
                </p>
                {accountType ? (
                  <TickIco />
                ) : (
                  <ArrowRight className="text-sky-950" />
                )}
              </Button>
            </div>
            <FormField
              type="text"
              name="balance"
              label="What is your current account balance?"
              register={register}
              error={errors.balance}
              isDirty={dirtyFields.balance}
            />
          </div>
          <Footer>
            <Button
              type="submit"
              className={`w-full py-6 ${darkBlueBg} hover:bg-sky-950/80 disabled:opacity-20`}
              disabled={!isValid}
            >
              Next
            </Button>
          </Footer>
        </>
      )}
    </form>
  );
}

export function Header({ children }: { children: ReactNode }) {
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

function TickIco() {
  return (
    <div className="h-9 w-9 flex items-center justify-center px-2 bg-green-500/5 rounded-full">
      <TickIcon aria-label="tick icon" className="text-green-500" />
    </div>
  );
}
