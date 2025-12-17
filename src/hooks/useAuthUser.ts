/// <reference types="vite/client" />
import { useEffect } from 'react';
import { DEMO_USER_ID, DEMO_USER_EMAIL } from '../constants/demo';
import type { AuthUser } from '../types/auth';
import { getAuthUser, AuthUserResponse } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';


const LOGIN_DISABLED = true;

export function useAuthUser() {
  const { setAuth, setError, setLoading, user, loading, error, authenticated } = useAuthStore();

  useEffect(() => {
    if (LOGIN_DISABLED) {
      // Only set demo user if not already set
      if (!user || !user.isDemo) {
        setAuth({ 
          authenticated: true, 
          user: { 
            user_id: DEMO_USER_ID, 
            email: DEMO_USER_EMAIL, 
            role: 'SUPERUSER',
            organisation_name: 'DESNZ',
            isDemo: true 
          } 
        });
        setLoading(false);
        console.log('[useAuthUser] LOGIN_DISABLED, using demo user');
      }
      return;
    }
    // Only call backend if user is not already in store
    if (!user) {
      getAuthUser()
        .then((data: AuthUserResponse) => {
          setAuth(data);
          console.log('[useAuthUser] Auth response:', data);
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err : new Error(String(err)));
          console.log('[useAuthUser] Auth error:', err);
        });
    }
  }, [user]); // Only depend on user, not on setAuth/setError/setLoading

  return {
    user,
    loading,
    error,
    authenticated,
  };
}