import { buildBackendUrl } from '../../../utils/apiConfig';
import { getCsrfHeaders } from '../../../utils/csrf';

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
  agencyName: string;
  organisations: {
    approved: OrganisationOption[];
    pending: OrganisationOption[];
  };
  workAddress: WorkAddress;
  oneLogin: {
    email: string;
    phone: string;
  };
}

export interface OrganisationOption {
  organisationId: string;
  organisationName: string;
}

export interface OrganisationSelectionResponse {
  approvedOrganisations: OrganisationOption[];
  pendingOrganisations: OrganisationOption[];
  availableOrganisations: OrganisationOption[];
}

export interface UpdateFullNamePayload {
  title?: string;
  firstName: string;
  lastName: string;
}

export interface UpdateWorkAddressPayload {
  line1: string;
  line2?: string;
  townCity: string;
  county?: string;
  postcode: string;
}

export interface UpdateAgencyNamePayload {
  agencyName: string;
}

export interface UpdateOrganisationsPayload {
  organisationIds: string[];
}

export interface ValidationErrorResponse {
  error: string;
  validationErrors?: Record<string, string>;
}

function throwApiError(body: ValidationErrorResponse, fallbackMessage: string, status: number): never {
  const error = new Error(body.error || fallbackMessage) as Error & {
    validationErrors?: Record<string, string>;
    status?: number;
  };

  error.validationErrors = body.validationErrors;
  error.status = status;
  throw error;
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
      ...getCsrfHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    return;
  }

  const body = (await response.json().catch(() => ({}))) as ValidationErrorResponse;
  throwApiError(body, 'Failed to update your full name', response.status);
}

export async function updateCurrentUserWorkAddress(payload: UpdateWorkAddressPayload): Promise<void> {
  const response = await fetch(buildBackendUrl('/backend/auth/details/work-address'), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getCsrfHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    return;
  }

  const body = (await response.json().catch(() => ({}))) as ValidationErrorResponse;
  throwApiError(body, 'Failed to update your work address', response.status);
}

export async function updateCurrentUserAgencyName(payload: UpdateAgencyNamePayload): Promise<void> {
  const response = await fetch(buildBackendUrl('/backend/auth/details/agency-name'), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getCsrfHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    return;
  }

  const body = (await response.json().catch(() => ({}))) as ValidationErrorResponse;
  throwApiError(body, 'Failed to update your agency name', response.status);
}

export async function getCurrentUserOrganisationSelection(): Promise<OrganisationSelectionResponse> {
  const response = await fetch(buildBackendUrl('/backend/auth/details/organisations-selection'), {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to load organisations');
  }

  return response.json();
}

export async function submitCurrentUserOrganisationRequest(
  payload: UpdateOrganisationsPayload
): Promise<void> {
  const response = await fetch(buildBackendUrl('/backend/auth/details/organisations-request'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getCsrfHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    return;
  }

  const body = (await response.json().catch(() => ({}))) as ValidationErrorResponse;
  throwApiError(body, 'Failed to submit your organisation request', response.status);
}
