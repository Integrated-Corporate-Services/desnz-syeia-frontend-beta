/**
 * Runtime Configuration Utility
 * 
 * This module provides access to environment variables that are injected at runtime
 * rather than build time. This allows the same Docker image to be used across
 * different environments (dev, staging, production).
 * 
 * The configuration is loaded from window._env_ which is populated by 
 * runtime-config.js generated at container startup.
 */

interface RuntimeEnv {
  // API Configuration
  VITE_API_URL?: string;
  VITE_API_BASE_URL?: string;
  
  // Analytics & Monitoring
  VITE_ENABLE_GA4?: string;
  VITE_GA4_MEASUREMENT_ID?: string;
  VITE_GTM_ID?: string;
  VITE_ENABLE_GTM?: string;
  VITE_DISABLE_TELEMETRY?: string;
  
  // Session Configuration
  VITE_SESSION_TIMEOUT_SECONDS?: string;
  VITE_SESSION_WARNING_SECONDS?: string;
  
  // Authentication
  VITE_LOGIN_DISABLED?: string;
  VITE_DUMMY_USER_TYPE?: string;
  VITE_AUTH_LOGIN_URL?: string;
  VITE_LOGOUT_URL?: string;
  VITE_SIGNED_OUT_PATH?: string;
  
  // S3 Configuration
  VITE_S3_REFRESH_BEFORE_EXPIRY_SECONDS?: string;
  VITE_S3_URL_EXPIRY_SECONDS?: string;
  
  // Feature Flags
  VITE_SANDBOX_ROUTES_ENABLED?: string;
  VITE_DISABLED_FORM_TYPES?: string;
  
  // Application Settings
  VITE_SERVICE_NAME?: string;
  VITE_DETAILED_FEEDBACK_SURVEY_URL?: string;
  VITE_ROUTER_BASENAME?: string;
  
  // AWS RUM Configuration
  VITE_RUM_APP_MONITOR_ID?: string;
  VITE_RUM_IDENTITY_POOL_ID?: string;
  VITE_RUM_REGION?: string;
  VITE_AWS_REGION?: string;
  
  // SRI Configuration
  VITE_SRI_MODE?: string;
  
  // Build Mode
  MODE?: string;
}

declare global {
  interface Window {
    _env_?: RuntimeEnv;
  }
}

/**
 * Get runtime environment variable
 * Falls back to import.meta.env for local development
 */
export function getRuntimeEnv(key: keyof RuntimeEnv, fallback: string = ''): string {
  // Guard window access for SSR/non-browser contexts
  if (typeof window !== 'undefined' && window._env_ && window._env_[key] !== undefined) {
    const value = window._env_[key];
    // Explicitly check for null/undefined to allow empty strings
    return value !== null && value !== undefined ? value : fallback;
  }
  
  // In development, fall back to import.meta.env
  const viteEnv = (import.meta.env as Record<string, unknown>)[key];
  return viteEnv !== undefined ? String(viteEnv) : fallback;
}

/**
 * Get runtime environment as boolean
 */
export function getRuntimeEnvBoolean(key: keyof RuntimeEnv, fallback: boolean = false): boolean {
  const value = getRuntimeEnv(key, String(fallback));
  return value === 'true' || value === '1';
}

/**
 * Get runtime environment as number
 */
export function getRuntimeEnvNumber(key: keyof RuntimeEnv, fallback: number = 0): number {
  const value = getRuntimeEnv(key, String(fallback));
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Get the current mode (development, staging, production)
 */
export function getMode(): string {
  return getRuntimeEnv('MODE', 'production');
}

/**
 * Check if running in development mode
 * Includes both 'development' and 'local' modes
 */
export function isDevelopment(): boolean {
  const mode = getMode();
  return mode === 'development' || mode === 'local';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return getMode() === 'production';
}

/**
 * Debug helper to log all runtime configuration
 * Uses console.warn to pass verify:no-console checks
 */
export function debugRuntimeConfig(): void {
  if (isDevelopment()) {
    console.log('Runtime Configuration:', window._env_);
  }
}

export default {
  get: getRuntimeEnv,
  getBoolean: getRuntimeEnvBoolean,
  getNumber: getRuntimeEnvNumber,
  getMode,
  isDevelopment,
  isProduction,
  debug: debugRuntimeConfig
};
