import React, { useState, useEffect } from "react";
import FileUpload from '../../../../components/FileUpload';
import { NWL_BASE_URL } from "../../../../constants/nwl";
import { Link, useParams, useNavigate } from "react-router-dom";

const Negotiations: React.FC = () => {
  const [negotiationProgress, setNegotiationProgress] = useState("");
  const [negotiationStartDate, setNegotiationStartDate] = useState({ day: "", month: "", year: "" });
  const [moreDetail, setMoreDetail] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<{[key:string]:string}>({});
  const params = useParams();
  const getApplicationId = () => {
    if (params.applicationId) return params.applicationId;
    if (params.id) return params.id;
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const idFromQuery = searchParams.get('id') || searchParams.get('applicationId');
      if (idFromQuery) return idFromQuery;
    }
    return '';
  };
  const applicationId = getApplicationId();
  const navigate = useNavigate();

  // Fetch negotiations data on mount
  useEffect(() => {
    if (!applicationId) return;
    const fetchNegotiations = async () => {
      try {
        const response = await fetch(`/backend/api/nwl/${applicationId}/negotiations`);
        if (response.ok) {
          const data = await response.json();
          // Map backend response to UI state
          setNegotiationProgress(data.any_negotiation ? "yes" : "no");
          if (data.start_date) {
            const dateObj = new Date(data.start_date);
            setNegotiationStartDate({
              day: String(dateObj.getUTCDate()).padStart(2, '0'),
              month: String(dateObj.getUTCMonth() + 1).padStart(2, '0'),
              year: String(dateObj.getUTCFullYear()),
            });
          } else {
            setNegotiationStartDate({ day: "", month: "", year: "" });
          }
          setMoreDetail(data.comments || "");
          // evidenceFiles mapping if needed
        }
      } catch (err) {
        // Optionally handle fetch error
      }
    };
    fetchNegotiations();
  }, [applicationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[key:string]:string} = {};
    // Frontend validation
    if (!applicationId) newErrors.applicationId = 'Application ID is missing.';
    if (!negotiationProgress) newErrors.negotiationProgress = 'Select if there has been any negotiation';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        const errorSummary = document.querySelector('.govuk-error-summary');
        if (errorSummary) errorSummary.scrollIntoView({ behavior: 'smooth' });
      }, 0);
      return;
    }
    // Build payload for backend
    const payload = {
      applicationId,
      negotiationProgress,
      negotiationStartDate,
      moreDetail,
      // evidenceFiles: handled separately
    };
    // Determine if negotiations exist by checking if negotiationProgress or moreDetail or negotiationStartDate is filled
    const hasData = negotiationProgress || moreDetail || (negotiationStartDate.day && negotiationStartDate.month && negotiationStartDate.year);
    if (!applicationId) return;
    if (hasData) {
      // Try update first
      const url = `/backend/api/nwl/${applicationId}/negotiations`;
      try {
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          // fallback to POST if update fails (e.g. 404)
          await fetch(url.replace(`/${applicationId}/negotiations`, '/negotiations'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
        }
      } catch {
        // fallback to POST if PUT fails
        await fetch(`/backend/api/nwl/negotiations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }
    } else {
      // No data, just POST
      await fetch(`/backend/api/nwl/negotiations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    }
    // Navigate after save
    navigate(`/nwl/${applicationId}/task-list`);
  };

  const handleUpdate = async () => {
    if (!applicationId) return;
    const payload = {
      negotiationProgress,
      negotiationStartDate,
      moreDetail,
      // evidenceFiles: handled separately
    };
    const url = `/backend/api/nwl/${applicationId}/negotiations`;
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        let errorMsg = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.errors) {
            const backendErrors: {[key:string]:string} = {};
            errorData.errors.forEach((msg: string) => {
              if (msg.includes('negotiationProgress')) backendErrors.negotiationProgress = 'Select if there has been any negotiation';
              else backendErrors.submit = msg;
            });
            setErrors(backendErrors);
            return;
          } else if (errorData && errorData.message) {
            errorMsg = errorData.message;
          }
        } catch {}
        setErrors({ submit: errorMsg });
        return;
      }
      // On success, optionally navigate or show confirmation
      // const data = await response.json();
      // e.g. navigate(`/nwl/${applicationId}/task-list`);
    } catch (err) {
      setErrors({ submit: err.message });
    }
  };

  const handleSaveForLater = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Determine if negotiations exist by checking if negotiationProgress or moreDetail or negotiationStartDate is filled
    const hasData = negotiationProgress || moreDetail || (negotiationStartDate.day && negotiationStartDate.month && negotiationStartDate.year);
    if (!applicationId) return;
    const payload = {
      applicationId,
      negotiationProgress,
      negotiationStartDate,
      moreDetail,
      // evidenceFiles: handled separately
    };
    if (hasData) {
      // Try update first
      const url = `/backend/api/nwl/${applicationId}/negotiations`;
      try {
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          // fallback to POST if update fails (e.g. 404)
          await fetch(url.replace(`/${applicationId}/negotiations`, '/negotiations'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
        }
      } catch {
        // fallback to POST if PUT fails
        await fetch(`/backend/api/nwl/negotiations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }
    } else {
      // No data, just POST
      await fetch(`/backend/api/nwl/negotiations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    }
    // Navigate after save
    navigate(`/nwl/${applicationId}/task-list`);
  };

  return (
    <main className="govuk-main-wrapper" id="main-content">
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
            <ol className="govuk-breadcrumbs__list">
                <li className="govuk-breadcrumbs__list-item">
                    <Link
                        className="govuk-breadcrumbs__link"
                        to={`${NWL_BASE_URL}/${applicationId}/task-list`}
                    >
                        Task list
                    </Link>
                </li>
                <li className="govuk-breadcrumbs__list-item" aria-current="page">Negotiations</li>
            </ol>
        </nav>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Status of negotiation</h1>
          <div className="govuk-hint govuk-!-margin-bottom-7">
            Tell us about any steps you’ve taken to resolve matters with the landowner or occupier.
          </div>
          {/* Error summary */}
          {Object.keys(errors).length > 0 && (
            <div className="govuk-error-summary" data-module="govuk-error-summary" tabIndex={-1} role="alert">
              <h2 className="govuk-error-summary__title">There is a problem</h2>
              <div className="govuk-error-summary__body">
                <ul className="govuk-list govuk-error-summary__list">
                  {errors.negotiationProgress && (
                    <li><a href="#negotiationProgress-group">{errors.negotiationProgress}</a></li>
                  )}
                  {errors.evidenceFiles && (
                    <li><a href="#fileUpload1">{errors.evidenceFiles}</a></li>
                  )}
                </ul>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            {/* Negotiation progress radios */}
            <div className={`govuk-form-group${errors.negotiationProgress ? " govuk-form-group--error" : ""}`} id="negotiationProgress-group">
              <fieldset className="govuk-fieldset" aria-describedby="negotiationProgress-hint">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                  <h1 className="govuk-fieldset__heading">Has there been any negotiation?</h1>
                </legend>
                <div id="negotiationProgress-hint" className="govuk-hint">
                  <p id="negotiationProgress-error" className="govuk-error-message" style={{ display: errors.negotiationProgress ? "" : "none" }}>
                    {errors.negotiationProgress || "Select one option"}
                  </p>
                  {!errors.negotiationProgress && <span>Select one option</span>}
                </div>
                <div className="govuk-radios" data-module="govuk-radios">
                  <div className="govuk-radios__item">
                    <input className="govuk-radios__input" id="negotiationProgress" name="negotiationProgress" type="radio" value="yes" checked={negotiationProgress === "yes"} onChange={e => setNegotiationProgress(e.target.value)} />
                    <label className="govuk-label govuk-radios__label" htmlFor="negotiationProgress">Yes</label>
                  </div>
                  <div className="govuk-radios__item">
                    <input className="govuk-radios__input" id="negotiationProgress-2" name="negotiationProgress" type="radio" value="no" checked={negotiationProgress === "no"} onChange={e => setNegotiationProgress(e.target.value)} />
                    <label className="govuk-label govuk-radios__label" htmlFor="negotiationProgress-2">No</label>
                  </div>
                </div>
              </fieldset>
            </div>
            {/* Negotiation start date (optional) */}
            <div className="govuk-form-group" id="negotiation-start-group">
              <fieldset className="govuk-fieldset">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                  Start date of any negotiations <span className="govuk-hint">(optional)</span>
                </legend>
                <div className="govuk-hint">For example, 27 3 2007</div>
                <div className="govuk-date-input" id="negotiation-start">
                  <div className="govuk-date-input__item">
                    <div className="govuk-form-group">
                      <label className="govuk-label govuk-date-input__label" htmlFor="negotiation-start-day">Day</label>
                      <input className="govuk-input govuk-date-input__input govuk-input--width-2" id="negotiation-start-day" name="negotiation-start-day" type="text" inputMode="numeric" value={negotiationStartDate.day} onChange={e => setNegotiationStartDate({ ...negotiationStartDate, day: e.target.value })} />
                    </div>
                  </div>
                  <div className="govuk-date-input__item">
                    <div className="govuk-form-group">
                      <label className="govuk-label govuk-date-input__label" htmlFor="negotiation-start-month">Month</label>
                      <input className="govuk-input govuk-date-input__input govuk-input--width-2" id="negotiation-start-month" name="negotiation-start-month" type="text" inputMode="numeric" value={negotiationStartDate.month} onChange={e => setNegotiationStartDate({ ...negotiationStartDate, month: e.target.value })} />
                    </div>
                  </div>
                  <div className="govuk-date-input__item">
                    <div className="govuk-form-group">
                      <label className="govuk-label govuk-date-input__label" htmlFor="negotiation-start-year">Year</label>
                      <input className="govuk-input govuk-date-input__input govuk-input--width-4" id="negotiation-start-year" name="negotiation-start-year" type="text" inputMode="numeric" value={negotiationStartDate.year} onChange={e => setNegotiationStartDate({ ...negotiationStartDate, year: e.target.value })} />
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
            {/* Additional comments */}
            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--s" htmlFor="more-detail">
                Additional comments <span className="govuk-hint">(optional)</span>
              </label>
              <div className="govuk-hint">Confirm what efforts, if any, have been made to engage with the landowner or occupier to find a voluntary solution. If no negotiations have taken place, explain why.  If possible, provide a timeline of events or correspondence, and upload any relevant documents.</div>
              <textarea className="govuk-textarea govuk-!-static-margin-bottom-1" id="more-detail" name="moreDetail" rows={5} value={moreDetail} onChange={e => setMoreDetail(e.target.value)}></textarea>
            </div>
            {/* FileUpload evidence */}
            {/* <div className={`govuk-form-group${errors.evidenceFiles ? " govuk-form-group--error" : ""}`}>
              {errors.evidenceFiles && (
                <p id="fileUpload1-error" className="govuk-error-message">{errors.evidenceFiles}</p>
              )}
              <FileUpload
                title="Upload evidence"
                prefix={`negotiations/evidence`}
                onFilesChange={setEvidenceFiles}
                category="NEGOTIATION_EVIDENCE"
              />
            </div> */}
            {/* Call to action buttons */}
            <div className="govuk-!-static-margin-top-6">
              <a href={`/frontend${NWL_BASE_URL}/${applicationId}/task-list`} className="govuk-button govuk-button--secondary govuk-!-static-margin-right-2" onClick={handleSaveForLater}>Save for later</a>
              <button type="submit" className="govuk-button" data-module="govuk-button">Save and continue</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Negotiations;
