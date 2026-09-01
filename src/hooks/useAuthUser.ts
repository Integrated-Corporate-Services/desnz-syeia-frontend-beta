/// <reference types="vite/client" />
import { useEffect, useRef } from "react";
import { getAuthUser, AuthUserResponse } from "../services/authService";
import { useAuth } from "./useAuth";
import { createLogger } from "../utils/logger";
import { getRuntimeEnv, parseEnvBoolean } from "../config/runtimeEnv";

const logger = createLogger('useAuthUser');

// Read from runtime config for flexibility (works with OneLogin simulator too)
const LOGIN_DISABLED = parseEnvBoolean(getRuntimeEnv('VITE_LOGIN_DISABLED'));

export function useAuthUser() {
  const { setAuth, setError, setLoading, user, loading, error, authenticated } =
    useAuth();
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
        logger.info(
          "Session loaded:",
          LOGIN_DISABLED ? "dummy" : "OneLogin"
        );
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err : new Error(String(err)));
        logger.info("Not authenticated:", err);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run only once on mount;
    // store setters and module constants are stable
  }, []);

  return {
    user,
    loading,
    error,
    authenticated,
  };
}
