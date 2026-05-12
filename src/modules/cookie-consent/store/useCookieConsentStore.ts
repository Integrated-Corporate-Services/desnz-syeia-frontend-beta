import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConsentDecision } from '../types';

interface CookieConsentState {
  hasPreference: boolean;
  analytics: ConsentDecision | null;
  monitoring: ConsentDecision | null;
  policyVersion: string;
  timestamp: number;
}

interface CookieConsentActions {
  setPreferences: (prefs: Omit<CookieConsentState, 'timestamp'>) => void;
  clearPreferences: () => void;
  getPreferences: () => CookieConsentState;
}

type CookieConsentStore = CookieConsentState & CookieConsentActions;

const INITIAL_STATE: CookieConsentState = {
  hasPreference: false,
  analytics: null,
  monitoring: null,
  policyVersion: '1.0',
  timestamp: 0,
};

/**
 * ⚠️ TEMPORARY STORE - TO BE REMOVED
 * 
 * This Zustand store with persist middleware is a temporary fallback.
 * Preferences are stored in localStorage key: 'cookie-consent-storage'
 * 
 * Once the backend API is enabled:
 * 1. Remove this file
 * 2. Remove consent-fallback.ts
 * 3. Update consent-api.ts to remove fallback logic
 * 
 * Search for "useCookieConsentStore" to find all usages when removing.
 */
export const useCookieConsentStore = create<CookieConsentStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setPreferences: (prefs) => {
        set({
          ...prefs,
          timestamp: Date.now(),
        });
      },

      clearPreferences: () => {
        set(INITIAL_STATE);
      },

      getPreferences: () => {
        const state = get();
        return {
          hasPreference: state.hasPreference,
          analytics: state.analytics,
          monitoring: state.monitoring,
          policyVersion: state.policyVersion,
          timestamp: state.timestamp,
        };
      },
    }),
    {
      name: 'cookie-consent-storage', // localStorage key
    }
  )
);
