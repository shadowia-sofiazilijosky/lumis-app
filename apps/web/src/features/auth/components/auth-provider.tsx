"use client";

import { useCurrentUser } from "../hooks/use-current-user";

/** Syncs the auth store with the server once on mount. Mount near the app root. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useCurrentUser();
  return children;
}
