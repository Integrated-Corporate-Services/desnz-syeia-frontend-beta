/**
 * Runtime Environment Configuration
 * 
 * This module provides access to runtime environment variables that are injected
 * at container startup via window._env_ object. This allows the same Docker image
 * to be used across different environments (dev, staging, production) without rebuilding.
 * 
 * Usage:
 *   import { getRuntimeEnv } from '@/config/runtimeEnv';
 *   const apiUrl = getRuntimeEnv('VITE_API_URL');
 */

interface RuntimeEnv {
  VITE_API_URL: string;
  VITE_ENABLE_GA4: string;
  VITE_GA4_MEASUREMENT_ID: string;
  VITE_GTM_ID: string;
  VITE_ENABLE_GTM: string;
  VITE_DISABLE_TELEMETRY: string;
  VITE_SESSION_TIMEOUT_SECONDS: string;
  VITE_SESSION_WARNING_SECONDS: string;
  VITE_LOGIN_DISABLED: string;
  VITE_DUMMY_USER_TYPE: string;
  VITE_DISABLED_FORM_TYPES: string;
  VITE_SERVICE_NAME: string;
  VITE_DETAILED_FEEDBACK_SURVEY_URL: string;
  VITE_ROUTER_BASENAME: string;
  VITE_RUM_APP_MONITOR_ID: string;
  VITE_RUM_IDENTITY_POOL_ID: string;
  VITE_RUM_REGION: string;
  VITE_AWS_REGION: string;
  VITE_SRI_MODE: string;
  VITE_TRUSTED_ORIGIN: string;
  MODE: string;
}

declare global {
  interface Window {
    _env_: RuntimeEnv;
  }
}

// Ensure window._env_ exists with defaults if not already loaded
if (typeof window !== 'undefined' && !window._env_) {
  window._env_ = {
    VITE_API_URL: '',
    VITE_ENABLE_GA4: 'false',
    VITE_GA4_MEASUREMENT_ID: '',
    VITE_GTM_ID: '',
    VITE_ENABLE_GTM: 'false',
    VITE_DISABLE_TELEMETRY: 'false',
    VITE_SESSION_TIMEOUT_SECONDS: '1800',
    VITE_SESSION_WARNING_SECONDS: '120',
    VITE_LOGIN_DISABLED: 'false',
    VITE_DUMMY_USER_TYPE: 'developer',
    VITE_DISABLED_FORM_TYPES: '',
    VITE_SERVICE_NAME: 'SYEIA',
    VITE_DETAILED_FEEDBACK_SURVEY_URL: '#',
    VITE_ROUTER_BASENAME: '/',
    VITE_RUM_APP_MONITOR_ID: '',
    VITE_RUM_IDENTITY_POOL_ID: '',
    VITE_RUM_REGION: 'eu-west-2',
    VITE_AWS_REGION: 'eu-west-2',
    VITE_SRI_MODE: 'report',
    VITE_TRUSTED_ORIGIN: '',
    MODE: 'development'
  };
}

/**
 * Get a runtime environment variable value
 * @param key - The environment variable key
 * @param defaultValue - Optional default value if the variable is not set
 * @returns The environment variable value or default value
 */
export function getRuntimeEnv(key: keyof RuntimeEnv, defaultValue: string = ''): string {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  return window._env_?.[key] || defaultValue;
}

/**
 * Parse a string value as a boolean
 * @param value - The string value to parse
 * @returns true if value is 'true' or '1', false otherwise
 */
export function parseEnvBoolean(value: string | undefined): boolean {
  if (!value) return false;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Parse a string value as an integer
 * @param value - The string value to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed integer or default value
 */
export function parseEnvInt(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get the current application mode
 * @returns The application mode (development, staging, or production)
 */
export function getMode(): 'development' | 'staging' | 'production' {
  const mode = getRuntimeEnv('MODE', 'development');
  if (mode === 'development') {
    return 'development';
  }
  if (mode === 'staging') {
    return 'staging';
  }
  return 'production';
}

/**
 * Check if the application is running in development mode
 * @returns true if in development mode
 */
export function isDevelopmentMode(): boolean {
  return getMode() === 'development';
}

export function isStaging(): boolean {
  return getMode() === 'staging';
}

/**
 * Check if the application is running in production mode
 * @returns true if in production mode
 */
export function isProductionMode(): boolean {
  return getMode() === 'production';
}
