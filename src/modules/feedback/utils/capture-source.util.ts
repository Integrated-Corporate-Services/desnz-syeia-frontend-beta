import { createLogger } from '../../../utils/logger';

const logger = createLogger('FeedbackUtil');

export function captureSourcePage(): string | null {
  try {
    if (document.referrer) {
      const referrerUrl = new URL(document.referrer);
      if (referrerUrl.origin === window.location.origin) {
        return referrerUrl.pathname;
      }
    }

    const lastPage = sessionStorage.getItem('lastPage');
    if (lastPage && lastPage !== window.location.pathname) {
      return lastPage;
    }
  } catch (error) {
    logger.error('Failed to capture source page:', error);
  }

  return null;
}
