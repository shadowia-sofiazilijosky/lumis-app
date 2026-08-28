"use client";

import type { ProfileStats, PublicUser } from "@lumis/shared-types";
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

  return (
    <section className="profile-page">
      <div className="profile-page-header">
        <h1>Mi perfil</h1>
        <div className="profile-tabs">
          <button
            type="button"
            className={tab === "overview" ? "profile-tab-active" : ""}
            onClick={() => setTab("overview")}
          >
            Vista general
          </button>
          <button
            type="button"
            className={tab === "edit" ? "profile-tab-active" : ""}
            onClick={() => setTab("edit")}
          >
            Editar perfil
          </button>
        </div>
      </div>

      {tab === "edit" ? (
        <div className="profile-panel">
          <ProfileEditForm
            user={user}
            onSaved={(updated) => {
              setUser(updated);
              setTab("overview");
            }}
          />
        </div>
      ) : (
        <>
          <div className="profile-top-card">
            <ProfileHeaderCard user={user} onUserChange={setUser} onEditClick={() => setTab("edit")} />

            {stats && (
              <div className="profile-stat-cards">
                <StatCard
                  icon="/assets/profile/icon-perfil-biblioteca.png"
                  iconTone="gold"
                  value={stats.counts.totalBooks}
                  label="Libros en tu biblioteca"
                  href="/library"
                  linkLabel="Ver todos"
                />
                <StatCard
                  icon="/assets/profile/icon-perfil-leidos.png"
                  iconTone="wine"
                  value={stats.counts.totalRead}
                  label="Libros leídos"
                  href="/library"
                  linkLabel="Ver todos"
                />
                <StatCard
                  icon="/assets/profile/icon-perfil-resenas.png"
                  iconTone="olive"
                  value={stats.counts.totalReviews}
                  label="Reseñas escritas"
                  href="/library"
                  linkLabel="Ver todas"
                />
                <StatCard
                  icon="/assets/profile/icon-perfil-racha.png"
                  iconTone="gold"
                  value={stats.counts.currentStreak}
                  label="Días de racha"
                  href="/library"
                  linkLabel="Ver racha"
                />
              </div>
            )}
          </div>

          {!stats ? (
            <p className="profile-loading">Cargando estadísticas…</p>
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
