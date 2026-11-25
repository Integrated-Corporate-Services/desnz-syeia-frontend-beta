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
  CHECK_ANSWERS: `${OBJECTION_BASE_URL}/check-your-answers`,
  SUBMITTED: `${OBJECTION_BASE_URL}/objection-submitted`,
  WITHDRAW: `${OBJECTION_BASE_URL}/withdraw`,
  WITHDRAW_CONFIRM: `${OBJECTION_BASE_URL}/withdraw/confirm`,
  WITHDRAWN: `${OBJECTION_BASE_URL}/objection-withdrawn`,
} as const;

/** Added to Change links on check your answers, so the page returns there after saving (SYEIA-2933 AC5). */
export const CHANGE_PARAM = 'change';
export const changeLink = (route: string) => `${route}?${CHANGE_PARAM}=true`;
