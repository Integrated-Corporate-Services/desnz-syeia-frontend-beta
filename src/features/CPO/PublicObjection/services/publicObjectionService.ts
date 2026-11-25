import { buildBackendUrl } from '../../../../utils/apiConfig';
import { generateCorrelationId } from '../../../../utils/correlationId';
import { fetchCsrfToken, getCsrfHeaders } from '../../../../utils/csrf';
import { OBJECTION_MESSAGES } from '../constants/objectionContent';
import type {
  ObjectionAction,
  ObjectionFieldError,
  ObjectionJourney,
  ObjectionSubmission,
  ObjectorType,
  WithdrawableObjection,
} from '../types/objectionJourney';

/** The API rejected one or more answers; each error names the field it belongs to. */
export class ObjectionFieldErrors extends Error {
  constructor(public readonly errors: ObjectionFieldError[]) {
    super(errors[0]?.message ?? 'Validation failed');
    this.name = 'ObjectionFieldErrors';
  }
}

/** The session has no journey (it expired or was never started). */
export class ObjectionJourneyMissing extends Error {
  constructor() {
    super('No objection journey');
    this.name = 'ObjectionJourneyMissing';
  }
}

const BASE_PATH = '/api/cpo/public-objection';
const endpoint = (path = '') => buildBackendUrl(`${BASE_PATH}/journey${path}`);

const readJourney = async <T = ObjectionJourney>(response: Response): Promise<T> => {
  if (response.ok) return response.json();
  const body = await response.json().catch(() => ({}));
  if (response.status === 400 && Array.isArray(body.errors)) throw new ObjectionFieldErrors(body.errors);
  if (response.status === 404) throw new ObjectionJourneyMissing();
  if (response.status === 429) throw new Error(OBJECTION_MESSAGES.TOO_MANY_REQUESTS);
  throw new Error(OBJECTION_MESSAGES.SERVICE_ERROR);
};

const csrf = async () => {
  let csrfHeaders = getCsrfHeaders();
  if (!csrfHeaders['X-CSRF-Token']) {
    await fetchCsrfToken();
    csrfHeaders = getCsrfHeaders();
  }
  return csrfHeaders;
};

const read = async <T = ObjectionJourney>(url: string) =>
  readJourney<T>(await fetch(url, { credentials: 'include', headers: { 'X-Correlation-ID': generateCorrelationId() } }));

const send = async <T = ObjectionJourney>(method: 'POST' | 'PUT' | 'DELETE', path: string, body: Record<string, unknown> = {}) =>
  readJourney<T>(await fetch(endpoint(path), {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-Correlation-ID': generateCorrelationId(), ...(await csrf()) },
    body: JSON.stringify(body),
  }));

// The file is the request body; its name travels in a header so the backend can stream it straight to storage.
const sendFile = async (file: File) =>
  readJourney(await fetch(endpoint('/documents/upload'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'X-File-Name': encodeURIComponent(file.name),
      'X-Correlation-ID': generateCorrelationId(),
      ...(await csrf()),
    },
    body: file,
  }));

export const publicObjectionService = {
  get: () => read(endpoint()),
  start: (reference: string) => send('POST', '', { reference }),
  chooseAction: (action: ObjectionAction | null) => send('PUT', '/action', { action }),
  saveFullName: (fullName: string) => send('PUT', '/full-name', { fullName }),
  saveEmail: (email: string) => send('PUT', '/email', { email }),
  verifySecurityCode: (securityCode: string) => send('POST', '/security-code', { securityCode }),
  resendSecurityCode: () => send('POST', '/security-code/resend'),
  searchAddress: (postcode: string, property: string) => send('POST', '/address/search', { postcode, property }),
  selectAddress: (addressId: string) => send('PUT', '/address/select', { addressId }),
  saveAddress: (address: { addressLine1: string; addressLine2: string; town: string; county: string; postcode: string }) =>
    send('PUT', '/address', address),
  chooseObjectorType: (objectorType: ObjectorType | null) => send('PUT', '/objector-type', { objectorType }),
  saveObjectionDetails: (objectionDetails: string) => send('PUT', '/objection', { objectionDetails }),
  uploadDocument: (file: File) => sendFile(file),
  removeDocument: (fileId: string) => send('DELETE', `/documents/${encodeURIComponent(fileId)}`),
  saveObjectorNames: (objectorNames: string[]) => send('PUT', '/objector-names', { objectorNames }),
  submit: () => send<ObjectionSubmission>('POST', '/submit'),
  getSubmission: () => read<ObjectionSubmission>(buildBackendUrl(`${BASE_PATH}/submitted`)),
  getWithdrawable: () => read<{ objections: WithdrawableObjection[]; selected: string[] }>(endpoint('/withdrawable')),
  selectForWithdrawal: (objectionIds: string[]) => send<{ selected: string[] }>('PUT', '/withdraw-selection', { objectionIds }),
  withdraw: (reason: string, confirmed: boolean) => send<ObjectionSubmission>('POST', '/withdraw', { reason, confirmed }),
  getWithdrawn: () => read<ObjectionSubmission>(buildBackendUrl(`${BASE_PATH}/withdrawn`)),
};
