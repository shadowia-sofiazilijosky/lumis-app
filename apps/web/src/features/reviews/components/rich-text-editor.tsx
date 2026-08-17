"use client";

import { useEffect, useRef } from "react";

interface RichTextEditorProps {
  initialHtml: string;
  onChange: (html: string) => void;
}

/**
 * Minimal contentEditable-based rich text editor (bold/italic/list) — no
 * editor library dependency for a single free-text review field. Uncontrolled
 * by design: `initialHtml` seeds it once on mount, `onChange` reports edits
 * as they happen. `document.execCommand` is deprecated but still broadly
 * supported for exactly this kind of basic inline formatting.
 */
export function RichTextEditor({ initialHtml, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current || !editorRef.current) return;
    didInit.current = true;
    editorRef.current.innerHTML = initialHtml;
  }, [initialHtml]);

  function exec(command: string) {
    document.execCommand(command);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML ?? "");
  }

  return (
    <div className="rich-text-editor">
      <div className="rich-text-toolbar">
        <button type="button" onClick={() => exec("bold")} aria-label="Negrita">
          <strong>N</strong>
        </button>
        <button type="button" onClick={() => exec("italic")} aria-label="Cursiva">
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => exec("insertUnorderedList")}
          aria-label="Lista"
        >
          •—
        </button>
      </div>
      <div
        ref={editorRef}
        className="rich-text-content"
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML ?? "")}
        data-placeholder="Escribí tu reseña…"
      />
    </div>
  );
}
