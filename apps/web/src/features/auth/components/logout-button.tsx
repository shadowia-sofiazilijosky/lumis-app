"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "../api/auth-client";
import { useAuthStore } from "../store/auth-store";

export function LogoutButton() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);
    try {
      await logout();
    } finally {
      setUser(null);
      router.push("/login");
      router.refresh();
      setIsSubmitting(false);
    }
  }

  return (
    <button type="button" onClick={handleLogout} disabled={isSubmitting}>
      {isSubmitting ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}
