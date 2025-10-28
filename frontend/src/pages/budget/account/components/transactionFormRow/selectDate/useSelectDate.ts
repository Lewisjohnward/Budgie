import { useRef } from "react";
import { usePopover } from "../selectCategory";
import { useState } from "react";

export const useSelectDate = () => {
  const popover = usePopover();
  const ref = useRef<HTMLInputElement>(null);
  const now = new Date();

  const [input, setInput] = useState(
    now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })
  );

  const focus = () => ref.current?.focus();

  const handleSelect = (val: string) => {
    setInput(val);
  };

  const handleBlur = () => {
    console.log("blur");
  };

  const reset = () => {
    setInput(
      now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
    );
  };

  return {
    input,
    reset,
    onSelect: handleSelect,
    setInput,
    onBlur: handleBlur,
    focus,
    ref,
    popover: {
      isOpen: popover.isOpen,
      open: popover.handleOpen,
      close: popover.handleClose,
    },
  };
};
