import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../hooks/reduxHooks";
import { selectCurrentToken } from "../../auth/authSlice";

const Auth = ({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => {
  // const token = useAppSelector(selectCurrentToken);
  const token = true;
  const location = useLocation();

  if (required) {
    return token ? (
      children
    ) : (
      <Navigate to="/" state={{ from: location }} replace />
    );
  }

  return token ? (
    <Navigate to="/budget" state={{ from: location }} replace />
  ) : (
    children
  );
};
export default Auth;
