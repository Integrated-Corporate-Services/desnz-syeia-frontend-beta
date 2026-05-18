import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { NWL_BASE_URL } from "../../../../constants/nwl";
import { useObjectorDetailsData } from "../hooks/useObjectorDetailsData";
import { saveObjectorAddress } from "../services";
import {
  BREADCRUMBS,
  LABELS,
  FORM_ERRORS,
  FORM_LABELS,
} from "../constants/objectorDetailsConstants";

/**
 * Objector Address Page
 * Collects objector's address information
 * Follows NWL architecture: Hook → Service → Backend
 */
const ObjectorAddress: React.FC = () => {
  const navigate = useNavigate();
  const appId = useGetApplicationId();
  
  // Use dedicated hook (NO application store)
  const { objectorDetails, isLoading, error: fetchError } = useObjectorDetailsData();

  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [town, setTown] = useState("");
  const [county, setCounty] = useState("");
  const [postcode, setPostcode] = useState("");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load existing data from objectorDetails
  useEffect(() => {
    if (objectorDetails) {
      setAddressLine1(objectorDetails.objector_address_line1 || "");
      setAddressLine2(objectorDetails.objector_address_line2 || "");
      setTown(objectorDetails.objector_town || "");
      setCounty(objectorDetails.objector_county || "");
      setPostcode(objectorDetails.objector_postcode || "");
    }
  }, [objectorDetails]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!addressLine1.trim()) {
      newErrors.addressLine1 = FORM_ERRORS.MISSING_ADDRESS_LINE1;
    }

    if (!town.trim()) {
      newErrors.town = FORM_ERRORS.MISSING_TOWN;
    }

    if (!postcode.trim()) {
      newErrors.postcode = FORM_ERRORS.MISSING_POSTCODE;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }

    if (!appId) {
      setSaveError('Application ID is missing');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      console.log('[ObjectorAddress] Saving address data for appId:', appId);
      
      await saveObjectorAddress(appId, {
        objector_address_line1: addressLine1,
        objector_address_line2: addressLine2,
        objector_town: town,
        objector_county: county,
        objector_postcode: postcode,
      });

      console.log('[ObjectorAddress] Address saved successfully');
      
      // Navigate to next page
      navigate(`${NWL_BASE_URL}/${appId}/is-objector-landowner`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save address';
      console.error('[ObjectorAddress] Save error:', errorMessage, err);
      setSaveError(errorMessage);
      window.scrollTo(0, 0);
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h1 className="govuk-heading-l">{LABELS.OBJECTOR_ADDRESS_TITLE}</h1>
              <p className="govuk-body">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show fetch error
  if (fetchError) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h1 className="govuk-heading-l">{LABELS.OBJECTOR_ADDRESS_TITLE}</h1>
              <div className="govuk-error-summary" role="alert">
                <h2 className="govuk-error-summary__title">There is a problem</h2>
                <div className="govuk-error-summary__body">
                  <p>{fetchError}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item" aria-current="false">
            <Link
              className="govuk-breadcrumbs__link"
              to={`${NWL_BASE_URL}/${appId}/task-list`}
            >
              {BREADCRUMBS.TASK_LIST}
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="true">
            {BREADCRUMBS.OBJECTOR_DETAILS}
          </li>
        </ol>
      </nav>

      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">{LABELS.OBJECTOR_ADDRESS_TITLE}</h1>

            {/* Show save error */}
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

            {/* Show validation errors */}
            {Object.keys(errors).length > 0 && (
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
                  <ul className="govuk-list govuk-error-summary__list">
                    {Object.entries(errors).map(([key, value]) => (
                      <li key={key}>
                        <a href={`#${key}`}>{value}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Address Line 1 */}
              <div
                className={`govuk-form-group ${
                  errors.addressLine1 ? "govuk-form-group--error" : ""
                }`}
              >
                <label className="govuk-label" htmlFor="addressLine1">
                  {FORM_LABELS.ADDRESS_LINE1}
                </label>
                {errors.addressLine1 && (
                  <p id="addressLine1-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span>{" "}
                    {errors.addressLine1}
                  </p>
                )}
                <input
                  className={`govuk-input ${
                    errors.addressLine1 ? "govuk-input--error" : ""
                  }`}
                  id="addressLine1"
                  name="addressLine1"
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  aria-describedby={
                    errors.addressLine1 ? "addressLine1-error" : undefined
                  }
                />
              </div>

              {/* Address Line 2 */}
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="addressLine2">
                  {FORM_LABELS.ADDRESS_LINE2}
                </label>
                <input
                  className="govuk-input"
                  id="addressLine2"
                  name="addressLine2"
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                />
              </div>

              {/* Town or City */}
              <div
                className={`govuk-form-group ${
                  errors.town ? "govuk-form-group--error" : ""
                }`}
              >
                <label className="govuk-label" htmlFor="town">
                  {FORM_LABELS.TOWN}
                </label>
                {errors.town && (
                  <p id="town-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span>{" "}
                    {errors.town}
                  </p>
                )}
                <input
                  className={`govuk-input ${
                    errors.town ? "govuk-input--error" : ""
                  }`}
                  id="town"
                  name="town"
                  type="text"
                  value={town}
                  onChange={(e) => setTown(e.target.value)}
                  aria-describedby={errors.town ? "town-error" : undefined}
                />
              </div>

              {/* County */}
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="county">
                  {FORM_LABELS.COUNTY}
                </label>
                <input
                  className="govuk-input"
                  id="county"
                  name="county"
                  type="text"
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                />
              </div>

              {/* Postcode */}
              <div
                className={`govuk-form-group ${
                  errors.postcode ? "govuk-form-group--error" : ""
                }`}
              >
                <label className="govuk-label" htmlFor="postcode">
                  {FORM_LABELS.POSTCODE}
                </label>
                {errors.postcode && (
                  <p id="postcode-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span>{" "}
                    {errors.postcode}
                  </p>
                )}
                <input
                  className={`govuk-input ${
                    errors.postcode ? "govuk-input--error" : ""
                  }`}
                  id="postcode"
                  name="postcode"
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  aria-describedby={
                    errors.postcode ? "postcode-error" : undefined
                  }
                />
              </div>

              <button
                type="submit"
                className="govuk-button"
                data-module="govuk-button"
              >
                {LABELS.CONTINUE}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ObjectorAddress;
