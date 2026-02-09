import React, { useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import FileUpload from '../../../components/FileUpload';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { saveConsultationRequest, getConsultationRequest } from '../../../services/consultationRequestService';
import { UploadedFile, ApplicationDocument } from '../../../types/fileUpload';
import { validateDateComponents } from '../../../utils/validation';

import { S37_BASE_URL } from '../../../constants/s37';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';
import { ConsultationStatus } from '../../../constants/consultationStatus';

const ConsultationRequestPage: React.FC = () => {
  // Get params from route and query string
  const { applicationId, consultationId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const consultationName = searchParams.get('consultationName') || 'Consultee';
  
  const [responseDate, setResponseDate] = useState({ day: '', month: '', year: '' });
  const [uploadedFileObjs, setUploadedFileObjs] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { user } = useAuthUser();
  const navigate = useNavigate();

  // Scroll to top on mount
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Handler for FileUpload onUploaded
  const handleUploadedFiles = (uploadedFiles: UploadedFile[], applicationDocuments: ApplicationDocument[]) => {
    setUploadedFileObjs(prev => [...prev, ...uploadedFiles]);
    setApplicationDocuments(prev => [...prev, ...applicationDocuments]);
  };

  // Fetch and bind consultation response on load
  React.useEffect(() => {
    async function fetchData() {
      if (applicationId && consultationId) {
        try {
          const data = await getConsultationRequest(applicationId, consultationId);
          if (data) {
            // Parse sent date if available
            if (data.sentDate) {
              const date = new Date(data.sentDate);
              setResponseDate({
                day: String(date.getDate()),
                month: String(date.getMonth() + 1),
                year: String(date.getFullYear())
              });
            }
            setUploadedFileObjs(data.uploadedFiles || []);
            setApplicationDocuments(data.applicationDocuments || []);
          }
        } catch (error) {
          console.error('Error fetching consultation request:', error);
        }
      }
    }
    fetchData();
  }, [applicationId, consultationId]);

  // Validation function
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    // Date validation using shared utility
    const dateValidation = validateDateComponents(responseDate, 'consultation request', { required: true });
    if (!dateValidation.isValid) {
      newErrors.responseDate = dateValidation.error!;
    }
    
    // File validation
    if (!uploadedFileObjs || uploadedFileObjs.length === 0) {
      newErrors.fileUpload = 'You must upload at least one evidence document';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation for save for later (only format validation, not required fields)
  const validateFormatOnly = () => {
    const newErrors: { [key: string]: string } = {};
    
    // Date format validation using shared utility (not required)
    const dateValidation = validateDateComponents(responseDate, 'consultation request', { required: false });
    if (!dateValidation.isValid) {
      newErrors.responseDate = dateValidation.error!;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save and Continue handler (with validation)
  const handleSaveAndContinue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to error summary
      const errorSummary = document.getElementById('error-summary');
      if (errorSummary) {
        errorSummary.focus();
        errorSummary.scrollIntoView({block: 'start' });
      }
      return;
    }
    let sentDate = '';
    if (responseDate.year && responseDate.month && responseDate.day) {
      sentDate = `${responseDate.year}-${responseDate.month.padStart(2, '0')}-${responseDate.day.padStart(2, '0')}`;
    }
    const payload = {
      applicationId: applicationId || '',
      consultationId: consultationId || '',
      sentDate: sentDate,
      uploadedFiles: uploadedFileObjs,
      applicationDocuments: applicationDocuments,
      createdBy: user?.user_id || '',
      lastUpdatedBy: user?.user_id || '',
      status: ConsultationStatus.REQUEST_SENT,
    };
    try {
      await saveConsultationRequest(payload);
      navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
    } catch (error) {
      console.error('Error saving consultation request:', error);
    }
  };

  // Save for later handler (format validation only)
  const handleSaveForLater = async () => {
    if (!validateFormatOnly()) {
      // Scroll to error summary
      const errorSummary = document.getElementById('error-summary');
      if (errorSummary) {
        errorSummary.focus();
        errorSummary.scrollIntoView({ block: 'start' });
      }
      return;
    }
    
    let sentDate = '';
    if (responseDate.year && responseDate.month && responseDate.day) {
      sentDate = `${responseDate.year}-${responseDate.month.padStart(2, '0')}-${responseDate.day.padStart(2, '0')}`;
    }
    const payload = {
      applicationId: applicationId || '',
      consultationId: consultationId || '',
      sentDate: sentDate || undefined,
      uploadedFiles: uploadedFileObjs,
      applicationDocuments: applicationDocuments,
      createdBy: user?.user_id || '',
      lastUpdatedBy: user?.user_id || '',
      status: ConsultationStatus.DRAFT,
    };
    try {
      await saveConsultationRequest(payload);
      navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
    } catch (error) {
      console.error('Error saving consultation request for later:', error);
    }
  };

  return (
    <div className="govuk-width-container govuk-!-margin-top-6 govuk-!-margin-bottom-6">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <nav className="govuk-breadcrumbs govuk-!-margin-bottom-6" aria-label="Breadcrumb">
            <ol className="govuk-breadcrumbs__list">
                <li className="govuk-breadcrumbs__list-item">
                  <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/task-list`}>Task list</Link>
                </li>
                <li className="govuk-breadcrumbs__list-item">
                  <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/consultation-details`}>Manage consultation</Link>
                </li>
                <li className="govuk-breadcrumbs__list-item" aria-current="page">Consultation request</li>
            </ol>
          </nav>
          
          <main id="main-content">
            {Object.keys(errors).length > 0 && (
              <div className="govuk-error-summary" data-module="govuk-error-summary" id="error-summary" tabIndex={-1}>
                <div role="alert">
                  <h2 className="govuk-error-summary__title">There is a problem</h2>
                  <div className="govuk-error-summary__body">
                    <ul className="govuk-list govuk-error-summary__list">
                      {errors.responseDate && (
                        <li>
                          <a href="#responseDateDay">{errors.responseDate}</a>
                        </li>
                      )}
                      {errors.fileUpload && (
                        <li>
                          <a href="#file-upload">{errors.fileUpload}</a>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            <h2 className="govuk-caption-xl">{consultationName}</h2>
            <h1 className="govuk-heading-l">Provide evidence of consultation request</h1>
            
            <p className="govuk-body">
              You need to record the date you sent the request and attach copies of everything you sent to the consultee, such as email correspondence, an application summary and any supporting documents and images.
            </p>

            <form className="govuk-form-group govuk-!-margin-bottom-6" noValidate onSubmit={handleSaveAndContinue}>
              <div className={`govuk-form-group govuk-!-margin-bottom-6 ${errors.responseDate ? 'govuk-form-group--error' : ''}`}>
                <fieldset className="govuk-fieldset" role="group" aria-describedby={errors.responseDate ? 'responseDate-error' : undefined}>
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h2 className="govuk-fieldset__heading">Date of consultation request</h2>
                  </legend>
                  {errors.responseDate && (
                    <p id="responseDate-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span> {errors.responseDate}
                    </p>
                  )}
                  <div className="govuk-date-input govuk-!-margin-top-2" id="responseDate">
                    <div className="govuk-date-input__item">
                      <div className="govuk-form-group">
                        <label className="govuk-label govuk-date-input__label" htmlFor="responseDateDay">Day</label>
                        <input 
                          className={`govuk-input govuk-date-input__input govuk-input--width-2 ${errors.responseDate ? 'govuk-input--error' : ''}`}
                          id="responseDateDay" 
                          name="responseDateDay" 
                          type="text" 
                          inputMode="numeric" 
                          autoComplete="off" 
                          value={responseDate.day} 
                          onChange={e => {
                            setResponseDate({ ...responseDate, day: e.target.value });
                            if (errors.responseDate) setErrors({ ...errors, responseDate: '' });
                          }} 
                        />
                      </div>
                    </div>
                    <div className="govuk-date-input__item">
                      <div className="govuk-form-group">
                        <label className="govuk-label govuk-date-input__label" htmlFor="responseDateMonth">Month</label>
                        <input 
                          className={`govuk-input govuk-date-input__input govuk-input--width-2 ${errors.responseDate ? 'govuk-input--error' : ''}`}
                          id="responseDateMonth" 
                          name="responseDateMonth" 
                          type="text" 
                          inputMode="numeric" 
                          autoComplete="off" 
                          value={responseDate.month} 
                          onChange={e => {
                            setResponseDate({ ...responseDate, month: e.target.value });
                            if (errors.responseDate) setErrors({ ...errors, responseDate: '' });
                          }} 
                        />
                      </div>
                    </div>
                    <div className="govuk-date-input__item">
                      <div className="govuk-form-group">
                        <label className="govuk-label govuk-date-input__label" htmlFor="responseDateYear">Year</label>
                        <input 
                          className={`govuk-input govuk-date-input__input govuk-input--width-4 ${errors.responseDate ? 'govuk-input--error' : ''}`}
                          id="responseDateYear" 
                          name="responseDateYear" 
                          type="text" 
                          inputMode="numeric" 
                          autoComplete="off" 
                          value={responseDate.year} 
                          onChange={e => {
                            setResponseDate({ ...responseDate, year: e.target.value });
                            if (errors.responseDate) setErrors({ ...errors, responseDate: '' });
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>
              
              <div className={`govuk-form-group govuk-!-margin-bottom-6 ${errors.fileUpload ? 'govuk-form-group--error' : ''}`} id="file-upload">
                <h2 className="govuk-heading-m">Upload evidence of the consultation request</h2>
                {errors.fileUpload && (
                  <p id="fileUpload-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.fileUpload}
                  </p>
                )}
                <FileUpload
                  title=""
                  prefix={`${applicationId}/${FILE_CATEGORIES.CONSULTATION_REQUEST}/${consultationId}`}
                  applicationId={applicationId}
                  category={FILE_CATEGORIES.CONSULTATION_REQUEST}
                  addedBy={user?.user_id || ''}
                  uploadedFiles={uploadedFileObjs}
                  onRemoveFile={idx => {
                    setUploadedFileObjs(objs => objs.filter((_, i) => i !== idx));
                    setApplicationDocuments(docs => docs.filter((_, i) => i !== idx));
                  }}
                  onUploaded={(files, docs) => {
                    handleUploadedFiles(files, docs);
                    if (errors.fileUpload) setErrors({ ...errors, fileUpload: '' });
                  }}
                  consultationId={consultationId}
                />
              </div>
              
             <div className="govuk-button-group govuk-!-margin-top-6">
                <button
                  type="submit"
                  className="govuk-button"
                  data-module="govuk-button"
                >
                  Save and continue
                </button>
                {/*  <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  data-module="govuk-button"
                  onClick={handleSaveForLater}
                >
                  Save for later
                </button> */}
              </div> 
            </form>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ConsultationRequestPage;
