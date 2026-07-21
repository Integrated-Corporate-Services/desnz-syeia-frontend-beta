/**
 * XSS Prevention: Strict DOMPurify Configuration
 * 
 * Fix #1 from HighSecurity.md
 * CVSS: 7.2 (HIGH)
 * CWE-79: Cross-Site Scripting
 * 
 * Purpose: Provides strict HTML sanitization to prevent stored and reflected XSS attacks
 */

import DOMPurify from 'dompurify';

// Strict configuration for user-generated content
const STRICT_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)/i, // Only http, https, mailto
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'oninput', 'onchange'],
};

/**
 * Sanitize HTML with strict configuration
 * Use this for rich text fields that allow limited formatting
 */
export const sanitizeHtml = (dirty: string | undefined | null): string => {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, STRICT_CONFIG);
};

/**
 * Sanitize text by stripping ALL HTML
 * Use this for plain text fields (names, emails, etc.)
 */
export const sanitizeText = (dirty: string | undefined | null): string => {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
};

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export const sanitizeUrl = (url: string | undefined | null): string => {
  if (!url) return '';
  
  // Block dangerous protocols
  const dangerous = /^(javascript|data|vbscript|file):/i;
  if (dangerous.test(url.trim())) {
    return '';
  }
  
  return DOMPurify.sanitize(url, { 
    ALLOWED_TAGS: [],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)/i
  });
};

// Add hook to force rel="noopener noreferrer" on external links
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    const href = node.getAttribute('href');
    
    // External link detection
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      const currentDomain = window.location.hostname;
      try {
        const linkUrl = new URL(href);
        if (linkUrl.hostname !== currentDomain) {
          // External link - add security attributes
          node.setAttribute('rel', 'noopener noreferrer');
          node.setAttribute('target', '_blank');
        }
      } catch {
        // Invalid URL - remove href
        node.removeAttribute('href');
      }
    }
    
    // Block javascript: protocol
    if (href && href.toLowerCase().startsWith('javascript:')) {
      node.removeAttribute('href');
    }
  }
});

export default {
  sanitizeHtml,
  sanitizeText,
  sanitizeUrl,
};
