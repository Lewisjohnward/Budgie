import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../hooks/reduxHooks";
import { selectAccessToken } from "../../slices/authSlice";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const accessToken = useAppSelector(selectAccessToken);
  const location = useLocation();

  return accessToken ? (
    children
  ) : (
    <Navigate to="/" state={{ from: location }} replace />
  );
}
