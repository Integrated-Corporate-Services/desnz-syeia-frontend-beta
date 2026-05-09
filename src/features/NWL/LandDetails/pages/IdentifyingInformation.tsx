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

const IdentifyingInformation: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { landDetails, updateLandDetails } = useLandDetailsData(applicationId);
  const { errors, validateIdentifyingInfo, clearError } = useFormValidation();
  const { goToUploadSiteInformation } = useLandNavigation(applicationId);

  const [identifyingInfo, setIdentifyingInfo] = useState(landDetails.identifying_information || '');
  const [isSaving, setIsSaving] = useState(false);

  const maxCharacters = 4000;

  const handleIdentifyingInfoChange = (value: string) => {
    if (value.length <= maxCharacters) {
      setIdentifyingInfo(value);
      clearError('identifyingInfo');
    }
  };

  const handleSaveAndContinue = async () => {
    const isValid = validateIdentifyingInfo(identifyingInfo);

    if (!isValid) {
      window.scrollTo(0, 0);
      return;
    }

    setIsSaving(true);

    try {
      updateLandDetails({
        identifying_information: identifyingInfo,
      });

      goToUploadSiteInformation();
    } catch (error) {
      setIsSaving(false);
    }
  };

  const errorFields = {
    identifyingInfo: 'identifying-info',
  };

  const labels = LAND_DETAILS_LABELS.IDENTIFYING_INFORMATION;

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
              <div className={`govuk-form-group${errors.identifyingInfo ? ' govuk-form-group--error' : ''}`}>
                <div className="govuk-hint">
                  {labels.DESCRIPTION}
                </div>
                {errors.identifyingInfo && (
                  <p id="identifying-info-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.identifyingInfo}
                  </p>
                )}
                <textarea
                  className={`govuk-textarea${errors.identifyingInfo ? ' govuk-textarea--error' : ''}`}
                  id="identifying-info"
                  name="identifyingInfo"
                  rows={8}
                  value={identifyingInfo}
                  onChange={(e) => handleIdentifyingInfoChange(e.target.value)}
                  aria-describedby={errors.identifyingInfo ? 'identifying-info-error' : undefined}
                />
                <div id="identifying-info-hint" className="govuk-hint">
                  {labels.CHARACTER_LIMIT}
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

export default IdentifyingInformation;
