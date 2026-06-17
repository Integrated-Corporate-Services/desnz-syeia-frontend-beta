import { buildBackendUrl } from '../../../utils/apiConfig';

export interface WorkAddress {
  line1: string;
  line2: string;
  townCity: string;
  county: string;
  postcode: string;
}

export interface UserDetailsResponse {
  title: string;
  firstName: string;
  lastName: string;
  fullName: string;
  organisationName: string;
  workAddress: WorkAddress;
  oneLogin: {
    email: string;
    phone: string;
  };
}

export interface UpdateFullNamePayload {
  title?: string;
  firstName: string;
  lastName: string;
}

export interface ValidationErrorResponse {
  error: string;
  validationErrors?: Record<string, string>;
}

export async function getCurrentUserDetails(): Promise<UserDetailsResponse> {
  const response = await fetch(buildBackendUrl('/backend/auth/details'), {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to load user details');
  }

  return response.json();
}

export async function updateCurrentUserFullName(payload: UpdateFullNamePayload): Promise<void> {
  const response = await fetch(buildBackendUrl('/backend/auth/details/full-name'), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    return;
  }

  const body = (await response.json().catch(() => ({}))) as ValidationErrorResponse;
  const error = new Error(body.error || 'Failed to update your full name') as Error & {
    validationErrors?: Record<string, string>;
    status?: number;
  };

  error.validationErrors = body.validationErrors;
  error.status = response.status;
  throw error;
}
