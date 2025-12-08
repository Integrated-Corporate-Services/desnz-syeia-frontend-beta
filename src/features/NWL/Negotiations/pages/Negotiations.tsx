
import React, { useState, useEffect } from "react";
import FileUpload from '../../../../components/FileUpload';
import { Link, useParams, useNavigate } from "react-router-dom";
import { NWL_BASE_URL } from "../../../../constants/nwl";
import { Negotiation } from '../../../../types/Negotiation';
import * as negotiationsService from '../../../../services/negotiationsService';
import { FILE_CATEGORIES, NWL_FILE_CATEGORIES } from "../../../../constants/fileCategoryConstants";
import { useAuthUser } from "../../../../hooks/useAuthUser";

const Negotiations: React.FC = () => {
  const [negotiation, setNegotiation] = useState<Negotiation>({
    applicationId: '',
    anyNegotiation: undefined,
    startDate: '',
    comments: '',
    uploadedFiles: [],
    applicationDocuments: [],
    createdBy: '',
    lastUpdatedBy: '',
  } as Negotiation);
  const [dateFields, setDateFields] = useState({ day: "", month: "", year: "" });
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<any[]>([]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const params = useParams();
  const navigate = useNavigate();
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

  useEffect(() => {
    if (!applicationId) return;
    negotiationsService.getNegotiation(applicationId).then((data) => {
      if (data) {
        setNegotiation({
          ...data,
          applicationId: data.applicationId || applicationId,
          uploadedFiles: data.uploadedFiles || [],
          applicationDocuments: data.applicationDocuments || [],
          createdBy: data.createdBy || '',
          lastUpdatedBy: data.lastUpdatedBy || '',
        });
        setUploadedFiles(data.uploadedFiles || []);
        setApplicationDocuments(data.applicationDocuments || []);
        if (data.startDate) {
          const dateObj = new Date(data.startDate);
          setDateFields({
            day: String(dateObj.getUTCDate()).padStart(2, '0'),
            month: String(dateObj.getUTCMonth() + 1).padStart(2, '0'),
            year: String(dateObj.getUTCFullYear()),
          });
        } else {
          setDateFields({ day: "", month: "", year: "" });
        }
      } else {
        setNegotiation((prev) => ({ ...prev, applicationId }));
        setUploadedFiles([]);
        setApplicationDocuments([]);
      }
    });
  }, [applicationId]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'day' || name === 'month' || name === 'year') {
      setDateFields((prev) => ({ ...prev, [name]: value.replace(/\D/g, '') }));
    } else {
      setNegotiation((prev) => ({
        ...prev,
        [name]: value,
        createdBy: prev.createdBy || userId,
        lastUpdatedBy: userId,
      }));
    }
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNegotiation((prev) => ({
      ...prev,
      anyNegotiation: e.target.value === 'yes',
    }));
  };

  const validateDateFields = () => {
    const { day, month, year } = dateFields;
    if (!day && !month && !year) return null; // Optional, so allow blank
    let error = '';
    const dayNum = Number(day);
    const monthNum = Number(month);
    const yearNum = Number(year);
    const currentYear = new Date().getFullYear();
    if (!/^(0?[1-9]|[12][0-9]|3[01])$/.test(day)) error = 'Day must be a number between 1 and 31';
    else if (!/^(0?[1-9]|1[0-2])$/.test(month)) error = 'Month must be a number between 1 and 12';
    else if (!/^\d{4}$/.test(year)) error = 'Year must be a 4-digit number';
    else if (yearNum <= currentYear) error = 'Year must be greater than the current year';
    return error || null;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    if (!negotiation.applicationId) newErrors.applicationId = 'Application ID is missing.';
    if (negotiation.anyNegotiation !== true && negotiation.anyNegotiation !== false) newErrors.anyNegotiation = 'Select if there has been any negotiation';
    const dateError = validateDateFields();
    if (dateError) newErrors.startDate = dateError;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        const errorSummary = document.querySelector('.govuk-error-summary');
        if (errorSummary) errorSummary.scrollIntoView({ behavior: 'smooth' });
      }, 0);
      return;
    }
    // Merge date fields into ISO string if present
    let startDate = '';
    if (dateFields.day && dateFields.month && dateFields.year) {
      startDate = `${dateFields.year.padStart(4, '0')}-${dateFields.month.padStart(2, '0')}-${dateFields.day.padStart(2, '0')}`;
    }
    const payload: Negotiation = {
      ...negotiation,
      startDate,
      uploadedFiles: uploadedFiles.map(f => ({
        id: f.id,
        storageProvider: f.storageProvider,
        s3Key: f.s3Key,
        bucketName: f.bucketName,
        virtualFolder: f.virtualFolder,
        filename: f.filename,
        fileContentType: f.fileContentType,
        fileSizeBytes: f.fileSizeBytes,
        uploadedAtTimestamp: f.uploadedAtTimestamp
      })),
      applicationDocuments: applicationDocuments.map(d => ({
        documentId: d.documentId || '',
        applicationId: d.applicationId || '',
        fileId: d.fileId || '',
        category: d.category || '',
        title: d.title || '',
        virtualFolder: d.virtualFolder || '',
        addedBy: d.addedBy || '',
        addedAt: d.addedAt || '',
        description: d.description || ''
      })),
    };
    const saved = await negotiationsService.saveNegotiation(payload);
    if (saved) {
      navigate(`/nwl/${negotiation.applicationId}/task-list`);
    } else {
      setErrors({ submit: 'Failed to save negotiation.' });
    }
  };

  // Save without validation
  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    let startDate = '';
    if (dateFields.day && dateFields.month && dateFields.year) {
      startDate = `${dateFields.year.padStart(4, '0')}-${dateFields.month.padStart(2, '0')}-${dateFields.day.padStart(2, '0')}`;
    }
    const payload: Negotiation = {
      ...negotiation,
      startDate,
      uploadedFiles: uploadedFiles.map(f => ({
        id: f.id,
        storageProvider: f.storageProvider,
        s3Key: f.s3Key,
        bucketName: f.bucketName,
        virtualFolder: f.virtualFolder,
        filename: f.filename,
        fileContentType: f.fileContentType,
        fileSizeBytes: f.fileSizeBytes,
        uploadedAtTimestamp: f.uploadedAtTimestamp
      })),
      applicationDocuments: applicationDocuments.map(d => ({
        documentId: d.documentId || '',
        applicationId: d.applicationId || '',
        fileId: d.fileId || '',
        category: d.category || '',
        title: d.title || '',
        virtualFolder: d.virtualFolder || '',
        addedBy: d.addedBy || '',
        addedAt: d.addedAt || '',
        description: d.description || ''
      })),
    };
    const saved = await negotiationsService.saveNegotiation(payload);
    if (saved) {
      navigate(`/nwl/${negotiation.applicationId}/task-list`);
    } else {
      setErrors({ submit: 'Failed to save negotiation.' });
    }
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
                  {errors.applicationId && (
                    <li><a href="#applicationId">{errors.applicationId}</a></li>
                  )}
                  {errors.anyNegotiation && (
                    <li><a href="#negotiationProgress-group">{errors.anyNegotiation}</a></li>
                  )}
                  {errors.startDate && (
                    <li><a href="#negotiation-start-group">{errors.startDate}</a></li>
                  )}
                  {errors.submit && (
                    <li>{errors.submit}</li>
                  )}
                </ul>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            {/* Negotiation progress radios */}
            <div className={`govuk-form-group${errors.negotiationProgress ? " govuk-form-group--error" : ""}`} id="negotiationProgress-group">
              <fieldset className="govuk-fieldset" aria-describedby="negotiationProgress-hint">
               
                  <div className={`govuk-form-group${errors.anyNegotiation ? " govuk-form-group--error" : ""}`} id="negotiationProgress-group">
              <fieldset className="govuk-fieldset" aria-describedby="negotiationProgress-hint">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                  <h1 className="govuk-fieldset__heading">Has there been any negotiation?</h1>
                </legend>
                <div id="negotiationProgress-hint" className="govuk-hint">
                  <p id="negotiationProgress-error" className="govuk-error-message" style={{ display: errors.anyNegotiation ? "" : "none" }}>
                    {errors.anyNegotiation || "Select one option"}
                  </p>
                  {!errors.anyNegotiation && <span>Select one option</span>}
                </div>
                <div className="govuk-radios" data-module="govuk-radios">
                  <div className="govuk-radios__item">
                    <input className="govuk-radios__input" id="negotiationProgress" name="anyNegotiation" type="radio" value="yes" checked={negotiation.anyNegotiation === true} onChange={handleRadioChange} />
                    <label className="govuk-label govuk-radios__label" htmlFor="negotiationProgress">Yes</label>
                  </div>
                  <div className="govuk-radios__item">
                    <input className="govuk-radios__input" id="negotiationProgress-2" name="anyNegotiation" type="radio" value="no" checked={negotiation.anyNegotiation === false} onChange={handleRadioChange} />
                    <label className="govuk-label govuk-radios__label" htmlFor="negotiationProgress-2">No</label>
                  </div>
                </div>
              </fieldset>
            </div>
              </fieldset>
            </div>
            {/* Negotiation start date (optional) */}
            <div className={`govuk-form-group${errors.startDate ? " govuk-form-group--error" : ""}`} id="negotiation-start-group">
              <fieldset className="govuk-fieldset">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                  Start date of any negotiations <span className="govuk-hint">(optional)</span>
                </legend>
                <div className="govuk-hint">For example, 27 3 2007</div>
                {errors.startDate && (
                  <span className="govuk-error-message">{errors.startDate}</span>
                )}
                <div className="govuk-date-input" id="negotiation-start">
                  <div className="govuk-date-input__item">
                    <div className="govuk-form-group">
                      <label className="govuk-label govuk-date-input__label" htmlFor="negotiation-start-day">Day</label>
                      <input className="govuk-input govuk-date-input__input govuk-input--width-2" id="negotiation-start-day" name="day" type="text" inputMode="numeric" maxLength={2} value={dateFields.day} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="govuk-date-input__item">
                    <div className="govuk-form-group">
                      <label className="govuk-label govuk-date-input__label" htmlFor="negotiation-start-month">Month</label>
                      <input className="govuk-input govuk-date-input__input govuk-input--width-2" id="negotiation-start-month" name="month" type="text" inputMode="numeric" maxLength={2} value={dateFields.month} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="govuk-date-input__item">
                    <div className="govuk-form-group">
                      <label className="govuk-label govuk-date-input__label" htmlFor="negotiation-start-year">Year</label>
                      <input className="govuk-input govuk-date-input__input govuk-input--width-4" id="negotiation-start-year" name="year" type="text" inputMode="numeric" maxLength={4} value={dateFields.year} onChange={handleChange} />
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
    <textarea className="govuk-textarea govuk-!-static-margin-bottom-1" id="comments" name="comments" rows={5} value={negotiation.comments || ''} onChange={handleChange}></textarea>            </div>
            {/* FileUpload evidence */}
              <div className={`govuk-form-group${errors.evidenceFiles ? " govuk-form-group--error" : ""}`}>
                {errors.evidenceFiles && (
                  <p id="fileUpload1-error" className="govuk-error-message">{errors.evidenceFiles}</p>
                )}
                  <FileUpload
            title="upload evidence of negotiations"
            prefix={`${applicationId}/${NWL_FILE_CATEGORIES.NWL_NEGOTIATIONS}/`}
            applicationId={applicationId}
            category={NWL_FILE_CATEGORIES.NWL_NEGOTIATIONS}
            addedBy={userId}
            uploadedFiles={uploadedFiles}
            onUploaded={(newUploadedFiles: any[], newProjectDocuments: any[]) => {
              setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
              setApplicationDocuments(prev => [...prev, ...newProjectDocuments]);
            }}
          />
              </div>
            {/* Call to action buttons */}
            <div className="govuk-!-static-margin-top-6">
               <button type="button" className="govuk-button govuk-button--secondary govuk-!-static-margin-right-2" onClick={handleSave}>Save for Later</button>
              <button type="submit" className="govuk-button govuk-!-static-margin-right-2" data-module="govuk-button">Save and continue</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Negotiations;