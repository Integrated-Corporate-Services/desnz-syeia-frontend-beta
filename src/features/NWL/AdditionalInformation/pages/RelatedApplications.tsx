import React, { useState, useEffect } from 'react';
import {
  LABELS,
  HINTS,
  FORM_LABELS,
  ERRORS,
  CHARACTER_LIMIT,
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
import { createOrUpdateAdditionalInformationData } from '../services/additionalInformationService';

/**
 * Related Applications Page
 * Asks if there are any related applications and collects details if yes
 */
const RelatedApplications: React.FC = () => {
  const { appId, additionalInformationData } = useAdditionalInformationData();
  const { errors, validateRadioSelection, validateRelatedApplicationsDetails } = useFormValidation();
  const { navigateToOtherImportantInformation, navigateToTaskList } = useAdditionalInformationNavigation(appId);

  const [hasRelatedApplications, setHasRelatedApplications] = useState<string>('');
  const [details, setDetails] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (additionalInformationData) {
      setHasRelatedApplications(
        additionalInformationData.has_related_applications === true
          ? 'yes'
          : additionalInformationData.has_related_applications === false
          ? 'no'
          : ''
      );
      setDetails(additionalInformationData.related_applications_details || '');
    }
  }, [additionalInformationData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRadioSelection(hasRelatedApplications, ERRORS.RADIO_REQUIRED)) {
      window.scrollTo(0, 0);
      return;
    }

    // Validate details only if "yes" is selected
    if (hasRelatedApplications === 'yes' && !validateRelatedApplicationsDetails(details)) {
      window.scrollTo(0, 0);
      return;
    }

    if (!appId) {
      return;
    }

    setIsSaving(true);

    try {
      // Save related applications data to backend
      await createOrUpdateAdditionalInformationData(appId, {
        has_related_applications: hasRelatedApplications === 'yes',
        related_applications_details: hasRelatedApplications === 'yes' ? details : undefined,
        has_other_information: additionalInformationData?.has_other_information ?? false,
        other_information_details: additionalInformationData?.other_information_details,
      });

      // Navigate based on response
      if (hasRelatedApplications === 'yes') {
        navigateToOtherImportantInformation();
      } else {
        navigateToTaskList();
      }
    } catch (error) {
      console.error('Error saving related applications:', error);
      // TODO: Show error message to user
    } finally {
      setIsSaving(false);
    }
  };

  const characterCount = details.length;
  const charactersRemaining = CHARACTER_LIMIT - characterCount;

  return (
    <div className="govuk-width-container">
      <AdditionalInformationBreadcrumbs 
        appId={appId} 
        currentPage={CONTENT.BREADCRUMBS.RELATED_APPLICATIONS}
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
                      {LABELS.RELATED_APPLICATIONS_TITLE}
                    </h1>
                  </legend>
                  <div className="govuk-hint">
                    {HINTS.RELATED_APPLICATIONS_INTRO}
                  </div>
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
                        id="hasRelatedApplications-yes"
                        name="hasRelatedApplications"
                        type="radio"
                        value="yes"
                        checked={hasRelatedApplications === 'yes'}
                        onChange={(e) => setHasRelatedApplications(e.target.value)}
                        data-aria-controls="conditional-details"
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="hasRelatedApplications-yes"
                      >
                        {FORM_LABELS.YES}
                      </label>
                    </div>
                    <div
                      className="govuk-radios__conditional"
                      id="conditional-details"
                      style={{
                        display: hasRelatedApplications === 'yes' ? 'block' : 'none',
                      }}
                    >
                      <div
                        className={`govuk-form-group ${
                          errors.details ? 'govuk-form-group--error' : ''
                        }`}
                      >
                        <label className="govuk-label" htmlFor="details">
                          {HINTS.RELATED_APPLICATIONS_DETAILS}
                        </label>
                        <div id="details-hint" className="govuk-hint">
                          {HINTS.RELATED_APPLICATIONS_GUIDANCE}
                        </div>
                        {errors.details && (
                          <p id="details-error" className="govuk-error-message">
                            <span className="govuk-visually-hidden">Error:</span>{' '}
                            {errors.details}
                          </p>
                        )}
                        <textarea
                          className={`govuk-textarea ${
                            errors.details ? 'govuk-textarea--error' : ''
                          }`}
                          id="details"
                          name="details"
                          rows={8}
                          value={details}
                          onChange={(e) => setDetails(e.target.value)}
                          aria-describedby={
                            errors.details
                              ? 'details-error details-hint details-info'
                              : 'details-hint details-info'
                          }
                          maxLength={CHARACTER_LIMIT}
                        />
                        <div
                          id="details-info"
                          className="govuk-hint govuk-character-count__message"
                          aria-live="polite"
                        >
                          {charactersRemaining >= 0
                            ? `You have ${charactersRemaining} characters remaining`
                            : `You have ${Math.abs(charactersRemaining)} characters too many`}
                        </div>
                      </div>
                    </div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="hasRelatedApplications-no"
                        name="hasRelatedApplications"
                        type="radio"
                        value="no"
                        checked={hasRelatedApplications === 'no'}
                        onChange={(e) => setHasRelatedApplications(e.target.value)}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="hasRelatedApplications-no"
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

export default RelatedApplications;
