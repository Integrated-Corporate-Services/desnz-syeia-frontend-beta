import React, { useState, useEffect } from 'react';
import { useGetApplicationId } from '../../../../hooks/useGetApplicationId';
import {
  LandDetailsBreadcrumbs,
  FormActions,
  ErrorSummary,
} from '../components';
import {
  useLandDetailsData,
  useLandNavigation,
} from '../hooks';
import { saveOSGridReference } from '../services/landDetailsService';
import { LAND_DETAILS_LABELS, LAND_DETAILS_VALIDATION } from '../constants';

const OSGridReference: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { landDetails, isLoading } = useLandDetailsData(applicationId);
  const { goToIdentifyingInformation } = useLandNavigation(applicationId);

  const [gridLetter, setGridLetter] = useState('');
  const [easting, setEasting] = useState('');
  const [northing, setNorthing] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorFields, setErrorFields] = useState<Record<string, string>>({});

  // Load existing data from backend
  useEffect(() => {
    if (landDetails) {
      setGridLetter(landDetails.os_grid_letter || '');
      setEasting(landDetails.os_grid_easting || '');
      setNorthing(landDetails.os_grid_northing || '');
    }
  }, [landDetails]);

  const validateFields = (): boolean => {
    const newErrors: Record<string, string> = {};
    const newErrorFields: Record<string, string> = {};

    // Only validate if any field has data (all fields are optional)
    const hasAnyData = gridLetter || easting || northing;

    if (hasAnyData) {
      // Grid letter validation: must be exactly 2 uppercase letters
      if (gridLetter && !/^[A-Z]{2}$/.test(gridLetter)) {
        newErrors.gridLetter = LAND_DETAILS_VALIDATION.GRID_LETTER_INVALID;
        newErrorFields.gridLetter = 'grid-letter';
      }

      // Easting validation: must be a number between 0 and 999999
      if (easting) {
        const eastingNum = parseInt(easting, 10);
        if (isNaN(eastingNum) || eastingNum < 0 || eastingNum > 999999) {
          newErrors.easting = LAND_DETAILS_VALIDATION.EASTING_INVALID;
          newErrorFields.easting = 'easting';
        }
      }

      // Northing validation: must be a number between 0 and 999999
      if (northing) {
        const northingNum = parseInt(northing, 10);
        if (isNaN(northingNum) || northingNum < 0 || northingNum > 999999) {
          newErrors.northing = LAND_DETAILS_VALIDATION.NORTHING_INVALID;
          newErrorFields.northing = 'northing';
        }
      }
    }

    setErrors(newErrors);
    setErrorFields(newErrorFields);

    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndContinue = async () => {
    if (!applicationId) return;

    if (!validateFields()) {
      window.scrollTo(0, 0);
      return;
    }

    setIsSaving(true);

    try {
      await saveOSGridReference(applicationId, {
        os_grid_letter: gridLetter,
        os_grid_easting: easting,
        os_grid_northing: northing,
      });

      goToIdentifyingInformation();
    } catch (error) {
      console.error('Error saving OS grid reference:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const labels = LAND_DETAILS_LABELS.OS_GRID_REFERENCE;

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

            <h1 className="govuk-heading-l">{labels.PAGE_TITLE}</h1>

            <p className="govuk-body">
              {labels.DESCRIPTION}{' '}
              <a 
                href="https://gridreferencefinder.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="govuk-link"
              >
                {labels.LINK_TEXT}
              </a>
            </p>

            <form>
              <div className={`govuk-form-group${errorFields.gridLetter ? ' govuk-form-group--error' : ''}`}>
                <label className="govuk-label" htmlFor="grid-letter">
                  {labels.GRID_LETTER}
                </label>
                <div id="grid-letter-hint" className="govuk-hint">
                  Two letter code (e.g., SP, TQ, NN)
                </div>
                {errorFields.gridLetter && (
                  <p id="grid-letter-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.gridLetter}
                  </p>
                )}
                <input
                  className={`govuk-input govuk-input--width-5${errorFields.gridLetter ? ' govuk-input--error' : ''}`}
                  id="grid-letter"
                  name="gridLetter"
                  type="text"
                  maxLength={2}
                  value={gridLetter}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                    setGridLetter(value);
                  }}
                  aria-describedby="grid-letter-hint"
                />
              </div>

              <div className={`govuk-form-group${errorFields.easting ? ' govuk-form-group--error' : ''}`}>
                <label className="govuk-label" htmlFor="easting">
                  {labels.EASTING}
                </label>
                <div id="easting-hint" className="govuk-hint">
                  Number between 0 and 999999
                </div>
                {errorFields.easting && (
                  <p id="easting-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.easting}
                  </p>
                )}
                <input
                  className={`govuk-input govuk-input--width-10${errorFields.easting ? ' govuk-input--error' : ''}`}
                  id="easting"
                  name="easting"
                  type="text"
                  maxLength={6}
                  value={easting}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setEasting(value);
                  }}
                  aria-describedby="easting-hint"
                />
              </div>

              <div className={`govuk-form-group${errorFields.northing ? ' govuk-form-group--error' : ''}`}>
                <label className="govuk-label" htmlFor="northing">
                  {labels.NORTHING}
                </label>
                <div id="northing-hint" className="govuk-hint">
                  Number between 0 and 999999
                </div>
                {errorFields.northing && (
                  <p id="northing-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.northing}
                  </p>
                )}
                <input
                  className={`govuk-input govuk-input--width-10${errorFields.northing ? ' govuk-input--error' : ''}`}
                  id="northing"
                  name="northing"
                  type="text"
                  maxLength={6}
                  value={northing}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setNorthing(value);
                  }}
                  aria-describedby="northing-hint"
                />
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

export default OSGridReference;
