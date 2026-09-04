import { useMemo } from 'react';
import type { SessionTimeoutContextType } from './types';
import { useSessionTimeoutState } from './useSessionTimeoutState';
import {
  useSessionTimeoutActivityEffect,
  useSessionTimeoutCrossTabEffect,
  useSessionTimeoutInitializationEffect,
  useSessionTimeoutTimerEffect,
  useSessionTimeoutVisibilityEffect,
} from './useSessionTimeoutEffects';

interface UseSessionTimeoutManagerParams {
  isAuthenticated: boolean;
}

export function useSessionTimeoutManager({
  isAuthenticated,
}: UseSessionTimeoutManagerParams): SessionTimeoutContextType {
  const runtime = useSessionTimeoutState({ isAuthenticated });

  useSessionTimeoutInitializationEffect();
  useSessionTimeoutCrossTabEffect();
  useSessionTimeoutActivityEffect({
    isAuthenticated,
    showModal: runtime.showModal,
    resetTimer: runtime.resetTimer,
  });
  useSessionTimeoutVisibilityEffect({
    isAuthenticated,
    lastActivityRef: runtime.lastActivityRef,
    showModalRef: runtime.showModalRef,
    setShowModal: runtime.setShowModal,
    setRemaining: runtime.setRemaining,
    handleLogout: runtime.handleLogout,
  });
  useSessionTimeoutTimerEffect({
    isAuthenticated,
    timerRef: runtime.timerRef,
    lastActivityRef: runtime.lastActivityRef,
    showModalRef: runtime.showModalRef,
    setShowModal: runtime.setShowModal,
    setRemaining: runtime.setRemaining,
    handleLogout: runtime.handleLogout,
  });

  return useMemo(
    () => ({
      showModal: runtime.showModal,
      remaining: runtime.remaining,
      resetTimer: runtime.resetTimer,
      handleLogout: runtime.handleLogout,
    }),
    [runtime.showModal, runtime.remaining, runtime.resetTimer, runtime.handleLogout]
  );
}
