import React from 'react';
import { useParams } from 'react-router-dom';
import {
  CheckYourAnswersBreadcrumbs,
  SummarySection,
  DeclarationSection,
  ErrorSummary,
} from '../components';
import {
  useCheckYourAnswersData,
  useApplicationFormatter,
  useDeclarationSubmit,
} from '../hooks';
import { PAGE_LABELS } from '../constants/checkYourAnswersConstants';
import { createLogger } from '../../../../utils/logger';

const logger = createLogger('CheckYourAnswers');

/**
 * Check Your Answers Page for NWL Applications
 * Following GDS Design System patterns
 * Displays a summary of all application data before submission
 */
const CheckYourAnswers: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const appId = applicationId || '';

  // Fetch application data
  const { application, loading, error: dataError } = useCheckYourAnswersData(appId);

  // Format data for display
  const { sections } = useApplicationFormatter(application);

  // Handle declaration and submission
  const {
    declarationConfirmed,
    error: submitError,
    isSubmitting,
    handleDeclarationChange,
    handleSubmit,
  } = useDeclarationSubmit(appId);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
  };

  // Loading state
  if (loading) {
    return (
      <div className="govuk-width-container">
        <CheckYourAnswersBreadcrumbs appId={appId} />
        <main className="govuk-main-wrapper" id="main-content">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h1 className="govuk-heading-l">{PAGE_LABELS.TITLE}</h1>
              <p className="govuk-body">Loading application data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (dataError || !application) {
    logger.error('Failed to load application data', { appId, error: dataError });
    return (
      <div className="govuk-width-container">
        <CheckYourAnswersBreadcrumbs appId={appId} />
        <main className="govuk-main-wrapper" id="main-content">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <div className="govuk-error-summary" data-module="govuk-error-summary">
                <h2 className="govuk-error-summary__title">There is a problem</h2>
                <div className="govuk-error-summary__body">
                  <p>{dataError || 'Failed to load application data. Please try again.'}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Validation errors
  const errors: { [key: string]: string } = {};
  if (submitError) {
    errors.declaration = submitError;
  }

  return (
    <div className="govuk-width-container">
      <CheckYourAnswersBreadcrumbs appId={appId} />

      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-xl">{PAGE_LABELS.TITLE}</h1>

            {/* Error Summary */}
            <ErrorSummary errors={errors} />

            {/* Summary Sections */}
            {sections.map((section, index) => (
              <SummarySection key={`${section.heading}-${index}`} section={section} appId={appId} />
            ))}

            {/* Declaration and Submit Form */}
            <form onSubmit={handleFormSubmit} noValidate>
              <DeclarationSection
                isChecked={declarationConfirmed}
                error={errors.declaration}
                onChange={handleDeclarationChange}
              />

              <div className="govuk-button-group">
                <button
                  type="submit"
                  className="govuk-button"
                  data-module="govuk-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : PAGE_LABELS.SUBMIT_BUTTON}
                </button>
              </div>
            </form>

            {/* Information notice */}
            <div className="govuk-inset-text">
              <p className="govuk-body">
                By submitting this application you are agreeing to our terms and conditions.
              </p>
              <p className="govuk-body">
                After submission, you will be directed to make payment for your application.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckYourAnswers;
