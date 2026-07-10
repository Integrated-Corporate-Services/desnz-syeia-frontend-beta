import React, { useState, useEffect, useRef } from 'react';
import { useGetApplicationId } from '../../../../hooks/useGetApplicationId';
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
import { ERROR_MESSAGES } from '../../../../constants/error';

const CountrySelection: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { landDetails, updateLandDetails } = useLandDetailsData(applicationId);
  const { errors, validateCountry } = useFormValidation();
  const { goToLandRegistry } = useLandNavigation(applicationId);

  const [selectedCountry, setSelectedCountry] = useState<'England' | 'Wales' | ''>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>("");
  const [versionError, setVersionError] = useState<string>('');
  const versionRef = useRef<number | undefined>(undefined);

  // Sync state when landDetails is fetched
  useEffect(() => {
    if (landDetails.site_country) {
      setSelectedCountry(landDetails.site_country);
    }
    if (landDetails) {
      versionRef.current = landDetails.version;
    }
  }, [landDetails.site_country, landDetails]);

  const handleCountryChange = (country: 'England' | 'Wales') => {
    setSelectedCountry(country);
  };

  const handleSaveAndContinue = async () => {
    const isValid = validateCountry(selectedCountry);

    if (!isValid) {
      window.scrollTo(0, 0);
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setVersionError('');

    try {
      await updateLandDetails({
        site_country: selectedCountry,
        version: versionRef.current,
      });

      goToLandRegistry();
    } catch (error: any) {
      if (error.statusCode === 409 || error.isVersionConflict) {
        setVersionError(ERROR_MESSAGES.VERSION_CONFLICT);
      } else {
        setSaveError("Failed to save country selection. Please try again.");
      }
      window.scrollTo(0, 0);
    } finally {
      setIsSaving(false);
    }
  };

  const errorFields = {
    country: 'country-england',
  };

  const labels = LAND_DETAILS_LABELS.COUNTRY_SELECTION;

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
            {saveError && (
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
                  <p>{saveError}</p>
                </div>
              </div>
            )}
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
    </>
  );
};

export default CountrySelection;
