import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const token = false;
  const location = useLocation();

  return token ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};
export default RequireAuth;
