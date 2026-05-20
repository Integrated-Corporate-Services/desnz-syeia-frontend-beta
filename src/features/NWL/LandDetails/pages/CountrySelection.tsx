import React, { useState, useEffect } from 'react';
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
import { saveCountry } from '../services/landDetailsService';
import { LAND_DETAILS_LABELS } from '../constants';

const CountrySelection: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { landDetails, isLoading } = useLandDetailsData(applicationId);
  const { errors, validateCountry } = useFormValidation();
  const { goToLandRegistry } = useLandNavigation(applicationId);

  const [selectedCountry, setSelectedCountry] = useState<'England' | 'Wales' | ''>('');
  const [isSaving, setIsSaving] = useState(false);

  // Load existing data from backend
  useEffect(() => {
    if (landDetails) {
      const country = landDetails.country || '';
      // Database stores lowercase, convert to capitalized for display
      const capitalizedCountry = country.charAt(0).toUpperCase() + country.slice(1).toLowerCase();
      setSelectedCountry((capitalizedCountry === 'England' || capitalizedCountry === 'Wales') ? capitalizedCountry as 'England' | 'Wales' : '');
    }
  }, [landDetails]);

  const handleCountryChange = (country: 'England' | 'Wales') => {
    setSelectedCountry(country);
  };

  const handleSaveAndContinue = async () => {
    const isValid = validateCountry(selectedCountry);

    if (!isValid) {
      window.scrollTo(0, 0);
      return;
    }

    if (!applicationId) return;

    setIsSaving(true);

    try {
      // Database expects lowercase country values
      await saveCountry(applicationId, selectedCountry.toLowerCase());
      goToLandRegistry();
    } catch (error) {
      console.error('Error saving country:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const errorFields = {
    country: 'country-england',
  };

  const labels = LAND_DETAILS_LABELS.COUNTRY_SELECTION;

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

            <form>
              <div className={`govuk-form-group${errors.country ? ' govuk-form-group--error' : ''}`}>
                <fieldset className="govuk-fieldset">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <h1 className="govuk-fieldset__heading">
                      {labels.PAGE_TITLE}
                    </h1>
                  </legend>
                  {errors.country && (
                    <p id="country-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span> {errors.country}
                    </p>
                  )}
                  <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="country-england"
                        name="country"
                        type="radio"
                        value="England"
                        checked={selectedCountry === 'England'}
                        onChange={() => handleCountryChange('England')}
                        aria-describedby={errors.country ? 'country-error' : undefined}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="country-england">
                        {labels.ENGLAND}
                      </label>
                    </div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="country-wales"
                        name="country"
                        type="radio"
                        value="Wales"
                        checked={selectedCountry === 'Wales'}
                        onChange={() => handleCountryChange('Wales')}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="country-wales">
                        {labels.WALES}
                      </label>
                    </div>
                  </div>
                </fieldset>
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

export default CountrySelection;
