import { CookiePreferences, CookiePreferenceState } from '../types/cookies.types';
import { 
  COOKIE_PREFERENCES_KEY, 
  COOKIE_CONSENT_EXPIRY,
  DEFAULT_COOKIE_PREFERENCES 
} from '../constants/cookieConstants';

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(
  name: string, 
  value: string, 
  maxAge: number = COOKIE_CONSENT_EXPIRY,
  path: string = '/'
): void {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=${path}; SameSite=Lax; Secure`;
}

export function deleteCookie(name: string, path: string = '/'): void {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${name}=; max-age=0; path=${path}`;
}

export function getCookiePreferences(): CookiePreferenceState {
  const stored = getCookie(COOKIE_PREFERENCES_KEY);
  
  if (!stored) {
    return {
      preferences: DEFAULT_COOKIE_PREFERENCES,
      hasConsent: false,
      consentDate: null,
      bannerVisible: true
    };
  }
  
  try {
    const parsed = JSON.parse(stored);
    return {
      preferences: {
        essential: true,
        analytics: parsed.analytics ?? false,
        functional: parsed.functional ?? false,
        marketing: parsed.marketing ?? false
      },
      hasConsent: true,
      consentDate: parsed.consentDate ? new Date(parsed.consentDate) : null,
      bannerVisible: false
    };
  } catch (error) {
    console.error('Failed to parse cookie preferences:', error);
    return {
      preferences: DEFAULT_COOKIE_PREFERENCES,
      hasConsent: false,
      consentDate: null,
      bannerVisible: true
    };
  }
}

export function saveCookiePreferences(preferences: CookiePreferences): void {
  const data = {
    ...preferences,
    essential: true,
    consentDate: new Date().toISOString()
  };
  
  setCookie(COOKIE_PREFERENCES_KEY, JSON.stringify(data), COOKIE_CONSENT_EXPIRY);
}

export function acceptAllCookies(): void {
  saveCookiePreferences({
    essential: true,
    analytics: true,
    functional: true,
    marketing: true
  });
}

export function rejectNonEssentialCookies(): void {
  saveCookiePreferences(DEFAULT_COOKIE_PREFERENCES);
}

export function areAnalyticsEnabled(): boolean {
  const { preferences } = getCookiePreferences();
  return preferences.analytics;
}

export function initializeAnalytics(): void {
  if (!areAnalyticsEnabled()) return;
  console.log('[Cookie Utils] Analytics would be initialized here (not yet implemented)');
}

export function removeAnalyticsCookies(): void {
  deleteCookie('_ga');
  deleteCookie('_gid');
  deleteCookie('_gat');
  
  const domain = window.location.hostname;
  deleteCookie('_ga', `/; domain=${domain}`);
  deleteCookie('_gid', `/; domain=${domain}`);
  deleteCookie('_gat', `/; domain=${domain}`);
}
