// Cookie Consent Module - GDPR-compliant cookie management
// Provides banner, settings page, and consent tracking

export {
  CookieBanner,
  CookieConsentProvider,
  useCookieConsent,
  type ConsentContextValue,
  type ConsentActions,
} from './components';

export { CookiesSettingsPage } from './pages';

export {
  consentApi,
  ApiError,
  initGa4,
  disableGa4,
  initRum,
  tearDownRum,
  recordRumPageView,
  loadAnalytics,
  loadMonitoring,
  stopAnalytics,
  stopMonitoring,
  isAnalyticsLoaded,
  isMonitoringLoaded,
} from './services';

export { readCookie, expireCookie, clearNonEssentialCookies, getCsrfToken } from './utils';

export type {
  ConsentDecision,
  CatalogEntry,
  UpdateConsentBody,
  ConsentChangeCallback,
  ConsentPreferencesResponse,
  WithdrawResponse,
} from './types';

export * from './constants';
