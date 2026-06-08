import { useState } from 'react';
import { IMPROVEMENTS_MAX_LENGTH } from '../constants/feedback.constants';
import { submitFeedback }           from '../services/feedback.api';
import type { FormValues, FormErrors, FeedbackPayload } from '../types/feedback.types';
import type { PageMetadata } from '../../../lib/page-metadata';

const INITIAL_VALUES: FormValues = {
  completedTask: '',
  satisfaction:  '',
  ease:          '',
  likelihood:    '',
  improvements:  '',
};

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.completedTask) {
    errors.completedTask = 'Select whether you completed what you came to do';
  }
  if (!values.satisfaction) {
    errors.satisfaction = 'Select your satisfaction with this service';
  }
  if (!values.ease) {
    errors.ease = 'Select how easy or difficult the service was to use';
  }
  if (!values.likelihood) {
    errors.likelihood = 'Select how likely you are to recommend this service';
  }
  if (values.improvements.length > IMPROVEMENTS_MAX_LENGTH) {
    errors.improvements = `Your feedback must be ${IMPROVEMENTS_MAX_LENGTH} characters or fewer`;
  }

  return errors;
}

export function useFeedbackForm(sourceMetadata?: PageMetadata) {
  const [values,      setValues]      = useState<FormValues>(INITIAL_VALUES);
  const [errors,      setErrors]      = useState<FormErrors>({});
  const [submitted,   setSubmitted]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function handleChange(field: keyof FormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear the error for this field as soon as the user changes it
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Move focus to error summary and scroll to top
      setTimeout(() => {
        const errorSummary = document.querySelector('.govuk-error-summary');
        if (errorSummary) {
          errorSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
          (errorSummary as HTMLElement).focus();
        }
      }, 50);
      return;
    }

    // Clear validation errors when submitting (validation passed)
    setErrors({});
    setSubmitting(true);
    try {
      const payload: FeedbackPayload = {
        completedTask: values.completedTask,
        satisfaction:  values.satisfaction,
        ease:          values.ease,
        likelihood:    values.likelihood,
        ...(values.improvements ? { improvements: values.improvements } : {}),
        ...(sourceMetadata?.pageName         ? { sourcePage:            sourceMetadata.pageName }         : {}),
        ...(sourceMetadata?.applicationType  ? { sourceApplicationType: sourceMetadata.applicationType }  : {}),
        ...(sourceMetadata?.category         ? { sourceCategory:        sourceMetadata.category }         : {}),
      };
      await submitFeedback(payload);
      setSubmitted(true);
      // Scroll to top on success to show confirmation panel
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'There was a problem sending your feedback.',
      );
      // Scroll to server error
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
    handleChange,
    handleSubmit,
  };
}
