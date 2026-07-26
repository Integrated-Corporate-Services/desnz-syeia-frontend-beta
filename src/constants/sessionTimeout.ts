import { getRuntimeEnv, parseEnvInt } from '../config/runtimeEnv';

/**
 * Session Timeout Configuration
 * Values are read from environment variables with fallback defaults
 * 
 * Default behavior:
 * - 28 minutes of idle time before warning modal appears
 * - 2 minutes warning period with countdown
 * - Total timeout = 30 minutes (28 min idle + 2 min warning)
 */

// Session timeout duration in seconds (default: 30 minutes = 1800 seconds)
// This is the TOTAL time before auto-logout (idle time + warning time)
export const SESSION_TIMEOUT = parseEnvInt(getRuntimeEnv('VITE_SESSION_TIMEOUT_SECONDS'), 1800);

// Warning modal display time in seconds (default: 2 minutes = 120 seconds)
// Modal shows at (SESSION_TIMEOUT - SESSION_WARNING) seconds of idle time
// Example: With defaults, modal shows at 1680s (28 minutes) of idle, then 120s (2 min) countdown
export const SESSION_WARNING = parseEnvInt(getRuntimeEnv('VITE_SESSION_WARNING_SECONDS'), 120);

// Redirect path after session timeout
export const SIGNED_OUT_PAGE = getRuntimeEnv('VITE_SIGNED_OUT_PATH', '/signed-out');
