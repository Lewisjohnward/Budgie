import { useLocation } from "react-router-dom";

export const useIsRoute = () => {
  const location = useLocation();

  const isRoute = (path: string) => location.pathname.startsWith(path);

  return isRoute;
};
