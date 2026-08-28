import type { PublicUser } from "@lumis/shared-types";
import { MapPin, Pencil } from "lucide-react";
import { formatMemberSince } from "../lib/presentation";

interface ProfileHeaderCardProps {
  user: PublicUser;
  onEditClick: () => void;
}

export function ProfileHeaderCard({ user, onEditClick }: ProfileHeaderCardProps) {
  return (
    <div className="profile-header-card">
      <div className="profile-avatar">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- signed, short-lived Supabase URL
          <img src={user.avatarUrl} alt="" />
        ) : (
          <span className="profile-avatar-placeholder">
            {user.displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="profile-header-info">
        <h2 className="profile-header-name">
          {user.displayName}
          <button
            type="button"
            className="profile-header-name-edit"
            onClick={onEditClick}
            aria-label="Editar perfil"
          >
            <Pencil size={13} />
          </button>
        </h2>
        {user.bio && <p className="profile-header-bio">{user.bio}</p>}
        <div className="profile-header-meta">
          {user.location && (
            <span>
              <MapPin size={13} /> {user.location}
            </span>
          )}
          <span>Miembro desde {formatMemberSince(user.createdAt)}</span>
        </div>
        {user.favoriteQuote && (
          <blockquote className="profile-header-quote">“{user.favoriteQuote}”</blockquote>
        )}
      </div>
    </div>
  );
}
