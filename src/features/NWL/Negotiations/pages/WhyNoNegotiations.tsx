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
import { createLogger } from '../../../../utils/logger';

const logger = createLogger('WhyNoNegotiations');

/**
 * Why No Negotiations Page
 * Collects reason why there are no negotiations
 */
const WhyNoNegotiations: React.FC = () => {
  const { appId, negotiationsData, refetchNegotiationsData } = useNegotiationsData();
  const { errors, validateNoNegotiationsReason } = useFormValidation();
  const { navigateToTaskList } = useNegotiationsNavigation(appId);
  const { updateProgress } = useNWLProgress(appId);

  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Log every render to track state changes (for debugging)
  logger.debug('[WhyNoNegotiations] ===== COMPONENT RENDER =====', {
    reason_value: reason,
    reason_length: reason.length,
    negotiationsData_available: !!negotiationsData,
    negotiationsData_no_negotiations_reason: negotiationsData?.no_negotiations_reason,
    negotiationsData_no_negotiations_reason_length: negotiationsData?.no_negotiations_reason?.length || 0,
  });

  useEffect(() => {
    logger.debug('[WhyNoNegotiations] ===== useEffect triggered by negotiationsData change =====');
    logger.debug('[WhyNoNegotiations] negotiationsData changed:', {
      hasData: !!negotiationsData,
      isNull: negotiationsData === null,
      isUndefined: negotiationsData === undefined,
      no_negotiations_reason: negotiationsData?.no_negotiations_reason,
      reason_length: negotiationsData?.no_negotiations_reason?.length || 0,
      has_negotiations: negotiationsData?.has_negotiations,
      application_id: negotiationsData?.application_id,
      negotiations_id: negotiationsData?.negotiations_id,
      raw_data: JSON.stringify(negotiationsData, null, 2),
    });
    
    if (negotiationsData) {
      const newReason = negotiationsData.no_negotiations_reason || '';
      logger.debug('[WhyNoNegotiations] About to update state with reason:', {
        newReason,
        newReasonLength: newReason.length,
        isEmptyString: newReason === '',
        isNull: negotiationsData.no_negotiations_reason === null,
        isUndefined: negotiationsData.no_negotiations_reason === undefined,
      });
      setReason(newReason);
      logger.debug('[WhyNoNegotiations] ✓ State updated, reason set to:', newReason);
    } else {
      logger.debug('[WhyNoNegotiations] No negotiations data available (data is null/undefined)');
    }
  }, [negotiationsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    logger.debug('[WhyNoNegotiations] ========== SAVE STARTED ==========');
    logger.debug('[WhyNoNegotiations] handleSubmit started', {
      appId,
      reason_length: reason.length,
      reason_value: reason,
      reason_type: typeof reason,
      reason_trimmed_length: reason.trim().length,
    });

    // VALIDATION CHECK
    const isValid = validateNoNegotiationsReason(reason);
    logger.debug('[WhyNoNegotiations] Validation result:', {
      isValid,
      reason_value: reason,
      reason_length: reason.length,
    });

    if (!isValid) {
      logger.error('[WhyNoNegotiations] ❌ VALIDATION FAILED - stopping save');
      window.scrollTo(0, 0);
      return;
    }

    logger.debug('[WhyNoNegotiations] ✓ Validation passed');

    if (!appId) {
      logger.error('[WhyNoNegotiations] ❌ No appId available - stopping save');
      return;
    }

    logger.debug('[WhyNoNegotiations] ✓ appId available:', appId);
    setIsSaving(true);

    try {
      // Use PATCH to only update reason without affecting other fields
      // If record doesn't exist (404), will fallback to POST which requires has_negotiations
      const payload = {
        has_negotiations: false,
        no_negotiations_reason: reason,
        negotiations_comments: '',
      };

      logger.debug('[WhyNoNegotiations] ===== CALLING API =====');
      logger.debug('[WhyNoNegotiations] API URL:', `/api/nwl/${appId}/negotiations`);
      logger.debug('[WhyNoNegotiations] Payload:', JSON.stringify(payload, null, 2));

      const result = await patchNegotiationsData(appId, payload);

      logger.debug('[WhyNoNegotiations] ===== API RESPONSE =====');
      logger.debug('[WhyNoNegotiations] Backend response:', {
        hasResult: !!result,
        negotiations_id: result?.negotiations_id,
        application_id: result?.application_id,
        has_negotiations: result?.has_negotiations,
        no_negotiations_reason: result?.no_negotiations_reason,
        reason_length: result?.no_negotiations_reason?.length || 0,
        full_result: JSON.stringify(result, null, 2),
      });

      if (!result) {
        logger.error('[WhyNoNegotiations] ❌ No response from backend - save may have failed');
        alert('Failed to save data. Please try again.');
        return;
      }

      // Verify the saved data
      if (result.no_negotiations_reason !== reason) {
        logger.error('[WhyNoNegotiations] ⚠️ WARNING: Saved data does not match input!', {
          sent: reason,
          received: result.no_negotiations_reason,
        });
      } else {
        logger.debug('[WhyNoNegotiations] ✓ Data saved correctly, matches input');
      }

      // Refetch data to ensure state is updated
      logger.debug('[WhyNoNegotiations] ===== REFETCHING DATA =====');
      logger.debug('[WhyNoNegotiations] Calling refetchNegotiationsData for appId:', appId);
      await refetchNegotiationsData();
      logger.debug('[WhyNoNegotiations] Refetch complete');
      
      // Update progress for Negotiations section
      try {
        await updateProgress('Negotiations', 'Completed');
        logger.info('[WhyNoNegotiations] Progress updated for Negotiations section');
      } catch (progressError) {
        logger.error('[WhyNoNegotiations] Error updating progress', progressError);
        // Continue even if progress update fails
      }
      
      navigateToTaskList();
    } catch (error) {
      logger.error('[WhyNoNegotiations] Error saving no negotiations reason:', error);
      alert('An error occurred while saving. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
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
    </>
  );
};

export default WhyNoNegotiations;
