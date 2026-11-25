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
