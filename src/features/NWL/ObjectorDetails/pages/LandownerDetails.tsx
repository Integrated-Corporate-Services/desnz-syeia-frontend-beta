import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NWL_BASE_URL } from "../../../../constants/nwl";
import {
  BREADCRUMBS,
  LABELS,
  FORM_ERRORS,
  FORM_LABELS,
  TITLE_OPTIONS,
} from "../constants/objectorDetailsConstants";
import { useObjectorDetailsData } from "../hooks/useObjectorDetailsData";
import { useFormValidation } from "../hooks/useFormValidation";
import { saveLandownerDetails } from "../services/objectorDetailsService";

const LandownerDetails: React.FC = () => {
  const navigate = useNavigate();
  const { appId, objectorDetails } = useObjectorDetailsData();
  const { validatePersonDetails, clearFieldError, errors: clientErrors } = useFormValidation();

  const [title, setTitle] = useState("");
  const [fullName, setFullName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>("");

  useEffect(() => {
    if (objectorDetails) {
      setTitle(objectorDetails.landowner_title || "");
      setFullName(objectorDetails.landowner_full_name || "");
      setOrganisation(objectorDetails.landowner_organisation || "");
      setEmail(objectorDetails.landowner_email || "");
      setPhone(objectorDetails.landowner_phone || "");
    }
  }, [objectorDetails]);

  /**
   * Map backend validation error field names to frontend field names
   */
  const mapBackendErrorFields = (validationErrors: any): { [key: string]: string } => {
    const mappedErrors: { [key: string]: string } = {};
    
    if (validationErrors && typeof validationErrors === 'object') {
      if (validationErrors.landowner_email) {
        mappedErrors.email = validationErrors.landowner_email;
      }
      if (validationErrors.landowner_phone) {
        mappedErrors.phone = validationErrors.landowner_phone;
      }
      if (validationErrors.landowner_full_name) {
        mappedErrors.fullName = validationErrors.landowner_full_name;
      }
      if (validationErrors.landowner_title) {
        mappedErrors.title = validationErrors.landowner_title;
      }
      if (validationErrors.landowner_organisation) {
        mappedErrors.organisation = validationErrors.landowner_organisation;
      }
    }
    
    return mappedErrors;
  };

  const handleClearFieldError = (fieldName: string) => {
    setFormErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[fieldName];
      return newErrors;
    });
    clearFieldError(fieldName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSaveError("");

    // Client-side validation (includes optional field format validation)
    if (!validatePersonDetails(fullName, email, phone)) {
      window.scrollTo(0, 0);
      return;
    }

    if (!appId) {
      return;
    }

    setIsSaving(true);

    try {
      // Save to backend
      await saveLandownerDetails(appId, {
        landowner_title: title,
        landowner_full_name: fullName,
        landowner_organisation: organisation,
        landowner_email: email,
        landowner_phone: phone,
      });

      navigate(`${NWL_BASE_URL}/${appId}/landowner-address`);
    } catch (error: any) {
      // Handle backend validation errors
      if (error.status === 400 && error.validationErrors) {
        const backendErrors = mapBackendErrorFields(error.validationErrors);
        setFormErrors(backendErrors);
      } else {
        setSaveError(error.message || "Failed to save landowner details. Please try again.");
      }
      
      window.scrollTo(0, 0);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item" aria-current="false">
            <Link className="govuk-breadcrumbs__link" to={`${NWL_BASE_URL}/${appId}/task-list`}>
              {BREADCRUMBS.TASK_LIST}
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="true">
            Landowner details
          </li>
        </ol>
      </nav>
      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">{LABELS.LANDOWNER_DETAILS_TITLE}</h1>
            
            {saveError && (
              <div className="govuk-error-summary" data-module="govuk-error-summary" tabIndex={-1} role="alert">
                <h2 className="govuk-error-summary__title">There is a problem</h2>
                <div className="govuk-error-summary__body">
                  <p>{saveError}</p>
                </div>
              </div>
            )}
            
            {(Object.keys(formErrors).length > 0 || Object.keys(clientErrors).length > 0) && (
              <div className="govuk-error-summary" data-module="govuk-error-summary" tabIndex={-1} role="alert">
                <h2 className="govuk-error-summary__title">There is a problem</h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    {Object.entries({ ...clientErrors, ...formErrors }).map(([key, value]) => (
                      <li key={key}><a href={`#${key}`}>{value}</a></li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} noValidate>
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="title">{FORM_LABELS.TITLE}</label>
                <select className="govuk-select" id="title" name="title" value={title} onChange={(e) => {
                  setTitle(e.target.value);
                  handleClearFieldError('title');
                }}>
                  {TITLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.text}</option>
                  ))}
                </select>
              </div>
              
              <div className={`govuk-form-group ${(formErrors.fullName || clientErrors.fullName) ? "govuk-form-group--error" : ""}`}>
                <label className="govuk-label" htmlFor="fullName">{FORM_LABELS.FULL_NAME}</label>
                {(formErrors.fullName || clientErrors.fullName) && <p id="fullName-error" className="govuk-error-message"><span className="govuk-visually-hidden">Error:</span> {formErrors.fullName || clientErrors.fullName}</p>}
                <input className={`govuk-input ${(formErrors.fullName || clientErrors.fullName) ? "govuk-input--error" : ""}`} id="fullName" name="fullName" type="text" value={fullName} onChange={(e) => {
                  setFullName(e.target.value);
                  handleClearFieldError('fullName');
                }} aria-describedby={(formErrors.fullName || clientErrors.fullName) ? "fullName-error" : undefined} />
              </div>
              
              <div className={`govuk-form-group ${(formErrors.organisation || clientErrors.organisation) ? "govuk-form-group--error" : ""}`}>
                <label className="govuk-label" htmlFor="organisation">{FORM_LABELS.ORGANISATION}</label>
                {(formErrors.organisation || clientErrors.organisation) && <p id="organisation-error" className="govuk-error-message"><span className="govuk-visually-hidden">Error:</span> {formErrors.organisation || clientErrors.organisation}</p>}
                <input className={`govuk-input ${(formErrors.organisation || clientErrors.organisation) ? "govuk-input--error" : ""}`} id="organisation" name="organisation" type="text" value={organisation} onChange={(e) => {
                  setOrganisation(e.target.value);
                  handleClearFieldError('organisation');
                }} aria-describedby={(formErrors.organisation || clientErrors.organisation) ? "organisation-error" : undefined} />
              </div>
              
              <div className={`govuk-form-group ${(formErrors.email || clientErrors.email) ? "govuk-form-group--error" : ""}`}>
                <label className="govuk-label" htmlFor="email">{FORM_LABELS.EMAIL}</label>
                {(formErrors.email || clientErrors.email) && <p id="email-error" className="govuk-error-message"><span className="govuk-visually-hidden">Error:</span> {formErrors.email || clientErrors.email}</p>}
                <input className={`govuk-input ${(formErrors.email || clientErrors.email) ? "govuk-input--error" : ""}`} id="email" name="email" type="email" value={email} onChange={(e) => {
                  setEmail(e.target.value);
                  handleClearFieldError('email');
                }} aria-describedby={(formErrors.email || clientErrors.email) ? "email-error" : undefined} />
              </div>
              
              <div className={`govuk-form-group ${(formErrors.phone || clientErrors.phone) ? "govuk-form-group--error" : ""}`}>
                <label className="govuk-label" htmlFor="phone">{FORM_LABELS.PHONE}</label>
                {(formErrors.phone || clientErrors.phone) && <p id="phone-error" className="govuk-error-message"><span className="govuk-visually-hidden">Error:</span> {formErrors.phone || clientErrors.phone}</p>}
                <input className={`govuk-input ${(formErrors.phone || clientErrors.phone) ? "govuk-input--error" : ""}`} id="phone" name="phone" type="tel" value={phone} onChange={(e) => {
                  setPhone(e.target.value);
                  handleClearFieldError('phone');
                }} aria-describedby={(formErrors.phone || clientErrors.phone) ? "phone-error" : undefined} />
              </div>
              
              <button type="submit" className="govuk-button" data-module="govuk-button" disabled={isSaving}>
                {isSaving ? "Saving..." : LABELS.CONTINUE}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandownerDetails;
