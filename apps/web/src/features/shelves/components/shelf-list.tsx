"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import type { ShelfListItem } from "@lumis/shared-types";
import { createShelf, fetchShelves } from "../api/shelves-client";
import { ShelfCard } from "./shelf-card";

export function ShelfList() {
  const router = useRouter();
  const [shelves, setShelves] = useState<ShelfListItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [newShelfName, setNewShelfName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchShelves()
      .then((data) => {
        setShelves(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!newShelfName.trim()) return;

    setIsCreating(true);
    try {
      const shelf = await createShelf({ name: newShelfName.trim() });
      router.push(`/shelves/${shelf.id}`);
    } finally {
      setIsCreating(false);
    }
  }

  if (status === "loading") return <p>Cargando…</p>;
  if (status === "error") return <p>No pudimos cargar tus estanterías.</p>;

  return (
    <div>
      <form onSubmit={handleCreate}>
        <label htmlFor="new-shelf-name">Nueva estantería</label>
        <input
          id="new-shelf-name"
          value={newShelfName}
          onChange={(event) => setNewShelfName(event.target.value)}
          placeholder="Ej: Fantasía"
        />
        <button type="submit" disabled={isCreating}>
          {isCreating ? "Creando…" : "Crear"}
        </button>
      </form>

      {shelves.length === 0 ? (
        <p>Todavía no tenés estanterías.</p>
      ) : (
        <div className="shelf-grid">
          {shelves.map((shelf) => (
            <ShelfCard key={shelf.id} shelf={shelf} />
          ))}
        </div>
      )}
    </div>
  );
}
