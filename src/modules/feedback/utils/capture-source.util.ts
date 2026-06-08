import { createLogger } from '../../../utils/logger';

const logger = createLogger('FeedbackUtil');

/**
 * Captures the source page URL using a hybrid approach:
 * 1. Primary: document.referrer (covers most navigation)
 * 2. Fallback: sessionStorage lastPage (for direct access/bookmarks)
 * 3. Default: null (if both fail)
 */
export function captureSourcePage(): string | null {
  try {
    // Try referrer first
    if (document.referrer) {
      const referrerUrl = new URL(document.referrer);
      // Only capture internal pages (same origin)
      if (referrerUrl.origin === window.location.origin) {
        return referrerUrl.pathname;
      }
    }

    // Fallback to sessionStorage
    const lastPage = sessionStorage.getItem('lastPage');
    if (lastPage && lastPage !== window.location.pathname) {
      return lastPage;
    }
  } catch (error) {
    logger.error('Failed to capture source page:', error);
  }

  return null;
}
