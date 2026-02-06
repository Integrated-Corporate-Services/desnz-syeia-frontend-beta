/// <reference types="vite/client" />
import { useEffect, useRef } from "react";
import { getAuthUser, AuthUserResponse } from "../services/authService";
import { useAuthStore } from "../store/useAuthStore";

// Read from environment variable for flexibility (works with OneLogin simulator too)
const LOGIN_DISABLED = import.meta.env.VITE_LOGIN_DISABLED === "true";

export function useAuthUser() {
  const { setAuth, setError, setLoading, user, loading, error, authenticated } =
    useAuthStore();
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Skip if already attempted load (mount only)
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    // Check backend for session (middleware auto-initializes dummy session if needed)
    getAuthUser()
      .then((data: AuthUserResponse) => {
        setAuth({
          authenticated: true,
          user: data.user ? {
            ...data.user,
            isDemo: LOGIN_DISABLED, // Mark as demo if in LOGIN_DISABLED mode
          } : null,
        });
        setLoading(false);
        console.log(
          "[useAuthUser] Session loaded:",
          LOGIN_DISABLED ? "dummy" : "OneLogin"
        );
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.log("[useAuthUser] Not authenticated:", err);
        setLoading(false);
      });
  }, []); // Empty array - load only once on mount

  return {
    user,
    loading,
    error,
    authenticated,
  };
}
