import { getTelemetryConfig, getCurrentEnvironment } from './config';
import { createLogger } from '../../../../utils/logger';
import { addSRIToScript } from '../../../../utils/sriHelper';

const logger = createLogger('GA4');

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
    logger.warn('Not initialized:', { ENABLED, MEASUREMENT_ID });
    return;
  }

  if (document.getElementById('ga4-script')) {
    logger.debug('Already initialized');
    return;
  }

  logger.debug('Initializing with ID:', MEASUREMENT_ID);
  logger.debug('Detected Environment:', getCurrentEnvironment());

  const scriptUrl = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  const script = document.createElement('script');
  script.id = 'ga4-script';
  script.async = true;
  script.src = scriptUrl;
  
  // SECURITY: Add Subresource Integrity (SRI) attributes
  // Protects against CDN compromise attacks (MEDIUM #4)
  addSRIToScript(script, scriptUrl);
  
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
 