import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRefreshTokenMutation } from "@/core/api/authApiSlice";
import { useAppDispatch, useAppSelector } from "@/core/hooks/reduxHooks";
import { selectAccessToken, setCredentials } from "@/core/slices/authSlice";
import { useLocation } from "react-router-dom";

export default function PersistLogin() {
  const [isLoading, setIsLoading] = useState(true);
  const token = useAppSelector(selectAccessToken);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const pathname = location.pathname;

  const [refreshToken] = useRefreshTokenMutation();

  const persist = true;

  const refresh = async () => {
    const result = await refreshToken().unwrap();
    return result;
  };

  useEffect(() => {
    let isMounted = true;

    const verifyRefreshToken = async () => {
      try {
        const response = await refresh();
        dispatch(setCredentials(response));
      } catch (err) {
      } finally {
        isMounted && setIsLoading(false);
      }
    };

    if (!token && persist) {
      verifyRefreshToken();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const isOnBudgetPage =
    pathname.startsWith("/budget") || pathname.startsWith("/user");

  return (
    <>
      {!persist ? (
        <Outlet />
      ) : isLoading && isOnBudgetPage ? (
        <>
          <AuthLoading />
        </>
      ) : (
        <Outlet />
      )}
    </>
  );
}

function AuthLoading() {
  return (
    <div className="flex min-h-screen min-w-96 bg-[radial-gradient(rgba(53,87,129)_0%,rgba(28,65,72,1)_100%)]">
      <div className="text-2xl font-bold text-gray-800">Budgie.</div>
    </div>
  );
}
