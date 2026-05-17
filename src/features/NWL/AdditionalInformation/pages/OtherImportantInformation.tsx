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

/**
 * Other Important Information Page
 * Asks if there is other important information to share
 */
const OtherImportantInformation: React.FC = () => {
  const { appId, additionalInformationData } = useAdditionalInformationData();
  const { errors, validateRadioSelection } = useFormValidation();
  const { navigateToTaskList } = useAdditionalInformationNavigation(appId);
  const navigate = useNavigate();

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

    setIsSaving(true);

    try {
      // Save other information flag to backend
      await createOrUpdateAdditionalInformationData(appId, {
        has_related_applications: additionalInformationData?.has_related_applications ?? false,
        related_applications_details: additionalInformationData?.related_applications_details,
        has_other_information: hasOtherInformation === 'yes',
        other_information_details: additionalInformationData?.other_information_details,
      });

      // Navigate based on response
      if (hasOtherInformation === 'yes') {
        navigate(`${NWL_BASE_URL}/${appId}/other-important-information/details`);
      } else {
        navigateToTaskList();
      }
    } catch (error) {
      console.error('Error saving other important information:', error);
      // TODO: Show error message to user
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="govuk-width-container">
      <AdditionalInformationBreadcrumbs 
        appId={appId} 
        currentPage={CONTENT.BREADCRUMBS.OTHER_IMPORTANT_INFORMATION}
      />

      <main className="govuk-main-wrapper" id="main-content">
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
      </main>
    </div>
  );
};

export default OtherImportantInformation;
