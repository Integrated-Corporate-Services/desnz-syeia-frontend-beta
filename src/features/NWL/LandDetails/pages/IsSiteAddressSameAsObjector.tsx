import React, { useState, useEffect } from 'react';
import { useGetApplicationId } from '../../../../hooks/useGetApplicationId';
import { 
  LandDetailsBreadcrumbs, 
  FormActions, 
  ErrorSummary 
} from '../components';
import {
  useLandDetailsData,
  useFormValidation,
  useLandNavigation,
} from '../hooks';
import { useNWLProgress } from '../../hooks/useNWLProgress';
import { getObjectorDetails } from '../../ObjectorDetails/services/objectorDetailsService';
import { ObjectorDetails } from '../../ObjectorDetails/types';

const IsSiteAddressSameAsObjector: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { landDetails, updateLandDetails } = useLandDetailsData(applicationId);
  const { errors, validateRadioSelection, clearError } = useFormValidation();
  const { goToSiteAddress, goToCountrySelection } = useLandNavigation(applicationId);
  const { updateProgress } = useNWLProgress(applicationId);

  const [isSameAddress, setIsSameAddress] = useState<string>("");
  const [objectorAddress, setObjectorAddress] = useState<ObjectorDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>("");

  // Initialize radio button from backend data
  useEffect(() => {
    if (landDetails?.is_site_at_objector_address !== undefined) {
      setIsSameAddress(landDetails.is_site_at_objector_address ? "yes" : "no");
    }
  }, [landDetails?.is_site_at_objector_address]);

  // Fetch objector details on component mount
  useEffect(() => {
    const fetchObjectorAddress = async () => {
      if (applicationId) {
        setIsLoading(true);
        try {
          const details = await getObjectorDetails(applicationId);
          setObjectorAddress(details);
        } catch (error) {
          // Error fetching objector address
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchObjectorAddress();
  }, [applicationId]);

  const handleRadioChange = (value: string) => {
    setIsSameAddress(value);
    clearError('isSameAddress');
  };

  const handleSaveAndContinue = async () => {
    const isValid = validateRadioSelection(isSameAddress);

    if (!isValid) {
      window.scrollTo(0, 0);
      return;
    }

    setSaveError("");
    setIsSaving(true);

    try {
      // Update progress
      try {
        await updateProgress('Site address', 'In Progress');
      } catch (e) {
        // ignore progress errors
      }

      // Handle "Yes" case - copy objector address to site address
      if (isSameAddress === "yes" && objectorAddress) {
        try {
          await updateLandDetails({
            is_site_at_objector_address: true,
            site_address_line1: objectorAddress.objector_address_line1 || '',
            site_address_line2: objectorAddress.objector_address_line2 || '',
            site_town: objectorAddress.objector_town || '',
            site_county: objectorAddress.objector_county || '',
            site_postcode: objectorAddress.objector_postcode || '',
          });
          
          // Update progress to completed
          try {
            await updateProgress('Site address', 'Completed');
          } catch (e) {
            // ignore
          }
          
          // Navigate to country selection (skip address entry)
          goToCountrySelection();
        } catch (error) {
          setSaveError("Failed to save site address. Please try again.");
          window.scrollTo(0, 0);
        }
      } else {
        // If "No", clear all site address details and navigate to the address entry page
        try {
          await updateLandDetails({
            is_site_at_objector_address: false,
          
          });
        } catch (error) {
          // Error saving flag
        }
        goToSiteAddress();
      }
    } catch (error) {
      setSaveError("Failed to process selection. Please try again.");
      window.scrollTo(0, 0);
    } finally {
      setIsSaving(false);
    }
  };

  const errorFields = {
    isSameAddress: 'is-same-address',
  };

  if (isLoading) {
    return (
      <div className="govuk-width-container">
        <LandDetailsBreadcrumbs 
          applicationId={applicationId} 
          currentPage="Site address"
        />
                  <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <p>Loading objector address...</p>
            </div>
          </div>
              </div>
    );
  }

  return (
    <>
            <div className="govuk-width-container">
        <LandDetailsBreadcrumbs 
          applicationId={applicationId} 
          currentPage="Site address"
        />

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
            <ErrorSummary errors={errors} errorFields={errorFields} />

            <form>
              {/* Radio Button Selection */}
              <div className={`govuk-form-group ${errors.isSameAddress ? 'govuk-form-group--error' : ''}`}>
                <fieldset
                  className="govuk-fieldset"
                  aria-describedby={`is-same-address-hint${errors.isSameAddress ? ' is-same-address-error' : ''}`}
                >
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <h1 className="govuk-fieldset__heading">
                      Is the site address the same as the objector's address?
                    </h1>
                  </legend>
                  <div className="govuk-hint" id="is-same-address-hint">
                    The site address is the location of the electric lines specified in the Notice Remove this application
                  </div>
                  {errors.isSameAddress && (
                    <p className="govuk-error-message" id="is-same-address-error">
                      <span className="govuk-visually-hidden">Error:</span> {errors.isSameAddress}
                    </p>
                  )}
                  <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="is-same-address-yes"
                        name="isSameAddress"
                        type="radio"
                        value="yes"
                        checked={isSameAddress === "yes"}
                        onChange={(e) => handleRadioChange(e.target.value)}
                        aria-describedby={errors.isSameAddress ? 'isSameAddress-error' : undefined}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="is-same-address-yes">
                        Yes
                      </label>
                    </div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="is-same-address-no"
                        name="isSameAddress"
                        type="radio"
                        value="no"
                        checked={isSameAddress === "no"}
                        onChange={(e) => handleRadioChange(e.target.value)}
                        aria-describedby={errors.isSameAddress ? 'isSameAddress-error' : undefined}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="is-same-address-no">
                        No
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>

              {/* Display Objector Address - Always visible */}
              {objectorAddress && (
                <details className="govuk-details" data-module="govuk-details">
                  <summary className="govuk-details__summary">
                    <span className="govuk-details__summary-text">
                      Objector's address
                    </span>
                  </summary>
                  <div className="govuk-details__text">
                    <dl className="govuk-summary-list">
                      {objectorAddress.objector_address_line1 && (
                        <>
                          <dt className="govuk-summary-list__key">Objector address</dt>
                          <dd className="govuk-summary-list__value">
                            {objectorAddress.objector_address_line1}
                            {objectorAddress.objector_address_line2 && (
                              <>
                                <br />
                                {objectorAddress.objector_address_line2}
                              </>
                            )}
                            {objectorAddress.objector_town && (
                              <>
                                <br />
                                {objectorAddress.objector_town}
                              </>
                            )}
                            {objectorAddress.objector_county && (
                              <>
                                <br />
                                {objectorAddress.objector_county}
                              </>
                            )}
                            {objectorAddress.objector_postcode && (
                              <>
                                <br />
                                {objectorAddress.objector_postcode}
                              </>
                            )}
                          </dd>
                        </>
                      )}
                    </dl>
                  </div>
                </details>
              )}

              <FormActions
                onSaveAndContinue={handleSaveAndContinue}
                isSaving={isSaving}
              />
            </form>
          </div>
        </div>
            </div>
    </>
  );
};

export default IsSiteAddressSameAsObjector;
