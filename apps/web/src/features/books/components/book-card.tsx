import type { BookSummary } from "@lumis/shared-types";
import Link from "next/link";

export function BookCard({ book }: { book: BookSummary }) {
  return (
    <Link href={`/library/${book.id}`} className="book-card">
      <div className="book-card-cover">
        {book.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- signed, short-lived Supabase URL
          <img src={book.coverUrl} alt="" />
        ) : (
          <span className="book-card-format-badge">{book.format}</span>
        )}
      </div>
      <h3>{book.title}</h3>
      {book.author && <p>{book.author}</p>}
    </Link>
  );
}
