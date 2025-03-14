import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRefreshTokenMutation } from "@/core/api/authApiSlice";
import { useAppDispatch, useAppSelector } from "@/core/hooks/reduxHooks";
import { selectCurrentToken, setCredentials } from "@/core/auth/authSlice";
import { useLocation } from "react-router-dom";

export default function PersistLogin() {
  const [isLoading, setIsLoading] = useState(true);
  const token = useAppSelector(selectCurrentToken);
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

    setTimeout(() => {
      !token && persist ? verifyRefreshToken() : setIsLoading(false);
    }, 1000);

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
        <div className="h-screen bg-red-400">Loading...</div>
      ) : (
        <Outlet />
      )}
    </>
  );
}
