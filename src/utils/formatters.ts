import log from '../logger';

// Date formatting utilities
/**
 * Format date string to readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Format date with time
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Application type normalization utilities
/**
 * Type mapping configuration
 * Maps database values to filter option values
 */
const TYPE_MAP: Record<string, string> = {
  // Database values (lowercase)
  's37': 'overhead-lines',
  's-37': 'overhead-lines',
  'overhead-lines': 'overhead-lines',
  'nwl': 'necessary-wayleaves',
  'necessary-wayleaves': 'necessary-wayleaves',
  'tlp': 'tree-lopping',
  'tree-lopping': 'tree-lopping',
  'tree-lopping-and-felling': 'tree-lopping',
} as const;

/**
 * Normalizes application type to filter option value
 * 
 * @param {string} appType - Raw application type from database
 * @returns {string} Normalized type matching filter options
 * 
 * @example
 * normalizeApplicationType('s37') // Returns: 'overhead-lines'
 * normalizeApplicationType('NWL') // Returns: 'necessary-wayleaves'
 */
export const normalizeApplicationType = (appType: string): string => {
  if (!appType) {
    log.warn('[normalizeApplicationType] Received empty type');
    return 'unknown';
  }

  const normalized = TYPE_MAP[appType.toLowerCase()];
  
  if (!normalized) {
    log.warn(`[normalizeApplicationType] Unknown type "${appType}"`);
    return appType.toLowerCase();
  }

  return normalized;
};

/**
 * Gets human-readable label for an application type
 * 
 * @param {string} appType - Raw application type
 * @returns {string} Display label
 */
export const getApplicationTypeLabel = (appType: string): string => {
  const normalized = normalizeApplicationType(appType);
  
  const labels: Record<string, string> = {
    'overhead-lines': 'Overhead Lines (S37)',
    'necessary-wayleaves': 'Necessary Wayleaves',
    'tree-lopping': 'Tree Lopping and Felling',
  };

  return labels[normalized] || appType;
};
