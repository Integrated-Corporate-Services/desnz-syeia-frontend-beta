export { consentApi, ApiError } from './consent-api';
export { consentFallback } from './consent-fallback';
export { initGa4, disableGa4 } from './telemetry/ga4';
export { initRum, tearDownRum, recordRumPageView } from './telemetry/rum';
export {
  loadAnalytics,
  loadMonitoring,
  stopAnalytics,
  stopMonitoring,
  isAnalyticsLoaded,
  isMonitoringLoaded,
} from './telemetry';
