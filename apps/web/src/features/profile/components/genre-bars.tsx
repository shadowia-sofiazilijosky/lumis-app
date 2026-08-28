import type { GenreStat } from "@lumis/shared-types";
import { SectionHeading } from "./section-heading";

export function GenreBars({ genres }: { genres: GenreStat[] }) {
  return (
    <div className="profile-panel">
      <SectionHeading icon="/assets/profile/icon-perfil-generos.png" title="Géneros favoritos" />

      {genres.length === 0 ? (
        <p className="profile-empty-message">
          Todavía no marcaste géneros en tus reseñas.
        </p>
      ) : (
        <ul className="profile-genre-list">
          {genres.map((genre) => (
            <li key={genre.genre} className="profile-genre-row">
              <span className="profile-genre-name">{genre.genre}</span>
              <span className="profile-genre-bar-track">
                <span
                  className="profile-genre-bar-fill"
                  style={{ width: `${Math.max(4, genre.percent)}%` }}
                />
              </span>
              <span className="profile-genre-count">{genre.count} libros</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
