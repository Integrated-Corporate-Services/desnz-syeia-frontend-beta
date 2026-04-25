
export type GDSTagColor =
  | 'grey' 
  | 'green'     
  | 'turquoise' 
  | 'blue'      
  | 'purple'    
  | 'pink'      
  | 'red'       
  | 'orange'    
  | 'yellow';   

export interface StatusConfig {
  /** Status value */
  value: string;
  /** User-friendly display label */
  label: string;
  /** GDS tag color modifier */
  color: GDSTagColor;
}

/**
 * Status Configuration Map Type
 * Generic type for status configuration objects
 */
export type StatusConfigMap = Record<string, StatusConfig>;

/**
 * Normalize status string for consistent lookup
 * Converts to lowercase, replaces hyphens/underscores with spaces, trims whitespace
*/
export const normalizeStatus = (status: string): string => {
  if (!status || typeof status !== 'string') return '';
  return status.toLowerCase().replace(/[-_]/g, ' ').trim();
};

/**
 * Generic Status Configuration Factory
 * Creates status helper functions for any status type
 * 
 * This is a Higher-Order Function that returns specialized functions
 * for a specific status configuration.
 * 
 * @param configMap - Status configuration map
 * @returns Object with helper functions for the status type
 * 
 * @example
 * const helpers = createStatusHelpers(APPLICATION_STATUS_CONFIG);
 * const config = helpers.getConfig('submitted');
 * const cssClass = helpers.getTagClass('submitted');
 * const label = helpers.getLabel('submitted');
 */
export const createStatusHelpers = (configMap: StatusConfigMap) => {
  /**
   * Get status configuration by status value
   * @param status - Status value to lookup
   * @returns Status configuration or null if not found
   */
  const getConfig = (status: string): StatusConfig | null => {
    const normalized = normalizeStatus(status);
    return configMap[normalized] || null;
  };


  const getTagClass = (status: string): string => {
    const config = getConfig(status);
    return config ? `govuk-tag govuk-tag--${config.color}` : 'govuk-tag';
  };

  const getLabel = (status: string): string => {
    const config = getConfig(status);
    if (config) return config.label;
    
    // Fallback: format the status string nicely
    return formatStatusString(status);
  };

  /**
   * Get status display information (label + className)
   * @param status - Status value
   * @returns Object with label and className
   */
  const getDisplay = (status: string): { label: string; className: string } => {
    return {
      label: getLabel(status),
      className: getTagClass(status),
    };
  };

  return {
    getConfig,
    getTagClass,
    getLabel,
    getDisplay,
  };
};


export const formatStatusString = (status: string): string => {
  if (!status || typeof status !== 'string') return '';
  
  return status
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Build combined status configuration from multiple sources
 * Useful for creating unified configurations statuses
 * 
 * @param configs - Multiple status configuration maps
 * @returns Combined configuration map
 * 
 * @example
 * const combined = combineStatusConfigs(
 *   APPLICATION_STATUS_CONFIG,
 *   CONSULTATION_STATUS_CONFIG
 * );
 */
export const combineStatusConfigs = (...configs: StatusConfigMap[]): StatusConfigMap => {
  return Object.assign({}, ...configs);
};

/**
 * Extract labels from status configuration
 * Useful for building display label maps
 * 
 * @param configMap - Status configuration map
 * @returns Map of status values to labels
 */
export const extractLabels = (configMap: StatusConfigMap): Record<string, string> => {
  return Object.entries(configMap).reduce((acc, [key, config]) => {
    acc[key] = config.label;
    return acc;
  }, {} as Record<string, string>);
};


export const extractTagClasses = (configMap: StatusConfigMap): Record<string, string> => {
  return Object.entries(configMap).reduce((acc, [key, config]) => {
    acc[key] = `govuk-tag govuk-tag--${config.color}`;
    return acc;
  }, {} as Record<string, string>);
};
