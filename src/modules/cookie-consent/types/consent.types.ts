export type ConsentDecision = 'accepted' | 'rejected';

export interface ConsentPreferencesResponse {
  hasPreference: boolean;
  analytics: ConsentDecision | null;
  monitoring: ConsentDecision | null;
  policyVersion: string;
}

export interface UpdateConsentBody {
  analytics: ConsentDecision;
  monitoring: ConsentDecision;
}

export interface WithdrawResponse extends ConsentPreferencesResponse {
  cookiesToClear: string[];
}

export interface ConsentChangeCallback {
  (prefs: ConsentPreferencesResponse, source: 'banner' | 'settings_page' | 'withdrawal'): void;
}

export interface CatalogEntry {
  name: string;
  category: string;
  purpose: string;
  httpOnly: boolean;
  secure: string;
  sameSite: string;
  domain: string;
  maxAge: string;
  consentRequired: boolean;
  policyVersion: string;
}
