import { buildBackendUrl } from '../../utils/apiConfig';
import { getCsrfHeaders } from '../../utils/csrf';

export async function signOut(): Promise<void> {
  await fetch(buildBackendUrl('/auth/logout'), {
    method: 'POST',
    headers: {
      ...getCsrfHeaders(),
    },
    credentials: 'include',
  });
}
