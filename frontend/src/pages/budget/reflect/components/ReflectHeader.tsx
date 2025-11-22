import { NavLink } from "react-router-dom";

const getNavLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `py-4 text-lg font-[500] ${isActive ? "border-b-4 border-b-sky-700" : "text-gray-700"}`;

export function ReflectHeader() {
  return (
    <div className="flex gap-6 px-4 bg-white">
      <NavLink to="spending-breakdown" className={getNavLinkClassName}>
        Spending Breakdown
      </NavLink>
      <NavLink to="spending-trends" className={getNavLinkClassName}>
        Spending Trends
      </NavLink>
    </div>
  );
}
