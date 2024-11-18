import { useNavigate } from "react-router-dom";
import { login, selectCurrentToken } from "../../core/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../../core/hooks/reduxHooks";
import { useEffect } from "react";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = useAppSelector(selectCurrentToken);

  useEffect(() => {
    if (token) {
      navigate("/budget", { replace: true });
    }
  }, []);

  const testLogin = () => {
    dispatch(login());
    navigate("/budget");
  };

  const loginWithGoogle = () => console.log("login");

  return (
    <LoginPageContent login={testLogin} loginWithGoogle={loginWithGoogle} />
  );
}

function LoginPageContent({
  login,
  loginWithGoogle,
}: {
  login: () => void;
  loginWithGoogle: () => void;
}) {
  return (
    <div className="h-screen w-screen p-10 bg-[radial-gradient(rgba(53,87,129)_0%,rgba(28,65,72,1)_100%)]">
      <h1 className="text-2xl text-white font-bold">Budgie.</h1>
      <p>
        Budgie aims to help thousands discover how to spend wisely, save
        confidently, and live joyfully through a straightforward set of
        transformative habits
      </p>
      <button className="bg-red-200 p-4 rounded-sm" onClick={login}>
        login
      </button>
      <button className="bg-red-200 p-4 rounded-sm" onClick={loginWithGoogle}>
        login with google
      </button>
    </div>
  );
}
