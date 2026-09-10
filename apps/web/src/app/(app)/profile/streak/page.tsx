import { getTranslations } from "next-intl/server";
import { StreakCalendarView } from "@/features/profile/components/streak-calendar-view";
import { PageTitle } from "@/shared/components/page-title";

export async function generateMetadata() {
  const t = await getTranslations("streakCalendar");
  return { title: t("pageTitle") };
}

export default async function StreakCalendarPage() {
  const t = await getTranslations("streakCalendar");
  return (
    <section>
      <PageTitle>{t("heading")}</PageTitle>
      <StreakCalendarView />
    </section>
  );
}
