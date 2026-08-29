import type { ShelfListItem } from "@lumis/shared-types";
import { Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DEFAULT_BOOK_COVER_SIZE,
  DEFAULT_DECORATION_SIZE,
  DEFAULT_SHELF_FRAME_SIZE,
} from "../lib/canvas";
import { findShelfFrameImage } from "../lib/appearance-catalog";
import { findDecorationDefaultSize, findDecorationImage } from "../lib/decoration-catalog";
import { getGenreStyle } from "../lib/genre-catalog";

const PREVIEW_ASPECT = CANVAS_WIDTH / CANVAS_HEIGHT;

export function ShelfCard({
  shelf,
  index = 0,
}: {
  shelf: ShelfListItem;
  index?: number;
}) {
  const t = useTranslations("shelvesList");
  const { color, Icon } = getGenreStyle(shelf.genre, index);

  // Items are placed in real canvas pixels, not a fixed logical space — the
  // closest we have to "the space they were arranged in" is the shelf's own
  // saved canvas size (or the default, if it was never manually resized).
  // Percentage-positioning against that reference is what lets this small
  // card mirror the actual editor layout instead of a generic stand-in.
  const refWidth = shelf.canvasWidth ?? CANVAS_WIDTH;
  const refHeight = shelf.canvasHeight ?? CANVAS_HEIGHT;

  return (
    <div className="shelf-card">
      <Link href={`/shelves/${shelf.id}`} className="shelf-card-link">
        <div className="shelf-card-topbar" style={{ backgroundColor: color }}>
          <span className="shelf-card-icon">
            <Icon size={18} />
          </span>
          <div className="shelf-card-topbar-text">
            <h3>{shelf.name}</h3>
            <p>{t("bookCount", { count: shelf.bookCount })}</p>
          </div>
        </div>

        <div className="shelf-card-preview" style={{ aspectRatio: PREVIEW_ASPECT }}>
          <div
            className="shelf-card-preview-background"
            style={{
              backgroundColor: shelf.backgroundColor || undefined,
              backgroundImage: shelf.backgroundImageUrl
                ? `url(${shelf.backgroundImageUrl})`
                : undefined,
            }}
          />

          {shelf.decorations
            .filter((decoration) => decoration.type === "shelf")
            .map((decoration) => {
              const frameImage = findShelfFrameImage(decoration.variant ?? null);
              if (!frameImage) return null;
              const width = decoration.width ?? DEFAULT_SHELF_FRAME_SIZE.width;
              const height = decoration.height ?? DEFAULT_SHELF_FRAME_SIZE.height;
              return (
                // eslint-disable-next-line @next/next/no-img-element -- local static asset, tiny preview thumbnail
                <img
                  key={decoration.id}
                  src={frameImage}
                  alt=""
                  className="shelf-card-frame"
                  style={{
                    left: `${(decoration.x / refWidth) * 100}%`,
                    top: `${(decoration.y / refHeight) * 100}%`,
                    width: `${(width / refWidth) * 100}%`,
                    height: `${(height / refHeight) * 100}%`,
                  }}
                />
              );
            })}

          {shelf.previewBooks.map(
            (entry, bookIndex) =>
              entry.coverUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- signed, short-lived Supabase URL
                <img
                  key={bookIndex}
                  src={entry.coverUrl}
                  alt=""
                  className="shelf-card-book-cover"
                  style={{
                    left: `${((entry.position?.x ?? 0) / refWidth) * 100}%`,
                    top: `${((entry.position?.y ?? 0) / refHeight) * 100}%`,
                    width: `${((entry.position?.width ?? DEFAULT_BOOK_COVER_SIZE.width) / refWidth) * 100}%`,
                    height: `${((entry.position?.height ?? DEFAULT_BOOK_COVER_SIZE.height) / refHeight) * 100}%`,
                  }}
                />
              ),
          )}

          {shelf.decorations
            .filter((decoration) => decoration.type !== "shelf")
            .map((decoration) => {
              const decorationImage = findDecorationImage(
                decoration.type,
                decoration.variant ?? null,
              );
              if (!decorationImage) return null;
              const catalogDefaultSize = findDecorationDefaultSize(
                decoration.type,
                decoration.variant ?? null,
              );
              const width =
                decoration.width ?? catalogDefaultSize?.width ?? DEFAULT_DECORATION_SIZE.width;
              const height =
                decoration.height ?? catalogDefaultSize?.height ?? DEFAULT_DECORATION_SIZE.height;
              return (
                <span
                  key={decoration.id}
                  className="shelf-card-decoration"
                  style={{
                    left: `${(decoration.x / refWidth) * 100}%`,
                    top: `${(decoration.y / refHeight) * 100}%`,
                    width: `${(width / refWidth) * 100}%`,
                    height: `${(height / refHeight) * 100}%`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- local static asset, tiny preview thumbnail */}
                  <img src={decorationImage} alt="" className="shelf-card-decoration-image" />
                </span>
              );
            })}
        </div>
      </Link>

      <div className="shelf-card-footer">
        <Link href={`/shelves/${shelf.id}`} className="shelf-card-open-button">
          {t("open")}
        </Link>
        <Link
          href={`/shelves/${shelf.id}`}
          className="shelf-card-settings"
          aria-label={t("settingsFor", { name: shelf.name })}
        >
          <Settings size={16} />
        </Link>
      </div>
    </div>
  );
}
