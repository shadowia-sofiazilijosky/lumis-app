"use client";

import { ReadingStatus, RecommendLevel } from "@lumis/shared-types";
import { BookOpen, Droplets, Heart, Laugh, Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { READING_STATUS_LABELS, fetchReview, saveReview } from "../api/reviews-client";
import { ChiliPepperIcon, CrystalBallIcon } from "./rating-icons";
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

const RECOMMEND_OPTIONS: { value: RecommendLevel; label: string }[] = [
  { value: RecommendLevel.YES, label: "Sí" },
  { value: RecommendLevel.MAYBE, label: "Tal vez" },
  { value: RecommendLevel.NO, label: "No" },
];

const AUTOSAVE_DELAY_MS = 1000;

/** Converts an ISO datetime string to the yyyy-mm-dd an <input type="date"> expects. */
function toDateInputValue(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

function daysBetween(start: string, end: string): number | null {
  if (!start || !end) return null;
  const days = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24),
  );
  return days >= 0 ? days : null;
}

export function ReviewEditor({ bookId }: { bookId: string }) {
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<ReadingStatus>(ReadingStatus.TBR);
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [spicyRating, setSpicyRating] = useState<number | null>(null);
  const [romanceRating, setRomanceRating] = useState<number | null>(null);
  const [plotRating, setPlotRating] = useState<number | null>(null);
  const [sadnessRating, setSadnessRating] = useState<number | null>(null);
  const [humorRating, setHumorRating] = useState<number | null>(null);
  const [mysteryRating, setMysteryRating] = useState<number | null>(null);
  const [favoriteCharacter, setFavoriteCharacter] = useState("");
  const [leastFavoriteCharacter, setLeastFavoriteCharacter] = useState("");
  const [favoriteQuote, setFavoriteQuote] = useState("");
  const [cried, setCried] = useState<boolean | null>(null);
  const [recommend, setRecommend] = useState<RecommendLevel | null>(null);
  const [bookNumberOfYear, setBookNumberOfYear] = useState("");
  const [mood, setMood] = useState("");
  const [notes, setNotes] = useState("");
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
        setGenre(review.genre ?? "");
        setRating(review.rating);
        setSpicyRating(review.spicyRating);
        setRomanceRating(review.romanceRating);
        setPlotRating(review.plotRating);
        setSadnessRating(review.sadnessRating);
        setHumorRating(review.humorRating);
        setMysteryRating(review.mysteryRating);
        setFavoriteCharacter(review.favoriteCharacter ?? "");
        setLeastFavoriteCharacter(review.leastFavoriteCharacter ?? "");
        setFavoriteQuote(review.favoriteQuote ?? "");
        setCried(review.cried);
        setRecommend(review.recommend);
        setBookNumberOfYear(review.bookNumberOfYear?.toString() ?? "");
        setMood(review.mood ?? "");
        setNotes(review.notes ?? "");
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
      const parsedBookNumber = parseInt(bookNumberOfYear, 10);

      saveReview(bookId, {
        status,
        genre,
        ...(rating !== null && { rating }),
        ...(spicyRating !== null && { spicyRating }),
        ...(romanceRating !== null && { romanceRating }),
        ...(plotRating !== null && { plotRating }),
        ...(sadnessRating !== null && { sadnessRating }),
        ...(humorRating !== null && { humorRating }),
        ...(mysteryRating !== null && { mysteryRating }),
        favoriteCharacter,
        leastFavoriteCharacter,
        favoriteQuote,
        ...(cried !== null && { cried }),
        ...(recommend !== null && { recommend }),
        ...(!Number.isNaN(parsedBookNumber) && { bookNumberOfYear: parsedBookNumber }),
        mood,
        notes,
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
  }, [
    loaded,
    bookId,
    status,
    genre,
    rating,
    spicyRating,
    romanceRating,
    plotRating,
    sadnessRating,
    humorRating,
    mysteryRating,
    favoriteCharacter,
    leastFavoriteCharacter,
    favoriteQuote,
    cried,
    recommend,
    bookNumberOfYear,
    mood,
    notes,
    startedAt,
    finishedAt,
    bodyHtml,
  ]);

  function markDirty<T>(setter: (value: T) => void) {
    return (value: T) => {
      hasUnsavedChanges.current = true;
      setter(value);
    };
  }

  const readingDays = useMemo(() => daysBetween(startedAt, finishedAt), [startedAt, finishedAt]);

  if (!loaded) {
    return <p>Cargando ficha…</p>;
  }

  return (
    <section className="ficha-lectura">
      <span className="ficha-corner ficha-corner-tl" aria-hidden="true" />
      <span className="ficha-corner ficha-corner-tr" aria-hidden="true" />
      <span className="ficha-corner ficha-corner-bl" aria-hidden="true" />
      <span className="ficha-corner ficha-corner-br" aria-hidden="true" />

      <div className="ficha-lectura-header">
        <h2>Ficha de lectura</h2>
        {saveState === "saving" && <span className="save-status">Guardando…</span>}
        {saveState === "saved" && <span className="save-status">Guardado</span>}
      </div>

      <div className="ficha-section">
        <div className="ficha-field-row">
          <label className="ficha-field">
            Estado
            <select
              value={status}
              onChange={(event) => markDirty(setStatus)(event.target.value as ReadingStatus)}
            >
              {STATUS_ORDER.map((option) => (
                <option key={option} value={option}>
                  {READING_STATUS_LABELS[option]}
                </option>
              ))}
            </select>
          </label>

          <label className="ficha-field">
            Género
            <input
              type="text"
              placeholder="Fantasía, romance…"
              value={genre}
              onChange={(event) => markDirty(setGenre)(event.target.value)}
            />
          </label>

          <label className="ficha-field">
            Empecé el
            <input
              type="date"
              value={startedAt}
              onChange={(event) => markDirty(setStartedAt)(event.target.value)}
            />
          </label>

          <label className="ficha-field">
            Terminé el
            <input
              type="date"
              value={finishedAt}
              onChange={(event) => markDirty(setFinishedAt)(event.target.value)}
            />
          </label>

          {readingDays !== null && (
            <div className="ficha-field ficha-reading-days">
              Tiempo de lectura
              <span>{readingDays} {readingDays === 1 ? "día" : "días"}</span>
            </div>
          )}
        </div>
      </div>

      <div className="ficha-divider" />

      <div className="ficha-section ficha-ratings">
        <RatingPicker
          label="Calificación"
          icon={Star}
          tone="star"
          value={rating}
          onChange={markDirty(setRating)}
        />
        <RatingPicker
          label="Romance"
          icon={Heart}
          tone="romance"
          value={romanceRating}
          onChange={markDirty(setRomanceRating)}
        />
        <RatingPicker
          label="Plot"
          icon={BookOpen}
          tone="plot"
          value={plotRating}
          onChange={markDirty(setPlotRating)}
        />
        <RatingPicker
          label="Tristeza"
          icon={Droplets}
          tone="sadness"
          value={sadnessRating}
          onChange={markDirty(setSadnessRating)}
        />
        <RatingPicker
          label="Humor"
          icon={Laugh}
          tone="humor"
          value={humorRating}
          onChange={markDirty(setHumorRating)}
        />
        <RatingPicker
          label="Spicy"
          icon={ChiliPepperIcon}
          tone="spicy"
          value={spicyRating}
          onChange={markDirty(setSpicyRating)}
        />
        <RatingPicker
          label="Misterio"
          icon={CrystalBallIcon}
          tone="mystery"
          value={mysteryRating}
          onChange={markDirty(setMysteryRating)}
        />
      </div>

      <div className="ficha-divider" />

      <div className="ficha-section">
        <div className="ficha-field-row">
          <label className="ficha-field ficha-field-grow">
            Personaje favorito
            <input
              type="text"
              value={favoriteCharacter}
              onChange={(event) => markDirty(setFavoriteCharacter)(event.target.value)}
            />
          </label>

          <label className="ficha-field ficha-field-grow">
            El que menos me gustó
            <input
              type="text"
              value={leastFavoriteCharacter}
              onChange={(event) => markDirty(setLeastFavoriteCharacter)(event.target.value)}
            />
          </label>
        </div>

        <label className="ficha-field">
          Frase favorita
          <textarea
            className="ficha-quote"
            rows={2}
            value={favoriteQuote}
            onChange={(event) => markDirty(setFavoriteQuote)(event.target.value)}
          />
        </label>

        <div className="ficha-field-row ficha-field-row-align-end">
          <div className="ficha-field">
            ¿Lloré?
            <div className="ficha-toggle-group">
              <button
                type="button"
                className={cried === true ? "ficha-toggle-active" : ""}
                onClick={() => markDirty(setCried)(cried === true ? null : true)}
              >
                Sí
              </button>
              <button
                type="button"
                className={cried === false ? "ficha-toggle-active" : ""}
                onClick={() => markDirty(setCried)(cried === false ? null : false)}
              >
                No
              </button>
            </div>
          </div>

          <div className="ficha-field">
            Recomiendo
            <div className="ficha-toggle-group">
              {RECOMMEND_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={recommend === option.value ? "ficha-toggle-active" : ""}
                  onClick={() =>
                    markDirty(setRecommend)(recommend === option.value ? null : option.value)
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <label className="ficha-field ficha-field-narrow">
            Libro # del año
            <input
              type="number"
              min={1}
              value={bookNumberOfYear}
              onChange={(event) => markDirty(setBookNumberOfYear)(event.target.value)}
            />
          </label>

          <label className="ficha-field">
            Mood
            <input
              type="text"
              placeholder="Acogedor, agridulce…"
              value={mood}
              onChange={(event) => markDirty(setMood)(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="ficha-divider" />

      <div className="ficha-section">
        <label className="ficha-field">
          Notas
          <textarea
            rows={3}
            value={notes}
            onChange={(event) => markDirty(setNotes)(event.target.value)}
          />
        </label>

        <label className="ficha-field">
          Mi opinión
          <RichTextEditor initialHtml={bodyHtml} onChange={markDirty(setBodyHtml)} />
        </label>
      </div>
    </section>
  );
}
