"use client";

import type { ProfileStats, PublicUser } from "@lumis/shared-types";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchProfileStats } from "../api/profile-client";
import { AchievementsGrid } from "./achievements-grid";
import { ActivityList } from "./activity-list";
import { GenreBars } from "./genre-bars";
import { LibraryPieChart } from "./library-pie-chart";
import { ProfileEditForm } from "./profile-edit-form";
import { ProfileHeaderCard } from "./profile-header-card";
import { ReadingProgressCard } from "./reading-progress-card";
import { StatCard } from "./stat-card";

type Tab = "overview" | "edit";

export function ProfilePage({ initialUser }: { initialUser: PublicUser }) {
  const router = useRouter();
  const t = useTranslations("profile");
  const [user, setUser] = useState(initialUser);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    let cancelled = false;
    fetchProfileStats().then((data) => {
      if (!cancelled) setStats(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // The topbar greeting (name + avatar) is rendered by the (app) layout, a
  // Server Component — it only re-fetches on navigation, so a save here
  // needs to explicitly ask the whole route tree to refresh, or the name/
  // photo you just changed wouldn't show up anywhere outside this page.
  function applyUserChange(updated: PublicUser) {
    setUser(updated);
    router.refresh();
  }

  return (
    <section className="profile-page">
      <div className="profile-page-header">
        <h1>{t("title")}</h1>
        <div className="profile-tabs">
          <button
            type="button"
            className={tab === "overview" ? "profile-tab-active" : ""}
            onClick={() => setTab("overview")}
          >
            {t("tabOverview")}
          </button>
          <button
            type="button"
            className={tab === "edit" ? "profile-tab-active" : ""}
            onClick={() => setTab("edit")}
          >
            {t("tabEdit")}
          </button>
        </div>
      </div>

      {tab === "edit" ? (
        <div className="profile-panel">
          <ProfileEditForm
            user={user}
            onAvatarChange={applyUserChange}
            onSaved={(updated) => {
              applyUserChange(updated);
              setTab("overview");
            }}
          />
        </div>
      ) : (
        <>
          <div className="profile-top-card">
            <ProfileHeaderCard user={user} onEditClick={() => setTab("edit")} />

            {stats && (
              <div className="profile-stat-cards">
                <StatCard
                  icon="/assets/profile/icon-perfil-biblioteca.png"
                  iconTone="gold"
                  value={stats.counts.totalBooks}
                  label={t("stats.libraryCount")}
                  href="/library"
                  linkLabel={t("stats.viewAll")}
                />
                <StatCard
                  icon="/assets/profile/icon-perfil-leidos.png"
                  iconTone="wine"
                  value={stats.counts.totalRead}
                  label={t("stats.readCount")}
                  href="/library"
                  linkLabel={t("stats.viewAll")}
                />
                <StatCard
                  icon="/assets/profile/icon-perfil-resenas.png"
                  iconTone="olive"
                  value={stats.counts.totalReviews}
                  label={t("stats.reviewCount")}
                  href="/library"
                  linkLabel={t("stats.viewAllFem")}
                />
                <StatCard
                  icon="/assets/profile/icon-perfil-racha.png"
                  iconTone="gold"
                  value={stats.counts.currentStreak}
                  label={t("stats.streakCount")}
                  href="/library"
                  linkLabel={t("stats.viewStreak")}
                />
              </div>
            )}
          </div>

          {!stats ? (
            <p className="profile-loading">{t("loadingStats")}</p>
          ) : (
            <>
              <div className="profile-grid">
                <ReadingProgressCard stats={stats.readingGoal} />
                <LibraryPieChart distribution={stats.libraryDistribution} />
                <GenreBars genres={stats.topGenres} />
              </div>

              <div className="profile-grid profile-grid-two">
                <ActivityList activity={stats.recentActivity} />
                <AchievementsGrid achievements={stats.achievements} />
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
