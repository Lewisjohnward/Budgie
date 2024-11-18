/* existing imports */
import { RouterProvider } from "react-router-dom";
import { router } from "./core";
import { Provider } from "react-redux";
import { store } from "./core/store/store";

export default function App() {
  return (
    <>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </>
  );
}
