import { createLogger } from '../../../../utils/logger';
import { getRuntimeEnv, parseEnvBoolean } from '../../../../config/runtimeEnv';

const logger = createLogger('telemetry-config');

interface ImportMetaEnv {
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly VITE_GA4_MEASUREMENT_ID?: string;
  readonly VITE_ENABLE_GA4?: string;
  readonly VITE_GTM_ID?: string;
  readonly VITE_ENABLE_GTM?: string;
  readonly VITE_DISABLE_TELEMETRY?: string;
  [key: string]: string | boolean | undefined;
}

interface TelemetryConfig {
  ga4MeasurementId: string | null;
  gtmId: string | null;
  enableGA4: boolean;
  enableGTM: boolean;
  debugMode: boolean;
}

/**
 * Get telemetry configuration from runtime environment variables
 * Reads from window._env_ (set at container startup) for production
 * Falls back to import.meta.env for development builds
 */
export function getTelemetryConfig(): TelemetryConfig {
  // HOTFIX: Read from window._env_ for production runtime config
  const ga4MeasurementId = getRuntimeEnv('VITE_GA4_MEASUREMENT_ID') || null;
  const gtmId = getRuntimeEnv('VITE_GTM_ID') || null;
  const enableGA4 = parseEnvBoolean(getRuntimeEnv('VITE_ENABLE_GA4'));
  const enableGTM = parseEnvBoolean(getRuntimeEnv('VITE_ENABLE_GTM'));
  const mode = getRuntimeEnv('MODE') || 'production';
  const debugMode = mode === 'development';

  logger.info('Telemetry config loaded from runtime env', {
    hasGA4Id: !!ga4MeasurementId,
    ga4IdLength: ga4MeasurementId?.length || 0,
    hasGTMId: !!gtmId,
    enableGA4,
    enableGTM,
    debugMode,
    mode,
  });

  return {
    ga4MeasurementId,
    gtmId,
    enableGA4,
    enableGTM,
    debugMode,
  };
}

/**
 * Get current environment name from runtime config
 */
export function getCurrentEnvironment(): string {
  return getRuntimeEnv('MODE');
}

/**
* Check if telemetry should be enabled
* Respects environment variables for override
*/
export function shouldEnableTelemetry(): boolean {
  const disableTelemetry = parseEnvBoolean(getRuntimeEnv('VITE_DISABLE_TELEMETRY'));
  
  if (disableTelemetry) {
    return false;
  }

  const config = getTelemetryConfig();
  return config.enableGA4 || config.enableGTM;
}
 