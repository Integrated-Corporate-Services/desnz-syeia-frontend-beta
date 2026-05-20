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
import { patchNegotiationsData } from '../services';
import { useNWLProgress } from '../../hooks/useNWLProgress';

/**
 * Why No Negotiations Page
 * Collects reason why there have been no negotiations
 */
const WhyNoNegotiations: React.FC = () => {
  const { appId, negotiationsData, refetchNegotiationsData } = useNegotiationsData();
  const { errors, validateNoNegotiationsReason } = useFormValidation();
  const { navigateToTaskList } = useNegotiationsNavigation(appId);
  const { updateProgress } = useNWLProgress(appId);

  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    console.log('[WhyNoNegotiations] negotiationsData changed:', {
      hasData: !!negotiationsData,
      no_negotiations_reason: negotiationsData?.no_negotiations_reason,
    });
    
    if (negotiationsData) {
      setReason(negotiationsData.no_negotiations_reason || '');
      console.log('[WhyNoNegotiations] State updated with reason:', negotiationsData.no_negotiations_reason);
    } else {
      console.log('[WhyNoNegotiations] No negotiations data available');
    }
  }, [negotiationsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('[WhyNoNegotiations] handleSubmit started', {
      reason_length: reason.length,
      reason: reason,
    });

    if (!validateNoNegotiationsReason(reason)) {
      window.scrollTo(0, 0);
      return;
    }

    if (!appId) {
      return;
    }

    setIsSaving(true);

    try {
      // Use PATCH to only update reason without affecting other fields
      console.log('[WhyNoNegotiations] Calling patchNegotiationsData...');
      const result = await patchNegotiationsData(appId, {
        no_negotiations_reason: reason,
        // Clear comments from opposite flow
        negotiations_comments: '',
      });

      console.log('[WhyNoNegotiations] Backend response:', result);

      if (!result) {
        console.error('[WhyNoNegotiations] No response from backend - save may have failed');
        alert('Failed to save data. Please try again.');
        return;
      }

      // Refetch data to ensure state is updated
      console.log('[WhyNoNegotiations] Refetching negotiations data...');
      await refetchNegotiationsData();
      console.log('[WhyNoNegotiations] Refetch complete');
      
      // Update progress for Negotiations section
      try {
        await updateProgress('Negotiations', 'Completed');
        console.log('[WhyNoNegotiations] Progress updated for Negotiations section');
      } catch (progressError) {
        console.error('[WhyNoNegotiations] Error updating progress', progressError);
        // Continue even if progress update fails
      }
      
      navigateToTaskList();
    } catch (error) {
      console.error('[WhyNoNegotiations] Error saving no negotiations reason:', error);
      alert('An error occurred while saving. Please try again.');
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
