"use client";

import type { BookDetail } from "@lumis/shared-types";
import { useRef, useState, type FormEvent } from "react";
import { BookRequestError, uploadBook } from "../api/books-client";

interface BookUploadFormProps {
  onUploaded: (book: BookDetail) => void;
}

export function BookUploadForm({ onUploaded }: BookUploadFormProps) {
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
      setError("Elegí un archivo para subir.");
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
        err instanceof BookRequestError
          ? err.message
          : "No pudimos subir el libro.",
      );
    } finally {
      setIsUploading(false);
      setProgress(null);
    }
  }

  return (
    <form className="book-upload-form" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="book-file">Archivo (PDF, EPUB, MOBI, CBR, CBZ, TXT)</label>
        <input
          id="book-file"
          type="file"
          ref={fileInputRef}
          accept=".pdf,.epub,.mobi,.cbr,.cbz,.txt"
          required
        />
      </div>

      <div>
        <label htmlFor="book-title-override">Título (opcional)</label>
        <input
          id="book-title-override"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="book-author-override">Autor (opcional)</label>
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
          aria-label="Progreso de subida"
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
        {isUploading ? "Subiendo…" : "Subir libro"}
      </button>
    </form>
  );
}
