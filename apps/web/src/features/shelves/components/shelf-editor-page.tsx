"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAutosaveLayout } from "../hooks/use-autosave-layout";
import { useShelf } from "../hooks/use-shelf";
import { deleteShelf } from "../api/shelves-client";
import { useShelfEditorStore, type SaveStatus } from "../store/shelf-editor-store";
import { ShelfBookPicker } from "./shelf-book-picker";
import { ShelfCanvas } from "./shelf-canvas";
import { ShelfListView } from "./shelf-list-view";
import { ShelfSettingsPanel } from "./shelf-settings-panel";

const SAVE_STATUS_LABEL: Record<SaveStatus, string> = {
  idle: "",
  saving: "Guardando…",
  saved: "Guardado",
  error: "No se pudo guardar",
};

export function ShelfEditorPage({ shelfId }: { shelfId: string }) {
  const router = useRouter();
  const { shelf, status } = useShelf(shelfId);
  const saveStatus = useShelfEditorStore((state) => state.saveStatus);
  const [view, setView] = useState<"canvas" | "list">("canvas");

  useAutosaveLayout();

  async function handleDelete() {
    if (!shelf) return;
    const confirmed = window.confirm(
      `¿Borrar la estantería "${shelf.name}"? Los libros no se borran, solo se quitan de acá.`,
    );
    if (!confirmed) return;

    await deleteShelf(shelf.id);
    router.push("/shelves");
  }

  if (status === "loading") {
    return <p>Cargando estantería…</p>;
  }

  if (status === "error" || !shelf) {
    return <p>No pudimos cargar esta estantería.</p>;
  }

  return (
    <div className="shelf-editor-page">
      <header className="shelf-editor-header">
        <h1>{shelf.name}</h1>
        <span role="status" aria-live="polite" className="save-status">
          {SAVE_STATUS_LABEL[saveStatus]}
        </span>
        <button
          type="button"
          onClick={() => setView(view === "canvas" ? "list" : "canvas")}
        >
          {view === "canvas" ? "Ver como lista" : "Ver como estantería"}
        </button>
        <button type="button" onClick={handleDelete}>
          Borrar estantería
        </button>
      </header>

      <ShelfSettingsPanel shelf={shelf} />
      <ShelfBookPicker shelf={shelf} />

      {view === "canvas" ? (
        <ShelfCanvas shelf={shelf} />
      ) : (
        <ShelfListView shelf={shelf} />
      )}
    </div>
  );
}
