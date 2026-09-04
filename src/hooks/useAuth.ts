import { useState, useCallback } from 'react';
import type { AuthUser } from '../types/auth';
import type { AuthUserResponse } from '../services/auth/types';
import { signOut as signOutService } from '../services/auth/signOutService';

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const setAuth = useCallback((response: AuthUserResponse) => {
    setAuthenticated(response.authenticated);
    setUser(response.user);
    setLoading(false);
    setError(null);
  }, []);

  const setAuthError = useCallback((err: Error) => {
    setError(err);
    setLoading(false);
    setAuthenticated(false);
    setUser(null);
  }, []);

  const setAuthLoading = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  const signOut = useCallback(async () => {
    await signOutService();
    setAuthenticated(false);
    setUser(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    authenticated,
    user,
    loading,
    error,
    setAuth,
    setError: setAuthError,
    setLoading: setAuthLoading,
    signOut,
  };
}
