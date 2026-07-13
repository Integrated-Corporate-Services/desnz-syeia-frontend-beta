import { useState } from 'react';
import { IMPROVEMENTS_MAX_LENGTH } from '../constants/feedback.constants';
import { submitFeedback } from '../services/feedback.api';
import type { FormValues, FormErrors, FeedbackPayload } from '../types/feedback.types';
import type { FeedbackSourceMetadata } from '../utils/extract-feedback-source.util';
import { validateUrlsInTextContent, type UrlWarning } from '../utils/url-content-validator.util';

const INITIAL_VALUES: FormValues = {
  satisfaction:  '',
  ease:          '',
  completedTask: '',
  userRole:      '',
  improvements:  '',
};

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.satisfaction) {
    errors.satisfaction = 'Select how satisfied you were with this service today';
  }
  if (!values.ease) {
    errors.ease = 'Select how easy it was to use this service';
  }
  if (!values.completedTask) {
    errors.completedTask = 'Select whether you managed to do what you came here to do';
  }
  if (!values.userRole) {
    errors.userRole = 'Select which best describes your role';
  }
  if (values.improvements.length > IMPROVEMENTS_MAX_LENGTH) {
    errors.improvements = `Your feedback must be ${IMPROVEMENTS_MAX_LENGTH} characters or fewer`;
  }

  // Validate URLs in improvements field (SECURITY: MEDIUM #10)
  if (values.improvements) {
    const urlWarning = validateUrlsInTextContent(values.improvements);
    if (urlWarning && urlWarning.type === 'error') {
      errors.improvements = urlWarning.message;
    }
  }

  return errors;
}

export function useFeedbackForm(sourceMetadata?: FeedbackSourceMetadata) {
  const [values,      setValues]      = useState<FormValues>(INITIAL_VALUES);
  const [errors,      setErrors]      = useState<FormErrors>({});
  const [submitted,   setSubmitted]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [urlWarning,  setUrlWarning]  = useState<UrlWarning | null>(null);

  function handleChange(field: keyof FormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Check for URLs in improvements field (SECURITY: MEDIUM #10)
    if (field === 'improvements') {
      const warning = validateUrlsInTextContent(value);
      setUrlWarning(warning);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTimeout(() => {
        const errorSummary = document.querySelector('.govuk-error-summary');
        if (errorSummary) {
          errorSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
          (errorSummary as HTMLElement).focus();
        }
      }, 50);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const payload: FeedbackPayload = {
        satisfaction:  values.satisfaction,
        ease:          values.ease,
        completedTask: values.completedTask,
        userRole:      values.userRole,
        ...(values.improvements ? { improvements: values.improvements } : {}),
        ...(sourceMetadata?.fullPath         ? { sourcePage:            sourceMetadata.fullPath }         : {}),
        ...(sourceMetadata?.applicationType  ? { sourceApplicationType: sourceMetadata.applicationType }  : {}),
        ...(sourceMetadata?.pageSlug         ? { sourceCategory:        sourceMetadata.pageSlug }         : {}),
      };
      await submitFeedback(payload);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'There was a problem sending your feedback.',
      );
      setTimeout(() => {
        const errorSummary = document.querySelector('.govuk-error-summary');
        if (errorSummary) {
          errorSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
          (errorSummary as HTMLElement).focus();
        }
      }, 50);
    } finally {
      setSubmitting(false);
    }
  }

  return {
    values,
    errors,
    submitted,
    submitting,
    serverError,
    urlWarning,
    handleChange,
    handleSubmit,
  };
}
