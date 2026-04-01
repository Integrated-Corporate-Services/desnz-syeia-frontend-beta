/**
 * Application Delete Confirmation Page
 * 
 * Separate page for application deletion confirmation
 */

import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { applicationApiService } from '../services/applicationApiService';
import { createLogger } from '../utils/logger';

const logger = createLogger('ApplicationDeleteConfirmationPage');

export const ApplicationDeleteConfirmationPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedOption, setSelectedOption] = useState<'yes' | 'no' | ''>('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Determine the base URL from the current path
  const getBaseUrl = () => {
    const pathname = location.pathname;
    if (pathname.includes('/s-37/')) return '/s-37';
    if (pathname.includes('/nwl/')) return '/nwl';
    if (pathname.includes('/tlp/')) return '/tlp';
    return '/s-37'; // fallback
  };

  const handleSubmit = async () => {
    if (selectedOption === 'no') {
      // Go back to task list
      const baseUrl = getBaseUrl();
      navigate(`${baseUrl}/${applicationId}/task-list`);
      return;
    }

    if (selectedOption === 'yes' && applicationId) {
      try {
        setIsDeleting(true);
        logger.info('Starting application deletion', { applicationId });
        
        const success = await applicationApiService.deleteApplication(applicationId);
        
        if (success) {
          logger.info('Application deletion successful', { applicationId });
          // Navigate to success page
          const baseUrl = getBaseUrl();
          navigate(`${baseUrl}/${applicationId}/delete-success`);
        } else {
          throw new Error('Deletion failed');
        }
      } catch (error) {
        logger.error('Application deletion failed', { applicationId, error });
        // Could navigate to an error page or show error message
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  if (!applicationId) {
    return <div>Invalid application ID</div>;
  }

  return (
    <div className="govuk-width-container">
      <div className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <a 
              href="#" 
              className="govuk-back-link" 
              onClick={(e) => {
                e.preventDefault();
                goBack();
              }}
            >
              Back
            </a>

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
                data-module="govuk-button"
                onClick={handleSubmit}
                disabled={!selectedOption || isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Save and continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};