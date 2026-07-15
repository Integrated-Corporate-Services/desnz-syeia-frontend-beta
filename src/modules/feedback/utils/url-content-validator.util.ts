/**
 * URL Content Validator for Frontend
 * 
 * Detects and validates URLs in user-input text fields
 * Shows warnings when users paste potentially unsafe URLs
 * 
 * Security Requirements (MEDIUM #10):
 * - Detect URLs in text
 * - Warn about http:// (non-secure)
 * - Block localhost and internal IPs
 * - Warn about suspicious patterns
 */

export interface UrlWarning {
  type: 'error' | 'warning' | 'info';
  message: string;
  urls: string[];
}

/**
 * Regular expression to detect URLs in text
 */
const URL_PATTERN = /(?:https?:\/\/|www\.)[\w\-._~:/?#[\]@!$&'()*+,;=%]+/gi;

/**
 * Maximum URL length allowed
 */
const MAX_URL_LENGTH = 2000;

/**
 * Extract all URLs from text
 */
export function extractUrlsFromText(text: string): string[] {
  if (!text) return [];
  const matches = text.match(URL_PATTERN) || [];
  return [...new Set(matches)]; // Remove duplicates
}

/**
 * Check if URL is using HTTP (non-secure)
 */
function isHttpUrl(url: string): boolean {
  return url.toLowerCase().startsWith('http://');
}

/**
 * Check if URL points to localhost or internal IP
 */
function isLocalOrInternalUrl(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  
  // Localhost patterns
  if (lowerUrl.includes('localhost')) return true;
  if (lowerUrl.includes('127.0.0.1')) return true;
  if (lowerUrl.includes('[::1]')) return true;
  
  // Private IP ranges
  const ipv4Patterns = [
    /https?:\/\/10\.\d+\.\d+\.\d+/,
    /https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+/,
    /https?:\/\/192\.168\.\d+\.\d+/,
  ];
  
  return ipv4Patterns.some(pattern => pattern.test(url));
}

/**
 * Check if URL contains suspicious patterns
 */
function hasSuspiciousPatterns(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  
  // Check for URL encoding attempts
  if (lowerUrl.includes('%00') || lowerUrl.includes('%2e') || lowerUrl.includes('%2f')) {
    return true;
  }
  

  const dangerousSchemes = [
    'javascript:',
    'vbscript:',
    'data:',
    'file:',
    'about:',
    'blob:',
  ];
  
  if (dangerousSchemes.some(scheme => lowerUrl.startsWith(scheme))) {
    return true;
  }
  
  // Check for very long URLs (potential buffer overflow)
  if (url.length > MAX_URL_LENGTH) {
    return true;
  }
  
  return false;
}

/**
 * Validate URLs in text and return warnings
 */
export function validateUrlsInTextContent(text: string): UrlWarning | null {
  if (!text) return null;
  
  const urls = extractUrlsFromText(text);
  
  if (urls.length === 0) return null;
  
  // Check for suspicious patterns first (highest priority)
  const suspiciousUrls = urls.filter(hasSuspiciousPatterns);
  if (suspiciousUrls.length > 0) {
    return {
      type: 'error',
      message: 'Suspicious or invalid URLs detected. Please remove them or contact support if you need to include links.',
      urls: suspiciousUrls,
    };
  }
  
  // Check for localhost/internal IPs
  const localUrls = urls.filter(isLocalOrInternalUrl);
  if (localUrls.length > 0) {
    return {
      type: 'error',
      message: 'URLs pointing to localhost or internal IP addresses are not allowed.',
      urls: localUrls,
    };
  }
  
  // Check for non-secure HTTP URLs
  const httpUrls = urls.filter(isHttpUrl);
  if (httpUrls.length > 0) {
    return {
      type: 'warning',
      message: 'Non-secure HTTP URLs detected. Only HTTPS URLs are recommended for security.',
      urls: httpUrls,
    };
  }
  
  // Info: URLs detected but seem OK
  if (urls.length > 0) {
    return {
      type: 'info',
      message: `${urls.length} URL${urls.length > 1 ? 's' : ''} detected in your feedback. Please ensure ${urls.length > 1 ? 'they are' : 'it is'} relevant and safe.`,
      urls,
    };
  }
  
  return null;
}

/**
 * Check if text contains any URLs
 */
export function containsUrls(text: string): boolean {
  if (!text) return false;
  return URL_PATTERN.test(text);
}

/**
 * Count URLs in text
 */
export function countUrls(text: string): number {
  return extractUrlsFromText(text).length;
}

/**
 * Sanitize text by removing problematic URLs (for display purposes)
 */
export function sanitizeTextForDisplay(text: string): string {
  if (!text) return text;
  
  const urls = extractUrlsFromText(text);
  let sanitized = text;
  
  for (const url of urls) {
    if (hasSuspiciousPatterns(url) || isLocalOrInternalUrl(url)) {
      // Remove dangerous URLs
      const regex = new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      sanitized = sanitized.replace(regex, '[URL removed for security]');
    }
  }
  
  return sanitized;
}
