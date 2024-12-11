import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { RootState } from "../store/store";
import {
  selectCurrentToken,
  selectCurrentUser,
  setCredentials,
} from "./authSlice";
import configureStore from "redux-mock-store";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import Navbar from "@/pages/budget/navBar/NavBar";

import { it, expect, describe } from "vitest";

const mockStore = configureStore();

describe("mySlice reducer", () => {
  it("first test", () => {
    expect(2).toEqual(2);
  });

  it("authSlice selectors", () => {
    // const token = useAppSelector(selectCurrentToken);

    // expect(token).toBeNull();
    // expect(selectCurrentToken()).toBeNull();

    const state: RootState = {
      auth: {
        token: null,
        email: null,
      },
    };
    const token = selectCurrentToken(state);
    const user = selectCurrentUser(state);
    expect(token).toBeNull();
    expect(user).toBeNull();
  });

  // it("test", () => {
  //   render(<Navbar />)
  // })

  // it("Test reducers and actions", () => {
  //   render(<Navbar />)
  //
  //
  //   // const payload = { email: "test@test.com", token: "testToken" };
  //   // const dispatch = useAppDispatch();
  //   // console.log(dispatch(setCredentials(payload)));
  // });

  // it("test", () => {
  //   const store = mockStore({
  //     auth: { token: null, email: null },
  //   });
  //
  //   const TestComponent = () => {
  //     const token = useAppSelector(selectCurrentToken)
  //     return <div>{token}</div>
  //   }
  //
  //   render(
  //     <Provider store={store}>
  //      <TestComponent />
  //     </Provider>
  //   )
  //
  //
  // });

  // it("should handle initial state", () => {
  //   const initialState = mySlice.getInitialState();
  //   expect(mySlice.reducer(undefined, { type: "unknown" })).toEqual(
  //     initialState,
  //   );
  // });

  // it("should handle a specific action", () => {
  //   const initialState = { value: 0 };
  //   const expectedState = { value: 1 };
  //
  //   const result = mySlice.reducer(initialState, mySlice.actions.increment());
  //   expect(result).toEqual(expectedState);
  // });
});
