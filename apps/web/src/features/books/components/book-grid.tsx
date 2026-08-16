import type { BookSummary } from "@lumis/shared-types";
import { BookCard } from "./book-card";

export function BookGrid({ books }: { books: BookSummary[] }) {
  if (books.length === 0) {
    return <p>Todavía no subiste ningún libro.</p>;
  }

  return (
    <div className="book-grid">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
