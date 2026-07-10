import React, { useState, useRef } from 'react';
import { useGetApplicationId } from '../../../../hooks/useGetApplicationId';
import { useNWLProgress } from '../../hooks/useNWLProgress';
import SkipLink from '../../../../components/SkipLink';
import {
  LandDetailsBreadcrumbs,
  FormActions,
  ErrorSummary,
  TextAreaWithCounter,
} from '../components';
import {
  useLandDetailsData,
  useFormValidation,
  useLandNavigation,
} from '../hooks';
import { LAND_DETAILS_LABELS } from '../constants';
import { ERROR_MESSAGES } from '../../../../constants/error';

const IdentifyingInformation: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { landDetails, updateLandDetails } = useLandDetailsData(applicationId);
  const { errors, validateIdentifyingInfo, clearError } = useFormValidation();
  const { goToUploadSiteInformation } = useLandNavigation(applicationId);
  const { updateProgress } = useNWLProgress(applicationId || undefined);

  const [identifyingInfo, setIdentifyingInfo] = useState(landDetails.identifying_information || '');
  const [isSaving, setIsSaving] = useState(false);
  const [versionError, setVersionError] = useState<string>('');
  const versionRef = useRef<number | undefined>(undefined);

  const maxCharacters = 4000;

  // Update local state when landDetails changes (after fetching from backend)
  React.useEffect(() => {
    if (landDetails.identifying_information !== undefined) {
      setIdentifyingInfo(landDetails.identifying_information);
    }
    if (landDetails) {
      versionRef.current = landDetails.version;
    }
  }, [landDetails.identifying_information, landDetails]);

  const handleIdentifyingInfoChange = (value: string) => {
    setIdentifyingInfo(value);
    clearError('identifyingInfo');
  };

  const handleSaveAndContinue = async () => {
    const isValid = validateIdentifyingInfo(identifyingInfo);

    if (!isValid) {
      window.scrollTo(0, 0);
      return;
    }

    setVersionError('');
    setIsSaving(true);

    try {
      await updateLandDetails({
        identifying_information: identifyingInfo,
        version: versionRef.current,
      });

      try {
        await updateProgress('Identifying information', 'Completed');
      } catch (err) {
        // Progress update failed, but continue anyway
      }

      goToUploadSiteInformation();
    } catch (error: any) {
      if (error.statusCode === 409 || error.isVersionConflict) {
        setVersionError(ERROR_MESSAGES.VERSION_CONFLICT);
        window.scrollTo(0, 0);
      }
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
              {versionError && (
                <div
                  className="govuk-error-summary"
                  data-module="govuk-error-summary"
                  tabIndex={-1}
                  role="alert"
                >
                  <h2 className="govuk-error-summary__title">
                    There is a problem
                  </h2>
                  <div className="govuk-error-summary__body">
                    <div dangerouslySetInnerHTML={{ __html: versionError }} />
                  </div>
                </div>
              )}

              <ErrorSummary errors={errors} errorFields={errorFields} />

            <h1 className="govuk-heading-l">{labels.PAGE_TITLE}</h1>

            <form>
              <TextAreaWithCounter
                id="identifying-info"
                name="identifyingInfo"
                label="Identifying information"
                labelClassName="govuk-label govuk-visually-hidden"
                hint={labels.DESCRIPTION}
                value={identifyingInfo}
                error={errors.identifyingInfo}
                rows={8}
                maxLength={maxCharacters}
                onChange={handleIdentifyingInfoChange}
                showLabel={true}
              />

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