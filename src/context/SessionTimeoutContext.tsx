/**
 * SessionTimeoutContext - Frontend idle timeout and logout UX
 * 
 * Separation of concerns:
 * 1. Frontend: Idle detection + warning modal + logout
 * 2. Backend: Manages its own session expiry independently
 * 
 * Uses sessionStorage to track last activity across tab switches
 * No forced logout on visibility change - only shows warning modal
 */

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback, useMemo } from 'react';
import { logout } from '../services/authService';
import { useAuthUserContext } from './AuthUserContext';
import { createLogger } from '../utils/logger';
import { SESSION_TIMEOUT, SESSION_WARNING, SIGNED_OUT_PAGE } from '../constants/sessionTimeout';

const logger = createLogger('SessionTimeout');
const LAST_ACTIVITY_KEY = 'lastActivity';

interface SessionTimeoutContextType {
  showModal: boolean;
  remaining: number;
  extendSession: () => void;
  logout: () => Promise<void>;
}

const SessionTimeoutContext = createContext<SessionTimeoutContextType | undefined>(undefined);

export const SessionTimeoutProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuthUserContext();
  const isAuthenticated = !!user && !authLoading;

  // UI State
  const [showModal, setShowModal] = useState(false);
  const [remaining, setRemaining] = useState(SESSION_WARNING);
  
  // Prevent double logout
  const isLoggingOutRef = useRef<boolean>(false);
  const warningThreshold = SESSION_TIMEOUT - SESSION_WARNING;

  // Log config only once on mount
  useEffect(() => {
    logger.info(`Session timeout config: ${SESSION_TIMEOUT}s total, warning at ${warningThreshold}s`);
  }, [warningThreshold]);

  // Update last activity timestamp in sessionStorage
  const updateLastActivity = useCallback(() => {
    sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  }, []);

  // Get idle seconds from sessionStorage
  const getIdleSeconds = useCallback(() => {
    const last = Number(sessionStorage.getItem(LAST_ACTIVITY_KEY));
    if (!last) return 0;
    return Math.floor((Date.now() - last) / 1000);
  }, []);

  // Track user activity with event listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll'];

    const onActivity = () => {
      updateLastActivity();
      // Note: Modal will NOT auto-hide on activity
      // User must explicitly click "Stay signed in" button
    };

    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    // Set initial value
    updateLastActivity();
    logger.info('Activity tracking started');

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      logger.debug('Activity tracking stopped');
    };
  }, [isAuthenticated, updateLastActivity]);

  // Extend session - User clicks "Stay signed in"
  const extendSession = useCallback(() => {
    logger.info('User extended session');
    updateLastActivity();
    setShowModal(false);
    setRemaining(SESSION_WARNING);
  }, [updateLastActivity]);

  // Logout handler
  const handleLogout = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    
    isLoggingOutRef.current = true;
    logger.warn('Logging out due to session timeout');
    
    try {
      await logout(SIGNED_OUT_PAGE);
    } catch (err) {
      logger.error('Logout error:', err);
      window.location.href = SIGNED_OUT_PAGE;
    }
  }, []);

  // Main session checker - runs every second
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      const idleSeconds = getIdleSeconds();

      // Log every 30 seconds for debugging
      if (idleSeconds > 0 && idleSeconds % 30 === 0) {
        const minutes = Math.floor(idleSeconds / 60);
        logger.debug(`Idle: ${minutes}m ${idleSeconds % 60}s / ${SESSION_TIMEOUT / 60}m`);
      }

      // Full timeout - auto sign out
      if (idleSeconds >= SESSION_TIMEOUT) {
        logger.warn(`Timeout reached (${idleSeconds}s) - auto signing out`);

 setShowModal(true);
  setRemaining(0);

  return;
      }

      // Warning phase - show modal and countdown
      if (idleSeconds >= warningThreshold) {
        if (!showModal) {
          logger.warn(`Warning threshold reached (${idleSeconds}s) - showing modal`);
          setShowModal(true);
        }
        const timeLeft = SESSION_TIMEOUT - idleSeconds;
        setRemaining(timeLeft);
      }
    }, 1000);

    logger.info('Session monitoring started');

    return () => {
      clearInterval(interval);
      logger.debug('Session monitoring stopped');
    };
  }, [isAuthenticated, getIdleSeconds, showModal, warningThreshold, handleLogout]);

  // Tab visibility handling - check idle time when returning to tab
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const idleSeconds = getIdleSeconds();
        const minutes = Math.floor(idleSeconds / 60);
        
        logger.info(`Tab visible - idle for ${minutes}m ${idleSeconds % 60}s`);

        // Auto sign out if session already expired
        if (idleSeconds >= SESSION_TIMEOUT) {
          logger.warn('Session expired while on another tab - auto signing out');

  setShowModal(true);
  setRemaining(0);
        } else if (idleSeconds >= warningThreshold) {
          // Show warning modal if in warning period
          logger.warn('Warning period active - showing modal');
          setShowModal(true);
          setRemaining(SESSION_TIMEOUT - idleSeconds);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, getIdleSeconds, warningThreshold, handleLogout]);

  // Context value
  const value = useMemo(
    () => ({
      showModal,
      remaining,
      extendSession,
      logout: handleLogout
    }),
    [showModal, remaining, extendSession, handleLogout]
  );

  return (
    <SessionTimeoutContext.Provider value={value}>
      {children}
    </SessionTimeoutContext.Provider>
  );
};

export const useSessionTimeout = () => {
  const ctx = useContext(SessionTimeoutContext);
  if (!ctx) {
    throw new Error('useSessionTimeout must be used within SessionTimeoutProvider');
  }
  return ctx;
};
