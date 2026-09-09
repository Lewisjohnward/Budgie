import { Textarea } from "@/core/components/uiLibrary/textarea";
import { ChevronDownIcon } from "lucide-react";
import { NoteViewModel } from "../../hooks/useNote";
import { useRef, useEffect } from "react";

type NoteProps = {
  noteViewModel: NoteViewModel;
};

export function Note({ noteViewModel: { note, ui } }: NoteProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [note.text]);

  return (
    <div className="bg-white rounded-lg">
      <button
        className="flex w-full items-center justify-between px-3 py-2 border-b"
        onClick={ui.toggle}
        aria-expanded={ui.value}
      >
        <span className="flex items-center gap-2">
          <span className="text-sm font-bold">Notes</span>
          <ChevronDownIcon
            className={`transition-transform duration-100 ${ui.value ? "rotate-0" : "-rotate-90"
              }`}
          />
        </span>
      </button>
      {ui.value && (
        <Textarea
          ref={textareaRef}
          aria-label="Monthly memo"
          placeholder="Something to remember this month?"
          className="border-0 resize-none min-h-[100px]"
          value={note.text}
          onChange={(e) => note.setText(e.target.value)}
        />
      )}
    </div>
  );
}
