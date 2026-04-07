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

const TIMEOUT = 3 * 60; // 30 min in seconds
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
    const previousIdleTime = idleRef.current;
    idleRef.current = 0;
    setShowModal(false);
    setRemaining(WARNING);
    
    // Log resets to help debug if timer is being reset too frequently
    if (previousIdleTime > 30) { // Only log if we were idle for more than 30 seconds
      logger.info(`⏮️ Timer RESET - was idle for ${previousIdleTime}s (${Math.floor(previousIdleTime / 60)}min ${previousIdleTime % 60}s)`);
    }
  }, []);

  // Logout logic - memoized and properly async
  const handleLogout = useCallback(async () => {
    try {
      logger.info('Starting session timeout logout process...');
      // Use logout to destroy session and redirect to signed-out page
      await logout('/frontend/signed-out');
     
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
        logger.debug('Activity detected but modal is showing - ignoring');
        return; // Don't reset timer - let user choose via modal buttons
      }
      
      // Normal activity tracking when modal is not showing
      if (idleRef.current > 0) { // Only log if we've been tracking
        logger.debug(`🖱️ Activity detected (${event.type}) - timer will reset. Was idle for ${idleRef.current}s`);
      }
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
    logger.info(`Session timeout configuration: Total timeout = ${TIMEOUT}s (${TIMEOUT / 60} min), Warning = ${WARNING}s (${WARNING / 60} min), Modal shows at ${TIMEOUT - WARNING}s`);
    
    timerRef.current = window.setInterval(() => {
      idleRef.current += 1;
      
      // More frequent logging for debugging (every 5 seconds instead of 10)
      if (idleRef.current % 5 === 0) {
        logger.info(`⏱️ Idle time: ${idleRef.current}s / ${TIMEOUT}s (${Math.floor(idleRef.current / 60)}min ${idleRef.current % 60}s) - Modal shows at ${TIMEOUT - WARNING}s (${Math.floor((TIMEOUT - WARNING) / 60)} min)`);
      }
      
      if (idleRef.current >= TIMEOUT - WARNING && idleRef.current < TIMEOUT) {
        if (!showModal) {
          logger.warn(`🚨 SHOWING SESSION TIMEOUT MODAL - Idle for ${idleRef.current}s`);
          setShowModal(true);
        }
        setRemaining(TIMEOUT - idleRef.current);
      } else if (idleRef.current >= TIMEOUT) {
        logger.warn(`🚨 SESSION TIMEOUT - Logging out automatically after ${idleRef.current}s of inactivity`);
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