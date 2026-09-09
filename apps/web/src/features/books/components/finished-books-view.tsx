"use client";

import type { BookSummary } from "@lumis/shared-types";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { fetchFinishedBooks } from "../api/books-client";
import { BookCard } from "./book-card";

export function FinishedBooksView() {
  const t = useTranslations("finishedBooks");
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    let cancelled = false;

    fetchFinishedBooks()
      .then((data) => {
        if (cancelled) return;
        setBooks(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") return <p>{t("loading")}</p>;
  if (status === "error") return <p>{t("loadError")}</p>;
  if (books.length === 0) return <p>{t("empty")}</p>;

  return (
    <div className="book-grid">
      {books.map((book) => (
        <div key={book.id} className="book-grid-item">
          <BookCard book={book} />
        </div>
      ))}
    </div>
  );
}
