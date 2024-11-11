/* existing imports */
import { RouterProvider } from "react-router-dom";
import { router } from "./core";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
