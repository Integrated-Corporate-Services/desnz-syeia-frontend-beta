interface ImportMetaEnv {
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly VITE_GA4_MEASUREMENT_ID?: string;
  readonly VITE_ENABLE_GA4?: string;
  readonly GTM_ID?: string;
  readonly GTM_ISENABLED?: string;
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
 * Get telemetry configuration directly from environment variables
 * No fallbacks, no environment detection - purely from import.meta.env
 */
export function getTelemetryConfig(): TelemetryConfig {
  const env = import.meta.env as ImportMetaEnv;

  // Read directly from environment variables
  const ga4MeasurementId = env.VITE_GA4_MEASUREMENT_ID || null;
  const gtmId = env.GTM_ID || null;
  const enableGA4 = env.VITE_ENABLE_GA4 === 'true';
  const enableGTM = env.GTM_ISENABLED === 'true';
  const debugMode = env.MODE === 'development' || env.DEV === true;

  // Debug logging in development mode
  if (debugMode) {
    console.log('[Telemetry Config] Loaded from environment variables:', {
      ga4MeasurementId: ga4MeasurementId || '(not set)',
      gtmId: gtmId || '(not set)',
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
 * Get current environment name from Vite MODE
 */
export function getCurrentEnvironment(): string {
  return (import.meta.env as ImportMetaEnv)?.MODE || 'unknown';
}

/**
* Check if telemetry should be enabled
* Respects environment variables for override
*/
export function shouldEnableTelemetry(): boolean {
  const env = import.meta.env as ImportMetaEnv;
  
  if (env?.VITE_DISABLE_TELEMETRY === 'true') {
    return false;
  }

  const config = getTelemetryConfig();
  return config.enableGA4 || config.enableGTM;
}
 