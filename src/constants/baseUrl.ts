/**
 * Get the base URL for the application
 * This reads from runtime configuration to support sub-path deployments
 * @returns The base URL path (e.g., '/' or '/app')
 *
 * Kept free of page imports, so hooks used by pages can read it without importing the route
 * registry (which imports the pages back).
 */
export const getBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window._env_) {
    return window._env_.VITE_ROUTER_BASENAME || '/';
  }
  return '/';
};
