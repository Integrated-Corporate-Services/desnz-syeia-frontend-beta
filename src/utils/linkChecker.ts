/**
 * Link Reputation Checker
 * 
 * Security: Validates external URLs before displaying or allowing users to click
 * - Checks against known malicious patterns
 * - Validates URL format and safety
 * - Logs external link clicks for monitoring
 * - Maintains internal blocklist
 */

import { createLogger } from './logger';

const logger = createLogger('LinkChecker');

/**
 * Link safety levels
 */
export enum LinkSafetyLevel {
  SAFE = 'SAFE',
  SUSPICIOUS = 'SUSPICIOUS',
  BLOCKED = 'BLOCKED',
  INVALID = 'INVALID',
}

/**
 * Link validation result
 */
export interface LinkCheckResult {
  isSafe: boolean;
  safetyLevel: LinkSafetyLevel;
  reason?: string;
  originalUrl: string;
  normalizedUrl?: string;
}

/**
 * Known malicious or suspicious URL patterns
 * This list should be maintained and updated regularly
 */
const BLOCKED_PATTERNS = [
  // Phishing/malware test domains
  /malware.*\.com$/i,
  /phishing.*\.com$/i,
  /evil.*\.com$/i,
  /hack.*\.ru$/i,
  /malicious.*\.site$/i,
  
  // Suspicious TLDs commonly used for malicious purposes
  /\.tk$/i,
  /\.ml$/i,
  /\.ga$/i,
  /\.cf$/i,
  /\.gq$/i,
  
  // URL shorteners (can hide malicious destinations)
  /bit\.ly/i,
  /tinyurl\.com/i,
  /goo\.gl/i,
  /ow\.ly/i,
  /t\.co/i, // Twitter shortener is OK for known twitter links
  
  // IP addresses in URLs (often suspicious)
  /^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
  
  // Localhost and internal IPs
  /localhost/i,
  /127\.0\.0\.1/,
  /192\.168\./,
  /10\.\d{1,3}\./,
  /172\.(1[6-9]|2[0-9]|3[0-1])\./,
  
  // Suspicious keywords in URLs
  /login.*verify/i,
  /secure.*account/i,
  /update.*payment/i,
  /confirm.*identity/i,
];

/**
 * Whitelisted trusted domains (government, official sites)
 */
const TRUSTED_DOMAINS = [
  'gov.uk',
  'legislation.gov.uk',
  'naturalengland.org.uk',
  'defra.gov.uk',
  'magic.defra.gov.uk',
  'energysecurity.gov.uk',
  'nationalarchives.gov.uk',
  'ordnancesurvey.co.uk',
  'gridreferencefinder.com',
  'openstreetmap.org',
  'gov.wales',
  'datamap.gov.wales',
];

/**
 * Check if a domain is trusted
 */
function isTrustedDomain(hostname: string): boolean {
  return TRUSTED_DOMAINS.some(trusted => 
    hostname === trusted || hostname.endsWith(`.${trusted}`)
  );
}

/**
 * Validate URL format and extract components safely
 */
function parseUrl(urlString: string): URL | null {
  try {
    // Normalize URL string
    let normalized = urlString.trim();
    
    // If no protocol, assume https
    if (!normalized.match(/^[a-z]+:\/\//i)) {
      normalized = `https://${normalized}`;
    }
    
    const url = new URL(normalized);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }
    
    return url;
  } catch (error) {
    logger.warn('Failed to parse URL', { urlString, error });
    return null;
  }
}

/**
 * Check if URL matches blocked patterns
 */
function matchesBlockedPattern(url: URL): { matched: boolean; pattern?: string } {
  const fullUrl = url.href;
  const hostname = url.hostname;
  
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(fullUrl) || pattern.test(hostname)) {
      return { matched: true, pattern: pattern.toString() };
    }
  }
  
  return { matched: false };
}

/**
 * Perform comprehensive URL safety check
 */
export function checkLinkSafety(urlString: string): LinkCheckResult {
  // Basic validation
  if (!urlString || typeof urlString !== 'string') {
    return {
      isSafe: false,
      safetyLevel: LinkSafetyLevel.INVALID,
      reason: 'Invalid URL format',
      originalUrl: urlString || '',
    };
  }

  // Length check (excessively long URLs can be suspicious)
  if (urlString.length > 2048) {
    return {
      isSafe: false,
      safetyLevel: LinkSafetyLevel.SUSPICIOUS,
      reason: 'URL exceeds maximum length',
      originalUrl: urlString,
    };
  }

  // Parse URL
  const url = parseUrl(urlString);
  if (!url) {
    return {
      isSafe: false,
      safetyLevel: LinkSafetyLevel.INVALID,
      reason: 'Malformed URL or unsupported protocol',
      originalUrl: urlString,
    };
  }

  // Check if trusted domain
  if (isTrustedDomain(url.hostname)) {
    return {
      isSafe: true,
      safetyLevel: LinkSafetyLevel.SAFE,
      originalUrl: urlString,
      normalizedUrl: url.href,
    };
  }

  // Check against blocked patterns
  const blockedCheck = matchesBlockedPattern(url);
  if (blockedCheck.matched) {
    logger.warn('Blocked URL detected', {
      url: urlString,
      pattern: blockedCheck.pattern,
      hostname: url.hostname,
    });
    
    return {
      isSafe: false,
      safetyLevel: LinkSafetyLevel.BLOCKED,
      reason: 'URL matches known malicious pattern',
      originalUrl: urlString,
      normalizedUrl: url.href,
    };
  }

  // Check for suspicious characteristics
  const suspiciousChecks = [
    // Multiple subdomains (e.g., secure.login.verify.example.com)
    (url.hostname.split('.').length > 4),
    
    // Suspicious keywords in path
    /password|verify|secure|account|login|banking/i.test(url.pathname),
    
    // Query string with suspicious patterns
    /token|session|auth|key/i.test(url.search),
  ];

  if (suspiciousChecks.some(check => check)) {
    return {
      isSafe: true, // Allow but warn
      safetyLevel: LinkSafetyLevel.SUSPICIOUS,
      reason: 'URL contains suspicious characteristics',
      originalUrl: urlString,
      normalizedUrl: url.href,
    };
  }

  // Default: safe but not explicitly trusted
  return {
    isSafe: true,
    safetyLevel: LinkSafetyLevel.SAFE,
    originalUrl: urlString,
    normalizedUrl: url.href,
  };
}

