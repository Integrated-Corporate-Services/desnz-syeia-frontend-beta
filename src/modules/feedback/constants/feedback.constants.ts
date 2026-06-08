import type { RadioOption } from '../types/feedback.types';

export const IMPROVEMENTS_MAX_LENGTH = 1200;

export const CONTENT = {
  pageTitle: 'Give feedback on this service',
  pageIntro:
    'This is a new service in private beta. Tell us what worked and what did not - it takes about 2 minutes and helps us improve it for all organisations.',

  questionCompletedTask: 'Did you complete what you came to do today?',
  questionSatisfaction: 'Overall, how satisfied were you with this service?',
  questionEase: 'How easy or difficult was it to use this service?',
  questionLikelihood: 'How likely are you to recommend this service to other organisations?',
  questionImprovements: 'How could we improve this service?',

  improvementsHint:
    'Do not include personal or commercially sensitive information, such as application reference numbers, site addresses or names.',

  buttonSubmit: 'Send feedback',
  buttonSubmitting: 'Sending…',
  buttonCancel: 'Cancel',

  errorSummaryTitle: 'There is a problem',
  serverErrorTitle: 'There was a problem',

  charactersRemaining: (count: number) => `You have ${count} characters remaining`,

  confirmationTitle: 'Feedback submitted',
  confirmationMessage: 'Thank you for helping us improve this service.',
  confirmationReturnLink: 'Return to application dashboard',
} as const;

export const COMPLETED_TASK_OPTIONS: RadioOption[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

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

export const LIKELIHOOD_OPTIONS: RadioOption[] = [
  { value: 'very-likely', label: 'Very likely' },
  { value: 'likely', label: 'Likely' },
  { value: 'neither-likely', label: 'Neither likely nor unlikely' },
  { value: 'unlikely', label: 'Unlikely' },
  { value: 'very-unlikely', label: 'Very unlikely' },
];

export const ERROR_ANCHORS = {
  completedTask: '#completedTask-yes',
  satisfaction: '#satisfaction-very-satisfied',
  ease: '#ease-very-easy',
  likelihood: '#likelihood-very-likely',
  improvements: '#improvements',
} as const;

export type ErrorField = keyof typeof ERROR_ANCHORS;
