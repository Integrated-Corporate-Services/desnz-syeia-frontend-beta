/**
 * Application Deletion Confirmation Component
 * 
 * Simple confirmation dialog for application deletion following GOV.UK Design System patterns
 */

import React, { useState } from 'react';
import { applicationApiService } from '../services/applicationApiService';
import { createLogger } from '../utils/logger';

const logger = createLogger('ApplicationDeletionConfirmation');

interface ApplicationDeletionConfirmationProps {
  applicationId: string;
  isOpen: boolean;
  onClose: () => void;
  onDeleteSuccess: () => void;
  onDeleteError: (error: string) => void;
}

export const ApplicationDeletionConfirmation: React.FC<ApplicationDeletionConfirmationProps> = ({
  applicationId,
  isOpen,
  onClose,
  onDeleteSuccess,
  onDeleteError,
}) => {
  const [step, setStep] = useState<'confirm' | 'success'>('confirm');
  const [selectedOption, setSelectedOption] = useState<'yes' | 'no' | ''>('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async () => {
    if (selectedOption === 'no') {
      onClose();
      return;
    }

    if (selectedOption === 'yes') {
      try {
        setIsDeleting(true);
        logger.info('Starting application deletion', { applicationId });
        
        const success = await applicationApiService.deleteApplication(applicationId);
        
        if (success) {
          logger.info('Application deletion successful', { applicationId });
          setStep('success');
        } else {
          throw new Error('Deletion failed');
        }
      } catch (error) {
        logger.error('Application deletion failed', { applicationId, error });
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        onDeleteError(errorMessage);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleReturnToDashboard = () => {
    onDeleteSuccess();
    onClose();
  };

  const reset = () => {
    setStep('confirm');
    setSelectedOption('');
    setIsDeleting(false);
  };

  // Reset when dialog closes
  React.useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="govuk-modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="govuk-modal" style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '4px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        {step === 'confirm' && (
          <>
            <h1 className="govuk-heading-l">Are you sure you want to delete this application?</h1>
            
            <div className="govuk-body">
              <p>This will remove all the information you have entered and remove the application from your dashboard. You cannot retrieve deleted applications.</p>
            </div>

            <div className="govuk-form-group">
              <fieldset className="govuk-fieldset">
                <div className="govuk-radios" data-module="govuk-radios">
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="delete-yes"
                      name="delete-confirmation"
                      type="radio"
                      value="yes"
                      checked={selectedOption === 'yes'}
                      onChange={() => setSelectedOption('yes')}
                      disabled={isDeleting}
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="delete-yes">
                      Yes, delete my application
                    </label>
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="delete-no"
                      name="delete-confirmation"
                      type="radio"
                      value="no"
                      checked={selectedOption === 'no'}
                      onChange={() => setSelectedOption('no')}
                      disabled={isDeleting}
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="delete-no">
                      No
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>

            <div className="govuk-button-group">
              <button 
                className="govuk-button" 
                onClick={handleSubmit}
                disabled={!selectedOption || isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Save and continue'}
              </button>
            </div>
          </>
        )}

        {step === 'success' && (
          <>
            <div className="govuk-panel govuk-panel--confirmation">
              <h1 className="govuk-panel__title">Application deleted</h1>
              <div className="govuk-panel__body">
                Your application has been deleted.
              </div>
            </div>
            
            <p className="govuk-body">
              <a href="#" className="govuk-link" onClick={(e) => {
                e.preventDefault();
                handleReturnToDashboard();
              }}>
                Return to dashboard
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
};