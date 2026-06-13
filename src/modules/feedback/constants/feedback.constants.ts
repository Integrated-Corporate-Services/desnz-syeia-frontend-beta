import type { RadioOption } from '../types/feedback.types';

export const IMPROVEMENTS_MAX_LENGTH = 1200;

export const DETAILED_SURVEY_URL =
  (import.meta.env.VITE_DETAILED_FEEDBACK_SURVEY_URL as string | undefined) ?? '#';

/** Keeps each Figma line on one row before <br /> without custom CSS */
const singleLine = (text: string): string => text.replace(/ /g, '\u00A0');

export const CONTENT = {
  pageTitleLine1: singleLine('Give feedback for Submit your energy'),
  pageTitleLine2: 'infrastructure application',
  pageTitle: 'Give feedback for Submit your energy infrastructure application',
  pageIntro:
    'Help us improve this service for the best experience by completing this satisfaction survey.',
  pageIntroDetailedSurveyPrefix: singleLine('You can also '),
  pageIntroDetailedSurveyLink: singleLine('complete our detailed survey'),
  pageIntroDetailedSurveyLine1Suffix: singleLine(', which would give us much more '),
  pageIntroDetailedSurveyLine2:
    'valuable information about how we can improve this service.',

  breadcrumbHome: 'Home',

  questionSatisfaction: singleLine(
    'Overall, how satisfied were you with this service today?',
  ),
  questionEase: 'How easy was it to use this service?',
  questionCompletedTask: 'Did you manage to do what you came here to do?',
  questionRole: 'Which best describes your role?',
  questionImprovements: 'What could we improve? (optional)',

  improvementsHint:
    'Do not add any personal or financial information. For example, names, addresses or credit card details',

  buttonSubmit: 'Send feedback',
  buttonSubmitting: 'Sending…',

  errorSummaryTitle: 'There is a problem',
  serverErrorTitle: 'There was a problem',

  charactersRemaining: (count: number) => `You have ${count} characters remaining`,

  confirmationTitle: 'Your feedback has been submitted',

  confirmationWhatHappensNext: 'What happens next',
  confirmationThankYou: 'Thank you for submitting your feedback.',
  confirmationSurveyLink: 'You can help even more by completing our survey',
  confirmationSurveySuffix:
    ', which will give us much more valuable and detailed information about how we can improve this service.',
} as const;

export const SATISFACTION_OPTIONS: RadioOption[] = [
  { value: 'very-satisfied', label: 'Very satisfied' },
  { value: 'satisfied', label: 'Satisfied' },
  { value: 'neither', label: 'Neither satisfied nor dissatisfied' },
  { value: 'dissatisfied', label: 'Dissatisfied' },
  { value: 'very-dissatisfied', label: 'Very dissatisfied' },
];

export const EASE_OPTIONS: RadioOption[] = [
  { value: 'very-easy', label: 'Very easy' },
  { value: 'easy', label: 'Easy' },
  { value: 'neither-easy', label: 'Neither easy nor difficult' },
  { value: 'difficult', label: 'Difficult' },
  { value: 'very-difficult', label: 'Very difficult' },
];

export const COMPLETED_TASK_OPTIONS: RadioOption[] = [
  { value: 'yes-completely', label: 'Yes, completely' },
  { value: 'partly', label: 'Partly' },
  { value: 'no', label: 'No' },
];

export const ROLE_OPTIONS: RadioOption[] = [
  { value: 'employee', label: 'Employee of an applicant organisation' },
  { value: 'agent', label: 'Agent working on behalf of an applicant organisation' },
];

export const ERROR_ANCHORS = {
  satisfaction: '#satisfaction-very-satisfied',
  ease: '#ease-very-easy',
  completedTask: '#completedTask-yes-completely',
  userRole: '#userRole-employee',
  improvements: '#improvements',
} as const;

export type ErrorField = keyof typeof ERROR_ANCHORS;
