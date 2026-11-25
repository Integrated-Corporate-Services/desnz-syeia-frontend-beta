import type { ObjectorType } from '../types/objectionJourney';

// Input IDs that each API field error links to from the error summary.
export const OBJECTION_FIELD_IDS: Record<string, string> = {
  reference: 'reference',
  action: 'action-submit',
  fullName: 'full-name',
  email: 'email',
  securityCode: 'security-code',
  objectionDetails: 'objection-details',
  document: 'objection-documents',
  postcode: 'postcode',
  property: 'property',
  address: 'address',
  addressLine1: 'address-line-1',
  addressLine2: 'address-line-2',
  town: 'town',
  county: 'county',
  objectorType: 'objector-type',
  withdrawSelection: 'withdraw-selection',
  withdrawalReason: 'withdrawal-reason',
  withdrawConfirmed: 'withdraw-confirmed',
};

/** Input ID for an API field error; objector name errors name their row (`objectorNames.2`). */
export const fieldIdFor = (field: string): string => {
  const row = /^objectorNames\.(\d+)$/.exec(field);
  if (row) return `objector-name-${row[1]}`;
  return OBJECTION_FIELD_IDS[field] ?? 'general';
};

// Not in the ACs; matches the backend limit until the BA answers the question on SYEIA-2937.
export const MAX_OBJECTORS = 20;

export const OBJECTION_MESSAGES = {
  TOO_MANY_REQUESTS: 'You have made too many requests. Try again in 15 minutes.',
  SERVICE_ERROR: 'Sorry, there is a problem with the service. Try again later.',
} as const;

export const OBJECTION_DETAILS_MAX_LENGTH = 4000;

// How often the objection page checks whether uploaded documents have finished their virus scan.
export const DOCUMENT_SCAN_POLL_MS = 3000;

// SYEIA-2923 AC5 gives this page; SYEIA-2932 links to it too until the BA confirms otherwise.
export const OBJECTION_GUIDANCE_URL = 'https://www.gov.uk/government/publications/compulsory-purchase-process-guidance';

// Radio labels on who is objecting (SYEIA-2931), repeated on check your answers (SYEIA-2933).
export const OBJECTOR_TYPE_LABELS: Record<ObjectorType, string> = {
  myself: 'Myself',
  organisation: 'An organisation I work for or am a member of',
  representative: 'A person, group or organisation I represent',
};

// SYEIA-2943: shown on the email page when the user is withdrawing.
export const OBJECTION_CONTACT_EMAIL = 'compulsorypurchaseorders@energysecurity.gov.uk';

export const characterCountMessage = (length: number, max = OBJECTION_DETAILS_MAX_LENGTH) => {
  const remaining = max - length;
  if (length === 0) return `You can enter up to ${max.toLocaleString('en-GB')} characters`;
  if (remaining < 0) return `You have ${Math.abs(remaining).toLocaleString('en-GB')} ${remaining === -1 ? 'character' : 'characters'} too many`;
  return `You have ${remaining.toLocaleString('en-GB')} ${remaining === 1 ? 'character' : 'characters'} remaining`;
};
