import { SIGNED_OUT_PAGE } from '../../constants/sessionTimeout';
import { SESSION_TERMINATION_STORAGE_KEY } from './constants';
import type { SessionTerminationReason } from './types';

export function broadcastTermination(reason: SessionTerminationReason): void {
  localStorage.setItem(
    SESSION_TERMINATION_STORAGE_KEY,
    JSON.stringify({ reason, at: Date.now() })
  );
}

export function redirectToSignedOut(reason: SessionTerminationReason): void {
  window.location.assign(`${SIGNED_OUT_PAGE}?reason=${encodeURIComponent(reason)}`);
}

export function getStorageTerminationReason(newValue: string): SessionTerminationReason | undefined {
  const payload = JSON.parse(newValue) as { reason?: SessionTerminationReason };
  return payload.reason;
}
