import type { ShelfListItem } from "@lumis/shared-types";
import { Settings } from "lucide-react";
import Link from "next/link";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../lib/canvas";
import { findShelfFrameImage } from "../lib/appearance-catalog";
import { DECORATION_ICONS } from "../lib/decoration-catalog";
import { getGenreStyle } from "../lib/genre-catalog";

const DEFAULT_SHELF_COLOR = "#8c2f39";
const PREVIEW_ASPECT = CANVAS_WIDTH / CANVAS_HEIGHT;

export function ShelfCard({
  shelf,
  index = 0,
}: {
  shelf: ShelfListItem;
  index?: number;
}) {
  const { color, Icon } = getGenreStyle(shelf.genre, index);
  const frameImage = findShelfFrameImage(shelf.shelfFrame);

  return (
    <div className="shelf-card">
      <Link href={`/shelves/${shelf.id}`} className="shelf-card-link">
        <div className="shelf-card-topbar" style={{ backgroundColor: color }}>
          <span className="shelf-card-icon">
            <Icon size={18} />
          </span>
          <div className="shelf-card-topbar-text">
            <h3>{shelf.name}</h3>
            <p>
              {shelf.bookCount} {shelf.bookCount === 1 ? "libro" : "libros"}
            </p>
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
          <div
            className="shelf-card-preview-frame"
            style={frameImage ? { backgroundImage: `url(${frameImage})` } : undefined}
          >
            {!frameImage && (
              <div
                className="shelf-color-overlay"
                style={{ backgroundColor: shelf.shelfColor ?? DEFAULT_SHELF_COLOR }}
              />
            )}
          </div>

          {shelf.decorations.map((decoration) => {
            const DecorationIcon =
              DECORATION_ICONS[decoration.type]?.[decoration.variant ?? ""];
            if (!DecorationIcon) return null;
            return (
              <span
                key={decoration.id}
                className="shelf-card-decoration"
                style={{
                  left: `${(decoration.x / CANVAS_WIDTH) * 100}%`,
                  top: `${(decoration.y / CANVAS_HEIGHT) * 100}%`,
                }}
              >
                <DecorationIcon />
              </span>
            );
          })}

          {shelf.previewCovers.length > 0 && (
            <div className="shelf-card-spines">
              {shelf.previewCovers.map((coverUrl, coverIndex) => (
                // eslint-disable-next-line @next/next/no-img-element -- small remote-signed thumbnails, not worth next/image's overhead here
                <img key={coverIndex} src={coverUrl} alt="" className="shelf-card-spine" />
              ))}
            </div>
          )}
        </div>
      </Link>

      <div className="shelf-card-footer">
        <Link href={`/shelves/${shelf.id}`} className="shelf-card-open-button">
          Abrir estantería
        </Link>
        <Link
          href={`/shelves/${shelf.id}`}
          className="shelf-card-settings"
          aria-label={`Configurar ${shelf.name}`}
        >
          <Settings size={16} />
        </Link>
      </div>
    </div>
  );
}
