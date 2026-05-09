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
import { LAND_DETAILS_LABELS } from '../constants';

const LandRegistry: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { landDetails, updateLandDetails } = useLandDetailsData(applicationId);
  const { errors, validateLandRegistry } = useFormValidation();
  const { goToLandRegistryInfo, goToUnregisteredLandDetails } = useLandNavigation(applicationId);

  const [hasLandRegistry, setHasLandRegistry] = useState<'yes' | 'no' | ''>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (landDetails.has_land_registry !== undefined) {
      setHasLandRegistry(landDetails.has_land_registry ? 'yes' : 'no');
    }
  }, [landDetails.has_land_registry]);

  const handleRadioChange = (value: 'yes' | 'no') => {
    setHasLandRegistry(value);
  };

  const handleSaveAndContinue = async () => {
    const isValid = validateLandRegistry(hasLandRegistry === 'yes');

    if (!isValid) {
      window.scrollTo(0, 0);
      return;
    }

    setIsSaving(true);

    try {
      const hasRegistry = hasLandRegistry === 'yes';
      updateLandDetails({
        has_land_registry: hasRegistry,
      });

      if (hasRegistry) {
        goToLandRegistryInfo();
      } else {
        goToUnregisteredLandDetails();
      }
    } catch (error) {
      setIsSaving(false);
    }
  };

  const errorFields = {
    hasLandRegistry: 'has-land-registry-yes',
  };

  const labels = LAND_DETAILS_LABELS.LAND_REGISTRY;

  return (
    <div className="govuk-width-container">
      <LandDetailsBreadcrumbs 
        applicationId={applicationId} 
        currentPage={labels.QUESTION_PAGE_TITLE}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <ErrorSummary errors={errors} errorFields={errorFields} />

            <form>
              <div className={`govuk-form-group${errors.hasLandRegistry ? ' govuk-form-group--error' : ''}`}>
                <fieldset className="govuk-fieldset">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <h1 className="govuk-fieldset__heading">
                      {labels.QUESTION_PAGE_TITLE}
                    </h1>
                  </legend>

                  {errors.hasLandRegistry && (
                    <p id="has-land-registry-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span> {errors.hasLandRegistry}
                    </p>
                  )}

                  <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="has-land-registry-yes"
                        name="hasLandRegistry"
                        type="radio"
                        value="yes"
                        checked={hasLandRegistry === 'yes'}
                        onChange={() => handleRadioChange('yes')}
                        aria-describedby={errors.hasLandRegistry ? 'has-land-registry-error' : undefined}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="has-land-registry-yes">
                        {labels.YES}
                      </label>
                    </div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="has-land-registry-no"
                        name="hasLandRegistry"
                        type="radio"
                        value="no"
                        checked={hasLandRegistry === 'no'}
                        onChange={() => handleRadioChange('no')}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="has-land-registry-no">
                        {labels.NO}
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

export default LandRegistry;
