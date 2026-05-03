import { create } from 'zustand';
import { 
  CookiePreferences, 
  CookiePreferenceState 
} from '../types/cookies.types';
import {
  getCookiePreferences,
  saveCookiePreferences,
  acceptAllCookies as acceptAll,
  rejectNonEssentialCookies as rejectAll,
  initializeAnalytics,
  removeAnalyticsCookies
} from '../utils/cookieUtils';

interface CookiePreferencesStore extends CookiePreferenceState {
  acceptAllCookies: () => void;
  rejectNonEssentialCookies: () => void;
  updatePreferences: (preferences: Partial<CookiePreferences>) => void;
  hideBanner: () => void;
  showBanner: () => void;
  loadPreferences: () => void;
}

export const useCookiePreferencesStore = create<CookiePreferencesStore>((set, get) => ({
  preferences: {
    essential: true,
    analytics: false,
    functional: false,
    marketing: false
  },
  hasConsent: false,
  consentDate: null,
  bannerVisible: false,

  acceptAllCookies: () => {
    acceptAll();
    const newState = getCookiePreferences();
    set({
      ...newState,
      bannerVisible: false
    });
    
    if (newState.preferences.analytics) {
      initializeAnalytics();
    }
  },

  rejectNonEssentialCookies: () => {
    rejectAll();
    const newState = getCookiePreferences();
    set({
      ...newState,
      bannerVisible: false
    });
    
    removeAnalyticsCookies();
  },

  updatePreferences: (updates: Partial<CookiePreferences>) => {
    const { preferences } = get();
    const newPreferences = {
      ...preferences,
      ...updates,
      essential: true
    };
    
    saveCookiePreferences(newPreferences);
    const newState = getCookiePreferences();
    set({
      ...newState,
      bannerVisible: false
    });
    
    if (newPreferences.analytics) {
      initializeAnalytics();
    } else {
      removeAnalyticsCookies();
    }
  },

  hideBanner: () => set({ bannerVisible: false }),

  showBanner: () => set({ bannerVisible: true }),

  loadPreferences: () => {
    const state = getCookiePreferences();
    set(state);
    
    if (state.preferences.analytics && state.hasConsent) {
      initializeAnalytics();
    }
  }
}));
