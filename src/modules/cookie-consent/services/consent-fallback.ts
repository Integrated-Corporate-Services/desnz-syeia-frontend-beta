import { useCookieConsentStore } from '../store/useCookieConsentStore';
import type {
  CatalogEntry,
  ConsentPreferencesResponse,
  UpdateConsentBody,
  WithdrawResponse,
} from '../types';

const POLICY_VERSION = '1.0';

/**
 * Mock catalog data for development when API is unavailable
 * This matches the expected structure from the backend
 */
const MOCK_CATALOG: CatalogEntry[] = [
  {
    name: 'session',
    category: 'essential',
    purpose: 'Session authentication and security',
    httpOnly: true,
    secure: 'true',
    sameSite: 'Lax',
    domain: window.location.hostname,
    maxAge: '2 hours',
    consentRequired: false,
    policyVersion: POLICY_VERSION,
  },
  {
    name: 'csrf_token',
    category: 'essential',
    purpose: 'Cross-Site Request Forgery protection',
    httpOnly: true,
    secure: 'true',
    sameSite: 'Strict',
    domain: window.location.hostname,
    maxAge: '2 hours',
    consentRequired: false,
    policyVersion: POLICY_VERSION,
  },
  {
    name: '_ga',
    category: 'analytics',
    purpose: 'Google Analytics - distinguishes users',
    httpOnly: false,
    secure: 'true',
    sameSite: 'Lax',
    domain: window.location.hostname,
    maxAge: '2 years',
    consentRequired: true,
    policyVersion: POLICY_VERSION,
  },
  {
    name: '_ga_*',
    category: 'analytics',
    purpose: 'Google Analytics - maintains session state',
    httpOnly: false,
    secure: 'true',
    sameSite: 'Lax',
    domain: window.location.hostname,
    maxAge: '2 years',
    consentRequired: true,
    policyVersion: POLICY_VERSION,
  },
  {
    name: '_gid',
    category: 'analytics',
    purpose: 'Google Analytics - distinguishes users',
    httpOnly: false,
    secure: 'true',
    sameSite: 'Lax',
    domain: window.location.hostname,
    maxAge: '24 hours',
    consentRequired: true,
    policyVersion: POLICY_VERSION,
  },
];

/**
 * Fallback consent API implementation using Zustand store
 * This provides the same interface as the real API for seamless integration
 */
export const consentFallback = {
  /**
   * Get user preferences from Zustand store
   */
  getPreferences: async (): Promise<ConsentPreferencesResponse> => {
    // Simulate network delay for realistic behavior
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const stored = useCookieConsentStore.getState().getPreferences();
    
    // If store has valid preferences, return them
    if (stored.hasPreference) {
      return {
        hasPreference: stored.hasPreference,
        analytics: stored.analytics,
        monitoring: stored.monitoring,
        policyVersion: stored.policyVersion,
      };
    }
    
    // No stored preferences - return defaults
    return {
      hasPreference: false,
      analytics: null,
      monitoring: null,
      policyVersion: POLICY_VERSION,
    };
  },

  /**
   * Save user preferences to Zustand store
   */
  setPreferences: async (body: UpdateConsentBody): Promise<ConsentPreferencesResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const prefs: ConsentPreferencesResponse = {
      hasPreference: true,
      analytics: body.analytics,
      monitoring: body.monitoring,
      policyVersion: POLICY_VERSION,
    };
    
    useCookieConsentStore.getState().setPreferences(prefs);
    return prefs;
  },

  /**
   * Withdraw consent and clear stored preferences
   */
  withdraw: async (): Promise<WithdrawResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    useCookieConsentStore.getState().clearPreferences();
    
    // List of cookies to clear (non-essential cookies)
    const cookiesToClear = [
      '_ga',
      '_gid',
      '_gat',
      '_ga_*',
    ];
    
    return {
      hasPreference: false,
      analytics: null,
      monitoring: null,
      policyVersion: POLICY_VERSION,
      cookiesToClear,
    };
  },

  /**
   * Get cookie catalog (mock data when API unavailable)
   */
  getCatalog: async (): Promise<{ cookies: CatalogEntry[] }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      cookies: MOCK_CATALOG,
    };
  },
};
