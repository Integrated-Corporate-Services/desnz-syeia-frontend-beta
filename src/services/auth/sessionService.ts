import { buildBackendUrl } from '../../utils/apiConfig';
import type { AuthUserResponse } from './types';

/**
 * Get current authenticated user from backend session.
 */
export async function getAuthUser(): Promise<AuthUserResponse> {
  const response = await fetch(buildBackendUrl('/auth/user'), {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Not authenticated');
  }

  return response.json();
}
