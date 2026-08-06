import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { consentApi } from '../services/consent-api';
import { clearNonEssentialCookies } from '../utils';
import {
  loadAnalytics,
  loadMonitoring,
  stopAnalytics,
  stopMonitoring,
} from '../services/telemetry';
import type {
  ConsentChangeCallback,
  ConsentDecision,
  ConsentPreferencesResponse,
  UpdateConsentBody,
} from '../types';

interface ConsentState {
  loading: boolean;
  hasPreference: boolean;
  analytics: ConsentDecision | null;
  monitoring: ConsentDecision | null;
  policyVersion: string;
  showBanner: boolean;
  initError: string | null;
}

export interface ConsentActions {
  acceptAll: () => Promise<void>;
  rejectAll: () => Promise<void>;
  updatePreferences: (body: UpdateConsentBody) => Promise<void>;
  withdraw: () => Promise<void>;
}

export type ConsentContextValue = ConsentState & ConsentActions;

const ConsentContext = createContext<ConsentContextValue | null>(null);

function syncTelemetry(prefs: ConsentPreferencesResponse): void {
  if (prefs.decisions.analytics === 'accepted') {
    loadAnalytics();
  } else {
    stopAnalytics();
  }
  if (prefs.decisions.monitoring === 'accepted') {
    loadMonitoring();
  } else {
    stopMonitoring();
  }
}

interface CookieConsentProviderProps {
  children: ReactNode;
  onConsentChange?: ConsentChangeCallback;
}

export function CookieConsentProvider({ children, onConsentChange }: CookieConsentProviderProps) {
  const [state, setState] = useState<ConsentState>({
    loading: true,
    hasPreference: false,
    analytics: null,
    monitoring: null,
    policyVersion: '',
    showBanner: false,
    initError: null,
  });

  useEffect(() => {
    let cancelled = false;
    consentApi.getPreferences()
      .then((prefs) => {
        if (cancelled) return;
        
        // // AUTO-ACCEPT ANALYTICS FOR DEVELOPMENT (bypass consent)
        // // Check if in development mode and no preference set
        // const isDev = import.meta.env.MODE === 'local' || import.meta.env.DEV;
        // const shouldAutoAccept = isDev;
        
        // if (shouldAutoAccept) {
        //   // Auto-accept without showing banner
        //   consentApi.setPreferences({ analytics: 'accepted', monitoring: 'accepted' })
        //     .then((newPrefs) => {
        //       if (cancelled) return;
        //       setState({
        //         loading: false,
        //         hasPreference: true,
        //         analytics: 'accepted',
        //         monitoring: 'accepted',
        //         policyVersion: newPrefs.policyVersion,
        //         showBanner: false,
        //         initError: null,
        //       });
        //       syncTelemetry(newPrefs);
        //     })
        //     .catch((err) => {
        //       // Fall back to normal flow
        //       setState({
        //         loading: false,
        //         hasPreference: prefs.hasPreference,
        //         analytics: prefs.decisions.analytics,
        //         monitoring: prefs.decisions.monitoring,
        //         policyVersion: prefs.policyVersion,
        //         showBanner: !prefs.hasPreference,
        //         initError: null,
        //       });
        //     });
        //   return;
        // }
        
        setState({
          loading: false,
          hasPreference: prefs.hasPreference,
          analytics: prefs.decisions.analytics,
          monitoring: prefs.decisions.monitoring,
          policyVersion: prefs.policyVersion,
          showBanner: !prefs.hasPreference,
          initError: null,
        });
        if (prefs.hasPreference) syncTelemetry(prefs);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          loading: false,
          showBanner: true,
          initError: err instanceof Error ? err.message : 'Failed to load preferences',
        }));
      });
    return () => { cancelled = true; };
  }, []);

  const applyPreferences = useCallback(async (
    body: UpdateConsentBody,
    source: 'banner' | 'settings_page',
  ): Promise<void> => {
    const prefs = await consentApi.setPreferences(body);
    setState((s) => ({
      ...s,
      hasPreference: prefs.hasPreference,
      analytics:     prefs.decisions.analytics,
      monitoring:    prefs.decisions.monitoring,
      policyVersion: prefs.policyVersion,
      showBanner:    false,
      initError:     null,
    }));
    syncTelemetry(prefs);
    onConsentChange?.(prefs, source);
  }, [onConsentChange]);

  const acceptAll = useCallback(
    () => applyPreferences({ analytics: 'accepted', monitoring: 'accepted' }, 'banner'),
    [applyPreferences],
  );

  const rejectAll = useCallback(
    () => applyPreferences({ analytics: 'rejected', monitoring: 'rejected' }, 'banner'),
    [applyPreferences],
  );

  const updatePreferences = useCallback(
    (body: UpdateConsentBody) => applyPreferences(body, 'settings_page'),
    [applyPreferences],
  );

  const withdraw = useCallback(async (): Promise<void> => {
    const result = await consentApi.withdraw();
    clearNonEssentialCookies(result.cookiesToClear);
    stopAnalytics();
    stopMonitoring();
    setState((s) => ({
      ...s,
      hasPreference: result.hasPreference,
      analytics:     result.decisions.analytics,
      monitoring:    result.decisions.monitoring,
      policyVersion: result.policyVersion,
      showBanner:    false,
    }));
    onConsentChange?.(result, 'withdrawal');
  }, [onConsentChange]);

  const value = useMemo<ConsentContextValue>(
    () => ({ ...state, acceptAll, rejectAll, updatePreferences, withdraw }),
    [state, acceptAll, rejectAll, updatePreferences, withdraw],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useCookieConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useCookieConsent must be used inside CookieConsentProvider');
  return ctx;
}
