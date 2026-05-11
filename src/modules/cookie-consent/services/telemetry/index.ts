import { initGa4, disableGa4 } from './ga4';
import { initRum, tearDownRum, recordRumPageView } from './rum';

export { recordRumPageView };

let analyticsLoaded = false;
let monitoringLoaded = false;

export function loadAnalytics(): void {
  if (analyticsLoaded) return;
  analyticsLoaded = true;
  initGa4();
}

export function loadMonitoring(): void {
  if (monitoringLoaded) return;
  monitoringLoaded = true;
  initRum().catch((err: unknown) => {
    console.error('[Telemetry] RUM initialisation failed:', err);
    monitoringLoaded = false;
  });
}

export function stopAnalytics(): void {
  if (!analyticsLoaded) return;
  analyticsLoaded = false;
  disableGa4();
}

export function stopMonitoring(): void {
  if (!monitoringLoaded) return;
  monitoringLoaded = false;
  tearDownRum();
}

export function isAnalyticsLoaded(): boolean { return analyticsLoaded; }
export function isMonitoringLoaded(): boolean { return monitoringLoaded; }
