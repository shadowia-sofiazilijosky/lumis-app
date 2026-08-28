import type { ActivityEvent } from "@lumis/shared-types";
import Link from "next/link";
import { ACTIVITY_LABEL, formatRelativeDate } from "../lib/presentation";
import { SectionHeading } from "./section-heading";

export function ActivityList({ activity }: { activity: ActivityEvent[] }) {
  return (
    <div className="profile-panel">
      <SectionHeading icon="/assets/profile/icon-perfil-actividad.png" title="Actividad reciente" />

      {activity.length === 0 ? (
        <p className="profile-empty-message">Todavía no hay actividad para mostrar.</p>
      ) : (
        <ul className="profile-activity-list">
          {activity.map((event, index) => (
            <li key={`${event.type}-${event.bookId}-${index}`} className="profile-activity-item">
              <Link href={`/library/${event.bookId}`} className="profile-activity-cover">
                {event.bookCoverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- signed, short-lived Supabase URL
                  <img src={event.bookCoverUrl} alt="" />
                ) : (
                  <span className="profile-activity-cover-placeholder" />
                )}
              </Link>
              <div className="profile-activity-body">
                <span className="profile-activity-action">{ACTIVITY_LABEL[event.type]}</span>
                <Link href={`/library/${event.bookId}`} className="profile-activity-title">
                  {event.bookTitle}
                </Link>
              </div>
              <span className="profile-activity-date">{formatRelativeDate(event.date)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
