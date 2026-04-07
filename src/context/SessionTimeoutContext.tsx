import React, { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback, useMemo } from 'react';
import { logout } from '../services/authService';
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

const TIMEOUT = 30 * 60; // 30 min in seconds
const WARNING = 2 * 60; // 2 min warning in seconds

export const SessionTimeoutProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuthUserContext();
  const [showModal, setShowModal] = useState(false);
  const [remaining, setRemaining] = useState(WARNING);
  const timerRef = useRef<number | null>(null);
  const idleRef = useRef<number>(0);
  const isAuthenticatedRef = useRef(false);
  const ignoreEventsRef = useRef<boolean>(false); // Flag to ignore passive events after tab switch
  const showModalRef = useRef<boolean>(false); // Track modal state in ref

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

  // Track modal state in ref to avoid stale closures
  useEffect(() => {
    showModalRef.current = showModal;
  }, [showModal]);

  // Reset timer on user activity - memoized
  const resetTimer = useCallback(() => {
    const previousIdleTime = idleRef.current;
    idleRef.current = 0;
    setShowModal(false);
    setRemaining(WARNING);
    
    // Log resets to help debug if timer is being reset too frequently
    if (previousIdleTime > 30) { // Only log if we were idle for more than 30 seconds
      logger.info(`Timer RESET - was idle for ${previousIdleTime}s (${Math.floor(previousIdleTime / 60)}min ${previousIdleTime % 60}s)`);
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
    
    // Only track genuine user interactions, not passive events
    const events = ['mousedown', 'keydown', 'click', 'touchstart'];
    const activity = (event: Event) => {
      // Ignore events temporarily after tab visibility changes
      if (ignoreEventsRef.current) {
        logger.debug(`Activity detected (${event.type}) but ignoring due to recent tab switch`);
        return;
      }

      // When modal is showing, ignore all general activity
      // Only allow modal button handlers to control the session
      if (showModalRef.current) {
        logger.debug('Activity detected but modal is showing - ignoring');
        return; // Don't reset timer - let user choose via modal buttons
      }
      
      // Normal activity tracking when modal is not showing
      if (idleRef.current > 0) { // Only log if we've been tracking
        logger.debug(` Activity detected (${event.type}) - timer will reset. Was idle for ${idleRef.current}s`);
      }
      resetTimer();
    };
    events.forEach(e => window.addEventListener(e, activity));
    return () => events.forEach(e => window.removeEventListener(e, activity));
  }, [isAuthenticated, resetTimer]);

  // Check session state - extracted for reuse
  const checkSessionState = useCallback(() => {
    const currentIdle = idleRef.current;
    
    if (currentIdle >= TIMEOUT) {
      logger.warn(`SESSION TIMEOUT - Logging out automatically after ${currentIdle}s of inactivity`);
      setShowModal(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      handleLogout();
    } else if (currentIdle >= TIMEOUT - WARNING) {
      if (!showModalRef.current) {
        logger.warn(`SHOWING SESSION TIMEOUT MODAL - Idle for ${currentIdle}s`);
        setShowModal(true);
      }
      setRemaining(TIMEOUT - currentIdle);
    }
  }, [handleLogout]);

  // Handle page visibility changes (tab switching)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        logger.info(` Tab became VISIBLE - checking session state (idle: ${idleRef.current}s)`);
        
        // Ignore passive events for 500ms after tab becomes visible
        // This prevents scroll/focus events from resetting the timer
        ignoreEventsRef.current = true;
        setTimeout(() => {
          ignoreEventsRef.current = false;
          logger.debug('Now accepting user activity events');
        }, 500);
        
        // Immediately check if we should show modal or logout
        checkSessionState();
      } else {
        logger.info(` Tab became HIDDEN - timer continues in background (idle: ${idleRef.current}s)`);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, checkSessionState]);

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

    logger.info(' Timer STARTED - user authenticated');
    logger.info(`Session timeout configuration: Total timeout = ${TIMEOUT}s (${TIMEOUT / 60} min), Warning = ${WARNING}s (${WARNING / 60} min), Modal shows at ${TIMEOUT - WARNING}s`);
    
    timerRef.current = window.setInterval(() => {
      idleRef.current += 1;
      
      // Log every 10 seconds for debugging
      if (idleRef.current % 10 === 0) {
        const visibilityStatus = document.visibilityState === 'visible' ? '👁️  Page Visible' : '🙈 Page Hidden';
        logger.info(`${visibilityStatus} | Idle: ${idleRef.current}s / ${TIMEOUT}s (${Math.floor(idleRef.current / 60)}m ${idleRef.current % 60}s) - Modal at ${TIMEOUT - WARNING}s`);
      }
      
      // Check session state
      checkSessionState();
    }, 1000);
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [isAuthenticated, checkSessionState]);

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