"use client";

import type { PublicUser } from "@lumis/shared-types";
import { MapPin, Pencil } from "lucide-react";
import { useRef, useState } from "react";
import { uploadAvatar } from "../api/profile-client";
import { formatMemberSince } from "../lib/presentation";

interface ProfileHeaderCardProps {
  user: PublicUser;
  onUserChange: (user: PublicUser) => void;
  onEditClick: () => void;
}

export function ProfileHeaderCard({ user, onUserChange, onEditClick }: ProfileHeaderCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const updated = await uploadAvatar(file);
      onUserChange(updated);
    } catch {
      setError("No pudimos subir la foto. Probá con un JPG, PNG o WEBP de menos de 5MB.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="profile-header-card">
      <div className="profile-avatar-wrap">
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
        <button
          type="button"
          className="profile-avatar-edit"
          aria-label="Cambiar foto de perfil"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Pencil size={13} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="profile-avatar-input"
          onChange={handleFileChange}
        />
      </div>

      <div className="profile-header-info">
        <h2 className="profile-header-name">
          {user.displayName}
          <button type="button" className="profile-header-name-edit" onClick={onEditClick} aria-label="Editar perfil">
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
        {error && <p className="profile-header-error">{error}</p>}
      </div>
    </div>
  );
}
