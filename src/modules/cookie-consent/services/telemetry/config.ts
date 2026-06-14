interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly VITE_GA4_MEASUREMENT_ID?: string;
  readonly VITE_ENABLE_GA4?: string;
  readonly GTM_ID?: string;
  readonly GTM_ISENABLED?: string;
  readonly VITE_DISABLE_TELEMETRY?: string;
  [key: string]: any;
}

type Environment = 'local' | 'development' | 'staging' | 'production';

interface TelemetryConfig {
  ga4MeasurementId: string | null;
  gtmId: string | null;
  enableGA4: boolean;
  enableGTM: boolean;
  debugMode: boolean;
}

/**
 * Default configuration values
 * Used when environment variables are not set
 */
const DEFAULT_GA4_MEASUREMENT_ID = 'G-7NL7XSY1LV';

/**
 * Environment-specific configuration overrides
 * Only used when environment variables are not available
 */
const TELEMETRY_CONFIGS: Record<Environment, TelemetryConfig> = {
  local: {
    ga4MeasurementId: DEFAULT_GA4_MEASUREMENT_ID,
    gtmId: null,
    enableGA4: true,
    enableGTM: true,
    debugMode: true,
  },
  development: {
    ga4MeasurementId: DEFAULT_GA4_MEASUREMENT_ID,
    gtmId: 'GTM-P7VVP48J',
    enableGA4: true,
    enableGTM: true,
    debugMode: true,
  },
  staging: {
    ga4MeasurementId: DEFAULT_GA4_MEASUREMENT_ID,
    gtmId: 'GTM-P7VVP48J',
    enableGA4: true,
    enableGTM: true,
    debugMode: false,
  },
  production: {
    ga4MeasurementId: DEFAULT_GA4_MEASUREMENT_ID,
    gtmId: null,
    enableGA4: true,
    enableGTM: true,
    debugMode: false,
  },
};

/**
 * Detect current environment
 * 
 * Priority 1: Use Vite MODE (set by build command)
 * Priority 2: Fallback to hostname detection (for runtime)
 */
function detectEnvironment(): Environment {
  const mode = (import.meta as any).env?.MODE?.toLowerCase();
  
  if (mode) {
    if (mode === 'local') {
      return 'local';
    }
    if (mode === 'development' || mode === 'dev') {
      return 'development';
    }
    if (mode === 'staging') {
      return 'staging';
    }
    if (mode === 'production' || mode === 'prod') {
      return 'production';
    }
  }

  const hostname = window.location.hostname.toLowerCase();

  if (hostname === 'syeia.energysecurity.gov.uk' || 
      hostname === 'www.syeia.energysecurity.gov.uk') {
    return 'production';
  }

  if (hostname.includes('staging.syeia') || 
      hostname.includes('eip-staging')) {
    return 'staging';
  }

  if (hostname.includes('dev.syeia') || 
      hostname.includes('syeia-dev') ||
      hostname.includes('dev-syeia') ||
      hostname.includes('eip-dev')) {
    return 'development';
  }

  return 'development';
}

/**
 * Get telemetry configuration for current environment
 * 
 * Priority order:
 * 1. Environment variables from SSM (VITE_GA4_MEASUREMENT_ID, VITE_ENABLE_GA4, GTM_ID, GTM_ISENABLED)
 * 2. Environment-specific config from TELEMETRY_CONFIGS
 * 3. Default values
 */
export function getTelemetryConfig(): TelemetryConfig {
  const env = detectEnvironment();
  const envConfig = TELEMETRY_CONFIGS[env];

  // Read from environment variables (populated from SSM in ECS)
  const envVars = (import.meta as any).env || {};
  
  const ga4MeasurementId = envVars.VITE_GA4_MEASUREMENT_ID || envConfig.ga4MeasurementId;
  const gtmId = envVars.GTM_ID || envConfig.gtmId;
  const enableGA4 = envVars.VITE_ENABLE_GA4 === 'true' || envConfig.enableGA4;
  const enableGTM = envVars.GTM_ISENABLED === 'true' || envConfig.enableGTM;

  return {
    ga4MeasurementId,
    gtmId,
    enableGA4,
    enableGTM,
    debugMode: envConfig.debugMode,
  };
}

/**
 * Get current environment (for debugging)
 */
export function getCurrentEnvironment(): Environment {
  return detectEnvironment();
}

/**
 * Check if telemetry should be enabled
 * Respects environment variables for override
 */
export function shouldEnableTelemetry(): boolean {
  // Allow environment variable override
  // Type assertion needed because import.meta.env is not in standard TypeScript types
  if ((import.meta as any).env?.VITE_DISABLE_TELEMETRY === 'true') {
    return false;
  }

  const config = getTelemetryConfig();
  return config.enableGA4 || config.enableGTM;
}
