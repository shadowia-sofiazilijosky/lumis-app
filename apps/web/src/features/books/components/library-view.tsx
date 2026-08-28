"use client";

import type { BookDetail, BookSummary } from "@lumis/shared-types";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { fetchBooks, reorderBooks } from "../api/books-client";
import { BookGrid } from "./book-grid";
import { BookUploadForm } from "./book-upload-form";

export function LibraryView() {
  const t = useTranslations("library");
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

  function handleReorder(nextBooks: BookSummary[]) {
    setBooks(nextBooks as BookDetail[]);
    reorderBooks(nextBooks.map((book) => book.id)).catch(() => {
      // best-effort — the grid keeps the reordered state locally either way
    });
  }

  return (
    <>
      <BookUploadForm onUploaded={handleUploaded} />
      {status === "loading" && <p>{t("loading")}</p>}
      {status === "error" && <p>{t("loadError")}</p>}
      {status === "ready" && (
        <BookGrid books={books} onReorder={handleReorder} />
      )}
    </>
  );
}
