"use client";

import { ReadingStatus } from "@lumis/shared-types";
import { useEffect, useRef, useState } from "react";
import { READING_STATUS_LABELS, fetchReview, saveReview } from "../api/reviews-client";
import { RatingPicker } from "./rating-picker";
import { RichTextEditor } from "./rich-text-editor";

const STATUS_ORDER: ReadingStatus[] = [
  ReadingStatus.TBR,
  ReadingStatus.READING,
  ReadingStatus.PAUSED,
  ReadingStatus.FINISHED,
  ReadingStatus.REREAD,
  ReadingStatus.ABANDONED,
];

const AUTOSAVE_DELAY_MS = 1000;

/** Converts an ISO datetime string to the yyyy-mm-dd an <input type="date"> expects. */
function toDateInputValue(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

export function ReviewEditor({ bookId }: { bookId: string }) {
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<ReadingStatus>(ReadingStatus.TBR);
  const [rating, setRating] = useState<number | null>(null);
  const [spicyRating, setSpicyRating] = useState<number | null>(null);
  const [romanceRating, setRomanceRating] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState("");
  const [finishedAt, setFinishedAt] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const hasUnsavedChanges = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchReview(bookId).then((review) => {
      if (cancelled) return;
      if (review) {
        setStatus(review.status);
        setRating(review.rating);
        setSpicyRating(review.spicyRating);
        setRomanceRating(review.romanceRating);
        setStartedAt(toDateInputValue(review.startedAt));
        setFinishedAt(toDateInputValue(review.finishedAt));
        setBodyHtml(review.bodyRichText?.html ?? "");
      }
      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [bookId]);

  useEffect(() => {
    if (!loaded || !hasUnsavedChanges.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setSaveState("saving");
    timeoutRef.current = setTimeout(() => {
      saveReview(bookId, {
        status,
        ...(rating !== null && { rating }),
        ...(spicyRating !== null && { spicyRating }),
        ...(romanceRating !== null && { romanceRating }),
        ...(startedAt && { startedAt: new Date(startedAt).toISOString() }),
        ...(finishedAt && { finishedAt: new Date(finishedAt).toISOString() }),
        bodyRichText: { html: bodyHtml },
      }).then(() => {
        hasUnsavedChanges.current = false;
        setSaveState("saved");
      });
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [loaded, bookId, status, rating, spicyRating, romanceRating, startedAt, finishedAt, bodyHtml]);

  function markDirty<T>(setter: (value: T) => void) {
    return (value: T) => {
      hasUnsavedChanges.current = true;
      setter(value);
    };
  }

  if (!loaded) {
    return <p>Cargando reseña…</p>;
  }

  return (
    <section className="review-editor">
      <div className="review-editor-header">
        <h2>Mi reseña</h2>
        {saveState === "saving" && <span className="save-status">Guardando…</span>}
        {saveState === "saved" && <span className="save-status">Guardado</span>}
      </div>

      <div className="review-editor-row">
        <label>
          Estado
          <select
            value={status}
            onChange={(event) =>
              markDirty(setStatus)(event.target.value as ReadingStatus)
            }
          >
            {STATUS_ORDER.map((option) => (
              <option key={option} value={option}>
                {READING_STATUS_LABELS[option]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Empecé el
          <input
            type="date"
            value={startedAt}
            onChange={(event) => markDirty(setStartedAt)(event.target.value)}
          />
        </label>

        <label>
          Terminé el
          <input
            type="date"
            value={finishedAt}
            onChange={(event) => markDirty(setFinishedAt)(event.target.value)}
          />
        </label>
      </div>

      <div className="review-editor-ratings">
        <RatingPicker
          label="Calificación"
          icon="⭐"
          value={rating}
          onChange={markDirty(setRating)}
        />
        <RatingPicker
          label="Spicy"
          icon="🌶️"
          value={spicyRating}
          onChange={markDirty(setSpicyRating)}
        />
        <RatingPicker
          label="Romance"
          icon="❤️"
          value={romanceRating}
          onChange={markDirty(setRomanceRating)}
        />
      </div>

      <RichTextEditor
        initialHtml={bodyHtml}
        onChange={markDirty(setBodyHtml)}
      />
    </section>
  );
}
