import { Textarea } from "@/core/components/uiLibrary/textarea";
import { ChevronDownIcon } from "lucide-react";
import { NotesState } from "../../hooks/useNotes";
import { useRef, useEffect } from "react";

export function Notes({ notes, ui }: NotesState) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [notes.text]);

  return (
    <div className="bg-white rounded-lg">
      <button
        className="flex w-full items-center justify-between px-3 py-2 border-b"
        onClick={ui.toggle}
        aria-expanded={ui.open}
      >
        <span className="flex items-center gap-2">
          <span className="text-sm font-bold">Notes</span>
          <ChevronDownIcon
            className={`transition-transform duration-100 ${
              ui.open ? "rotate-0" : "-rotate-90"
            }`}
          />
        </span>
      </button>
      {ui.open && (
        <Textarea
          ref={textareaRef}
          placeholder="Something to remember this month?"
          className="border-0 resize-none min-h-[100px]"
          value={notes.text}
          onChange={(e) => notes.setText(e.target.value)}
        />
      )}
    </div>
  );
}