import type { ReadingGoalStats } from "@lumis/shared-types";
import { SectionHeading } from "./section-heading";

const RADIUS = 68;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function motivationalMessage(stats: ReadingGoalStats): string {
  if (stats.goal === null) {
    return "Configurá una meta anual en \"Editar perfil\" para ver tu progreso acá.";
  }
  if (stats.comparisonPercent === null) {
    return `Llevás ${stats.readThisYear} de ${stats.goal} libros este año.`;
  }
  if (stats.comparisonPercent >= 0) {
    return `¡Vas muy bien! Llevás un ${stats.comparisonPercent}% más que el año pasado a esta altura.`;
  }
  return `Llevás un ${Math.abs(stats.comparisonPercent)}% menos que el año pasado a esta altura — todavía estás a tiempo.`;
}

export function ReadingProgressCard({ stats }: { stats: ReadingGoalStats }) {
  const percent = stats.percent ?? 0;
  const offset = CIRCUMFERENCE * (1 - percent / 100);

  return (
    <div className="profile-panel">
      <SectionHeading icon="/assets/profile/icon-perfil-progreso.png" title="Tu progreso de lectura" />

      <div className="profile-progress-row">
        <svg viewBox="0 0 160 160" className="profile-progress-ring" aria-hidden="true">
          <circle cx="80" cy="80" r={RADIUS} className="profile-progress-ring-track" />
          <circle
            cx="80"
            cy="80"
            r={RADIUS}
            className="profile-progress-ring-fill"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={stats.goal === null ? CIRCUMFERENCE : offset}
          />
          <text x="80" y="76" textAnchor="middle" className="profile-progress-ring-percent">
            {stats.goal === null ? "—" : `${percent}%`}
          </text>
          <text x="80" y="96" textAnchor="middle" className="profile-progress-ring-caption">
            de tu meta anual
          </text>
        </svg>

        <dl className="profile-progress-stats">
          <div>
            <dt>Meta anual</dt>
            <dd>{stats.goal ?? "—"} libros</dd>
          </div>
          <div>
            <dt>Leídos hasta ahora</dt>
            <dd>{stats.readThisYear} libros</dd>
          </div>
          <div>
            <dt>Faltan</dt>
            <dd>{stats.remaining ?? "—"} libros</dd>
          </div>
        </dl>
      </div>

      <p className="profile-progress-message">{motivationalMessage(stats)}</p>
    </div>
  );
}
