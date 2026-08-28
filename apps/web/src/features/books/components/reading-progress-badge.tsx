import { useTranslations } from "next-intl";

export function ReadingProgressBadge({ percent }: { percent: number }) {
  const t = useTranslations("library");
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <div
      className="reading-progress-badge"
      style={{
        background: `conic-gradient(var(--primary) ${clamped * 3.6}deg, rgba(43, 27, 17, 0.35) 0deg)`,
      }}
      role="img"
      aria-label={t("progressAria", { percent: clamped })}
    >
      <span className="reading-progress-badge-inner">{clamped}%</span>
    </div>
  );
}
