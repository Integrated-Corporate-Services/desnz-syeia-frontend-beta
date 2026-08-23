import type { AuthUser } from '../types/auth';
import { createLogger } from '../utils/logger';
import { buildBackendUrl } from '../utils/apiConfig';
import { getCsrfHeaders } from '../utils/csrf';

const logger = createLogger('authService');

export type AuthUserResponse = {
  authenticated: boolean;
  user: AuthUser | null;
};

/**
 * Get current authenticated user from backend session
 * Always uses relative paths for same-origin requests
 */
export async function getAuthUser(): Promise<AuthUserResponse> {
  const response = await fetch(buildBackendUrl('/auth/user'), {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Not authenticated");
  }
  return response.json();
}

export async function signOut(): Promise<void> {
  await fetch(buildBackendUrl('/auth/logout'), {
    method: "POST",
    headers: {
      ...getCsrfHeaders(),
    },
    credentials: "include",
  });
}

/**
 * Refresh the backend session by calling the keep-alive endpoint
 * This extends the session timeout on the server side
 * @returns Promise resolving to true if successful, false if session expired
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
      
      // If session is already expired on backend, return false
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

export async function logout(redirectTo?: string): Promise<void> {
  logger.info("Logging out user...", { redirectTo });

  const parsedReason = (() => {
    if (!redirectTo) {
      return 'SESSION_GLOBAL_LOGOUT';
    }

    const reasonMatch = redirectTo.match(/[?&]reason=([^&]+)/);
    return reasonMatch ? decodeURIComponent(reasonMatch[1]) : 'SESSION_GLOBAL_LOGOUT';
  })();

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

  // Let the backend handle all logout logic including OIDC session destruction
  // The backend will redirect appropriately after destroying sessions
  window.location.assign(logoutUrl);
}