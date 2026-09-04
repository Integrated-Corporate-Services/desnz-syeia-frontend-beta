import { useCallback, useEffect, useRef, useState } from 'react';
import { logout } from '../../services/auth/logoutService';
import { createLogger } from '../../utils/logger';
import { SESSION_WARNING, SIGNED_OUT_PAGE } from '../../constants/sessionTimeout';
import { broadcastTermination } from './utils';
import type { SessionTerminationReason } from './types';

const logger = createLogger('SessionTimeoutState');

interface UseSessionTimeoutStateParams {
  isAuthenticated: boolean;
}

export interface SessionTimeoutRuntimeState {
  showModal: boolean;
  remaining: number;
  timerRef: React.MutableRefObject<number | null>;
  lastActivityRef: React.MutableRefObject<number>;
  showModalRef: React.MutableRefObject<boolean>;
  handleLogout: () => Promise<void>;
  resetTimer: () => void;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  setRemaining: React.Dispatch<React.SetStateAction<number>>;
}

export function useSessionTimeoutState({
  isAuthenticated,
}: UseSessionTimeoutStateParams): SessionTimeoutRuntimeState {
  const [showModal, setShowModal] = useState(false);
  const [remaining, setRemaining] = useState(SESSION_WARNING);

  const timerRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isLoggingOutRef = useRef(false);
  const showModalRef = useRef(false);

  const safeBroadcastTermination = useCallback((reason: SessionTerminationReason) => {
    try {
      broadcastTermination(reason);
    } catch (error) {
      logger.warn('Unable to broadcast cross-tab termination event', error);
    }
  }, []);

  useEffect(() => {
    showModalRef.current = showModal;
  }, [showModal]);

  useEffect(() => {
    if (!isAuthenticated) {
      logger.debug('User not authenticated - resetting modal state');
      setShowModal(false);
      setRemaining(SESSION_WARNING);
      isLoggingOutRef.current = false;
    }
  }, [isAuthenticated]);

  const resetTimer = useCallback(() => {
    if (isLoggingOutRef.current) return;

    const now = Date.now();
    const wasIdleFor = Math.floor((now - lastActivityRef.current) / 1000);
    const stack = new Error().stack;
    const caller = stack?.split('\n')[2]?.trim() || 'unknown';

    lastActivityRef.current = now;
    setShowModal(false);
    setRemaining(SESSION_WARNING);

    if (wasIdleFor > 5) {
      logger.info(`TIMER RESET - Idle for ${wasIdleFor}s (${Math.floor(wasIdleFor / 60)}m) | Caller: ${caller}`);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    if (isLoggingOutRef.current) return;

    isLoggingOutRef.current = true;
    logger.warn('Session timeout - Logging out user');
    safeBroadcastTermination('SESSION_TIMEOUT');

    try {
      await logout(`${SIGNED_OUT_PAGE}?reason=SESSION_TIMEOUT`);
    } catch (err) {
      logger.error('Logout error:', err);
      window.location.href = `${SIGNED_OUT_PAGE}?reason=SESSION_TIMEOUT`;
    }
  }, [safeBroadcastTermination]);

  return {
    showModal,
    remaining,
    timerRef,
    lastActivityRef,
    showModalRef,
    handleLogout,
    resetTimer,
    setShowModal,
    setRemaining,
  };
}
