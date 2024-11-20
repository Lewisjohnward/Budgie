import { Copyright } from "@/core/components";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageContent />;
}

function ForgotPasswordPageContent() {
  return (
    <div className="flex flex-col h-screen pb-4">
      <Header />
      <div className="flex flex-col justify-center items-center h-screen">
        <ForgotPasswordForm />
        {/* <ResetSuccess /> */}
      </div>
      <Copyright className="text-black" />
    </div>
  );
}

function Header() {
  return (
    <div className="px-4 py-2 shadow-lg">
      <Link to={"/"} className="hidden lg:block text-4xl font-bold">
        Budgie.
      </Link>
    </div>
  );
}

function ForgotPasswordForm() {
  return (
    <div className="bg-blue-300">
      <h1 className="text-2xl font-bold">Forgot your password?</h1>
    </div>
  );
}

function ResetSuccess() {
  return (
    <div>
      <div>hello</div>
    </div>
  );
}
