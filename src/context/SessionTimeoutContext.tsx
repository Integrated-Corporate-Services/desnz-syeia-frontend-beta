/**
 * SessionTimeoutContext - Frontend idle timeout and logout UX
 * 
 * Separation of concerns:
 * 1. Frontend: Idle detection + warning modal + logout
 * 2. Backend: Manages its own session expiry independently
 * 
 * No backend keep-alive pinging - prevents page refresh issues when switching tabs
 */

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback, useMemo } from 'react';
import { logout } from '../services/authService';
import { useAuthUserContext } from './AuthUserContext';
import { createLogger } from '../utils/logger';
import { SESSION_TIMEOUT, SESSION_WARNING, SIGNED_OUT_PAGE } from '../constants/sessionTimeout';
import { useIdleTimer } from '../hooks/useIdleTimer';

const logger = createLogger('SessionTimeout');

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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Timer refs
  const checkIntervalRef = useRef<number | null>(null);
  const warningThreshold = SESSION_TIMEOUT - SESSION_WARNING;

  logger.info(`Session timeout config: ${SESSION_TIMEOUT}s total, warning at ${warningThreshold}s`);

  //  1. IDLE DETECTION - Track user inactivity
  const idleTimer = useIdleTimer({
    enabled: isAuthenticated && !isLoggingOut,
    onActive: () => {
      // User became active - hide modal if showing
      if (showModal) {
        logger.info('User became active - hiding modal');
        setShowModal(false);
        setRemaining(SESSION_WARNING);
      }
    },
    events: ['click', 'keydown'] // Only deliberate actions
  });

  // 2. EXTEND SESSION - User clicks "Stay signed in"
  const extendSession = useCallback(() => {
    logger.info('User extended session');
    idleTimer.resetIdle();
    setShowModal(false);
    setRemaining(SESSION_WARNING);
  }, [idleTimer]);

  //  3. LOGOUT HANDLER - Clean logout
  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    logger.warn('Logging out due to session timeout');
    
    try {
      await logout(SIGNED_OUT_PAGE);
    } catch (err) {
      logger.error('Logout error:', err);
      window.location.href = SIGNED_OUT_PAGE;
    }
  }, [isLoggingOut]);

  //  4. IDLE CHECK TIMER - Monitor idle time and trigger modal/logout
  useEffect(() => {
    if (!isAuthenticated || isLoggingOut) {
      // Clear timer when not authenticated
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    // Check idle time every second
    checkIntervalRef.current = window.setInterval(() => {
      const idleSeconds = idleTimer.getIdleTime();

      // Log every 30 seconds for debugging
      if (idleSeconds > 0 && idleSeconds % 30 === 0) {
        const minutes = Math.floor(idleSeconds / 60);
        logger.debug(`Idle: ${minutes}m ${idleSeconds % 60}s / ${SESSION_TIMEOUT / 60}m`);
      }

      // TIMEOUT EXCEEDED - Auto logout
      if (idleSeconds >= SESSION_TIMEOUT) {
        logger.warn(`⏰ Timeout reached (${idleSeconds}s) - logging out`);
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
        handleLogout();
        return;
      }

      // WARNING PERIOD - Show modal and countdown
      if (idleSeconds >= warningThreshold) {
        if (!showModal) {
          logger.warn(`⚠️ Warning threshold reached (${idleSeconds}s) - showing modal`);
          setShowModal(true);
        }
        // Update countdown
        const timeLeft = SESSION_TIMEOUT - idleSeconds;
        setRemaining(timeLeft);
      }
    }, 1000);

    logger.info('Idle monitoring started');

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, isLoggingOut, idleTimer, showModal, warningThreshold, handleLogout]);

  //  5. TAB VISIBILITY - Handle browser tab switching
  useEffect(() => {
    if (!isAuthenticated || isLoggingOut) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const idleSeconds = idleTimer.getIdleTime();
        const minutes = Math.floor(idleSeconds / 60);
        
        logger.info(` Tab visible - idle for ${minutes}m ${idleSeconds % 60}s`);

        // Session expired while away - immediate logout
        if (idleSeconds >= SESSION_TIMEOUT) {
          logger.warn('Session expired while on another tab - logging out');
          handleLogout();
          return;
        }

        // In warning period - show modal immediately
        if (idleSeconds >= warningThreshold && !showModal) {
          logger.warn('Warning period active - showing modal');
          setShowModal(true);
          setRemaining(SESSION_TIMEOUT - idleSeconds);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, isLoggingOut, idleTimer, showModal, warningThreshold, handleLogout]);

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
