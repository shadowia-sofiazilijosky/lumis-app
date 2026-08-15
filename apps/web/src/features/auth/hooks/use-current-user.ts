"use client";

import { useEffect } from "react";
import { fetchCurrentUser } from "../api/auth-client";
import { useAuthStore } from "../store/auth-store";

/** Syncs the auth store with the server on mount. Call once near the app root. */
export function useCurrentUser() {
  const status = useAuthStore((state) => state.status);
  const setUser = useAuthStore((state) => state.setUser);
  const setStatus = useAuthStore((state) => state.setStatus);

  useEffect(() => {
    if (status !== "idle") return;

    setStatus("loading");
    fetchCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, [status, setUser, setStatus]);
}
