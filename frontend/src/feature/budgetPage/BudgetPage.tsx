import { bannerColor } from "../../core/theme/colors";
export default function BudgetPage() {
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
