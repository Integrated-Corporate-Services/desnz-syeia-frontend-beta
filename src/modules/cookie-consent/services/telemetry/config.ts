import { createLogger } from '../../../../utils/logger';
import { getRuntimeEnv, getRuntimeEnvBoolean, getMode, isDevelopment } from '../../../../config/runtimeConfig';

const logger = createLogger('telemetry-config');

interface TelemetryConfig {
  ga4MeasurementId: string | null;
  gtmId: string | null;
  enableGA4: boolean;
  enableGTM: boolean;
  debugMode: boolean;
}

/**
 * Get telemetry configuration from runtime environment variables
 */
export function getTelemetryConfig(): TelemetryConfig {
  // Read directly from runtime environment variables
  const ga4MeasurementId = getRuntimeEnv('VITE_GA4_MEASUREMENT_ID', '') || null;
  const gtmId = getRuntimeEnv('VITE_GTM_ID', '') || null;
  const enableGA4 = getRuntimeEnvBoolean('VITE_ENABLE_GA4', false);
  const enableGTM = getRuntimeEnvBoolean('VITE_ENABLE_GTM', false);
  const debugMode = isDevelopment();

  if (debugMode) {
    logger.info('Loaded from runtime environment variables', {
      hasGA4Id: !!ga4MeasurementId,
      hasGTMId: !!gtmId,
      enableGA4,
      enableGTM,
      debugMode,
    });
  }

  return {
    ga4MeasurementId,
    gtmId,
    enableGA4,
    enableGTM,
    debugMode,
  };
}

/**
 * Get current environment name
 */
export function getCurrentEnvironment(): string {
  return getMode();
}

/**
* Check if telemetry should be enabled
* Respects environment variables for override
*/
export function shouldEnableTelemetry(): boolean {
  if (getRuntimeEnvBoolean('VITE_DISABLE_TELEMETRY', false)) {
    return false;
  }

  const config = getTelemetryConfig();
  return config.enableGA4 || config.enableGTM;
}
 