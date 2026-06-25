import React, { useState, useEffect } from 'react';
import { useGetApplicationId } from '../../../../hooks/useGetApplicationId';
import SkipLink from '../../../../components/SkipLink';
import {
  LandDetailsBreadcrumbs,
  FormActions,
  ErrorSummary,
} from '../components';
import {
  useLandDetailsData,
  useLandNavigation,
} from '../hooks';
import { useNWLProgress } from '../../hooks/useNWLProgress';
import { LAND_DETAILS_LABELS } from '../constants';

const OSGridReference: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { landDetails, updateLandDetails } = useLandDetailsData(applicationId);
  const { goToIdentifyingInformation } = useLandNavigation(applicationId);
  const { updateProgress } = useNWLProgress(applicationId);

  const [gridLetter, setGridLetter] = useState(landDetails.os_grid_reference_letter || '');
  const [easting, setEasting] = useState(landDetails.os_grid_reference_easting || '');
  const [northing, setNorthing] = useState(landDetails.os_grid_reference_northing || '');

  // Sync form with fetched data
  useEffect(() => {
    setGridLetter(landDetails.os_grid_reference_letter || '');
    setEasting(landDetails.os_grid_reference_easting || '');
    setNorthing(landDetails.os_grid_reference_northing || '');
  }, [landDetails.os_grid_reference_letter, landDetails.os_grid_reference_easting, landDetails.os_grid_reference_northing]);
  const [errors, setErrors] = useState<{ gridLetter?: string; easting?: string; northing?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>("");

  const validateForm = () => {
    const newErrors: { gridLetter?: string; easting?: string; northing?: string } = {};

    // Each field is independently optional - only validate format if provided
    if (gridLetter && gridLetter.trim() !== '') {
      if (!/^[A-Z]{2}$/.test(gridLetter.trim())) {
        newErrors.gridLetter = 'Grid letter must be exactly 2 uppercase letters (e.g. TL, SP, SK)';
      }
    }

    if (easting && easting.trim() !== '') {
      if (!/^\d{1,6}$/.test(easting.trim())) {
        newErrors.easting = 'Easting must be 1-6 digits';
      }
    }

    if (northing && northing.trim() !== '') {
      if (!/^\d{1,6}$/.test(northing.trim())) {
        newErrors.northing = 'Northing must be 1-6 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndContinue = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      // Always save - send actual values or empty strings (backend will handle)
      // Each field is independently optional
      await updateLandDetails({
        os_grid_reference_letter: gridLetter.trim() || '',
        os_grid_reference_easting: easting.trim() || '',
        os_grid_reference_northing: northing.trim() || '',
      });

      try {
        await updateProgress('OS Grid reference', 'Completed');
      } catch (e) {
        // ignore progress errors
      }

      goToIdentifyingInformation();
    } catch (error) {
      setSaveError("Failed to save OS grid reference. Please try again.");
      window.scrollTo(0, 0);
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
            <ErrorSummary errors={{}} errorFields={{}} />

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
              <div className={`govuk-form-group ${errors.gridLetter ? 'govuk-form-group--error' : ''}`}>
                <label className="govuk-label" htmlFor="grid-letter">
                  {labels.GRID_LETTER}
                </label>
                <div className="govuk-hint">
                  2 uppercase letters, e.g. TL, SP, SK
                </div>
                {errors.gridLetter && (
                  <p className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.gridLetter}
                  </p>
                )}
                <input
                  className={`govuk-input govuk-input--width-5 ${errors.gridLetter ? 'govuk-input--error' : ''}`}
                  id="grid-letter"
                  name="gridLetter"
                  type="text"
                  maxLength={2}
                  value={gridLetter}
                  onChange={(e) => setGridLetter(e.target.value.toUpperCase())}
                />
              </div>

              <div className={`govuk-form-group ${errors.easting ? 'govuk-form-group--error' : ''}`}>
                <label className="govuk-label" htmlFor="easting">
                  {labels.EASTING}
                </label>
                <div className="govuk-hint">
                  1 to 6 digits
                </div>
                {errors.easting && (
                  <p className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.easting}
                  </p>
                )}
                <input
                  className={`govuk-input govuk-input--width-10 ${errors.easting ? 'govuk-input--error' : ''}`}
                  id="easting"
                  name="easting"
                  type="text"
                  maxLength={6}
                  value={easting}
                  onChange={(e) => setEasting(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div className={`govuk-form-group ${errors.northing ? 'govuk-form-group--error' : ''}`}>
                <label className="govuk-label" htmlFor="northing">
                  {labels.NORTHING}
                </label>
                <div className="govuk-hint">
                  1 to 6 digits
                </div>
                {errors.northing && (
                  <p className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.northing}
                  </p>
                )}
                <input
                  className={`govuk-input govuk-input--width-10 ${errors.northing ? 'govuk-input--error' : ''}`}
                  id="northing"
                  name="northing"
                  type="text"
                  maxLength={6}
                  value={northing}
                  onChange={(e) => setNorthing(e.target.value.replace(/\D/g, ''))}
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
    </>
  );
};

export default OSGridReference;