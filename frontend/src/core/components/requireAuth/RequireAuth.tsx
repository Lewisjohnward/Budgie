import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../hooks/reduxHooks";
import { selectCurrentToken } from "../../auth/authSlice";

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const token = useAppSelector(selectCurrentToken);
  const location = useLocation();

  return token ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};
export default RequireAuth;
