/**
 * Extracts page metadata from URLs for feedback source tracking.
 * Categorizes pages by URL patterns to understand where feedback originates.
 */

import { categorizeUrl } from './url-categorizer';

export interface PageMetadata {
  pageName:         string;  // Last URL segment, e.g., "task-list", "applicant-details"
  applicationType:  string;  // Application type: "S37", "NWL", "TLP", or "Common"
  category:         string;  // High-level category, e.g., "Applicant details", "Project details"
}

/**
 * Extracts the last meaningful segment from a URL path.
 * Skips UUIDs and numeric IDs to get the page name.
 */
function extractPageName(pathname: string): string {
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .filter(seg => seg !== 'frontend');  // Skip base path

  if (segments.length === 0) return 'home';

  // UUID pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  // Walk backwards to find the first non-ID segment
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    
    // Skip UUIDs
    if (uuidPattern.test(seg)) continue;
    
    // Skip pure numeric IDs (3+ digits)
    if (/^\d{3,}$/.test(seg)) continue;
    
    // Found a valid page name
    return seg;
  }

  // Fallback if only IDs found
  return segments[segments.length - 1] || 'unknown';
}

/**
 * Main extraction function.
 * Combines page name with applicationType/category metadata from URL pattern matching.
 */
export function extractPageMetadata(url: string): PageMetadata {
  try {
    // Parse URL (handle both full URLs and relative paths)
    const parsedUrl = url.startsWith('http') ? new URL(url) : new URL(`https://placeholder${url}`);
    const pathname = parsedUrl.pathname;

    const pageName = extractPageName(pathname);
    const { applicationType, category } = categorizeUrl(pathname);

    return {
      pageName,
      applicationType,
      category,
    };
  } catch (error) {
    // Fallback for malformed URLs
    console.error('[extractPageMetadata] Failed to parse URL:', url, error);
    return {
      pageName: 'unknown',
      applicationType: 'Common',
      category: 'Other',
    };
  }
}
