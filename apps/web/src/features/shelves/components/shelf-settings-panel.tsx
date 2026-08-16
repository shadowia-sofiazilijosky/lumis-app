"use client";

import type {
  ShelfArrangement,
  ShelfWithBooks,
  UpdateShelfInput,
} from "@lumis/shared-types";
import { useState, type FormEvent } from "react";
import { useDebouncedCallback } from "@/shared/hooks/use-debounced-callback";
import { updateShelf } from "../api/shelves-client";
import { useShelfEditorStore } from "../store/shelf-editor-store";

interface TextFieldPatch {
  name?: string;
  genre?: string;
  backgroundImageUrl?: string;
}

export function ShelfSettingsPanel({ shelf }: { shelf: ShelfWithBooks }) {
  const patchShelfMeta = useShelfEditorStore((state) => state.patchShelfMeta);

  const [name, setName] = useState(shelf.name);
  const [genre, setGenre] = useState(shelf.genre ?? "");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(
    shelf.backgroundImageUrl ?? "",
  );

  const saveTextFields = useDebouncedCallback((patch: TextFieldPatch) => {
    updateShelf(shelf.id, patch)
      .then(() => patchShelfMeta(patch))
      .catch(() => {
        // best-effort — the field keeps its typed value locally either way
      });
  }, 600);

  function saveImmediately(patch: UpdateShelfInput) {
    updateShelf(shelf.id, patch)
      .then((updated) => patchShelfMeta(updated))
      .catch(() => {});
  }

  return (
    <form
      className="shelf-settings-panel"
      onSubmit={(event: FormEvent) => event.preventDefault()}
    >
      <div>
        <label htmlFor="shelf-name">Nombre</label>
        <input
          id="shelf-name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            saveTextFields({ name: event.target.value });
          }}
        />
      </div>

      <div>
        <label htmlFor="shelf-genre">Género</label>
        <input
          id="shelf-genre"
          value={genre}
          onChange={(event) => {
            setGenre(event.target.value);
            saveTextFields({ genre: event.target.value });
          }}
        />
      </div>

      <div>
        <label htmlFor="shelf-arrangement">Modo de acomodo</label>
        <select
          id="shelf-arrangement"
          value={shelf.arrangement}
          onChange={(event) =>
            saveImmediately({
              arrangement: event.target.value as ShelfArrangement,
            })
          }
        >
          <option value="SPINE">Lomo</option>
          <option value="COVER">Portada de frente</option>
        </select>
      </div>

      <div>
        <label htmlFor="shelf-color">Color del mueble</label>
        <input
          id="shelf-color"
          type="color"
          value={shelf.shelfColor ?? "#8c2f39"}
          onChange={(event) => saveImmediately({ shelfColor: event.target.value })}
        />
      </div>

      <div>
        <label htmlFor="shelf-background-color">Color de fondo</label>
        <input
          id="shelf-background-color"
          type="color"
          value={shelf.backgroundColor ?? "#f7e6e6"}
          onChange={(event) =>
            saveImmediately({ backgroundColor: event.target.value })
          }
        />
      </div>

      <div>
        <label htmlFor="shelf-background-image">Imagen de fondo (URL)</label>
        <input
          id="shelf-background-image"
          value={backgroundImageUrl}
          placeholder="/backgrounds/madera.jpg"
          onChange={(event) => {
            setBackgroundImageUrl(event.target.value);
            saveTextFields({ backgroundImageUrl: event.target.value });
          }}
        />
      </div>
    </form>
  );
}
