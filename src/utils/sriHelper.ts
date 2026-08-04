/**
 * Subresource Integrity (SRI) Helper Utilities
 * 
 * Utilities for adding SRI attributes to dynamically loaded scripts and links.
 * 
 * SECURITY ISSUE: MEDIUM #4 - No Subresource Integrity
 * CVSS: 5.5
 */

import { getSRIConfigByUrl, isSRIEnabled, isSRIEnforcing, SRI_MODE } from '../config/sriHashes';
import { createLogger } from './logger';

const logger = createLogger('SRI');

/**
 * Add SRI attributes to a script element
 * 
 * @param script - The script element to enhance
 * @param url - The script source URL
 * @returns The enhanced script element
 */
export function addSRIToScript(script: HTMLScriptElement, url: string): HTMLScriptElement {
  if (!isSRIEnabled()) {
    logger.debug('SRI disabled, skipping', { url });
    return script;
  }

  const sriConfig = getSRIConfigByUrl(url);
  
  if (!sriConfig) {
    logger.warn('No SRI configuration found for URL', { url });
    return script;
  }

  if (!sriConfig.integrity) {
    logger.warn('SRI hash is empty for URL', { url, mode: SRI_MODE });
    // Empty hash = skip SRI for this resource (e.g., frequently updated scripts)
    return script;
  }

  // Add integrity attribute
  script.setAttribute('integrity', sriConfig.integrity);
  script.setAttribute('crossorigin', sriConfig.crossorigin);

  logger.debug('Added SRI attributes', {
    url,
    integrity: sriConfig.integrity.substring(0, 20) + '...',
    crossorigin: sriConfig.crossorigin,
  });

  // Add error handler for SRI failures
  script.addEventListener('error', (event) => {
    handleSRIError(url, sriConfig.integrity, event);
  });

  return script;
}

/**
 * Add SRI attributes to a link element (for stylesheets)
 * 
 * @param link - The link element to enhance
 * @param url - The link href URL
 * @returns The enhanced link element
 */
export function addSRIToLink(link: HTMLLinkElement, url: string): HTMLLinkElement {
  if (!isSRIEnabled()) {
    return link;
  }

  const sriConfig = getSRIConfigByUrl(url);
  
  if (!sriConfig || !sriConfig.integrity) {
    return link;
  }

  link.setAttribute('integrity', sriConfig.integrity);
  link.setAttribute('crossorigin', sriConfig.crossorigin);

  logger.debug('Added SRI attributes to link', {
    url,
    integrity: sriConfig.integrity.substring(0, 20) + '...',
  });

  link.addEventListener('error', (event) => {
    handleSRIError(url, sriConfig.integrity, event);
  });

  return link;
}

/**
 * Handle SRI errors (hash mismatch or script load failure)
 * 
 * @param url - The URL that failed
 * @param integrity - The integrity hash that was used
 * @param event - The error event
 */
function handleSRIError(url: string, integrity: string, _event: Event): void {
  const errorMessage = 'SRI integrity check failed or script failed to load';
  
  logger.error(errorMessage, {
    url,
    integrity: integrity.substring(0, 20) + '...',
    mode: SRI_MODE,
    enforcing: isSRIEnforcing(),
  });

  // Log to console for visibility
  console.error(`[SRI] ${errorMessage}`, {
    url,
    solution: 'Run "npm run update-sri" to update SRI hashes',
    mode: SRI_MODE,
  });

  // In report mode, we've already logged the error
  // In enforce mode, the browser blocks the script automatically
  
  // Could send to error tracking service here
  if (window.location.hostname !== 'localhost') {
    // Send SRI failure to monitoring service
    sendSRIFailureToMonitoring(url, integrity);
  }
}

/**
 * Send SRI failure to monitoring/logging service
 * 
 * @param url - The URL that failed
 * @param integrity - The integrity hash
 */
function sendSRIFailureToMonitoring(url: string, integrity: string): void {
  // TODO: Integrate with actual monitoring service (e.g., CloudWatch, Sentry)
  logger.error('[SECURITY] SRI Failure - External resource integrity check failed', {
    url,
    integrity: integrity.substring(0, 30),
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    page: window.location.href,
  });
}

/**
 * Create a script element with SRI attributes
 * 
 * Helper function to create and configure a script element with SRI in one step
 * 
 * @param url - The script source URL
 * @param options - Additional script options
 * @returns Configured script element ready to be appended
 */
export function createScriptWithSRI(
  url: string,
  options: {
    id?: string;
    async?: boolean;
    defer?: boolean;
    type?: string;
    onLoad?: () => void;
    onError?: (event: Event) => void;
  } = {}
): HTMLScriptElement {
  const script = document.createElement('script');
  script.src = url;

  if (options.id) script.id = options.id;
  if (options.async !== undefined) script.async = options.async;
  if (options.defer !== undefined) script.defer = options.defer;
  if (options.type) script.type = options.type;
  if (options.onLoad) script.addEventListener('load', options.onLoad);
  if (options.onError) script.addEventListener('error', options.onError);

  // Add SRI attributes
  addSRIToScript(script, url);

  return script;
}

/**
 * Create a link element with SRI attributes
 * 
 * @param url - The stylesheet URL
 * @param options - Additional link options
 * @returns Configured link element ready to be appended
 */
export function createLinkWithSRI(
  url: string,
  options: {
    id?: string;
    rel?: string;
    type?: string;
  } = {}
): HTMLLinkElement {
  const link = document.createElement('link');
  link.href = url;
  link.rel = options.rel || 'stylesheet';
  if (options.id) link.id = options.id;
  if (options.type) link.type = options.type;

  // Add SRI attributes
  addSRIToLink(link, url);

  return link;
}

/**
 * Validate that all external scripts have SRI attributes
 * 
 * Useful for testing/verification
 * 
 * @returns Array of scripts missing SRI
 */
export function validateExternalScripts(): Array<{ element: HTMLScriptElement; src: string }> {
  if (!isSRIEnabled()) {
    return [];
  }

  const externalScripts = Array.from(document.querySelectorAll('script[src]'))
    .filter((script) => {
      const src = (script as HTMLScriptElement).src;
      // Check if it's an external script (not same origin)
      return src && !src.startsWith(window.location.origin) && (src.startsWith('http://') || src.startsWith('https://'));
    }) as HTMLScriptElement[];

  const missingIntegrity = externalScripts.filter((script) => !script.hasAttribute('integrity'));

  if (missingIntegrity.length > 0) {
    logger.warn('Found external scripts without integrity attribute', {
      count: missingIntegrity.length,
      scripts: missingIntegrity.map((s) => s.src),
    });
  }

  return missingIntegrity.map((element) => ({ element, src: element.src }));
}

/**
 * Log SRI status for debugging
 */
export function logSRIStatus(): void {
  logger.info('SRI Configuration Status', {
    enabled: isSRIEnabled(),
    mode: SRI_MODE,
    enforcing: isSRIEnforcing(),
    externalScriptsWithoutSRI: validateExternalScripts().length,
  });
}
