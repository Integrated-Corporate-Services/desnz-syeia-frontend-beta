export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  functional?: boolean;
  marketing?: boolean;
}

export interface CookiePreferenceState {
  preferences: CookiePreferences;
  hasConsent: boolean;
  consentDate: Date | null;
  bannerVisible: boolean;
}

export interface CookieInfo {
  name: string;
  purpose: string;
  expiry: string;
  category: 'essential' | 'analytics' | 'functional' | 'marketing';
}
