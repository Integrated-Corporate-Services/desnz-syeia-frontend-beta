import React, { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback, useMemo } from 'react';
import { logout, signOut } from '../services/authService';
import { useAuthUserContext } from './AuthUserContext';
import { createLogger } from '../utils/logger';

const logger = createLogger('SessionTimeoutContext');

interface SessionTimeoutContextType {
  showModal: boolean;
  remaining: number;
  resetTimer: () => void;
  handleLogout: () => Promise<void>;
}

const SessionTimeoutContext = createContext<SessionTimeoutContextType | undefined>(undefined);

const TIMEOUT = 3 * 60; // 5 min in seconds (for testing - change to 30 * 60 for production)
const WARNING = 2 * 60; // 2 min warning in seconds

export const SessionTimeoutProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuthUserContext();
  const [showModal, setShowModal] = useState(false);
  const [remaining, setRemaining] = useState(WARNING);
  const timerRef = useRef<number | null>(null);
  const idleRef = useRef<number>(0);
  const isAuthenticatedRef = useRef(false);

  // Derive auth state
  const isAuthenticated = !!user && !authLoading;

  // Update auth state ref
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
    logger.info('Auth state updated:', { 
      isAuthenticated, 
      user: user ? { user_id: user.user_id, role: user.role } : null, 
      authLoading 
    });
  }, [isAuthenticated, user, authLoading]);

  // Reset timer on user activity - memoized
  const resetTimer = useCallback(() => {
    idleRef.current = 0;
    setShowModal(false);
    setRemaining(WARNING);
  }, []);

  // Logout logic - memoized and properly async
  const handleLogout = useCallback(async () => {
    try {
      logger.info('Starting session timeout logout process...');
      // Use logout to destroy session and handle redirect
      await logout();
      window.location.href = '/frontend/signed-out';
    } catch (err) {
      logger.error('Logout error:', err);
      // Force redirect even if signOut fails
      window.location.href = '/frontend/signed-out';
    }
  }, []);

  useEffect(() => {
    // Only track activity for authenticated users
    if (!isAuthenticated) return;
    
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const activity = (event: Event) => {
      // When modal is showing, ignore all general activity
      // Only allow modal button handlers to control the session
      if (showModal) {
        return; // Don't reset timer - let user choose via modal buttons
      }
      
      // Normal activity tracking when modal is not showing
      logger.debug('Activity detected - timer reset. Current idle time:', idleRef.current);
      resetTimer();
    };
    events.forEach(e => window.addEventListener(e, activity));
    return () => events.forEach(e => window.removeEventListener(e, activity));
  }, [isAuthenticated, showModal, resetTimer]);

  useEffect(() => {
    // Only run timer for authenticated users
    if (!isAuthenticated) {
      logger.debug('Timer NOT started - user not authenticated');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    logger.info('Timer STARTED - user authenticated');
    timerRef.current = window.setInterval(() => {
      idleRef.current += 1;
      if (idleRef.current % 10 === 0) { // Log every 10 seconds
        logger.debug(`Idle time: ${idleRef.current}s (show popup at ${TIMEOUT - WARNING}s, logout at ${TIMEOUT}s)`);
      }
      if (idleRef.current >= TIMEOUT - WARNING && idleRef.current < TIMEOUT) {
        if (!showModal) {
          logger.info('Showing session timeout modal');
          setShowModal(true);
        }
        setRemaining(TIMEOUT - idleRef.current);
      } else if (idleRef.current >= TIMEOUT) {
        logger.info('Session timeout - logging out automatically');
        setShowModal(false);
        // Ensure automatic logout works by forcing redirect
        clearInterval(timerRef.current!);
        timerRef.current = null;
        handleLogout();
      }
    }, 1000);
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [isAuthenticated, handleLogout]);

  // Countdown in modal
  useEffect(() => {
    if (!showModal) return undefined;
    const modalTimer = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          logger.info('Modal countdown finished - logging out automatically');
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