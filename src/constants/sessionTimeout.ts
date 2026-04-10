/**
 * Session Timeout Configuration
 * Values are read from environment variables with fallback defaults
 */

// Session timeout duration in seconds (default: 30 minutes = 1800 seconds)
export const SESSION_TIMEOUT = Number(import.meta.env.VITE_SESSION_TIMEOUT_SECONDS) || 1800;

// Warning modal display time in seconds (default: 2 minutes = 120 seconds before timeout)
export const SESSION_WARNING = Number(import.meta.env.VITE_SESSION_WARNING_SECONDS) || 120;

// Redirect path after session timeout
export const SIGNED_OUT_PAGE = import.meta.env.VITE_SIGNED_OUT_PATH || '/frontend/signed-out';
