import React, { useState } from 'react';
import { useGetApplicationId } from '../../../../hooks/useGetApplicationId';
import {
  LandDetailsBreadcrumbs,
  FormActions,
  ErrorSummary,
} from '../components';
import {
  useLandDetailsData,
  useFormValidation,
  useLandNavigation,
} from '../hooks';
import { LAND_DETAILS_LABELS } from '../constants';

const UnregisteredLandDetails: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { landDetails, updateLandDetails } = useLandDetailsData(applicationId);
  const { errors, validateUnregisteredLand, clearError } = useFormValidation();
  const { goToOSGridReference } = useLandNavigation(applicationId);

  const [explanation, setExplanation] = useState(landDetails.unregistered_land_explanation || '');
  const [isSaving, setIsSaving] = useState(false);

  const maxCharacters = 4000;

  const handleExplanationChange = (value: string) => {
    if (value.length <= maxCharacters) {
      setExplanation(value);
      clearError('unregisteredLand');
    }
  };

  const handleSaveAndContinue = async () => {
    const isValid = validateUnregisteredLand(explanation);

    if (!isValid) {
      window.scrollTo(0, 0);
      return;
    }

    setIsSaving(true);

    try {
      updateLandDetails({
        unregistered_land_explanation: explanation,
      });

      goToOSGridReference();
    } catch (error) {
      setIsSaving(false);
    }
  };

  const errorFields = {
    unregisteredLand: 'unregistered-land-explanation',
  };

  const labels = LAND_DETAILS_LABELS.UNREGISTERED_LAND;

  return (
    <div className="govuk-width-container">
      <LandDetailsBreadcrumbs 
        applicationId={applicationId} 
        currentPage={labels.PAGE_TITLE}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <ErrorSummary errors={errors} errorFields={errorFields} />

            <h1 className="govuk-heading-l">{labels.PAGE_TITLE}</h1>

            <form>
              <div className={`govuk-form-group${errors.unregisteredLand ? ' govuk-form-group--error' : ''}`}>
                <label className="govuk-label" htmlFor="unregistered-land-explanation">
                  {labels.DESCRIPTION}
                </label>
                {errors.unregisteredLand && (
                  <p id="unregistered-land-explanation-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.unregisteredLand}
                  </p>
                )}
                <textarea
                  className={`govuk-textarea${errors.unregisteredLand ? ' govuk-textarea--error' : ''}`}
                  id="unregistered-land-explanation"
                  name="unregisteredLandExplanation"
                  rows={8}
                  value={explanation}
                  onChange={(e) => handleExplanationChange(e.target.value)}
                  aria-describedby={errors.unregisteredLand ? 'unregistered-land-explanation-error' : undefined}
                />
                <div id="unregistered-land-hint" className="govuk-hint">
                  {labels.CHARACTER_LIMIT}
                </div>
              </div>

              <div className="govuk-form-group">
                <h2 className="govuk-heading-m">{labels.DOCUMENTS_UPLOADED}</h2>
                {/* Documents will be listed here when backend integration is complete */}
              </div>

              <div className="govuk-form-group">
                <h2 className="govuk-heading-m">{labels.UPLOAD_SECTION_TITLE}</h2>
                <div className="govuk-hint">
                  {labels.UPLOAD_HINT}
                </div>
                <div className="govuk-file-upload" style={{ border: '2px dashed #b1b4b6', padding: '20px', textAlign: 'center', backgroundColor: '#f3f2f1' }}>
                  <p className="govuk-body">No file chosen</p>
                  <div className="govuk-button-group">
                    <button type="button" className="govuk-button govuk-button--secondary" data-module="govuk-button">
                      Choose file
                    </button>
                    <span className="govuk-body">or drop file</span>
                  </div>
                </div>
              </div>

              <FormActions
                onSaveAndContinue={handleSaveAndContinue}
                isSaving={isSaving}
              />
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UnregisteredLandDetails;
