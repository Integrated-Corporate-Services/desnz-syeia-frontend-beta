import React, { createContext, useContext, useMemo } from 'react';
import { useAuthUser } from '../hooks/useAuthUser';
import type { AuthUser } from '../types/auth';

type AuthUserContextType = {
  user: AuthUser | null;
  loading: boolean;
  error: any;
  authenticated: boolean;
};

const AuthUserContext = createContext<AuthUserContextType>({ user: null, loading: true, error: null, authenticated: false });

export const AuthUserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, error, authenticated } = useAuthUser();
  const value = useMemo(() => ({ user, loading, error, authenticated }), [user, loading, error, authenticated]);
  return (
    <AuthUserContext.Provider value={value}>
      {children}
    </AuthUserContext.Provider>
  );
};

export const useAuthUserContext = () => useContext(AuthUserContext);