import React, { useState, useEffect } from 'react';
import {
  LABELS,
  FORM_LABELS,
  ERRORS,
} from '../constants';
import {
  useAdditionalInformationData,
  useFormValidation,
  useAdditionalInformationNavigation,
} from '../hooks';
import {
  AdditionalInformationBreadcrumbs,
  ErrorSummary,
  FormActions,
} from '../components';
import { CONTENT } from '../constants';
import { useNavigate } from 'react-router-dom';
import { NWL_BASE_URL } from '../../../../constants/nwl';
import { createOrUpdateAdditionalInformationData } from '../services/additionalInformationService';
import { useNWLProgress } from '../../hooks/useNWLProgress';

/**
 * Other Important Information Page
 * Asks if there is other important information to share
 */
const OtherImportantInformation: React.FC = () => {
  const { appId, additionalInformationData } = useAdditionalInformationData();
  const { errors, setErrors, validateRadioSelection } = useFormValidation();
  const { navigateToTaskList } = useAdditionalInformationNavigation(appId);
  const navigate = useNavigate();
  const { updateProgress } = useNWLProgress(appId);

  const [hasOtherInformation, setHasOtherInformation] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (additionalInformationData) {
      setHasOtherInformation(
        additionalInformationData.has_other_information === true
          ? 'yes'
          : additionalInformationData.has_other_information === false
          ? 'no'
          : ''
      );
    }
  }, [additionalInformationData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRadioSelection(hasOtherInformation, ERRORS.OTHER_INFO_RADIO_REQUIRED)) {
      window.scrollTo(0, 0);
      return;
    }

    if (!appId) {
      return;
    }

    // If user selects "Yes", navigate to details page without saving
    // The details page will save the complete data including the details text
    if (hasOtherInformation === 'yes') {
      navigate(`${NWL_BASE_URL}/${appId}/other-important-information/details`);
      return;
    }

    // If user selects "No", save with has_other_information set to false
    setIsSaving(true);

    try {
      // Save other information flag as false to backend
      await createOrUpdateAdditionalInformationData(appId, {
        has_related_applications: additionalInformationData?.has_related_applications ?? false,
        related_applications_details: additionalInformationData?.related_applications_details,
        has_other_information: false,
        // Don't send other_information_details when has_other_information is false
      });

      // Update progress for Supporting information section (backend subsection name)
      try {
        await updateProgress('Additional information', 'Completed');
      } catch (progressError) {
        // Continue even if progress update fails
      }

      navigateToTaskList();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
        ? String(error.response.data.error)
        : ERRORS.API_ERROR;
      setErrors({ api: errorMessage });
      window.scrollTo(0, 0);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
            <div className="govuk-width-container">
        <AdditionalInformationBreadcrumbs 
        appId={appId} 
        currentPage={CONTENT.BREADCRUMBS.OTHER_IMPORTANT_INFORMATION}
      />

              <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <ErrorSummary errors={errors} />

            <form onSubmit={handleSubmit} noValidate>
              <div
                className={`govuk-form-group ${
                  errors.radio ? 'govuk-form-group--error' : ''
                }`}
              >
                <fieldset className="govuk-fieldset">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <h1 className="govuk-fieldset__heading">
                      {LABELS.OTHER_INFORMATION_TITLE}
                    </h1>
                  </legend>
                  {errors.radio && (
                    <p id="radio-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span>{' '}
                      {errors.radio}
                    </p>
                  )}
                  <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="hasOtherInformation-yes"
                        name="hasOtherInformation"
                        type="radio"
                        value="yes"
                        checked={hasOtherInformation === 'yes'}
                        onChange={(e) => setHasOtherInformation(e.target.value)}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="hasOtherInformation-yes"
                      >
                        {FORM_LABELS.YES}
                      </label>
                    </div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="hasOtherInformation-no"
                        name="hasOtherInformation"
                        type="radio"
                        value="no"
                        checked={hasOtherInformation === 'no'}
                        onChange={(e) => setHasOtherInformation(e.target.value)}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="hasOtherInformation-no"
                      >
                        {FORM_LABELS.NO}
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>

              <FormActions isSaving={isSaving} />
            </form>
          </div>
        </div>
          </div>    </>  );
};

export default OtherImportantInformation;
