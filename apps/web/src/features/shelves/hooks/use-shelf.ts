"use client";

import { useEffect, useState } from "react";
import { fetchShelf } from "../api/shelves-client";
import { useShelfEditorStore } from "../store/shelf-editor-store";

export function useShelf(shelfId: string) {
  const loadShelf = useShelfEditorStore((state) => state.loadShelf);
  const shelf = useShelfEditorStore((state) => state.shelf);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    let cancelled = false;

    fetchShelf(shelfId)
      .then((data) => {
        if (cancelled) return;
        loadShelf(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [shelfId, loadShelf]);

  return { shelf, status };
}
