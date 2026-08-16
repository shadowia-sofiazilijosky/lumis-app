"use client";

import type { BookSummary, ShelfWithBooks } from "@lumis/shared-types";
import { useEffect, useMemo, useState } from "react";
import { fetchBooks } from "@/features/books/api/books-client";
import { addBookToShelf } from "../api/shelves-client";
import { DEFAULT_BOOK_POSITION } from "../lib/canvas";
import { useShelfEditorStore } from "../store/shelf-editor-store";

export function ShelfBookPicker({ shelf }: { shelf: ShelfWithBooks }) {
  const addBookLocally = useShelfEditorStore((state) => state.addBookLocally);
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetchBooks().then(setBooks);
  }, [isOpen]);

  const shelfBookIds = useMemo(
    () => new Set(shelf.books.map((entry) => entry.bookId)),
    [shelf.books],
  );

  const availableBooks = books.filter(
    (book) =>
      !shelfBookIds.has(book.id) &&
      book.title.toLowerCase().includes(query.toLowerCase()),
  );

  async function handleAdd(book: BookSummary) {
    await addBookToShelf(shelf.id, {
      bookId: book.id,
      position: DEFAULT_BOOK_POSITION,
    });
    addBookLocally({
      bookId: book.id,
      position: DEFAULT_BOOK_POSITION,
      addedAt: new Date().toISOString(),
      book,
    });
  }

  if (!isOpen) {
    return (
      <button type="button" onClick={() => setIsOpen(true)}>
        + Agregar libro
      </button>
    );
  }

  return (
    <div className="shelf-book-picker">
      <label htmlFor="book-picker-search">Buscar en tu biblioteca</label>
      <input
        id="book-picker-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Título…"
      />
      <ul>
        {availableBooks.map((book) => (
          <li key={book.id}>
            <span>{book.title}</span>
            <button type="button" onClick={() => handleAdd(book)}>
              Agregar
            </button>
          </li>
        ))}
        {availableBooks.length === 0 && <li>No hay libros para agregar.</li>}
      </ul>
      <button type="button" onClick={() => setIsOpen(false)}>
        Cerrar
      </button>
    </div>
  );
}
