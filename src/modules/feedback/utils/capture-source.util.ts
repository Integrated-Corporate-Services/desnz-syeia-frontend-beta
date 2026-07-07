import { createLogger } from '../../../utils/logger';

const logger = createLogger('FeedbackUtil');

function isUsableSourcePath(path: string | null, currentPath: string): path is string {
  if (!path || path === currentPath || path.includes('/feedback')) {
    return false;
  }

  const normalized = path
    .replace(/^\/+|\/+$/g, '')
    .replace(/^frontend\/?/, '');

  return normalized.length > 0;
}

export function captureSourcePage(): string | null {
  try {
    const currentPath = window.location.pathname;

    // Prefer sessionStorage — reliably tracks React Router navigations within the SPA.
    const lastPage = sessionStorage.getItem('lastPage');
    if (isUsableSourcePath(lastPage, currentPath)) {
      return lastPage;
    }

    // Fallback to referrer for full-page navigations (e.g. external link into feedback).
    if (document.referrer) {
      const referrerUrl = new URL(document.referrer);
      if (referrerUrl.origin === window.location.origin) {
        const referrerPath = referrerUrl.pathname;
        if (isUsableSourcePath(referrerPath, currentPath)) {
          return referrerPath;
        }
      }
    }
  } catch (error) {
    logger.error('Failed to capture source page:', error);
  }

  return null;
}
