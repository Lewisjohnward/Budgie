import { Link, useNavigate } from "react-router-dom";
import { selectCurrentToken, setCredentials } from "@/core/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/core/hooks/reduxHooks";
import { useEffect } from "react";
import { useLoginMutation } from "@/core/api/authApiSlice";
import { Checkbox } from "@/core/components/uiLibrary/checkbox";
import { Button } from "@/core/components/uiLibrary/button";
import { buttonBlue, textBlue } from "@/core/theme/colors";
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

const formSchema = z.object({
  email: z.string(),
  password: z.string(),
  stayLoggedIn: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = useAppSelector(selectCurrentToken);
  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    if (token) {
      navigate("/budget", { replace: true });
    }
  }, []);

  const handleLogin = async (values: FormValues) => {
    const { email, password, stayLoggedIn } = values;
    try {
      const token = await login({
        email,
        password,
      }).unwrap();
      dispatch(setCredentials({ token, email }));
    } catch (error) {
      console.log("Form submission error", error);
      console.log("THERE HAS BEEN A LOGIN ERROR");
      // TODO: react redux login auth flow 30:01
      // TODO: add typing
      console.log(error);
      if (!error) {
        //setErrMsg('')
        console.log("No server response");
      } else if (error.status === 400) {
        console.log("Missing username or password");
      } else if (error.status === 401) {
        console.log("Unauthorised");
      } else {
        console.log("login failed");
      }
    }
  };

  const loginWithGoogle = () => console.log("login");

  return (
    <LoginPageContent
      handleLogin={handleLogin}
      loginWithGoogle={loginWithGoogle}
    />
  );
}

function LoginPageContent({
  handleLogin,
  loginWithGoogle,
}: {
  handleLogin: (values: FormValues) => void;
  loginWithGoogle: () => void;
}) {
  return (
    <div className="min-h-screen w-screen bg-[radial-gradient(rgba(53,87,129)_0%,rgba(28,65,72,1)_100%)]">
      <main className="flex flex-col h-screen space-y-10 pt-10 pb-4 px-4 md:px-10">
        <LogoLink />
        <div className="flex-grow flex flex-col lg:flex-row items-center lg:justify-center pt-20 lg:gap-20 space-y-10 lg:space-y-0">
          <Aside />
          <LoginForm handleLogin={handleLogin} />
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
      <h1 className="text-4xl font-bold text-white">Do money differently.</h1>
      <p className="text-white">
        Budgie aims to help thousands discover how to spend wisely, save
        confidently, and live joyfully through a straightforward set of
        transformative habits
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

function LoginForm({ handleLogin }: { handleLogin: (formValues) => void }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  return (
    <div className="w-full xs:max-w-[500px] py-8 px-6 space-y-0 rounded-lg bg-white">
      <div className="space-y-5">
        <h1 className="text-center text-4xl font-bold">Log In</h1>
        <p className="text-center">
          New to Budgie?
          <Link to="../signup" className={`ml-2 ${textBlue}`}>
            Sign up today.
          </Link>
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleLogin)}
          className="space-y-8 py-5"
        >
          <FormField
            control={form.control}
            name="email"
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

          <div className="flex justify-between items-center">
            <FormField
              control={form.control}
              name="stayLoggedIn"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 border-none">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Keep me logged in</FormLabel>

                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <Link to={"../forgotPassword"} className={`text-sm ${textBlue}`}>
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className={`${buttonBlue} w-full`}>
            Log In
          </Button>
        </form>
      </Form>
      <Separator />
      <SocialAuth />
    </div>
  );
}
