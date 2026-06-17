import { getTelemetryConfig, getCurrentEnvironment } from './config';

// HOTFIX: Lazy config loading - evaluates at runtime instead of build time
let _config: ReturnType<typeof getTelemetryConfig> | null = null;
function getConfig() {
  if (!_config) {
    _config = getTelemetryConfig();
  }
  return _config;
}

export function initGa4(): void {
  const config = getConfig();
  const MEASUREMENT_ID = config.ga4MeasurementId;
  const ENABLED = config.enableGA4;
  const DEBUG_MODE = config.debugMode;

  if (!ENABLED || !MEASUREMENT_ID) {
    console.warn('[GA4] Not initialized:', { ENABLED, MEASUREMENT_ID });
    return;
  }

  if (document.getElementById('ga4-script')) {
    console.log('[GA4] Already initialized');
    return;
  }

  console.log('[GA4] Initializing with ID:', MEASUREMENT_ID);
  console.log('[GA4] Detected Environment:', getCurrentEnvironment());

  const script = document.createElement('script');
  script.id = 'ga4-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  const win = window as unknown as { dataLayer: IArguments[]; gtag: (...args: unknown[]) => void };
  win.dataLayer = win.dataLayer ?? [];
  win.gtag = function () { win.dataLayer.push(arguments as unknown as IArguments); };
  win.gtag('js', new Date());
  win.gtag('config', MEASUREMENT_ID, { debug_mode: DEBUG_MODE });
}

export function disableGa4(): void {
  const config = getConfig();
  const MEASUREMENT_ID = config.ga4MeasurementId;
  if (!MEASUREMENT_ID) return;
  (window as unknown as Record<string, unknown>)[`ga-disable-${MEASUREMENT_ID}`] = true;
  document.getElementById('ga4-script')?.remove();
}
 