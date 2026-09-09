import { useDebouncedCallback } from "use-debounce";
import { useEffect, useState } from "react";
import { NoteBranded } from "@/core/types/NormalizedData";
import { useUpdateNoteMutation } from "@/core/api/budget/notes/noteSnapshotSlice";
import { useToggle } from "./useToggle";
import { MonthKey, NoteId } from "../../../types/types";

type NoteParams = {
  note: NoteBranded;
};

export type NoteViewModel = {
  ui: {
    value: boolean;
    toggle: () => void;
  };
  note: {
    text: string;
    setText: (text: string) => void;
  };
};

export const useNoteViewModel = ({ note }: NoteParams): NoteViewModel => {
  const notesUi = useToggle();
  const { month, content, id } = note;

  const [updateNote] = useUpdateNoteMutation();
  const [text, setText] = useState(content);

  const debouncedSave = useDebouncedCallback(
    (nextText: string, noteId: NoteId, noteMonth: MonthKey) => {
      updateNote({
        month: noteMonth,
        id: noteId,
        content: nextText,
      });
    },
    100,
    { maxWait: 500 }
  );

  useEffect(() => {
    setText(content);
  }, [id, content]);

  useEffect(() => {
    return () => {
      debouncedSave.flush();
    };
  }, [debouncedSave]);

  const updateText = (value: string) => {
    setText(value);

    debouncedSave(value, id, month);
  };

  return {
    ui: notesUi,
    note: {
      text,
      setText: updateText,
    },
  };
};
