import React, { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback, useMemo } from 'react';
import { logout } from '../services/authService';
import { useAuthUserContext } from './AuthUserContext';
import { createLogger } from '../utils/logger';
import { SESSION_TIMEOUT, SESSION_WARNING, SIGNED_OUT_PAGE } from '../constants/sessionTimeout';

const logger = createLogger('SessionTimeoutContext');
const SESSION_TERMINATION_STORAGE_KEY = 'syeia.session.termination';

type SessionTerminationReason =
  | 'SESSION_TIMEOUT'
  | 'SESSION_ABSOLUTE_TIMEOUT'
  | 'SESSION_EVICTED'
  | 'SESSION_GLOBAL_LOGOUT'
  | 'SESSION_BACKCHANNEL_LOGOUT';

interface SessionTimeoutContextType {
  showModal: boolean;
  remaining: number;
  resetTimer: () => void;
  handleLogout: () => Promise<void>;
}

const SessionTimeoutContext = createContext<SessionTimeoutContextType | undefined>(undefined);

export const SessionTimeoutProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuthUserContext();
  const [showModal, setShowModal] = useState(false);
  const [remaining, setRemaining] = useState(SESSION_WARNING);
  const timerRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isLoggingOutRef = useRef(false);

  // Derive auth state
  const isAuthenticated = !!user && !authLoading;

  const broadcastTermination = useCallback((reason: SessionTerminationReason) => {
    try {
      localStorage.setItem(
        SESSION_TERMINATION_STORAGE_KEY,
        JSON.stringify({ reason, at: Date.now() })
      );
    } catch (error) {
      logger.warn('Unable to broadcast cross-tab termination event', error);
    }
  }, []);

  const redirectToSignedOut = useCallback((reason: SessionTerminationReason) => {
    window.location.assign(`/frontend/signed-out?reason=${encodeURIComponent(reason)}`);
  }, []);

  // Log configuration on mount
  useEffect(() => {
    logger.info(`Session timeout initialized: Idle timeout = ${SESSION_TIMEOUT}s (${SESSION_TIMEOUT / 60} min), Warning period = ${SESSION_WARNING}s (${SESSION_WARNING / 60} min)`);
    logger.info(`Modal will show at ${SESSION_TIMEOUT - SESSION_WARNING}s (${(SESSION_TIMEOUT - SESSION_WARNING) / 60} min of idle time)`);
  }, []); // Empty deps - only log once on mount

  // Reset modal state when user becomes unauthenticated
  // This ensures modal doesn't show on landing page or after logout
  useEffect(() => {
    if (!isAuthenticated) {
      logger.debug('User not authenticated - resetting modal state');
      setShowModal(false);
      setRemaining(SESSION_WARNING);
      isLoggingOutRef.current = false;
    }
  }, [isAuthenticated]);

  // Reset timer on user activity
  const resetTimer = useCallback(() => {
    if (isLoggingOutRef.current) return; // Don't reset if we're logging out
    
    const now = Date.now();
    const wasIdleFor = Math.floor((now - lastActivityRef.current) / 1000);
    
    // Get stack trace to understand WHO is calling resetTimer
    const stack = new Error().stack;
    const caller = stack?.split('\n')[2]?.trim() || 'unknown';
    
    lastActivityRef.current = now;
    setShowModal(false);
    setRemaining(SESSION_WARNING);
    
    if (wasIdleFor > 5) { // Log resets after 5+ seconds idle (lowered from 10)
      logger.info(`TIMER RESET - Idle for ${wasIdleFor}s (${Math.floor(wasIdleFor / 60)}m) | Caller: ${caller}`);
    }
  }, []);

  // Logout logic
  const handleLogout = useCallback(async () => {
    if (isLoggingOutRef.current) return; // Prevent multiple logout calls
    
    isLoggingOutRef.current = true;
    logger.warn('Session timeout - Logging out user');
    broadcastTermination('SESSION_TIMEOUT');
    
    try {
      await logout(`${SIGNED_OUT_PAGE}?reason=SESSION_TIMEOUT`);
    } catch (err) {
      logger.error('Logout error:', err);
      window.location.href = `${SIGNED_OUT_PAGE}?reason=SESSION_TIMEOUT`;
    }
  }, [broadcastTermination]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== SESSION_TERMINATION_STORAGE_KEY || !event.newValue) {
        return;
      }

      try {
        const payload = JSON.parse(event.newValue) as { reason?: SessionTerminationReason };
        if (payload.reason) {
          logger.warn('Cross-tab session termination detected', { reason: payload.reason });
          redirectToSignedOut(payload.reason);
        }
      } catch (error) {
        logger.error('Failed to parse cross-tab termination payload', error);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [redirectToSignedOut]);

  // Activity tracking - only track meaningful user interactions (not mousemove/scroll)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Only track deliberate actions: clicks and keypresses (not passive mousemove/scroll)
    const events = ['click', 'keydown'];
    
    const handleActivity = (event: Event) => {
      if (showModal) {
        // When modal is showing, ignore activity - user must use modal buttons
        return;
      }
      
      // Log what triggered the activity reset to help debug unexpected resets
      const target = event.target as HTMLElement;
      const eventType = event.type;
      const targetInfo = target?.tagName || 'unknown';
      const targetId = target?.id || '';
      const targetClass = target?.className || '';
      
      logger.debug(`Activity: ${eventType} on ${targetInfo}${targetId ? '#'+targetId : ''}${targetClass ? '.'+targetClass.split(' ')[0] : ''}`);
      
      resetTimer();
    };
    
    events.forEach(e => window.addEventListener(e, handleActivity));
    
    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
    };
  }, [isAuthenticated, showModal, resetTimer]);

  // Check for expired session when user returns to tab
  // WHY: Browser throttles timers on hidden tabs, so logout may not trigger at exactly 30min
  // FIX: When tab becomes visible, immediately check if session expired and logout if needed
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const now = Date.now();
        const idleSeconds = Math.floor((now - lastActivityRef.current) / 1000);
        const idleMinutes = Math.floor(idleSeconds / 60);
        const modalShowTime = SESSION_TIMEOUT - SESSION_WARNING;

        logger.info(`Tab visible - checking session: idle ${idleMinutes}m ${idleSeconds % 60}s`);

        // If session expired while on another tab, logout immediately
        if (idleSeconds >= SESSION_TIMEOUT) {
          logger.warn(`Session expired while on another tab (idle ${idleMinutes}m) - logging out`);
          handleLogout();
        }
        // If in warning period, show modal immediately
        else if (idleSeconds >= modalShowTime && !showModal) {
          logger.warn(`Warning period reached while on another tab - showing modal`);
          setShowModal(true);
          setRemaining(SESSION_TIMEOUT - idleSeconds);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, showModal, handleLogout]);

  // Main timer loop - runs every second
  useEffect(() => {
    if (!isAuthenticated) {
      logger.info('User not authenticated - timer stopped');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    logger.info(' Session timer STARTED');
    lastActivityRef.current = Date.now();
    
    timerRef.current = window.setInterval(() => {
      const now = Date.now();
      const idleSeconds = Math.floor((now - lastActivityRef.current) / 1000);
      const idleMinutes = Math.floor(idleSeconds / 60);
      const modalShowTime = SESSION_TIMEOUT - SESSION_WARNING;
      
      // Log every 30 seconds for debugging
      if (idleSeconds % 30 === 0) {
        logger.info(`Idle: ${idleMinutes}m ${idleSeconds % 60}s / ${SESSION_TIMEOUT / 60}m | Modal at: ${modalShowTime / 60}m`);
      }
      
      // Show modal when reaching warning threshold (28 minutes by default)
      if (idleSeconds >= modalShowTime && idleSeconds < SESSION_TIMEOUT) {
        if (!showModal) {
          logger.warn(`SHOWING TIMEOUT MODAL - Idle for ${idleMinutes}m ${idleSeconds % 60}s`);
          setShowModal(true);
        }
        // Update countdown
        const timeLeft = SESSION_TIMEOUT - idleSeconds;
        setRemaining(timeLeft);
      }
      // Auto logout when timeout reached (30 minutes by default)
      else if (idleSeconds >= SESSION_TIMEOUT) {
        logger.warn(`AUTO LOGOUT - Idle time exceeded ${SESSION_TIMEOUT}s`);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        handleLogout();
      }
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isAuthenticated, showModal, handleLogout]);

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