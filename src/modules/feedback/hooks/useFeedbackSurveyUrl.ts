import { useMemo } from 'react';
import { validateFeedbackUrl } from '../utils/url-validation.util';
import { DETAILED_SURVEY_URL } from '../constants/feedback.constants';
import { getRuntimeEnv } from '../../../config/runtimeEnv';

export function useFeedbackSurveyUrl() {
  return useMemo(() => {
    const configUrl = getRuntimeEnv('VITE_DETAILED_FEEDBACK_SURVEY_URL');
    const urlToValidate = configUrl && configUrl !== '#' ? configUrl : DETAILED_SURVEY_URL;
    const result = validateFeedbackUrl(urlToValidate);

    return {
      url: result.sanitizedUrl,
      isValidated: result.isValid,
      isFallback: !result.isValid,
      reason: result.reason,
    };
  }, []);
}
