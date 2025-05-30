import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../hooks/reduxHooks";
import { selectAccessToken } from "../../slices/authSlice";

export default function RedirectIfAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAppSelector(selectAccessToken);
  const location = useLocation();

  return token ? (
    <Navigate to="/budget/allocation" state={{ from: location }} replace />
  ) : (
    children
  );
}
