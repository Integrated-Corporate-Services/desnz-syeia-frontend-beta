import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TLP_BASE_URL } from "../../../../constants/tlp";
import FileUpload from "../../../../components/FileUpload";

const SupportingInfo: React.FC = () => {
  const [signedWayleave, setSignedWayleave] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [signedWayleaveDate, setSignedWayleaveDate] = useState({
    day: "",
    month: "",
    year: "",
  });
  const [signedWayleaveFiles, setSignedWayleaveFiles] = useState<File[]>([]);
  const [inheritedWayleave, setInheritedWayleave] = useState("");
  const [counterNoticeDate, setCounterNoticeDate] = useState({
    day: "",
    month: "",
    year: "",
  });
  const [inheritedWayleaveFiles, setInheritedWayleaveFiles] = useState<File[]>(
    []
  );
  const [anyPayments, setAnyPayments] = useState("");
  const [anyPaymentsFiles, setAnyPaymentsFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  const params = useParams();
  const getApplicationId = () => {
    if (params.applicationId) return params.applicationId;
    if (params.id) return params.id;
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const idFromQuery =
        searchParams.get("id") || searchParams.get("applicationId");
      if (idFromQuery) return idFromQuery;
    }
    return "";
  };
  const applicationId = getApplicationId();

  // FileUpload handles files via its onFilesChange prop

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    const newErrors: { [key: string]: string } = {};
    // Validate signedWayleave
    if (!signedWayleave) {
      newErrors.signedWayleave = "Select if 21 day Notice has been served";
    } else if (signedWayleave === "Yes") {
      if (
        !signedWayleaveDate.day ||
        !signedWayleaveDate.month ||
        !signedWayleaveDate.year
      ) {
        newErrors.signedWayleaveDate = "Enter the full 21 day notice date";
      }
      if (signedWayleaveFiles.length === 0) {
        newErrors.signedWayleaveFile =
          "Upload a document to support your application";
      }
    }
    // Validate inheritedWayleave
    if (!inheritedWayleave) {
      newErrors.inheritedWayleave =
        "Select if a counter notice has been given by the landowner";
    } else if (inheritedWayleave === "Yes") {
      if (
        !counterNoticeDate.day ||
        !counterNoticeDate.month ||
        !counterNoticeDate.year
      ) {
        newErrors.counterNoticeDate =
          "Enter the full counter notice issue date";
      }
      if (inheritedWayleaveFiles.length === 0) {
        newErrors.inheritedWayleaveFile =
          "Upload a document to support your application";
      }
    }
    // Validate anyPayments
    if (!anyPayments) {
      newErrors.anyPayments =
        "Select if your application includes a title plan";
    } else if (anyPayments === "Yes" && anyPaymentsFiles.length === 0) {
      newErrors.anyPaymentsFile = "Upload the title plan document";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      // Submit logic here (e.g., API call)
      navigate("/form-negotiations.html");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

return (
  <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link
              className="govuk-breadcrumbs__link"
              to={`${TLP_BASE_URL}/${applicationId}/task-list`}
            >
              Task list
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">Supporting information</li>
        </ol>
      </nav>
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <h1 className="govuk-heading-xl">Supporting information</h1>
        {/* Error summary for missing radio selections */}
        {formSubmitted && (!signedWayleave || !inheritedWayleave || !anyPayments) && (
          <div className="govuk-error-summary" data-module="govuk-error-summary" tabIndex={-1}>
            <div role="alert">
              <h2 className="govuk-error-summary__title">There is a problem</h2>
              <div className="govuk-error-summary__body">
                <ul className="govuk-list govuk-error-summary__list">
                  {!signedWayleave && (
                    <li><a href="#signedWayleave-error">Select if a 21 day Notice has been served</a></li>
                  )}
                  {!inheritedWayleave && (
                    <li><a href="#inheritedWayleave-error">Select if a counter notice has been given by the landowner</a></li>
                  )}
                  {!anyPayments && (
                    <li><a href="#anyPayments-error">Select if your application includes a title plan</a></li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          {/* 21 day notice */}
          <div className={`govuk-form-group${formSubmitted && !signedWayleave ? ' govuk-form-group--error' : ''}`}> 
            <fieldset className="govuk-fieldset" aria-describedby="signedWayleave-hint">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Has a 21 day Notice been served?</legend>
              <div id="signedWayleave-hint" className="govuk-hint">
                {formSubmitted && !signedWayleave && (
                  <p id="signedWayleave-error" className="govuk-error-message">
                    Select if 21 day Notice been served
                  </p>
                )}
              </div>
              <div className="govuk-radios" data-module="govuk-radios">
                <div className="govuk-radios__item">
                  <input className="govuk-radios__input" id="signedWayleave" name="signedWayleave" type="radio" value="Yes" aria-controls="conditional-signedWayleave" aria-expanded={signedWayleave === "Yes"} checked={signedWayleave === "Yes"} onChange={() => setSignedWayleave("Yes")}/>
                  <label className="govuk-label govuk-radios__label" htmlFor="signedWayleave">Yes</label>
                </div>
                <div className="govuk-radios__conditional" id="conditional-signedWayleave" style={{display: signedWayleave === "Yes" ? "block" : "none"}}>
                  <div className={`govuk-form-group${formSubmitted && errors.signedWayleaveDate ? ' govuk-form-group--error' : ''}`}> 
                    <fieldset className="govuk-fieldset" role="group" aria-describedby="passport-issued-hint">
                      <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                        <h1 className="govuk-label govuk-label--s">21 day notice date</h1>
                      </legend>
                      <div id="passport-issued-hint" className="govuk-hint">For example, 27 3 2007</div>
                      <p id="passport-issued-error" className="govuk-error-message" style={{display: errors.signedWayleaveDate ? "block" : "none"}}>
                        Enter the full 21 day notice date
                      </p>
                      <div className="govuk-date-input" id="passport-issued">
                        <div className="govuk-date-input__item">
                          <div className="govuk-form-group">
                            <label className="govuk-label govuk-date-input__label" htmlFor="passport-issued-day">Day</label>
                            <input className="govuk-input govuk-date-input__input govuk-input--width-2" id="passport-issued-day" name="passport-issued-day" type="text" inputMode="numeric" value={signedWayleaveDate.day} onChange={e => setSignedWayleaveDate({...signedWayleaveDate, day: e.target.value})}/>
                          </div>
                        </div>
                        <div className="govuk-date-input__item">
                          <div className="govuk-form-group">
                            <label className="govuk-label govuk-date-input__label" htmlFor="passport-issued-month">Month</label>
                            <input className="govuk-input govuk-date-input__input govuk-input--width-2" id="passport-issued-month" name="passport-issued-month" type="text" inputMode="numeric" value={signedWayleaveDate.month} onChange={e => setSignedWayleaveDate({...signedWayleaveDate, month: e.target.value})}/>
                          </div>
                        </div>
                        <div className="govuk-date-input__item">
                          <div className="govuk-form-group">
                            <label className="govuk-label govuk-date-input__label" htmlFor="passport-issued-year">Year</label>
                            <input className="govuk-input govuk-date-input__input govuk-input--width-4" id="passport-issued-year" name="passport-issued-year" type="text" inputMode="numeric" value={signedWayleaveDate.year} onChange={e => setSignedWayleaveDate({...signedWayleaveDate, year: e.target.value})}/>
                          </div>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                  <div className="govuk-form-group">
                    <FileUpload 
                      title="Upload a document" 
                      prefix={`applications/${applicationId}/signed-wayleave`} 
                      onFilesChange={setSignedWayleaveFiles} 
                      applicationId={applicationId} 
                      category="SIGNED_WAYLEAVE" 
                    />
                  </div>
                </div>
                <div className="govuk-radios__item">
                  <input className="govuk-radios__input" id="signedWayleave-2" name="signedWayleave" type="radio" value="No" aria-controls="conditional-signedWayleave-2" aria-expanded={signedWayleave === "No"} checked={signedWayleave === "No"} onChange={() => setSignedWayleave("No")}/>
                  <label className="govuk-label govuk-radios__label" htmlFor="signedWayleave-2">No</label>
                </div>
                <div className="govuk-radios__conditional govuk-radios__conditional--hidden" id="conditional-signedWayleave-2"></div>
              </div>
            </fieldset>
          </div>
          {/* Counter notice */}
          <div className={`govuk-form-group${formSubmitted && !inheritedWayleave ? ' govuk-form-group--error' : ''}`}> 
            <fieldset className="govuk-fieldset" aria-describedby="inheritedWayleave-hint">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Has a counter notice been given by the landowner?</legend>
              <div id="inheritedWayleave-hint" className="govuk-hint">
                {formSubmitted && !inheritedWayleave && (
                  <p id="inheritedWayleave-error" className="govuk-error-message">
                    Select if a counter notice has been given by the landowner
                  </p>
                )}
              </div>
              <div className="govuk-radios" data-module="govuk-radios">
                <div className="govuk-radios__item">
                  <input className="govuk-radios__input" id="inheritedWayleave" name="inheritedWayleave" type="radio" value="Yes" aria-controls="conditional-inheritedWayleave" aria-expanded={inheritedWayleave === "Yes"} checked={inheritedWayleave === "Yes"} onChange={() => setInheritedWayleave("Yes")}/>
                  <label className="govuk-label govuk-radios__label" htmlFor="inheritedWayleave">Yes</label>
                </div>
                <div className="govuk-radios__conditional" id="conditional-inheritedWayleave" style={{display: inheritedWayleave === "Yes" ? "block" : "none"}}>
                  <div className="govuk-form-group">
                    <fieldset className="govuk-fieldset" role="group" aria-describedby="passport-issued-hint">
                      <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                        <h1 className="govuk-label govuk-label--s">Counter notice issue date</h1>
                      </legend>
                      <div id="passport-issued-hint" className="govuk-hint">For example, 27 3 2007</div>
                      <p id="counter-notice-error" className="govuk-error-message" style={{display: errors.counterNoticeDate ? "block" : "none"}}>
                        Enter the full counter notice issue date
                      </p>
                      <div className="govuk-date-input" id="passport-issued">
                        <div className="govuk-date-input__item">
                          <div className="govuk-form-group">
                            <label className="govuk-label govuk-date-input__label" htmlFor="counter-notice-day">Day</label>
                            <input className="govuk-input govuk-date-input__input govuk-input--width-2" id="counter-notice-day" name="counter-notice-day" type="text" inputMode="numeric" value={counterNoticeDate.day} onChange={e => setCounterNoticeDate({...counterNoticeDate, day: e.target.value})}/>
                          </div>
                        </div>
                        <div className="govuk-date-input__item">
                          <div className="govuk-form-group">
                            <label className="govuk-label govuk-date-input__label" htmlFor="counter-notice-month">Month</label>
                            <input className="govuk-input govuk-date-input__input govuk-input--width-2" id="counter-notice-month" name="counter-notice-month" type="text" inputMode="numeric" value={counterNoticeDate.month} onChange={e => setCounterNoticeDate({...counterNoticeDate, month: e.target.value})}/>
                          </div>
                        </div>
                        <div className="govuk-date-input__item">
                          <div className="govuk-form-group">
                            <label className="govuk-label govuk-date-input__label" htmlFor="counter-notice-year">Year</label>
                            <input className="govuk-input govuk-date-input__input govuk-input--width-4" id="counter-notice-year" name="counter-notice-year" type="text" inputMode="numeric" value={counterNoticeDate.year} onChange={e => setCounterNoticeDate({...counterNoticeDate, year: e.target.value})}/>
                          </div>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                  <div className="govuk-form-group">
                    <FileUpload 
                      title="Upload a document" 
                      prefix={`applications/${applicationId}/inherited-wayleave`}
                      onFilesChange={setInheritedWayleaveFiles} 
                      applicationId={applicationId} 
                      category="INHERITED_WAYLEAVE" 
                    />
                  </div>
                </div>
                <div className="govuk-radios__item">
                  <input className="govuk-radios__input" id="inheritedWayleave-2" name="inheritedWayleave" type="radio" value="No" aria-controls="conditional-inheritedWayleave-2" aria-expanded={inheritedWayleave === "No"} checked={inheritedWayleave === "No"} onChange={() => setInheritedWayleave("No")}/>
                  <label className="govuk-label govuk-radios__label" htmlFor="inheritedWayleave-2">No</label>
                </div>
                <div className="govuk-radios__conditional govuk-radios__conditional--hidden" id="conditional-inheritedWayleave-2"></div>
              </div>
            </fieldset>
          </div>
          {/* Any payments */}
          <div className={`govuk-form-group${formSubmitted && !anyPayments ? ' govuk-form-group--error' : ''}`}> 
            <fieldset className="govuk-fieldset" aria-describedby="anyPayments-hint">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Does your application include a title plan?</legend>
              <div id="anyPayments-hint" className="govuk-hint">
                {formSubmitted && !anyPayments && (
                  <p id="anyPayments-error" className="govuk-error-message">
                    Select if your application includes a title plan
                  </p>
                )}
              </div>
              <div className="govuk-radios" data-module="govuk-radios">
                <div className="govuk-radios__item">
                  <input className="govuk-radios__input" id="anyPayments" name="anyPayments" type="radio" value="Yes" aria-controls="conditional-anyPayments" aria-expanded={anyPayments === "Yes"} checked={anyPayments === "Yes"} onChange={() => setAnyPayments("Yes")}/>
                  <label className="govuk-label govuk-radios__label" htmlFor="anyPayments">Yes</label>
                </div>
                <div className="govuk-radios__conditional" id="conditional-anyPayments" style={{display: anyPayments === "Yes" ? "block" : "none"}}>
                  <div className="govuk-form-group">
                    <FileUpload 
                      title="Upload the title plan document" 
                      prefix={`applications/${applicationId}/title-plan`} 
                      onFilesChange={setAnyPaymentsFiles} 
                      applicationId={applicationId} 
                      category="TITLE_PLAN" 
                    />
                  </div>
                </div>
                <div className="govuk-radios__item">
                  <input className="govuk-radios__input" id="anyPayments-2" name="anyPayments" type="radio" value="No" aria-controls="conditional-anyPayments-2" aria-expanded={anyPayments === "No"} checked={anyPayments === "No"} onChange={() => setAnyPayments("No")}/>
                  <label className="govuk-label govuk-radios__label" htmlFor="anyPayments-2">No</label>
                </div>
                <div className="govuk-radios__conditional govuk-radios__conditional--hidden" id="conditional-anyPayments-2"></div>
              </div>
            </fieldset>
          </div>
          {/* Call to action buttons */}
          <div className="govuk-!-static-margin-top-6">
            <a href="application-overview.html" className="govuk-button govuk-button--secondary govuk-!-static-margin-right-2">Save for later</a>
            <button type="submit" className="govuk-button" data-module="govuk-button">Save and continue</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
};

export default SupportingInfo;
