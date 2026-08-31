"use client";

import type { BookDetail } from "@lumis/shared-types";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useRef, useState, type FormEvent } from "react";
import { BookRequestError, uploadBook } from "../api/books-client";

interface BookUploadFormProps {
  onUploaded: (book: BookDetail) => void;
}

export function BookUploadForm({ onUploaded }: BookUploadFormProps) {
  const t = useTranslations("library.upload");
  const toggleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError(t("chooseFile"));
      return;
    }

    setError(null);
    setIsUploading(true);
    setProgress(0);

    try {
      const book = await uploadBook(
        file,
        { title: title.trim() || undefined, author: author.trim() || undefined },
        setProgress,
      );
      onUploaded(book);
      setTitle("");
      setAuthor("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(
        err instanceof BookRequestError ? err.message : t("genericError"),
      );
    } finally {
      setIsUploading(false);
      setProgress(null);
    }
  }

  return (
    <div className="book-upload-collapsible">
      {/* Mobile-only toggle (see globals.css) -- a real checkbox so the form
          can expand/collapse with pure CSS, no JS/resize listener needed to
          tell "small screen, start collapsed" apart from "large screen,
          always shown". Desktop hides this entirely and keeps the form
          always open, unchanged from before this existed. */}
      <input type="checkbox" id={toggleId} className="book-upload-toggle-checkbox" />
      <label htmlFor={toggleId} className="book-upload-toggle-label">
        <Plus size={16} />
        {t("addBookButton")}
      </label>

      <form className="book-upload-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="book-file">{t("fileLabel")}</label>
          <input
            id="book-file"
            type="file"
            ref={fileInputRef}
            accept=".pdf,.epub,.mobi,.cbr,.cbz,.txt"
            required
          />
        </div>

        <div>
          <label htmlFor="book-title-override">{t("titleLabel")}</label>
          <input
            id="book-title-override"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="book-author-override">{t("authorLabel")}</label>
          <input
            id="book-author-override"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
          />
        </div>

        {progress !== null && (
          <div
            className="upload-progress"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t("progressAria")}
          >
            <div className="upload-progress-bar" style={{ width: `${progress}%` }} />
            <span>{progress}%</span>
          </div>
        )}

        {error && (
          <p role="alert" aria-live="assertive">
            {error}
          </p>
        )}

        <button type="submit" disabled={isUploading}>
          {isUploading ? t("uploading") : t("submit")}
        </button>
      </form>
    </div>
  );
}
