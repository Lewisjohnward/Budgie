import { useDebouncedCallback } from "use-debounce";
import { useState } from "react";
import { useEffect } from "react";
import { NoteBranded } from "@/core/types/NormalizedData";
import { useUpdateNoteMutation } from "@/core/api/budget/notes/noteSnapshotSlice";

// Input
type UseNotesParams = {
  note: NoteBranded;
};

// Output
export type UseNotes = {
  text: string;
  setText: (text: string) => void;
};

export const useNotes = ({ note }: UseNotesParams): UseNotes => {
  const { month, content, id } = note;

  const [updateNote] = useUpdateNoteMutation();

  const [text, setText] = useState(content);

  // keep in sync when switching notes
  useEffect(() => {
    setText(content);
    // flush on note change to prevent losing data
    debouncedSave.flush?.();
  }, [id, content]);

  // debounced save function
  const debouncedSave = useDebouncedCallback(
    (nextText: string, noteId: string) => {
      updateNote({ month: month, id: noteId, content: nextText });
    },
    1000,
    { maxWait: 5000 }
  );

  const updateText = (value: string) => {
    setText(value);
    debouncedSave(value, id);
  };

  return {
    text,
    setText: updateText,
  };
};
