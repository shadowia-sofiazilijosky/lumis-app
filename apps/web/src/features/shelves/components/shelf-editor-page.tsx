"use client";

import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAutosaveLayout } from "../hooks/use-autosave-layout";
import { useShelf } from "../hooks/use-shelf";
import { deleteShelf } from "../api/shelves-client";
import { useShelfEditorStore, type SaveStatus } from "../store/shelf-editor-store";
import { ShelfBookPicker } from "./shelf-book-picker";
import { ShelfCanvas } from "./shelf-canvas";
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
  const exitEditMode = useShelfEditorStore((state) => state.exitEditMode);

  const { saveNow } = useAutosaveLayout();

  function handleSaveClick() {
    saveNow();
    // Locks the arrangement immediately (optimistic) — the local state is
    // already what's being sent, so there's no need to wait on the network
    // round-trip before hiding the resize handles/lock-delete toolbar.
    exitEditMode();
  }

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
        <div className="shelf-editor-header-title">
          <Link href="/shelves" className="shelf-editor-back" aria-label="Volver a estanterías">
            <ArrowLeft size={20} />
          </Link>
          <h1>Estantería: {shelf.name}</h1>
        </div>
        <div className="shelf-editor-header-actions">
          <span role="status" aria-live="polite" className="save-status">
            {SAVE_STATUS_LABEL[saveStatus]}
          </span>
          <button type="button" className="shelf-editor-save-button" onClick={handleSaveClick}>
            <Save size={16} />
            Guardar cambios
          </button>
          <button type="button" className="danger" onClick={handleDelete}>
            Borrar estantería
          </button>
        </div>
      </header>

      <ShelfSettingsPanel shelf={shelf} />
      <ShelfBookPicker shelf={shelf} />

      <ShelfCanvas shelf={shelf} />
    </div>
  );
}
