import React, { useState, useEffect } from 'react';
import {
  LABELS,
  HINTS,
  FORM_LABELS,
  CONTENT,
} from '../constants/negotiationsConstants';
import {
  useNegotiationsData,
  useFormValidation,
  useNegotiationsNavigation,
} from '../hooks';
import {
  NegotiationsBreadcrumbs,
  ErrorSummary,
  DateInput,
  FormActions,
} from '../components';
import { updateNegotiationsData } from '../services';

/**
 * Tell Us About Existing Negotiations Page
 * Asks if there have been any negotiations and optionally collects start date
 */
const TellUsAboutExistingNegotiations: React.FC = () => {
  const { appId, negotiationsData } = useNegotiationsData();
  const { errors, validateRadioSelection, setErrors } = useFormValidation();
  const {
    navigateToEvidenceOfNegotiations,
    navigateToWhyNoNegotiations,
  } = useNegotiationsNavigation(appId);

  const [hasNegotiations, setHasNegotiations] = useState<string>('');
  const [startDate, setStartDate] = useState({
    day: '',
    month: '',
    year: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (negotiationsData) {
      setHasNegotiations(
        negotiationsData.has_negotiations === true
          ? 'yes'
          : negotiationsData.has_negotiations === false
          ? 'no'
          : ''
      );
      setStartDate({
        day: negotiationsData.negotiations_start_date_day || '',
        month: negotiationsData.negotiations_start_date_month || '',
        year: negotiationsData.negotiations_start_date_year || '',
      });
    }
  }, [negotiationsData]);

  const handleDateChange = (field: 'day' | 'month' | 'year', value: string) => {
    setStartDate((prev) => ({ ...prev, [field]: value }));
    // Clear date-related errors when user starts typing
    if (errors.date || errors.day || errors.month || errors.year) {
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRadioSelection(hasNegotiations)) {
      window.scrollTo(0, 0);
      return;
    }

    if (!appId) {
      return;
    }

    setIsSaving(true);

    try {
      const isYes = hasNegotiations === 'yes';
      await updateNegotiationsData(appId, {
        has_negotiations: isYes,
        negotiations_start_date_day: isYes ? startDate.day : undefined,
        negotiations_start_date_month: isYes ? startDate.month : undefined,
        negotiations_start_date_year: isYes ? startDate.year : undefined,
        // Clear opposite flow fields on page 1
        no_negotiations_reason: isYes ? '' : undefined,
        negotiations_comments: isYes ? undefined : '',
      });

      if (hasNegotiations === 'yes') {
        navigateToEvidenceOfNegotiations();
      } else {
        navigateToWhyNoNegotiations();
      }
    } catch (error) {
      console.error('Error saving negotiations data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="govuk-width-container">
      <NegotiationsBreadcrumbs appId={appId} />

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
                      {LABELS.EXISTING_NEGOTIATIONS_TITLE}
                    </h1>
                  </legend>
                  <div className="govuk-hint">
                    {CONTENT.EXISTING_NEGOTIATIONS_INTRO}
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
                        id="hasNegotiations-yes"
                        name="hasNegotiations"
                        type="radio"
                        value="yes"
                        checked={hasNegotiations === 'yes'}
                        onChange={(e) => setHasNegotiations(e.target.value)}
                        data-aria-controls="conditional-date"
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="hasNegotiations-yes"
                      >
                        {FORM_LABELS.YES}
                      </label>
                    </div>
                    <div
                      className="govuk-radios__conditional"
                      id="conditional-date"
                      style={{
                        display: hasNegotiations === 'yes' ? 'block' : 'none',
                      }}
                    >
                      <DateInput
                        date={startDate}
                        errors={errors}
                        onDateChange={handleDateChange}
                        legend={HINTS.START_DATE}
                        hint={HINTS.DATE_FORMAT}
                      />
                    </div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="hasNegotiations-no"
                        name="hasNegotiations"
                        type="radio"
                        value="no"
                        checked={hasNegotiations === 'no'}
                        onChange={(e) => setHasNegotiations(e.target.value)}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="hasNegotiations-no"
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

export default TellUsAboutExistingNegotiations;
