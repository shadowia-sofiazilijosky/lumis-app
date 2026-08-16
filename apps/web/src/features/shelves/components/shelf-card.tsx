import type { ShelfListItem } from "@lumis/shared-types";
import Link from "next/link";

export function ShelfCard({ shelf }: { shelf: ShelfListItem }) {
  return (
    <Link
      href={`/shelves/${shelf.id}`}
      className="shelf-card"
      style={{ backgroundColor: shelf.backgroundColor ?? undefined }}
    >
      <h3>{shelf.name}</h3>
      {shelf.genre && <p>{shelf.genre}</p>}
      <p>
        {shelf.bookCount} {shelf.bookCount === 1 ? "libro" : "libros"}
      </p>
    </Link>
  );
}
