import React, { useState, useEffect } from 'react';
import {
  LABELS,
  CHARACTER_LIMITS,
  MESSAGES,
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
  TextAreaWithCounter,
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

  return (
    <div className="govuk-width-container">
      <NegotiationsBreadcrumbs appId={appId} />

      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <ErrorSummary errors={errors} />

            <form onSubmit={handleSubmit} noValidate>
              <h1 className="govuk-label-wrapper">
                <label className="govuk-label govuk-label--l" htmlFor="reason">
                  {LABELS.NO_NEGOTIATIONS_TITLE}
                </label>
              </h1>
              
              <TextAreaWithCounter
                id="reason"
                name="reason"
                value={reason}
                error={errors.reason}
                rows={8}
                maxLength={CHARACTER_LIMITS.MAX_REASON}
                onChange={setReason}
                characterRemainingMessage={MESSAGES.CHARACTER_REMAINING}
                showLabel={false}
              />

              <FormActions isSaving={isSaving} />
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WhyNoNegotiations;
