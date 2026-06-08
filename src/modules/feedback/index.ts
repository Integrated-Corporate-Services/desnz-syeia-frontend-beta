/**
 * Feedback Module
 * 
 * Generic GOV.UK feedback form component for service improvement.
 * Collects user satisfaction data and improvement suggestions.
 */

// Pages
export { default as FeedbackPage } from './pages/FeedbackPage';

// Hooks
export { useFeedbackForm } from './hooks/useFeedbackForm';

// Re-export shared RadioGroup from commonFormFields
export { default as RadioGroup } from '../../components/commonFormFields/RadioGroup';

// API
export { submitFeedback } from './services/feedback.api';

// Types
export type {
  RadioOption,
  FormValues,
  FormErrors,
  FeedbackPayload,
} from './types/feedback.types';

// Constants
export {
  IMPROVEMENTS_MAX_LENGTH,
  COMPLETED_TASK_OPTIONS,
  SATISFACTION_OPTIONS,
  EASE_OPTIONS,
  LIKELIHOOD_OPTIONS,
} from './constants/feedback.constants';
