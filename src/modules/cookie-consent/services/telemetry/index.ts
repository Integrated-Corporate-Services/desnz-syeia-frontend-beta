import { initGa4, disableGa4 } from './ga4';
import { initGTM, disableGTM } from './gtm';
import { initRum, tearDownRum, recordRumPageView } from './rum';
import { createLogger } from '../../../../utils/logger';

const logger = createLogger('Telemetry');

export { recordRumPageView };

let analyticsLoaded = false;
let monitoringLoaded = false;

export function loadAnalytics(): void {
  if (analyticsLoaded) return;
  analyticsLoaded = true;
  initGa4();
  initGTM();
}

export function loadMonitoring(): void {
  if (monitoringLoaded) return;
  monitoringLoaded = true;
  initRum().catch((err: unknown) => {
    logger.error('RUM initialisation failed:', err);
    monitoringLoaded = false;
  });
}

export function stopAnalytics(): void {
  if (!analyticsLoaded) return;
  analyticsLoaded = false;
  disableGa4();
  disableGTM();
}

export function stopMonitoring(): void {
  if (!monitoringLoaded) return;
  monitoringLoaded = false;
  tearDownRum();
}

export function isAnalyticsLoaded(): boolean { return analyticsLoaded; }
export function isMonitoringLoaded(): boolean { return monitoringLoaded; }
