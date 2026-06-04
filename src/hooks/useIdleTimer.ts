/**
 * useIdleTimer - Pure idle detection hook
 * 
 * Tracks user inactivity (no keyboard/mouse interaction)
 * Does NOT handle session logic - just detects idle time
 */

import { useEffect, useRef, useCallback } from 'react';
import { createLogger } from '../utils/logger';

const logger = createLogger('useIdleTimer');

interface UseIdleTimerOptions {
  enabled: boolean;
  onIdle?: (idleSeconds: number) => void;
  onActive?: () => void;
  events?: string[];
}

interface UseIdleTimerReturn {
  getIdleTime: () => number;
  resetIdle: () => void;
  lastActivityTime: number;
}

/**
 * Hook to track user idle time
 * @param enabled - Whether idle tracking is active
 * @param onActive - Optional callback when user becomes active after idle
 * @param events - Events to track (default: click, keydown)
 */
export function useIdleTimer({
  enabled,
  onActive,
  events = ['click', 'keydown']
}: UseIdleTimerOptions): UseIdleTimerReturn {
  const lastActivityRef = useRef<number>(Date.now());
  const wasIdleRef = useRef<boolean>(false);

  // Get current idle time in seconds
  const getIdleTime = useCallback(() => {
    return Math.floor((Date.now() - lastActivityRef.current) / 1000);
  }, []);

  // Reset idle timer (mark user as active)
  const resetIdle = useCallback(() => {
    const wasIdle = wasIdleRef.current;
    const idleTime = getIdleTime();

    lastActivityRef.current = Date.now();
    wasIdleRef.current = false;

    // Call onActive callback if transitioning from idle to active
    if (wasIdle && onActive) {
      logger.debug(`User became active after ${idleTime}s idle`);
      onActive();
    }
  }, [getIdleTime, onActive]);

  // Activity event tracking
  useEffect(() => {
    if (!enabled) return;

    const handleActivity = () => {
      resetIdle();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    logger.info('Idle timer started', { events });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      logger.debug('Idle timer stopped');
    };
  }, [enabled, events, resetIdle]);

  return {
    getIdleTime,
    resetIdle,
    lastActivityTime: lastActivityRef.current
  };
}
