import { create } from 'zustand';
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
export const useCookieConsentStore = create<CookieConsentStore>((set, get) => ({
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
}));
