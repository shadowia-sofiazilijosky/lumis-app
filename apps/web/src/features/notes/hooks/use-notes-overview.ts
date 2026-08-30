"use client";

import type { NotesOverview } from "@lumis/shared-types";
import { useEffect, useState } from "react";
import { fetchNotesOverview } from "../api/notes-overview-client";

/** Loads every note/highlight the user has, grouped by book -- refetched
 * fresh on every mount, so counts/relative-time labels are always computed
 * from the real current state, never a stale or hardcoded snapshot. */
export function useNotesOverview() {
  const [overview, setOverview] = useState<NotesOverview | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetchNotesOverview()
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setOverview(data);
          setStatus("ready");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { overview, status };
}