/**
 * Log external link click for monitoring
 */
export function logLinkClick(url: string, context?: string, userId?: string): void {
  const checkResult = checkLinkSafety(url);
  
  logger.info('External link clicked', {
    url,
    context,
    userId,
    safetyLevel: checkResult.safetyLevel,
    timestamp: new Date().toISOString(),
  });

  // If suspicious or blocked, log as warning
  if (checkResult.safetyLevel === LinkSafetyLevel.SUSPICIOUS || 
      checkResult.safetyLevel === LinkSafetyLevel.BLOCKED) {
    logger.warn('Suspicious/blocked link clicked', {
      url,
      context,
      userId,
      safetyLevel: checkResult.safetyLevel,
      reason: checkResult.reason,
    });
  }
}

/**
 * Validate URL for form submissions
 * Stricter than display validation
 */
export function validateUrlForSubmission(urlString: string): {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
} {
  if (!urlString || urlString.trim() === '') {
    return {
      isValid: false,
      error: 'URL is required',
    };
  }

  const checkResult = checkLinkSafety(urlString);

  // Block invalid and blocked URLs
  if (checkResult.safetyLevel === LinkSafetyLevel.INVALID) {
    return {
      isValid: false,
      error: 'Invalid URL format. Please enter a valid web address.',
    };
  }

  if (checkResult.safetyLevel === LinkSafetyLevel.BLOCKED) {
    return {
      isValid: false,
      error: 'This URL cannot be used. Please use a different web address.',
    };
  }

  // Require HTTPS for submissions (except trusted gov domains)
  const url = parseUrl(urlString);
  if (url && url.protocol !== 'https:' && !isTrustedDomain(url.hostname)) {
    return {
      isValid: false,
      error: 'URL must use HTTPS (secure connection). Please use https://...',
    };
  }

  // Allow suspicious URLs but log them
  if (checkResult.safetyLevel === LinkSafetyLevel.SUSPICIOUS) {
    logger.info('Suspicious URL submitted', {
      url: urlString,
      reason: checkResult.reason,
    });
  }

  return {
    isValid: true,
    normalizedUrl: checkResult.normalizedUrl,
  };
}

/**
 * Sanitize URL for safe display
 * Removes potentially harmful characters
 */
export function sanitizeUrlForDisplay(url: string): string {
  try {
    const parsed = parseUrl(url);
    if (!parsed) return url;

    // Return normalized URL without fragment
    const sanitized = `${parsed.protocol}//${parsed.hostname}${parsed.pathname}${parsed.search}`;
    
    // Limit display length
    if (sanitized.length > 100) {
      return sanitized.substring(0, 97) + '...';
    }
    
    return sanitized;
  } catch {
    return url;
  }
}

/**
 * Check if URL is external (not same origin)
 */
export function isExternalUrl(url: string): boolean {
  try {
    const parsed = parseUrl(url);
    if (!parsed) return false;

    // Check if different origin
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      return parsed.origin !== currentOrigin;
    }

    // Server-side: assume external if has protocol
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Get user-friendly warning message based on safety level
 */
export function getWarningMessage(safetyLevel: LinkSafetyLevel): string | null {
  switch (safetyLevel) {
    case LinkSafetyLevel.BLOCKED:
      return 'This link has been blocked as it may be unsafe. Please do not click this link.';
    
    case LinkSafetyLevel.SUSPICIOUS:
      return 'This link has characteristics that may indicate it is unsafe. Proceed with caution.';
    
    case LinkSafetyLevel.SAFE:
      return null;
    
    case LinkSafetyLevel.INVALID:
      return 'This link format is invalid.';
    
    default:
      return null;
  }
}

/**
 * React hook for link safety checking
 */
export function useLinkSafety(url: string | null | undefined) {
  if (!url) {
    return {
      checkResult: null,
      warningMessage: null,
      isBlocked: false,
      isSuspicious: false,
    };
  }

  const checkResult = checkLinkSafety(url);
  const warningMessage = getWarningMessage(checkResult.safetyLevel);

  return {
    checkResult,
    warningMessage,
    isBlocked: checkResult.safetyLevel === LinkSafetyLevel.BLOCKED,
    isSuspicious: checkResult.safetyLevel === LinkSafetyLevel.SUSPICIOUS,
  };
}
