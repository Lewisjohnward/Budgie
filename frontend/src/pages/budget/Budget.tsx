import { useNavigate } from "react-router-dom";
import { logOut } from "../../core/auth/authSlice";
import { useAppDispatch } from "../../core/hooks/reduxHooks";
import { bannerColor } from "../../core/theme/colors";

export default function BudgetPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const logout = () => {
    dispatch(logOut());
    navigate("/login", { replace: true });
  };

  return (
    <>
      <BudgetContent />
    </>
  );
}

function BudgetContent() {
  return (
    <>
      <div className={`h-screen w-56 ${bannerColor}`}></div>
      <h1>Budget page</h1>
    </>
  );
}
