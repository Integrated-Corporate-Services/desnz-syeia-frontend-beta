import React, { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback, useMemo } from 'react';
import { logout } from '../services/authService';
import { useAuthUserContext } from './AuthUserContext';

interface SessionTimeoutContextType {
  showModal: boolean;
  remaining: number;
  resetTimer: () => void;
  handleLogout: () => Promise<void>;
}

const SessionTimeoutContext = createContext<SessionTimeoutContextType | undefined>(undefined);

const TIMEOUT = 3 * 60; // 3 min in seconds
const WARNING = 2 * 60; // 2 min in seconds

export const SessionTimeoutProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuthUserContext();
  const [showModal, setShowModal] = useState(false);
  const [remaining, setRemaining] = useState(WARNING);
  const timerRef = useRef<number | null>(null);
  const idleRef = useRef<number>(0);
  const isAuthenticatedRef = useRef(false);

  // Update auth state ref
  useEffect(() => {
    isAuthenticatedRef.current = !!user && !authLoading;
    console.log('🔐 Auth state updated:', { isAuthenticated: isAuthenticatedRef.current, user, authLoading });
  }, [user, authLoading]);

  // Reset timer on user activity - memoized
  const resetTimer = useCallback(() => {
    idleRef.current = 0;
    setShowModal(false);
    setRemaining(WARNING);
  }, []);

  // Logout logic - memoized and properly async
  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
      // Force redirect even if logout fails
      window.location.href = '/backend/auth/login';
    }
  }, []);

  useEffect(() => {
    // Only track activity for authenticated users
    if (!isAuthenticatedRef.current) return;
    
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const activity = () => {
      // Only reset timer if modal is NOT shown
      if (!showModal) {
        console.log('👆 Activity detected - timer reset');
        resetTimer();
      }
    };
    events.forEach(e => window.addEventListener(e, activity));
    return () => events.forEach(e => window.removeEventListener(e, activity));
  }, [showModal, resetTimer]);

  useEffect(() => {
    // Only run timer for authenticated users
    if (!isAuthenticatedRef.current) {
      console.log('⏱️ Timer NOT started - user not authenticated');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    console.log('⏱️ Timer STARTED - user authenticated');
    timerRef.current = window.setInterval(() => {
      idleRef.current += 1;
      if (idleRef.current % 10 === 0) { // Log every 10 seconds
        console.log(`⏰ Idle time: ${idleRef.current}s (show popup at ${TIMEOUT - WARNING}s, logout at ${TIMEOUT}s)`);
      }
      if (idleRef.current >= TIMEOUT - WARNING && idleRef.current < TIMEOUT) {
        setShowModal(true);
        setRemaining(TIMEOUT - idleRef.current);
      } else if (idleRef.current >= TIMEOUT) {
        setShowModal(false);
        handleLogout();
      }
    }, 1000);
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [handleLogout, user, authLoading]);

  // Countdown in modal
  useEffect(() => {
    if (!showModal) return undefined;
    const modalTimer = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          setShowModal(false);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearInterval(modalTimer);
    };
  }, [showModal, handleLogout]);

  const value = useMemo(() => ({ showModal, remaining, resetTimer, handleLogout }), [showModal, remaining, resetTimer, handleLogout]);

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