import { useState, useEffect } from 'react';
import { buildBackendUrl } from '../../../utils/apiConfig';
import { createLogger } from '../../../utils/logger';

const logger = createLogger('useFeatureFlags');

interface FeatureFlags {
  NWL_PACKAGE_DOWNLOAD?: boolean;
  [key: string]: boolean | undefined;
}

interface UseFeatureFlagsResult {
  flags: FeatureFlags;
  isLoading: boolean;
  error: string | null;
  isEnabled: (feature: string) => boolean;
}

/**
 * Custom hook to fetch and manage feature flags from the backend
 * 
 * Features are controlled server-side via environment variables.
 * This allows for gradual rollout, A/B testing, and quick feature toggles.
 * 
 * @returns Object containing feature flags state and helper function
 * 
 * @example
 * const { flags, isLoading, isEnabled } = useFeatureFlags();
 * 
 * if (isEnabled('NWL_PACKAGE_DOWNLOAD')) {
 *   return <DownloadButton />;
 * }
 */
export const useFeatureFlags = (): UseFeatureFlagsResult => {
  const [flags, setFlags] = useState<FeatureFlags>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatureFlags = async () => {
      try {
        logger.debug('Fetching feature flags');
        
        const url = buildBackendUrl('/api/feature-flags');
        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        logger.info('Feature flags loaded', { flags: data });
        setFlags(data);
        setError(null);
      } catch (err: any) {
        logger.error('Failed to fetch feature flags', {
          error: err?.message || 'Unknown error',
        });
        
        // On error, assume all features are disabled (fail-safe)
        setFlags({});
        setError(err?.message || 'Failed to load feature flags');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatureFlags();
  }, []);

  /**
   * Check if a specific feature is enabled
   * @param feature - The feature flag name (e.g., 'NWL_PACKAGE_DOWNLOAD')
   * @returns true if enabled, false if disabled or unknown
   */
  const isEnabled = (feature: string): boolean => {
    return flags[feature] === true;
  };

  return {
    flags,
    isLoading,
    error,
    isEnabled,
  };
};
