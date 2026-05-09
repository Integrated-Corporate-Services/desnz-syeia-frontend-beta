import React, { useState, useEffect } from 'react';
import {
  LABELS,
} from '../constants/negotiationsConstants';
import {
  useNegotiationsData,
  useFormValidation,
  useNegotiationsNavigation,
} from '../hooks';
import {
  NegotiationsBreadcrumbs,
  ErrorSummary,
  FormActions,
} from '../components';
import { updateNegotiationsData } from '../services';

/**
 * Why No Negotiations Page
 * Collects reason why there have been no negotiations
 */
const WhyNoNegotiations: React.FC = () => {
  const { appId, negotiationsData } = useNegotiationsData();
  const { errors, validateNoNegotiationsReason } = useFormValidation();
  const { navigateToTaskList } = useNegotiationsNavigation(appId);

  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (negotiationsData) {
      setReason(negotiationsData.no_negotiations_reason || '');
    }
  }, [negotiationsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateNoNegotiationsReason(reason)) {
      window.scrollTo(0, 0);
      return;
    }

    if (!appId) {
      return;
    }

    setIsSaving(true);

    try {
      await updateNegotiationsData(appId, {
        no_negotiations_reason: reason,
      });

      navigateToTaskList();
    } catch (error) {
      console.error('Error saving no negotiations reason:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const maxCharacters = 4000;
  const remainingChars = maxCharacters - reason.length;

  return (
    <div className="govuk-width-container">
      <NegotiationsBreadcrumbs appId={appId} />

      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <ErrorSummary errors={errors} />

            <form onSubmit={handleSubmit} noValidate>
              <div
                className={`govuk-form-group ${
                  errors.reason ? 'govuk-form-group--error' : ''
                }`}
              >
                <h1 className="govuk-label-wrapper">
                  <label className="govuk-label govuk-label--l" htmlFor="reason">
                    {LABELS.NO_NEGOTIATIONS_TITLE}
                  </label>
                </h1>
                {errors.reason && (
                  <p id="reason-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span>{' '}
                    {errors.reason}
                  </p>
                )}
                <textarea
                  className={`govuk-textarea ${
                    errors.reason ? 'govuk-textarea--error' : ''
                  }`}
                  id="reason"
                  name="reason"
                  rows={8}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  aria-describedby={
                    errors.reason ? 'reason-error reason-info' : 'reason-info'
                  }
                  maxLength={4000}
                />
                <div id="reason-info" className="govuk-hint govuk-character-count__message govuk-visually-hidden">
                  You can enter up to 4,000 characters
                </div>
                <div className="govuk-hint govuk-character-count__message govuk-character-count__status" aria-hidden="true">
                  You have {remainingChars} characters remaining
                </div>
                <div className="govuk-character-count__sr-status govuk-visually-hidden" aria-live="polite">
                  You have {remainingChars} characters remaining
                </div>
              </div>

              <FormActions isSaving={isSaving} />
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WhyNoNegotiations;
