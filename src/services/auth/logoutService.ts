import { createLogger } from '../../utils/logger';
import { buildBackendUrl } from '../../utils/apiConfig';

const logger = createLogger('logoutService');

function getTerminationReason(redirectTo?: string): string {
  if (!redirectTo) {
    return 'SESSION_GLOBAL_LOGOUT';
  }

  const reasonMatch = redirectTo.match(/[?&]reason=([^&]+)/);
  return reasonMatch ? decodeURIComponent(reasonMatch[1]) : 'SESSION_GLOBAL_LOGOUT';
}

export async function logout(redirectTo?: string): Promise<void> {
  logger.info('Logging out user...', { redirectTo });

  const parsedReason = getTerminationReason(redirectTo);

  try {
    localStorage.setItem(
      'syeia.session.termination',
      JSON.stringify({ reason: parsedReason, at: Date.now() })
    );
  } catch (error) {
    logger.warn('Unable to broadcast logout event across tabs', error);
  }

  const logoutUrl = redirectTo
    ? buildBackendUrl(`/auth/logout?redirectTo=${encodeURIComponent(redirectTo)}`)
    : buildBackendUrl(`/auth/logout?redirectTo=${encodeURIComponent('/landingPage')}`);

  window.location.assign(logoutUrl);
}
