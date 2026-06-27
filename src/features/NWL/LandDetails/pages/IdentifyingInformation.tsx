import React, { useState } from 'react';
import { useGetApplicationId } from '../../../../hooks/useGetApplicationId';
import { useNWLProgress } from '../../hooks/useNWLProgress';
import SkipLink from '../../../../components/SkipLink';
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
  const { updateProgress } = useNWLProgress(applicationId || undefined);

  const [identifyingInfo, setIdentifyingInfo] = useState(landDetails.identifying_information || '');
  const [isSaving, setIsSaving] = useState(false);

  const maxCharacters = 4000;

  // Update local state when landDetails changes (after fetching from backend)
  React.useEffect(() => {
    if (landDetails.identifying_information !== undefined) {
      setIdentifyingInfo(landDetails.identifying_information);
    }
  }, [landDetails.identifying_information]);

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
      await updateLandDetails({
        identifying_information: identifyingInfo,
      });

      try {
        await updateProgress('Identifying information', 'Completed');
      } catch (err) {
      }

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
    <>
      <SkipLink />
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
                <label className="govuk-label govuk-visually-hidden" htmlFor="identifying-info">
                  Identifying information
                </label>
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
                <div className="govuk-hint">
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
    </>
  );
};

export default IdentifyingInformation;