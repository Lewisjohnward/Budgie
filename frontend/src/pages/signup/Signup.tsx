import { Link, useNavigate } from "react-router-dom";
import { selectCurrentToken, setCredentials } from "@/core/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/core/hooks/reduxHooks";
import { useEffect } from "react";
import { useLoginMutation } from "@/core/api/authApiSlice";
import { Checkbox } from "@/core/components/uiLibrary/checkbox";
import { Button } from "@/core/components/uiLibrary/button";
import { buttonBlue, buttonBlueHover, textBlue } from "@/core/theme/colors";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/core/components/uiLibrary/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/core/components/uiLibrary/input";
import { FaGithub, FcGoogle, IoMdArrowBack } from "@/core/icons/icons";
import { PasswordInput } from "@/core/components/uiLibrary/PasswordInput";
import { Copyright } from "@/core/components";

export default function SignupPage() {
  return <SignupPageContent />;
}

function SignupPageContent() {
  return (
    <div className="min-h-screen w-screen bg-[radial-gradient(rgba(53,87,129)_0%,rgba(28,65,72,1)_100%)]">
      <main className="flex flex-col h-screen space-y-10 pt-10 pb-4 px-4 md:px-10">
        <LogoLink />
        <div className="flex-grow flex flex-col lg:flex-row items-center lg:justify-center pt-20 lg:gap-20 space-y-10 lg:space-y-0">
          <Aside />
          <MyForm />
        </div>
        <Copyright />
      </main>
    </div>
  );
}

function Separator() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300 dark:border-gray-800" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 text-gray-500 bg-white rounded dark:bg-black/10">
          Or
        </span>
      </div>
    </div>
  );
}

function Aside() {
  return (
    <aside className="xl:max-w-md space-y-5">
      <h1 className="text-4xl font-bold text-white">
        Give Budgie a shot free for 30 days
      </h1>
      <p className="text-white">
        Most Budgie users save £600 within their first two months (and we’re
        betting you’ll save even more).
      </p>
    </aside>
  );
}

function LogoLink() {
  return (
    <Link to={"/"} className="text-white/40">
      <div className="lg:hidden flex items-center gap-2 text-sm">
        <IoMdArrowBack />
        <p>Back to budgie.com</p>
      </div>
      <h1 className="hidden lg:block text-4xl text-white font-bold">Budgie.</h1>
    </Link>
  );
}

const formSchema = z.object({
  username: z.string(),
  password: z.string(),
});

function SocialAuth() {
  return (
    <div className="space-y-4">
      <Button
        className="w-full"
        variant={"outline"}
        type="button"
        onClick={() => {}}
      >
        <FcGoogle className="mr-2 size-5" />
        Continue with Google
      </Button>
      <Button
        className="w-full"
        variant={"outline"}
        type="button"
        onClick={() => {}}
      >
        <FaGithub />
        Continue with Github
      </Button>
    </div>
  );
}

function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      // toast(
      //   <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
      //     <code className="text-white">{JSON.stringify(values, null, 2)}</code>
      //   </pre>,
      // );
    } catch (error) {
      console.error("Form submission error", error);
      // toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <div className="w-full xs:max-w-[500px] py-8 px-6 space-y-0 rounded-lg bg-white">
      <div className="space-y-5">
        <h1 className="text-center text-4xl font-bold">Sign Up</h1>
        <p className="text-center">
          Have an account?
          <Link to="../login" className={`ml-2 ${textBlue}`}>
            Log in
          </Link>
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-5">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Email Address" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className={`${buttonBlue} w-full ${buttonBlueHover}`}
          >
            Log In
          </Button>
        </form>
      </Form>
      <Separator />
      <SocialAuth />
    </div>
  );
}
