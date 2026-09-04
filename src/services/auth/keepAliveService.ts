import { createLogger } from '../../utils/logger';
import { buildBackendUrl } from '../../utils/apiConfig';
import { getCsrfHeaders } from '../../utils/csrf';

const logger = createLogger('keepAliveService');

/**
 * Refresh the backend session by calling the keep-alive endpoint.
 */
export async function keepAlive(): Promise<boolean> {
  try {
    const response = await fetch(buildBackendUrl('/auth/keep-alive'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...getCsrfHeaders(),
      },
    });

    if (!response.ok) {
      logger.error('Backend keep-alive failed');

      if (response.status === 401) {
        logger.warn('Backend session already expired');
        return false;
      }

      throw new Error(`Failed to refresh session: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    logger.error('Error calling keep-alive endpoint', error);
    throw error;
  }
}
