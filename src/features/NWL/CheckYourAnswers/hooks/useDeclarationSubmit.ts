import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationApiService } from '../../../../services/applicationApiService';
import { NWL_BASE_URL } from '../../../../constants/nwl';
import { createLogger } from '../../../../utils/logger';
import { ERROR_MESSAGES } from '../constants/checkYourAnswersConstants';

const logger = createLogger('useDeclarationSubmit');

/**
 * Hook to handle declaration and submission logic
 * Manages declaration state and API calls
 */
export const useDeclarationSubmit = (appId: string) => {
  const navigate = useNavigate();
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeclarationChange = (checked: boolean) => {
    setDeclarationConfirmed(checked);
    if (checked && error === ERROR_MESSAGES.MISSING_DECLARATION) {
      setError(null);
    }
  };

  const handleSubmit = async (): Promise<boolean> => {
    if (!declarationConfirmed) {
      setError(ERROR_MESSAGES.MISSING_DECLARATION);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      logger.debug('Saving declaration confirmation', {
        appId,
        declarationConfirmed: true,
      });

      // Save declaration to database
      await applicationApiService.confirmDeclaration(appId, true);
      
      logger.debug('Declaration saved successfully', { appId });

      // Navigate to pay and submit page
      navigate(`${NWL_BASE_URL}/${appId}/pay-and-submit`);
      return true;
    } catch (err) {
      logger.error('Failed to save declaration', err);
      setError(ERROR_MESSAGES.FAILED_TO_SAVE);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    declarationConfirmed,
    error,
    isSubmitting,
    handleDeclarationChange,
    handleSubmit,
  };
};
