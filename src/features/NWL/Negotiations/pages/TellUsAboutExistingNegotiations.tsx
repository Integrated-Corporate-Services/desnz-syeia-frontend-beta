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
import { NegotiationsData } from '../types/negotiations';
import { createLogger } from '../../../../utils/logger';
import SkipLink from '../../../../components/SkipLink';

const logger = createLogger('TellUsAboutExistingNegotiations');

/**
 * Tell Us About Existing Negotiations Page
 * Asks if there have been any negotiations and optionally collects start date
 */
const TellUsAboutExistingNegotiations: React.FC = () => {
  const { appId, negotiationsData, refetchNegotiationsData } = useNegotiationsData();
  const { errors, validateRadioSelection, validateDate, validateDateNotInFuture, setErrors } = useFormValidation();
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
    logger.debug('[TellUsAboutExistingNegotiations] negotiationsData changed:', {
      hasData: !!negotiationsData,
      has_negotiations: negotiationsData?.has_negotiations,
      date_day: negotiationsData?.negotiations_start_date_day,
      date_month: negotiationsData?.negotiations_start_date_month,
      date_year: negotiationsData?.negotiations_start_date_year,
    });
    
    if (negotiationsData) {
      const hasNegValue = negotiationsData.has_negotiations === true
        ? 'yes'
        : negotiationsData.has_negotiations === false
        ? 'no'
        : '';
      
      setHasNegotiations(hasNegValue);
      setStartDate({
        day: negotiationsData.negotiations_start_date_day || '',
        month: negotiationsData.negotiations_start_date_month || '',
        year: negotiationsData.negotiations_start_date_year || '',
      });
      
      logger.debug('[TellUsAboutExistingNegotiations] State updated:', {
        hasNegotiations: hasNegValue,
        startDate: {
          day: negotiationsData.negotiations_start_date_day || '',
          month: negotiationsData.negotiations_start_date_month || '',
          year: negotiationsData.negotiations_start_date_year || '',
        },
      });
    } else {
      logger.debug('[TellUsAboutExistingNegotiations] No negotiations data available');
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

    // Validate date when 'Yes' is selected
    if (hasNegotiations === 'yes') {
      // Check if any date field is empty
      if (!startDate.day || !startDate.month || !startDate.year) {
        setErrors({ date: 'Enter the start date' });
        window.scrollTo(0, 0);
        return;
      }
      
      // Validate date format, validity, and that it's not in the future
      if (!validateDateNotInFuture(startDate.day, startDate.month, startDate.year)) {
        window.scrollTo(0, 0);
        return;
      }
    }

    if (!appId) {
      return;
    }

    setIsSaving(true);

    try {
      const isYes = hasNegotiations === 'yes';
      const payload: Partial<NegotiationsData> = {
        has_negotiations: isYes,
      };

      // Date is mandatory when has_negotiations is true
      if (isYes) {
        payload.negotiations_start_date_day = startDate.day;
        payload.negotiations_start_date_month = startDate.month;
        payload.negotiations_start_date_year = startDate.year;

        payload.no_negotiations_reason = '';
        // Preserve existing comments
        payload.negotiations_evidence_comments = negotiationsData?.negotiations_evidence_comments || '';
      } else {
        payload.no_negotiations_reason = negotiationsData?.no_negotiations_reason || '';
        // Clear opposite flow field
        payload.negotiations_evidence_comments = '';
        payload.evidence_documents = [];
        payload.application_documents = [];
        payload.uploaded_files = [];
      }

      logger.debug('[TellUsAboutExistingNegotiations] Calling updateNegotiationsData with payload:', payload);
      const result = await updateNegotiationsData(appId, payload);
      logger.debug('[TellUsAboutExistingNegotiations] Backend response:', result);

      if (!result) {
        logger.error('[TellUsAboutExistingNegotiations] No response from backend - save may have failed');
        alert('Failed to save data. Please try again.');
        return;
      }

      // Refetch data to ensure state is updated
      logger.debug('[TellUsAboutExistingNegotiations] Refetching negotiations data...');
      await refetchNegotiationsData();
      logger.debug('[TellUsAboutExistingNegotiations] Refetch complete');

      if (hasNegotiations === 'yes') {
        navigateToEvidenceOfNegotiations();
      } else {
        navigateToWhyNoNegotiations();
      }
    } catch (error) {
      logger.error('Error saving negotiations data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <SkipLink />
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
                  <div className="govuk-body">
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
    </>
  );
};

export default TellUsAboutExistingNegotiations;
