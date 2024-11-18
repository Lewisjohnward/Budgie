import { useNavigate } from "react-router-dom";
import { selectCurrentToken, setCredentials } from "../../core/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../../core/hooks/reduxHooks";
import { useEffect } from "react";
import { useLoginMutation } from "../../core/api/authApiSlice";

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

  const testLogin = async () => {
    try {
      const user = "john";
      const userData = await login({
        username: user,
        password: "password",
      }).unwrap();
      dispatch(setCredentials({ ...userData, user }));
      navigate("/budget");
    } catch (error) {
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
