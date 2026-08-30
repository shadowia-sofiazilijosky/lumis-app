"use client";

import type { NotesOverview } from "@lumis/shared-types";
import { useCallback, useEffect, useState } from "react";
import { fetchNotesOverview } from "../api/notes-overview-client";

/** Loads every note/highlight the user has, grouped by book -- refetched
 * fresh on every mount, so counts/relative-time labels are always computed
 * from the real current state, never a stale or hardcoded snapshot.
 * `refetch` re-pulls the same way after a mutation (pinning an item) --
 * simplest way to keep every derived count/order consistent at this
 * dataset's scale, no separate optimistic-update reducer needed. */
export function useNotesOverview() {
  const [overview, setOverview] = useState<NotesOverview | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  const load = useCallback(async () => {
    setStatus("loading");
    const data = await fetchNotesOverview();
    if (data) {
      setOverview(data);
      setStatus("ready");
    } else {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

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

  return { overview, status, refetch: load };
}
