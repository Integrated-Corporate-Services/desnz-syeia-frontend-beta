import { categorizeUrl } from './url-categorizer';

export interface PageMetadata {
  pageName:         string;
  applicationType:  string;
  category:         string;
}

function extractPageName(pathname: string): string {
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .filter(seg => seg !== 'frontend');

  if (segments.length === 0) return 'home';

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    
    if (uuidPattern.test(seg)) continue;
    
    if (/^\d{3,}$/.test(seg)) continue;
    
    return seg;
  }

  return segments[segments.length - 1] || 'unknown';
}

export function extractPageMetadata(url: string): PageMetadata {
  try {
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
    console.error('[extractPageMetadata] Failed to parse URL:', url, error);
    return {
      pageName: 'unknown',
      applicationType: 'Common',
      category: 'Other',
    };
  }
}
