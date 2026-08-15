"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthRequestError, register } from "../api/auth-client";
import { useAuthStore } from "../store/auth-store";

export function RegisterForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { user } = await register({ displayName, email, password });
      setUser(user);
      router.push("/library");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof AuthRequestError
          ? err.message
          : "No pudimos crear la cuenta. Probá de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="register-display-name">Nombre</label>
        <input
          id="register-display-name"
          name="displayName"
          type="text"
          autoComplete="name"
          required
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="register-password">Contraseña</label>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {error && (
        <p role="alert" aria-live="assertive">
          {error}
        </p>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
      </button>
    </form>
  );
}
