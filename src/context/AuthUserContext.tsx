import React, { createContext, useContext } from 'react';
import { useAuthUser } from '../hooks/useAuthUser';
import type { AuthUser } from '../types/auth';

type AuthUserContextType = {
  user: AuthUser | null;
  loading: boolean;
  error: any;
};

const AuthUserContext = createContext<AuthUserContextType>({ user: null, loading: true, error: null });

export const AuthUserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, error } = useAuthUser();
  return (
    <AuthUserContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthUserContext.Provider>
  );
};

export const useAuthUserContext = () => useContext(AuthUserContext);
