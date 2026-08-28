"use client";

import type { PublicUser } from "@lumis/shared-types";
import { Pencil } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { updateProfile, uploadAvatar } from "../api/profile-client";
import { COUNTRIES } from "../lib/countries";

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

function listTimezones(): string[] {
  try {
    // Modern browsers only — the actual IANA database, always accurate
    // regardless of the country selected above (unlike guessing a timezone
    // from a country, which breaks for any country spanning multiple zones).
    return (Intl as unknown as { supportedValuesOf: (key: string) => string[] }).supportedValuesOf(
      "timeZone",
    );
  } catch {
    return [detectTimezone()];
  }
}

interface ProfileEditFormProps {
  user: PublicUser;
  /** Form submitted — switches back to "Vista general". */
  onSaved: (user: PublicUser) => void;
  /** Avatar changed — updates state in place, stays on this tab. */
  onAvatarChange: (user: PublicUser) => void;
}

export function ProfileEditForm({ user, onSaved, onAvatarChange }: ProfileEditFormProps) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio ?? "");
  const [location, setLocation] = useState(user.location ?? "");
  const [favoriteQuote, setFavoriteQuote] = useState(user.favoriteQuote ?? "");
  const [readingGoal, setReadingGoal] = useState(user.readingGoal?.toString() ?? "");
  const [country, setCountry] = useState(user.country ?? "");
  const [timezone, setTimezone] = useState(user.timezone ?? detectTimezone());
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const timezoneOptions = useMemo(() => listTimezones(), []);

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setAvatarUploading(true);
    setAvatarError(null);
    try {
      const updated = await uploadAvatar(file);
      setAvatarUrl(updated.avatarUrl);
      onAvatarChange(updated);
    } catch {
      setAvatarError("No pudimos subir la foto. Probá con un JPG, PNG o WEBP de menos de 5MB.");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaveState("saving");

    const parsedGoal = parseInt(readingGoal, 10);

    try {
      const updated = await updateProfile({
        displayName: displayName.trim() || user.displayName,
        bio,
        location,
        favoriteQuote,
        ...(readingGoal !== "" && !Number.isNaN(parsedGoal) && { readingGoal: parsedGoal }),
        country,
        timezone,
      });
      onSaved(updated);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  return (
    <form className="profile-edit-form" onSubmit={handleSubmit}>
      <div className="profile-avatar-field">
        <div className="profile-avatar profile-avatar-large">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- signed, short-lived Supabase URL
            <img src={avatarUrl} alt="" />
          ) : (
            <span className="profile-avatar-placeholder">
              {user.displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <button
            type="button"
            className="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
          >
            <Pencil size={13} /> {avatarUploading ? "Subiendo…" : "Cambiar foto"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="profile-avatar-input"
            onChange={handleAvatarChange}
          />
          {avatarError && <p className="profile-header-error">{avatarError}</p>}
        </div>
      </div>

      <label className="profile-field">
        Nombre
        <input
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={80}
          required
        />
      </label>

      <label className="profile-field">
        Bio
        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          maxLength={280}
          rows={2}
          placeholder="Contá algo sobre vos como lectora/lector…"
        />
      </label>

      <div className="profile-field-row">
        <label className="profile-field">
          Ubicación
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            maxLength={120}
            placeholder="Ciudad, país"
          />
        </label>

        <label className="profile-field">
          Meta anual de lectura
          <input
            type="number"
            min={1}
            max={1000}
            value={readingGoal}
            onChange={(event) => setReadingGoal(event.target.value)}
            placeholder="Ej: 80"
          />
        </label>
      </div>

      <label className="profile-field">
        Cita personal
        <input
          type="text"
          value={favoriteQuote}
          onChange={(event) => setFavoriteQuote(event.target.value)}
          maxLength={200}
          placeholder="Una frase que te represente…"
        />
      </label>

      <div className="profile-field-row">
        <label className="profile-field">
          País
          <select value={country} onChange={(event) => setCountry(event.target.value)}>
            <option value="">Sin especificar</option>
            {COUNTRIES.map((option) => (
              <option key={option.code} value={option.code}>
                {option.name}
              </option>
            ))}
          </select>
        </label>

        <label className="profile-field">
          Huso horario
          <select value={timezone} onChange={(event) => setTimezone(event.target.value)}>
            {!timezoneOptions.includes(timezone) && <option value={timezone}>{timezone}</option>}
            {timezoneOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="profile-field-hint">
            Se usa para calcular tu racha y &quot;lector nocturno&quot; en tu hora real.
          </span>
        </label>
      </div>

      <div className="profile-edit-actions">
        <button type="submit" disabled={saveState === "saving"}>
          {saveState === "saving" ? "Guardando…" : "Guardar cambios"}
        </button>
        {saveState === "saved" && <span className="profile-save-status">Guardado</span>}
        {saveState === "error" && (
          <span className="profile-save-status profile-save-status-error">
            No pudimos guardar. Probá de nuevo.
          </span>
        )}
      </div>
    </form>
  );
}
