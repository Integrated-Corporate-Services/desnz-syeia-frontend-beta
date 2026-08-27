import { createLogger } from '../../../utils/logger';

const logger = createLogger('FeedbackSourceUtil');

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface FeedbackSourceMetadata {
  /** Full path without leading slash, e.g. s-37/{id}/project-overview */
  fullPath: string;
  /** Last route segment, e.g. project-overview */
  pageSlug: string;
  /** Application type derived from path: S37, NWL, or Common */
  applicationType: string;
}

function normalizePath(pathname: string): string {
  return pathname
    .replace(/^\/+|\/+$/g, '')
    .replace(/^frontend\/?/, '');
}

function extractPageSlug(segments: string[]): string {
  if (segments.length === 0) return 'home';

  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    if (UUID_PATTERN.test(seg)) continue;
    if (/^\d{3,}$/.test(seg)) continue;
    return seg;
  }

  return segments[segments.length - 1] || 'unknown';
}

function detectApplicationType(normalizedPath: string): string {
  const firstSegment = normalizedPath.split('/')[0]?.toLowerCase() ?? '';

  if (firstSegment === 's-37') return 'S37';
  if (firstSegment === 'nwl') return 'NWL';

  return 'Common';
}

export function extractFeedbackSourceMetadata(path: string): FeedbackSourceMetadata {
  try {
    const pathname = path.startsWith('http')
      ? new URL(path).pathname
      : path;

    const fullPath = normalizePath(pathname);
    if (!fullPath) {
      throw new Error('Empty source path after normalization');
    }

    const segments = fullPath.split('/').filter(Boolean);
    const pageSlug = extractPageSlug(segments);
    const applicationType = detectApplicationType(fullPath);

    return { fullPath, pageSlug, applicationType };
  } catch (error) {
    logger.error('Failed to extract feedback source metadata:', error);
    return {
      fullPath: 'unknown',
      pageSlug: 'unknown',
      applicationType: 'Common',
    };
  }
}
