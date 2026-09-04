import { useEffect } from 'react';
import { createLogger } from '../../utils/logger';
import { SESSION_TIMEOUT, SESSION_WARNING } from '../../constants/sessionTimeout';
import { SESSION_TERMINATION_STORAGE_KEY } from './constants';
import { getStorageTerminationReason, redirectToSignedOut } from './utils';

const logger = createLogger('SessionTimeoutEffects');

interface SessionTimeoutEffectSharedParams {
  isAuthenticated: boolean;
}

interface SessionTimeoutActivityEffectParams extends SessionTimeoutEffectSharedParams {
  showModal: boolean;
  resetTimer: () => void;
}

interface SessionTimeoutVisibilityEffectParams extends SessionTimeoutEffectSharedParams {
  lastActivityRef: React.MutableRefObject<number>;
  showModalRef: React.MutableRefObject<boolean>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  setRemaining: React.Dispatch<React.SetStateAction<number>>;
  handleLogout: () => Promise<void>;
}

interface SessionTimeoutTimerEffectParams extends SessionTimeoutEffectSharedParams {
  timerRef: React.MutableRefObject<number | null>;
  lastActivityRef: React.MutableRefObject<number>;
  showModalRef: React.MutableRefObject<boolean>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  setRemaining: React.Dispatch<React.SetStateAction<number>>;
  handleLogout: () => Promise<void>;
}

export function useSessionTimeoutInitializationEffect(): void {
  useEffect(() => {
    logger.info(
      `Session timeout initialized: Idle timeout = ${SESSION_TIMEOUT}s (${SESSION_TIMEOUT / 60} min), Warning period = ${SESSION_WARNING}s (${SESSION_WARNING / 60} min)`
    );
    logger.info(
      `Modal will show at ${SESSION_TIMEOUT - SESSION_WARNING}s (${(SESSION_TIMEOUT - SESSION_WARNING) / 60} min of idle time)`
    );
  }, []);
}

export function useSessionTimeoutCrossTabEffect(): void {
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== SESSION_TERMINATION_STORAGE_KEY || !event.newValue) {
        return;
      }

      try {
        const reason = getStorageTerminationReason(event.newValue);
        if (reason) {
          logger.warn('Cross-tab session termination detected', { reason });
          redirectToSignedOut(reason);
        }
      } catch (error) {
        logger.error('Failed to parse cross-tab termination payload', error);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
}

export function useSessionTimeoutActivityEffect({
  isAuthenticated,
  showModal,
  resetTimer,
}: SessionTimeoutActivityEffectParams): void {
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['click', 'keydown'];

    const handleActivity = (event: Event) => {
      if (showModal) {
        return;
      }

      const target = event.target as HTMLElement;
      const eventType = event.type;
      const targetInfo = target?.tagName || 'unknown';
      const targetId = target?.id || '';
      const targetClass = target?.className || '';

      logger.debug(
        `Activity: ${eventType} on ${targetInfo}${targetId ? '#' + targetId : ''}${targetClass ? '.' + targetClass.split(' ')[0] : ''}`
      );

      resetTimer();
    };

    events.forEach((evt) => window.addEventListener(evt, handleActivity));
    return () => events.forEach((evt) => window.removeEventListener(evt, handleActivity));
  }, [isAuthenticated, showModal, resetTimer]);
}

export function useSessionTimeoutVisibilityEffect({
  isAuthenticated,
  lastActivityRef,
  showModalRef,
  setShowModal,
  setRemaining,
  handleLogout,
}: SessionTimeoutVisibilityEffectParams): void {
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const now = Date.now();
        const idleSeconds = Math.floor((now - lastActivityRef.current) / 1000);
        const idleMinutes = Math.floor(idleSeconds / 60);
        const modalShowTime = SESSION_TIMEOUT - SESSION_WARNING;

        logger.info(`Tab visible - checking session: idle ${idleMinutes}m ${idleSeconds % 60}s`);

        if (idleSeconds >= SESSION_TIMEOUT) {
          logger.warn(`Session expired while on another tab (idle ${idleMinutes}m) - logging out`);
          handleLogout().catch((err) => {
            logger.error('Logout failed during visibility change:', err);
          });
        } else if (idleSeconds >= modalShowTime && !showModalRef.current) {
          logger.warn('Warning period reached while on another tab - showing modal');
          setShowModal(true);
          setRemaining(SESSION_TIMEOUT - idleSeconds);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, lastActivityRef, showModalRef, setShowModal, setRemaining, handleLogout]);
}

export function useSessionTimeoutTimerEffect({
  isAuthenticated,
  timerRef,
  lastActivityRef,
  showModalRef,
  setShowModal,
  setRemaining,
  handleLogout,
}: SessionTimeoutTimerEffectParams): void {
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

      if (idleSeconds % 30 === 0) {
        logger.info(`Idle: ${idleMinutes}m ${idleSeconds % 60}s / ${SESSION_TIMEOUT / 60}m | Modal at: ${modalShowTime / 60}m`);
      }

      if (idleSeconds >= modalShowTime && idleSeconds < SESSION_TIMEOUT) {
        if (!showModalRef.current) {
          logger.warn(`SHOWING TIMEOUT MODAL - Idle for ${idleMinutes}m ${idleSeconds % 60}s`);
          setShowModal(true);
        }
        setRemaining(SESSION_TIMEOUT - idleSeconds);
      } else if (idleSeconds >= SESSION_TIMEOUT) {
        logger.warn(`AUTO LOGOUT - Idle time exceeded ${SESSION_TIMEOUT}s`);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        handleLogout().catch((err) => {
          logger.error('Auto logout failed:', err);
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isAuthenticated, timerRef, lastActivityRef, showModalRef, setShowModal, setRemaining, handleLogout]);
}
