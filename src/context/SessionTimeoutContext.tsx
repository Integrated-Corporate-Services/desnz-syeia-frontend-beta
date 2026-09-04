import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthUserContext } from './AuthUserContext';
import type { SessionTimeoutContextType } from './session-timeout';
import { useSessionTimeoutManager } from './session-timeout';

const SessionTimeoutContext = createContext<SessionTimeoutContextType | undefined>(undefined);

export const SessionTimeoutProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuthUserContext();
  const isAuthenticated = !!user && !authLoading;
  const value = useSessionTimeoutManager({ isAuthenticated });

  return (
    <SessionTimeoutContext.Provider value={value}>
      {children}
    </SessionTimeoutContext.Provider>
  );
};

export const useSessionTimeout = () => {
  const ctx = useContext(SessionTimeoutContext);
  if (!ctx) throw new Error('useSessionTimeout must be used within SessionTimeoutProvider');
  return ctx;
};