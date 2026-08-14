import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NWL_BASE_URL } from "../../../../constants/nwl";
import { BREADCRUMBS, LABELS, FORM_ERRORS, FORM_LABELS } from "../constants/objectorDetailsConstants";
import { useObjectorDetailsData } from "../hooks/useObjectorDetailsData";
import { useFormValidation } from "../hooks/useFormValidation";
import { saveLandownerAddress } from "../services/objectorDetailsService";
import { useNWLProgress } from '../../hooks/useNWLProgress';

const LandownerAddress: React.FC = () => {
  const navigate = useNavigate();
  const { appId, objectorDetails } = useObjectorDetailsData();
  const { validatePostcode } = useFormValidation();
  const { updateProgress } = useNWLProgress(appId);

  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [town, setTown] = useState("");
  const [county, setCounty] = useState("");
  const [postcode, setPostcode] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>("");

  useEffect(() => {
    if (objectorDetails) {
      setAddressLine1(objectorDetails.landowner_address_line1 || "");
      setAddressLine2(objectorDetails.landowner_address_line2 || "");
      setTown(objectorDetails.landowner_town || "");
      setCounty(objectorDetails.landowner_county || "");
      setPostcode(objectorDetails.landowner_postcode || "");
    }
  }, [objectorDetails]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!addressLine1.trim()) newErrors.addressLine1 = FORM_ERRORS.MISSING_ADDRESS_LINE1;
    if (!town.trim()) newErrors.town = FORM_ERRORS.MISSING_TOWN;
    if (!postcode.trim()) {
      newErrors.postcode = FORM_ERRORS.MISSING_POSTCODE;
    } else {
      // Postcode is provided, validate format
      const postcodeError = validatePostcode(postcode);
      if (postcodeError) {
        newErrors.postcode = postcodeError;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClearFieldError = (fieldName: string) => {
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const mapBackendErrorFields = (validationErrors: unknown): { [key: string]: string } => {
    const mappedErrors: { [key: string]: string } = {};
    
    if (validationErrors && typeof validationErrors === 'object') {
      const errors = validationErrors as Record<string, any>;
      if (errors.landowner_address_line1) {
        mappedErrors.addressLine1 = errors.landowner_address_line1;
      }
      if (errors.landowner_address_line2) {
        mappedErrors.addressLine2 = errors.landowner_address_line2;
      }
      if (errors.landowner_town) {
        mappedErrors.town = errors.landowner_town;
      }
      if (errors.landowner_county) {
        mappedErrors.county = errors.landowner_county;
      }
      if (errors.landowner_postcode) {
        mappedErrors.postcode = errors.landowner_postcode;
      }
    }
    
    return mappedErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");

    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }

    setIsSaving(true);

    try {
      // Save to backend
      await saveLandownerAddress(appId, {
        landowner_address_line1: addressLine1,
        landowner_address_line2: addressLine2,
        landowner_town: town,
        landowner_county: county,
        landowner_postcode: postcode,
      });

      try {
        await updateProgress('Landowner details', 'Completed');
      } catch (e) {
        // ignore progress errors
      }
      navigate(`${NWL_BASE_URL}/${appId}/is-there-representative`);
    } catch (error: any) {
      // Handle backend validation errors
      if (error.status === 400 && error.validationErrors) {
        const mappedErrors = mapBackendErrorFields(error.validationErrors);
        setErrors(mappedErrors);
      } else if (error.message && error.message.includes('landowner_')) {
        // Parse field name from error message (e.g., "landowner_postcode" with value ...)
        const fieldMatch = error.message.match(/"(landowner_\w+)"/);
        if (fieldMatch) {
          const backendFieldName = fieldMatch[1];
          const fieldMap: { [key: string]: string } = {
            'landowner_address_line1': 'addressLine1',
            'landowner_address_line2': 'addressLine2',
            'landowner_town': 'town',
            'landowner_county': 'county',
            'landowner_postcode': 'postcode',
          };
          const frontendFieldName = fieldMap[backendFieldName];
          if (frontendFieldName) {
            setErrors({ [frontendFieldName]: error.message });
          } else {
            setSaveError(error.message || "Failed to save landowner address. Please try again.");
          }
        } else {
          setSaveError(error.message || "Failed to save landowner address. Please try again.");
        }
      } else {
        setSaveError(error.message || "Failed to save landowner address. Please try again.");
      }
      
      window.scrollTo(0, 0);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
            <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item" aria-current="false">
            <Link className="govuk-breadcrumbs__link" to={`${NWL_BASE_URL}/${appId}/task-list`}>{BREADCRUMBS.TASK_LIST}</Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="true">Landowner details</li>
        </ol>
      </nav>
              <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">{LABELS.LANDOWNER_ADDRESS_TITLE}</h1>
            {saveError && (
              <div className="govuk-error-summary" data-module="govuk-error-summary" tabIndex={-1} role="alert">
                <h2 className="govuk-error-summary__title">There is a problem</h2>
                <div className="govuk-error-summary__body">
                  <p>{saveError}</p>
                </div>
              </div>
            )}
            {Object.keys(errors).length > 0 && (
              <div className="govuk-error-summary" data-module="govuk-error-summary" tabIndex={-1} role="alert">
                <h2 className="govuk-error-summary__title">There is a problem</h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    {Object.entries(errors).map(([key, value]) => (<li key={key}><a href={`#${key}`}>{value}</a></li>))}
                  </ul>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} noValidate>
              <div className={`govuk-form-group ${errors.addressLine1 ? "govuk-form-group--error" : ""}`}>
                <label className="govuk-label" htmlFor="addressLine1">{FORM_LABELS.ADDRESS_LINE1}</label>
                {errors.addressLine1 && <p id="addressLine1-error" className="govuk-error-message"><span className="govuk-visually-hidden">Error:</span> {errors.addressLine1}</p>}
                <input className={`govuk-input ${errors.addressLine1 ? "govuk-input--error" : ""}`} id="addressLine1" name="addressLine1" type="text" value={addressLine1} onChange={(e) => {
                  setAddressLine1(e.target.value);
                  handleClearFieldError('addressLine1');
                }} aria-describedby={errors.addressLine1 ? "addressLine1-error" : undefined} />
              </div>
              <div className={`govuk-form-group ${errors.addressLine2 ? "govuk-form-group--error" : ""}`}>
                <label className="govuk-label" htmlFor="addressLine2">{FORM_LABELS.ADDRESS_LINE2}</label>
                {errors.addressLine2 && <p id="addressLine2-error" className="govuk-error-message"><span className="govuk-visually-hidden">Error:</span> {errors.addressLine2}</p>}
                <input className={`govuk-input ${errors.addressLine2 ? "govuk-input--error" : ""}`} id="addressLine2" name="addressLine2" type="text" value={addressLine2} onChange={(e) => {
                  setAddressLine2(e.target.value);
                  handleClearFieldError('addressLine2');
                }} aria-describedby={errors.addressLine2 ? "addressLine2-error" : undefined} />
              </div>
              <div className={`govuk-form-group ${errors.town ? "govuk-form-group--error" : ""}`}>
                <label className="govuk-label" htmlFor="town">{FORM_LABELS.TOWN}</label>
                {errors.town && <p id="town-error" className="govuk-error-message"><span className="govuk-visually-hidden">Error:</span> {errors.town}</p>}
                <input className={`govuk-input ${errors.town ? "govuk-input--error" : ""}`} id="town" name="town" type="text" value={town} onChange={(e) => {
                  setTown(e.target.value);
                  handleClearFieldError('town');
                }} aria-describedby={errors.town ? "town-error" : undefined} />
              </div>
              <div className={`govuk-form-group ${errors.county ? "govuk-form-group--error" : ""}`}>
                <label className="govuk-label" htmlFor="county">{FORM_LABELS.COUNTY}</label>
                {errors.county && <p id="county-error" className="govuk-error-message"><span className="govuk-visually-hidden">Error:</span> {errors.county}</p>}
                <input className={`govuk-input ${errors.county ? "govuk-input--error" : ""}`} id="county" name="county" type="text" value={county} onChange={(e) => {
                  setCounty(e.target.value);
                  handleClearFieldError('county');
                }} aria-describedby={errors.county ? "county-error" : undefined} />
              </div>
              <div className={`govuk-form-group ${errors.postcode ? "govuk-form-group--error" : ""}`}>
                <label className="govuk-label" htmlFor="postcode">{FORM_LABELS.POSTCODE}</label>
                {errors.postcode && <p id="postcode-error" className="govuk-error-message"><span className="govuk-visually-hidden">Error:</span> {errors.postcode}</p>}
                <input className={`govuk-input ${errors.postcode ? "govuk-input--error" : ""}`} id="postcode" name="postcode" type="text" value={postcode} onChange={(e) => {
                  setPostcode(e.target.value);
                  handleClearFieldError('postcode');
                }} aria-describedby={errors.postcode ? "postcode-error" : undefined} />
              </div>
              <button type="submit" className="govuk-button" data-module="govuk-button" disabled={isSaving}>
                {isSaving ? "Saving..." : LABELS.CONTINUE}
              </button>
            </form>
          </div>
        </div>
            </div>
    </>
  );
};

export default LandownerAddress;
