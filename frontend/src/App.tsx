/* existing imports */
import { RouterProvider } from "react-router-dom";
import { router } from "./core";
import { Provider } from "react-redux";
import { store } from "./core/store/store";
import { Toaster } from "sonner";

export default function App() {
  return (
    <Provider store={store}>
      <Toaster position="top-center" richColors />
      <RouterProvider router={router} />
    </Provider>
  );
}
