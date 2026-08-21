"use client";

import { BookFormat, type BookDetail } from "@lumis/shared-types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ReviewEditor } from "@/features/reviews/components/review-editor";
import { deleteBook, fetchBookDetail } from "../api/books-client";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function BookDetailView({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchBookDetail(bookId)
      .then((data) => {
        if (cancelled) return;
        setBook(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [bookId]);

  async function handleDelete() {
    if (!book) return;
    const confirmed = window.confirm(
      `¿Borrar "${book.title}"? Esto también lo quita de cualquier estantería.`,
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteBook(book.id);
      router.push("/library");
    } finally {
      setIsDeleting(false);
    }
  }

  if (status === "loading") {
    return <p>Cargando…</p>;
  }

  if (status === "error" || !book) {
    return <p>No pudimos cargar este libro.</p>;
  }

  return (
    <>
      <article className="book-detail">
        <div className="book-detail-cover">
          {book.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- signed, short-lived Supabase URL
            <img src={book.coverUrl} alt="" />
          ) : (
            <span className="book-card-format-badge">{book.format}</span>
          )}
        </div>

        <div className="book-detail-info">
          <h1>{book.title}</h1>
          {book.author && <p className="book-detail-author">{book.author}</p>}

          <dl>
            <dt>Formato</dt>
            <dd>{book.format}</dd>
            {book.pageCount !== null && (
              <>
                <dt>Páginas</dt>
                <dd>{book.pageCount}</dd>
              </>
            )}
            {book.fileSizeBytes !== null && (
              <>
                <dt>Tamaño</dt>
                <dd>{formatFileSize(book.fileSizeBytes)}</dd>
              </>
            )}
          </dl>

          {book.fileUrl && (
            <a href={book.fileUrl} target="_blank" rel="noreferrer">
              Descargar original
            </a>
          )}

          <div className="book-detail-actions">
            {book.format !== BookFormat.MOBI && (
              <Link href={`/read/${book.id}`}>Leer</Link>
            )}
            <button
              type="button"
              className="danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Borrando…" : "Borrar libro"}
            </button>
          </div>
        </div>
      </article>

      <ReviewEditor bookId={book.id} />
    </>
  );
}
