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

const LandRegistryInformation: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { landDetails, updateLandDetails } = useLandDetailsData(applicationId);
  const { errors, validateTitleNumber, clearError } = useFormValidation();
  const { goToOSGridReference } = useLandNavigation(applicationId);

  const [titleNumber, setTitleNumber] = useState(landDetails.land_registry_title_number || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleTitleNumberChange = (value: string) => {
    setTitleNumber(value);
    clearError('titleNumber');
  };

  const handleSaveAndContinue = async () => {
    const isValid = validateTitleNumber(titleNumber);

    if (!isValid) {
      window.scrollTo(0, 0);
      return;
    }

    setIsSaving(true);

    try {
      updateLandDetails({
        land_registry_title_number: titleNumber,
      });

      goToOSGridReference();
    } catch (error) {
      setIsSaving(false);
    }
  };

  const errorFields = {
    titleNumber: 'title-number',
  };

  const labels = LAND_DETAILS_LABELS.LAND_REGISTRY;

  return (
    <div className="govuk-width-container">
      <LandDetailsBreadcrumbs 
        applicationId={applicationId} 
        currentPage={labels.INFO_PAGE_TITLE}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <ErrorSummary errors={errors} errorFields={errorFields} />

            <h1 className="govuk-heading-l">{labels.INFO_PAGE_TITLE}</h1>

            <form>
              <div className={`govuk-form-group${errors.titleNumber ? ' govuk-form-group--error' : ''}`}>
                <label className="govuk-label" htmlFor="title-number">
                  {labels.TITLE_NUMBER}
                </label>
                <div id="title-number-hint" className="govuk-hint">
                  {labels.TITLE_NUMBER_HINT}
                </div>
                {errors.titleNumber && (
                  <p id="title-number-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.titleNumber}
                  </p>
                )}
                <input
                  className={`govuk-input govuk-input--width-20${errors.titleNumber ? ' govuk-input--error' : ''}`}
                  id="title-number"
                  name="titleNumber"
                  type="text"
                  value={titleNumber}
                  onChange={(e) => handleTitleNumberChange(e.target.value)}
                  aria-describedby={`title-number-hint${errors.titleNumber ? ' title-number-error' : ''}`}
                />
              </div>

              <div className="govuk-form-group">
                <h2 className="govuk-heading-m">{labels.DOCUMENTS_UPLOADED}</h2>
                
                <h3 className="govuk-heading-s">{labels.UPLOAD_SECTION_TITLE}</h3>
                <div className="govuk-hint">
                  {labels.UPLOAD_HINT}
                </div>

                <div className="govuk-file-upload">
                  <div className="govuk-file-upload__file-name">No file chosen</div>
                  <button type="button" className="govuk-button govuk-button--secondary" data-module="govuk-button">
                    Choose file
                  </button>
                  <span className="govuk-file-upload__or-text">or drop file</span>
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

export default LandRegistryInformation;
