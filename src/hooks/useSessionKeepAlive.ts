import { useEffect, useRef, useCallback, MutableRefObject } from 'react';
import { createLogger } from '../utils/logger';
import { keepSessionAlive } from '../services/authService';

const logger = createLogger('useSessionKeepAlive');

interface UseSessionKeepAliveOptions {
  isAuthenticated: boolean;
  lastActivityRef: MutableRefObject<number>;
  isLoggingOutRef: MutableRefObject<boolean>;
  pingIntervalSeconds?: number;
  activityThresholdSeconds?: number;
}

export function useSessionKeepAlive({
  isAuthenticated,
  lastActivityRef,
  isLoggingOutRef,
  pingIntervalSeconds = 45,
  activityThresholdSeconds = 300
}: UseSessionKeepAliveOptions): void {
  const lastPingRef = useRef<number>(Date.now());
  const isPingingRef = useRef<boolean>(false);

  // Session keep-alive ping to prevent backend session expiry
  const pingSession = useCallback(async () => {
    if (!isAuthenticated || isLoggingOutRef.current || isPingingRef.current) return;

    isPingingRef.current = true;
    const now = Date.now();
    const timeSinceLastPing = Math.floor((now - lastPingRef.current) / 1000);

    if (timeSinceLastPing < 40) {
      isPingingRef.current = false;
      logger.debug(`Skipping ping - only ${timeSinceLastPing}s since last ping`);
      return;
    }

    try {
      const success = await keepSessionAlive();

      if (success) {
        lastPingRef.current = now;
        logger.info('Session keep-alive ping successful', {
          timeSinceLastPing: `${Math.floor(timeSinceLastPing / 60)}m ${timeSinceLastPing % 60}s`
        });
      } else {
        logger.warn('Session keep-alive ping failed - session may have expired');
        }
    } finally {
      isPingingRef.current = false;
    }
  }, [isAuthenticated, isLoggingOutRef]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const keepAliveInterval = setInterval(() => {
      const now = Date.now();
      const idleSeconds = Math.floor((now - lastActivityRef.current) / 1000);
      
      // Decision point: Should we ping?
      if (idleSeconds < activityThresholdSeconds) {
        // User is "recently active" → Keep session alive
        logger.debug(`User active (idle ${idleSeconds}s) - sending keep-alive ping`);
        pingSession();
      } else {
        // User is "truly idle" → Stop pinging to allow security timeout
        logger.debug(`User truly idle (${Math.floor(idleSeconds / 60)}m) - skipping ping to allow timeout`);
      }
    }, pingIntervalSeconds * 1000);

    logger.info(`Session keep-alive started (${pingIntervalSeconds}-second intervals for ALB compatibility)`);

    return () => {
      clearInterval(keepAliveInterval);
    };
  }, [isAuthenticated, pingSession, lastActivityRef, pingIntervalSeconds, activityThresholdSeconds]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const now = Date.now();
        const idleSeconds = Math.floor((now - lastActivityRef.current) / 1000);
        
        logger.info(`Page visible - idle for ${Math.floor(idleSeconds / 60)}m ${idleSeconds % 60}s`);
        
        if (idleSeconds < activityThresholdSeconds) {
          logger.info('User was recently active - sending keep-alive ping after tab return');
          pingSession();
        } else {
          logger.info(`User idle for ${Math.floor(idleSeconds / 60)}m - skipping ping to allow timeout warning`);
        }
      } else {
        logger.debug('Page hidden - session keep-alive paused');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, pingSession, lastActivityRef, activityThresholdSeconds]);
}