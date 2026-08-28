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
        <Image src={icon} alt="" width={28} height={28} />
      </span>
      <span className="profile-stat-value">{value}</span>
      <span className="profile-stat-label">{label}</span>
      <Link href={href} className="profile-stat-link">
        {linkLabel} →
      </Link>
    </div>
  );
}
