export const OBJECTION_BASE_URL = '/object-to-a-cpo';

export const OBJECTION_ROUTES = {
  START: OBJECTION_BASE_URL,
  REFERENCE: `${OBJECTION_BASE_URL}/cpo-reference`,
  ACTION: `${OBJECTION_BASE_URL}/what-do-you-want-to-do`,
  FULL_NAME: `${OBJECTION_BASE_URL}/your-name`,
  EMAIL: `${OBJECTION_BASE_URL}/your-email`,
  CHECK_EMAIL: `${OBJECTION_BASE_URL}/check-your-email`,
  ADDRESS: `${OBJECTION_BASE_URL}/find-your-address`,
  CHOOSE_ADDRESS: `${OBJECTION_BASE_URL}/choose-your-address`,
  MANUAL_ADDRESS: `${OBJECTION_BASE_URL}/enter-your-address`,
  WHO_IS_OBJECTING: `${OBJECTION_BASE_URL}/who-is-objecting`,
  OBJECTOR_NAMES: `${OBJECTION_BASE_URL}/names-of-objectors`,
  OBJECTION: `${OBJECTION_BASE_URL}/your-objection`,
  // SYEIA-2933 check your answers (not built yet)
  CHECK_ANSWERS: `${OBJECTION_BASE_URL}/check-your-answers`,
  SUBMITTED: `${OBJECTION_BASE_URL}/objection-submitted`,
  // SYEIA-2943 withdraw journey (not built yet)
  WITHDRAW: `${OBJECTION_BASE_URL}/withdraw`,
} as const;
