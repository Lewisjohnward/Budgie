import { useAppDispatch } from "@/core/hooks/reduxHooks";
import { toggleManagePayees } from "@/core/slices/dialogSlice";
import { useMemo, useReducer, useRef, useState } from "react";
import { usePopover } from "../selectCategory";

// TODO:(lewis 2025-11-29 12:10) this needs to come from api
//// transferable accounts

// TODO:(lewis 2025-11-29 12:28)   // when choosing transfer category needs to be disabled

const accounts = [
  {
    name: "account1",
  },
  {
    name: "account2",
  },
];

//// payees

type Payee = {
  name: string;
};

const payees: Payee[] = [
  {
    name: "test",
  },
  {
    name: "test",
  },
  {
    name: "test",
  },
  {
    name: "test",
  },
  {
    name: "test",
  },
  {
    name: "test",
  },
  {
    name: "test",
  },
  {
    name: "test",
  },
  {
    name: "test1",
  },
  {
    name: "test43",
  },
  {
    name: "testba",
  },
  {
    name: "testb",
  },
];
// const payees: Payee[] = [
//   {
//     name: "test",
//   },
//   {
//     name: "test",
//   },
// ];

// only add a new payee if they don't exist when adding or editing a transaction

const initialState: State = { status: "idle" };

type State =
  | { status: "idle" }
  | { status: "filtering"; input: string }
  | { status: "exactMatch"; input: string }
  | { status: "noMatch"; input: string }
  | { status: "selected"; input: string };

type Action =
  | {
    type: "INPUT_CHANGED";
    input: string;
    hasExactMatch: boolean;
    hasResults: boolean;
  }
  | { type: "SELECT"; input: string }
  | { type: "RESET" };

function reducer(_state: State, action: Action): State {
  if (action.type === "INPUT_CHANGED") {
    if (action.hasExactMatch) {
      return { status: "exactMatch", input: action.input };
    }
    if (!action.hasResults) {
      return { status: "noMatch", input: action.input };
    }

    return { status: "filtering", input: action.input };
  }
  if (action.type === "RESET") {
    return { status: "idle" };
  }
  if (action.type === "SELECT") {
    return { status: "selected", input: action.input };
  }

  return { status: "idle" };
}

export const useSelectPayee = () => {
  const popover = usePopover();

  const ref = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();
  const [inputState, dispatchReducer] = useReducer(reducer, initialState);

  const value = inputState.status !== "idle" ? inputState.input : "";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      dispatchReducer({ type: "RESET" });
      return;
    }

    const hasExactMatch =
      payees.some((p) => p.name === value) ||
      accounts.some((a) => a.name === value);

    const hasResults =
      payees.some((p) => p.name.includes(value)) ||
      accounts.some((a) => a.name.includes(value));

    dispatchReducer({
      type: "INPUT_CHANGED",
      input: value,
      hasExactMatch,
      hasResults,
    });
  };

  const filteredPayees = useMemo(() => {
    if (inputState.status === "idle") return payees;
    return payees.filter((p) => p.name.includes(value));
  }, [value, inputState.status]);

  const filteredAccounts = useMemo(() => {
    if (inputState.status === "idle") return accounts;
    return accounts.filter((a) => a.name.includes(value));
  }, [value, inputState.status]);

  // TODO:(lewis 2025-12-03 12:18) when selecting account needs to say to/from acc
  // TODO:(lewis 2025-12-03 12:18) do i need a select action?
  // TODO:(lewis 2025-12-03 12:18) i think so, when selected state it displays all options and highlights selected
  const handleSelect = (item: {
    name: string;
    id: string;
    type: "payee" | "account";
  }) => {
    if (item.type === "account") {
      console.log("disable category");
    }
    dispatchReducer({
      type: "SELECT",
      input: item.name,
    });
    console.log("focus next input");
  };

  const handleOpenManagePayeesDialog = () => {
    dispatch(toggleManagePayees());
  };

  const focus = () => {
    ref.current?.focus();
  };

  return {
    input: {
      value,
      ref,
      onChange: handleInputChange,
      status: inputState.status,
      isIdle: inputState.status === "idle",
      isFiltering: inputState.status === "filtering",
      isNoMatch: inputState.status === "noMatch",
      isExactMatch: inputState.status === "exactMatch",
    },
    filteredPayees,
    filteredAccounts,
    select: handleSelect,
    openManagePayeesDialog: handleOpenManagePayeesDialog,
    focus,
    popover: {
      isOpen: popover.isOpen,
      open: popover.handleOpen,
      close: popover.handleClose,
    },
  };
};

export type SelectPayeeModel = ReturnType<typeof useSelectPayee>;
