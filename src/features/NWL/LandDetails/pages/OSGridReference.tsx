import React, { useState } from 'react';
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
import { LAND_DETAILS_LABELS } from '../constants';

const OSGridReference: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { landDetails, updateLandDetails } = useLandDetailsData(applicationId);
  const { goToIdentifyingInformation } = useLandNavigation(applicationId);

  const [gridLetter, setGridLetter] = useState(landDetails.os_grid_reference_letter || '');
  const [easting, setEasting] = useState(landDetails.os_grid_reference_easting || '');
  const [northing, setNorthing] = useState(landDetails.os_grid_reference_northing || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAndContinue = async () => {
    setIsSaving(true);

    try {
      updateLandDetails({
        os_grid_reference_letter: gridLetter,
        os_grid_reference_easting: easting,
        os_grid_reference_northing: northing,
      });

      goToIdentifyingInformation();
    } catch (error) {
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
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="grid-letter">
                  {labels.GRID_LETTER}
                </label>
                <input
                  className="govuk-input govuk-input--width-5"
                  id="grid-letter"
                  name="gridLetter"
                  type="text"
                  maxLength={2}
                  value={gridLetter}
                  onChange={(e) => setGridLetter(e.target.value.toUpperCase())}
                />
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="easting">
                  {labels.EASTING}
                </label>
                <input
                  className="govuk-input govuk-input--width-10"
                  id="easting"
                  name="easting"
                  type="text"
                  maxLength={6}
                  value={easting}
                  onChange={(e) => setEasting(e.target.value)}
                />
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="northing">
                  {labels.NORTHING}
                </label>
                <input
                  className="govuk-input govuk-input--width-10"
                  id="northing"
                  name="northing"
                  type="text"
                  maxLength={6}
                  value={northing}
                  onChange={(e) => setNorthing(e.target.value)}
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
