import { FieldError, UseFormRegister } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z, ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./uiLibrary/input";
import { buttonBlueDisabled, darkBlueBg, darkBlueText } from "../theme/colors";
import { Button } from "./uiLibrary/button";

export type FormData = {
  name: string;
  accountType: string;
  balance: number;
};

export type FormFieldProps = {
  type: string;
  name: ValidNames;
  label: ValidLabels;
  register: UseFormRegister<FormData>;
  error: FieldError | undefined;
  valueAsNumber?: boolean;
};

type ValidNames = "name" | "accountType" | "balance";

export type ValidLabels =
  | "Give it a nickname"
  | "What type of account are you adding?"
  | "What is your current account balance?";

const FormField: React.FC<FormFieldProps> = ({
  type,
  label,
  name,
  register,
  error,
  valueAsNumber,
}) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={name} className={`text-sm font-bold ${darkBlueText}`}>
      {label}
    </label>
    <Input
      id={name}
      type={type}
      className="py-6 shadow-transparent focus:border-sky-800 focus-visible:ring-0"
      {...register(name, { valueAsNumber })}
    />
    {error && <span className="error-message">{error.message}</span>}
  </div>
);

export const UserSchema: ZodType<FormData> = z.object({
  name: z.string(),
  accountType: z.string(),
  balance: z.number(),
});

export function AddAccount() {
  return <AddAccountForm />;
}

function AddAccountForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(UserSchema),
  });

  const onSubmit = async (data: FormData) => {
    console.log("SUCCESS", data);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-2">
        <FormField
          type="text"
          name="name"
          label="Give it a nickname"
          register={register}
          error={errors.name}
        />

        <FormField
          type="text"
          name="accountType"
          label="What type of account are you adding?"
          register={register}
          error={errors.accountType}
        />

        <FormField
          type="text"
          name="balance"
          label="What is your current account balance?"
          register={register}
          error={errors.balance}
          valueAsNumber
        />

        <Button
          type="submit"
          className={`py-6 ${darkBlueBg} hover:bg-sky-950/80 disabled:opacity-20`}
          disabled={!isValid}
        >
          next
        </Button>
      </div>
    </form>
  );
}
