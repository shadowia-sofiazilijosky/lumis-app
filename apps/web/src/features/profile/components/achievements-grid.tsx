import type { AchievementStat } from "@lumis/shared-types";
import Image from "next/image";
import { ACHIEVEMENT_META } from "../lib/presentation";
import { SectionHeading } from "./section-heading";

export function AchievementsGrid({ achievements }: { achievements: AchievementStat[] }) {
  return (
    <div className="profile-panel">
      <SectionHeading icon="/assets/profile/icon-perfil-logros.png" title="Logros" />

      <div className="profile-achievements-grid">
        {achievements.map((achievement) => {
          const meta = ACHIEVEMENT_META[achievement.key];
          return (
            <div
              key={achievement.key}
              className={`profile-achievement${achievement.unlocked ? "" : " profile-achievement-locked"}`}
            >
              <span className="profile-achievement-icon">
                <Image src={meta.icon} alt="" width={40} height={40} />
              </span>
              <span className="profile-achievement-title">{meta.title}</span>
              <span className="profile-achievement-description">{meta.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
