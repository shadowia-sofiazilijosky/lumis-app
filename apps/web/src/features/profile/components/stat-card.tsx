import Image from "next/image";
import Link from "next/link";

interface StatCardProps {
  icon: string;
  iconTone: "gold" | "wine" | "olive";
  value: number;
  label: string;
  href: string;
  linkLabel: string;
}

export function StatCard({ icon, iconTone, value, label, href, linkLabel }: StatCardProps) {
  return (
    <div className="profile-stat-card">
      <span className={`profile-stat-icon profile-stat-icon-${iconTone}`}>
        {/* The source PNGs aren't square (612x408 landscape for three of
            them, 408x612 portrait for the streak one) -- `fill` +
            object-fit: contain (in globals.css) sizes each to the circle
            while keeping its real aspect ratio, instead of the old fixed
            width/height, which stretched them. */}
        <Image src={icon} alt="" fill sizes="56px" />
      </span>
      <span className="profile-stat-value">{value}</span>
      <span className="profile-stat-label">{label}</span>
      <Link href={href} className="profile-stat-link">
        {linkLabel} →
      </Link>
    </div>
  );
}
