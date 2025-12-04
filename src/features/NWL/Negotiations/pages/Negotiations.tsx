import React, { useState, useEffect } from "react";
import FileUpload from '../../../../components/FileUpload';
import { NWL_BASE_URL } from "../../../../constants/nwl";
import { ApplicationDocument, UploadedFile } from "../../../../types/fileUpload";
import { Link, useParams, useNavigate } from "react-router-dom";
import { NWL_FILE_CATEGORIES } from "../../../../constants/fileCategoryConstants";
import { useAuthUser } from "../../../../hooks/useAuthUser";

const Negotiations: React.FC = () => {
  const [negotiationProgress, setNegotiationProgress] = useState("");
  const [negotiationStartDate, setNegotiationStartDate] = useState({ day: "", month: "", year: "" });
  const [comments, setComments] = useState("");
  const [supportingDocs, setSupportingDocs] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
  const [errors, setErrors] = useState<{[key:string]:string}>({});
  const [negotiationsExists, setNegotiationsExists] = useState(false);
  const params = useParams();
  const { user } = useAuthUser();
  const userId = user?.user_id;

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

  useEffect(() => {
    if (!applicationId) return;
    const fetchNegotiations = async () => {
      try {
        const response = await fetch(`/backend/api/nwl/${applicationId}/negotiations`);
        if (response.ok) {
          const result = await response.json();
          const data = result.negotiations || {};
          setNegotiationProgress(data.negotiationProgress || "");
          if (data.negotiationStartDate && typeof data.negotiationStartDate === 'object') {
            setNegotiationStartDate(data.negotiationStartDate);
          } else {
            setNegotiationStartDate({ day: "", month: "", year: "" });
          }
          setComments(data.moreDetail || "");
          setUploadedFiles(Array.isArray(data.uploaded_files) ? data.uploaded_files : []);
          setApplicationDocuments(Array.isArray(data.application_documents) ? data.application_documents : []);
          // Check if negotiations record exists (use a unique field, e.g. negotiationProgress or another backend-provided id)
          setNegotiationsExists(!!(data && (data.negotiationProgress || data.id)));
        } else {
          setNegotiationsExists(false);
        }
      } catch {
        setNegotiationsExists(false);
      }
    };
    fetchNegotiations();
  }, [applicationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[key:string]:string} = {};
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
    // Build payload to match backend requirements
    const payload = {
      applicationId: applicationId,
      negotiationProgress: negotiationProgress || null,
      negotiationStartDate: negotiationStartDate.day || negotiationStartDate.month || negotiationStartDate.year
        ? { ...negotiationStartDate }
        : null,
      moreDetail: comments || null,
      uploaded_files: uploadedFiles,
      application_documents: applicationDocuments,
    };
    const hasData = negotiationProgress || comments || (negotiationStartDate.day && negotiationStartDate.month && negotiationStartDate.year);
    if (!applicationId) return;
    if (hasData) {
      let url = '';
      let method: 'PUT' | 'POST' = 'POST';
      let postPayload = payload;
      if (negotiationsExists) {
        url = `/backend/api/nwl/${applicationId}/negotiations`;
        method = 'PUT';
      } else {
        url = `/backend/api/nwl/negotiations`;
        method = 'POST';
        // Only send allowed fields for POST
        postPayload = {
          applicationId: applicationId,
          negotiationProgress: negotiationProgress || null,
          negotiationStartDate: negotiationStartDate.day || negotiationStartDate.month || negotiationStartDate.year
            ? { ...negotiationStartDate }
            : null,
          moreDetail: comments || null,
          uploaded_files: uploadedFiles || [],
          application_documents: applicationDocuments || [],
        };
      }
      try {
        await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(method === 'POST' ? postPayload : payload),
        });
      } catch (err) {
        setErrors({ submit: (err instanceof Error ? err.message : 'Failed to save negotiations') });
      }
    }
    navigate(`/nwl/${applicationId}/task-list`);
  };

  const handleSaveForLater = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const hasData = negotiationProgress || comments || (negotiationStartDate.day && negotiationStartDate.month && negotiationStartDate.year);
    if (!applicationId) return;
    const payload = {
      applicationId: applicationId,
      negotiationProgress: negotiationProgress || null,
      negotiationStartDate: negotiationStartDate.day || negotiationStartDate.month || negotiationStartDate.year
        ? { ...negotiationStartDate }
        : null,
      moreDetail: comments || null,
      uploaded_files: uploadedFiles,
      application_documents: applicationDocuments,
    };
    if (hasData) {
      let url = '';
      let method: 'PUT' | 'POST' = 'POST';
      let postPayload = payload;
      if (negotiationsExists) {
        url = `/backend/api/nwl/${applicationId}/negotiations`;
        method = 'PUT';
      } else {
        url = `/backend/api/nwl/negotiations`;
        method = 'POST';
        // Only send allowed fields for POST
        postPayload = {
          applicationId: applicationId,
          negotiationProgress: negotiationProgress || null,
          negotiationStartDate: negotiationStartDate.day || negotiationStartDate.month || negotiationStartDate.year
            ? { ...negotiationStartDate }
            : null,
          moreDetail: comments || null,
        };
      }
      try {
        await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(method === 'POST' ? postPayload : payload),
        });
      } catch {
        // Optionally handle error
      }
    }
    navigate(`/nwl/${applicationId}/task-list`);
  };

  return (
    <main className="govuk-main-wrapper" id="main-content">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link className="govuk-breadcrumbs__link" to={`${NWL_BASE_URL}/${applicationId}/task-list`}>
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
                  {errors.submit && (
                    <li>{errors.submit}</li>
                  )}
                </ul>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>
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
            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--s" htmlFor="comments">
                Additional comments <span className="govuk-hint">(optional)</span>
              </label>
              <div className="govuk-hint">Confirm what efforts, if any, have been made to engage with the landowner or occupier to find a voluntary solution. If no negotiations have taken place, explain why.  If possible, provide a timeline of events or correspondence, and upload any relevant documents.</div>
              <textarea className="govuk-textarea govuk-!-static-margin-bottom-1" id="comments" name="comments" rows={5} value={comments} onChange={e => setComments(e.target.value)}></textarea>
            </div>
            <fieldset className={`govuk-fieldset govuk-form-group${errors.supportingDocs ? " govuk-form-group--error" : ""}`}
              style={{ marginBottom: 32, paddingBottom: 8, borderLeft: errors.supportingDocs ? '4px solid #d4351c' : undefined, paddingLeft: errors.supportingDocs ? 12 : undefined }}
              aria-describedby={errors.supportingDocs ? "supportingDocs-error" : undefined}>
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--s" style={{ fontSize: '1.125rem', lineHeight: '1.31579' }}>
                <h2 className="govuk-fieldset__heading" style={{ fontSize: '1.125rem', lineHeight: '1.31579' }}>
                  Do you have any further supporting documents to provide?
                </h2>
              </legend>
              {errors.supportingDocs && (
                <span className="govuk-error-message" id="supportingDocs-error">
                  <span className="govuk-visually-hidden">Error:</span> Select yes if this application has supporting documents
                </span>
              )}
              <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios" style={{ marginTop: 8 }}>
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="hasSupportingDocuments"
                    name="hasSupportingDocuments"
                    type="radio"
                    value="true"
                    aria-controls="hasSupportingDocuments-hidden"
                    aria-expanded="true"
                    checked={supportingDocs === "yes"}
                    onChange={() => setSupportingDocs("yes")}
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor="hasSupportingDocuments">
                    Yes
                  </label>
                </div>
                {supportingDocs === "yes" && (
                  <div className="govuk-radios__conditional govuk-form-group govuk-form-group--error" id="hasSupportingDocuments-hidden">
                    <label className="govuk-label" style={{ fontWeight: 600 }}>
                      Upload supporting information documents
                    </label>
                    <FileUpload
                      title="Upload evidence of negotiation"
                      prefix={`${applicationId}/${NWL_FILE_CATEGORIES.NEGOTIATIONS}/`}
                      applicationId={applicationId}
                      category={NWL_FILE_CATEGORIES.NEGOTIATIONS}
                      addedBy={userId}
                      uploadedFiles={uploadedFiles}
                      onUploaded={(newUploadedFiles, newProjectDocuments) => {
                        setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
                        setApplicationDocuments(prev => [...prev, ...newProjectDocuments]);
                      }}
                    />
                  </div>
                )}
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="hasSupportingDocuments-no"
                    name="hasSupportingDocuments"
                    type="radio"
                    value="false"
                    checked={supportingDocs === "no"}
                    onChange={() => setSupportingDocs("no")}
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor="hasSupportingDocuments-no">
                    No
                  </label>
                </div>
              </div>
            </fieldset>
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
