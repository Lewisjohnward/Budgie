import { useDebounce } from "use-debounce";
import { useState } from "react";
import { useToggle } from "./useToggle";
import { useEffect } from "react";

export const useNotes = () => {
  const initialNote = "";

  const [text, setText] = useState(initialNote);
  const [debouncedText] = useDebounce(text, 1000);
  const { value: open, toggle } = useToggle();

  useEffect(() => {
    if (debouncedText !== initialNote) {
      // todo: call api with debounced text
      console.log("sending to api", debouncedText);
    }
  }, [debouncedText]);

  return {
    notes: {
      setText,
      text,
    },
    ui: {
      open,
      toggle,
    },
  };
};

export type NotesState = ReturnType<typeof useNotes>;
