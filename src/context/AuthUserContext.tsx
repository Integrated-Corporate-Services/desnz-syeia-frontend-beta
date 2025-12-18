import React, { createContext, useContext } from 'react';
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
  return (
    <AuthUserContext.Provider value={{ user, loading, error, authenticated }}>
      {children}
    </AuthUserContext.Provider>
  );
};

export const useAuthUserContext = () => useContext(AuthUserContext);