import type { ActivityEventType, AchievementKey, LibraryDistributionBucket } from "@lumis/shared-types";

export const ACHIEVEMENT_META: Record<
  AchievementKey,
  { title: string; description: string; icon: string }
> = {
  FIRST_10: {
    title: "Primeros 10",
    description: "Agregaste 10 libros",
    icon: "/assets/profile/icon-logro-primeros10.png",
  },
  CRITIC: {
    title: "Crítico",
    description: "Escribiste 5 reseñas",
    icon: "/assets/profile/icon-logro-critico.png",
  },
  STREAK_7: {
    title: "Racha de 7",
    description: "7 días seguidos",
    icon: "/assets/profile/icon-logro-racha7.png",
  },
  NIGHT_OWL: {
    title: "Lector nocturno",
    description: "Leíste de noche",
    icon: "/assets/profile/icon-logro-nocturno.png",
  },
};

export const ACTIVITY_LABEL: Record<ActivityEventType, string> = {
  FINISHED: "Terminaste de leer",
  ADDED: "Agregaste a tu biblioteca",
  REVIEWED: "Escribiste una reseña de",
};

export const DISTRIBUTION_LABEL: Record<LibraryDistributionBucket, string> = {
  READ: "Leídos",
  TO_READ: "Por leer",
  READING: "Leyendo",
  OTHER: "Otros",
};

/** "Hoy" / "Ayer" / "Hace N días" / a plain date past that. */
export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / dayMs);

  if (diffDays <= 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 30) return `Hace ${diffDays} días`;

  return date.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}

/** "agosto de 2026" — for "Miembro desde". */
export function formatMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}
