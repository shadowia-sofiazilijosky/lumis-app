"use client";

import type { BookDetail } from "@lumis/shared-types";
import { useEffect, useState } from "react";
import { fetchBooks } from "../api/books-client";
import { BookGrid } from "./book-grid";
import { BookUploadForm } from "./book-upload-form";

export function LibraryView() {
  const [books, setBooks] = useState<BookDetail[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    let cancelled = false;

    fetchBooks()
      .then((data) => {
        if (cancelled) return;
        setBooks(data as BookDetail[]);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleUploaded(book: BookDetail) {
    setBooks((prev) => [book, ...prev]);
  }

  return (
    <>
      <BookUploadForm onUploaded={handleUploaded} />
      {status === "loading" && <p>Cargando…</p>}
      {status === "error" && <p>No pudimos cargar tu biblioteca.</p>}
      {status === "ready" && <BookGrid books={books} />}
    </>
  );
}
