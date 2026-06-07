import React, { useState, useRef } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import FileUpload, { FileUploadHandle } from '../../../components/FileUpload';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { saveConsultationRequest, getConsultationRequest } from '../../../services/consultationRequestService';
import { UploadedFile, ApplicationDocument } from '../../../types/fileUpload';
import { validateDateComponents } from '../../../utils/validation';
import { CONSULTATION_VALIDATION_MESSAGES } from '../../../constants/consultationValidationMessages';
import log from '../../../logger';

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
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileUploadRef = useRef<FileUploadHandle>(null);
  const { user } = useAuthUser();
  const navigate = useNavigate();

  // Scroll to top on mount
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Handle file validation errors from FileUpload component
  const handleFileValidationErrors = (errors: string[]) => {
    setFileValidationErrors(errors);
    // Clear form-level errors when file validation errors are cleared
    if (errors.length === 0) {
      setErrors(prev => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { fileUpload: _fileUpload, ...rest } = prev;
        return rest;
      });
    }
  };

  // Handle error click to focus file upload area
  const handleErrorClick = (event: React.MouseEvent, errorType: string) => {
    event.preventDefault();
    if (errorType === 'fileUpload' || errorType === 'file') {
      const fileUploadSection = document.querySelector('#file-upload');
      if (fileUploadSection) {
        // First scroll to the section smoothly
        fileUploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Wait for scroll to complete, then focus the upload container
        setTimeout(() => {
          const uploadContainer = fileUploadSection.querySelector('.gds-upload-container');
          if (uploadContainer) {
            (uploadContainer as HTMLElement).focus();
          } else {
            // Fallback: try to focus the file input directly
            const fileInput = fileUploadSection.querySelector('#file-upload-input');
            if (fileInput) {
              (fileInput as HTMLElement).focus();
            } 
          }
        }, 300);
      } 
    }
  };

  // Fetch and bind consultation response on load
  React.useEffect(() => {
    async function fetchData() {
      if (applicationId && consultationId) {
        try {
          log.debug('[ConsultationRequestPage] Fetching consultation request data', { applicationId, consultationId });
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
            log.debug('[ConsultationRequestPage] Consultation data loaded successfully');
          }
        } catch (error) {
          log.error('[ConsultationRequestPage] Error fetching consultation request:', error);
        }
      }
    }
    fetchData();
  }, [applicationId, consultationId]);

  // Clear file upload error when pending files are added
  React.useEffect(() => {
    if (pendingFiles.length > 0 || uploadedFileObjs.length > 0) {
      setErrors(prev => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { fileUpload: _fileUpload, ...rest } = prev;
        return rest;
      });
    }
  }, [pendingFiles.length, uploadedFileObjs.length]);

  // Validation function
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    // Date validation using shared utility
    const dateValidation = validateDateComponents(responseDate, 'consultation request', { required: true });
    if (!dateValidation.isValid) {
      newErrors.responseDate = dateValidation.error!;
    }
    
    // File validation - check both uploaded files AND pending files
    const hasFiles = (uploadedFileObjs && uploadedFileObjs.length > 0) || pendingFiles.length > 0;
    
    if (!hasFiles) {
      newErrors.fileUpload = CONSULTATION_VALIDATION_MESSAGES.consultationRequestUpload.empty;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && fileValidationErrors.length === 0;
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

    try {
      // STEP 1: Upload pending files to S3 FIRST (before validation)
      let newlyUploadedFiles: UploadedFile[] = [];
      let newlyUploadedDocuments: ApplicationDocument[] = [];
      
      if (fileUploadRef.current && pendingFiles.length > 0) {
        log.debug('[ConsultationRequestPage] Uploading pending files to S3', { pendingFilesCount: pendingFiles.length });
        const result = await fileUploadRef.current.triggerUpload();
        newlyUploadedFiles = result.uploadedFiles;
        newlyUploadedDocuments = result.applicationDocuments;
        log.info('[ConsultationRequestPage] Pending files uploaded successfully');
        
        // Update state immediately so files remain visible even if validation fails
        setUploadedFileObjs(prev => [...prev, ...newlyUploadedFiles]);
        setApplicationDocuments(prev => [...prev, ...newlyUploadedDocuments]);
      }

      // STEP 2: Now validate after files are uploaded
      const totalUploadedFiles = uploadedFileObjs.length + newlyUploadedFiles.length;
      
      // Date validation
      const dateValidation = validateDateComponents(responseDate, 'consultation request', { required: true });
      const newErrors: { [key: string]: string } = {};
      
      if (!dateValidation.isValid) {
        newErrors.responseDate = dateValidation.error!;
      }
      
      // File validation - check if we have files after upload
      if (totalUploadedFiles === 0) {
        newErrors.fileUpload = CONSULTATION_VALIDATION_MESSAGES.consultationRequestUpload.empty;
      }
      
      // Check for file validation errors
      if (Object.keys(newErrors).length > 0 || fileValidationErrors.length > 0) {
        setErrors(newErrors);
        const errorSummary = document.getElementById('error-summary');
        if (errorSummary) {
          errorSummary.focus();
          errorSummary.scrollIntoView({block: 'start' });
        }
        return;
      }

      // STEP 3: Build and save payload
      let sentDate = '';
      if (responseDate.year && responseDate.month && responseDate.day) {
        sentDate = `${responseDate.year}-${responseDate.month.padStart(2, '0')}-${responseDate.day.padStart(2, '0')}`;
      }
      
      const payload = {
        applicationId: applicationId || '',
        consultationId: consultationId || '',
        sentDate: sentDate,
        uploadedFiles: [...uploadedFileObjs, ...newlyUploadedFiles],
        applicationDocuments: [...applicationDocuments, ...newlyUploadedDocuments],
        createdBy: user?.user_id || '',
        lastUpdatedBy: user?.user_id || '',
        status: ConsultationStatus.REQUEST_SENT,
      };
      
      log.debug('[ConsultationRequestPage] Saving consultation request', { status: ConsultationStatus.REQUEST_SENT });
      await saveConsultationRequest(payload);
      log.info('[ConsultationRequestPage] Consultation request saved successfully');
      navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
    } catch (error) {
      console.error('Save failed:', error);
      log.error('[ConsultationRequestPage] Error saving consultation request:', error);
      alert(`Failed to save consultation request: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      log.debug('[ConsultationRequestPage] Saving consultation draft', { status: ConsultationStatus.DRAFT });
      await saveConsultationRequest(payload);
      log.info('[ConsultationRequestPage] Consultation draft saved successfully');
      navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
    } catch (error) {
      log.error('[ConsultationRequestPage] Error saving consultation request for later:', error);
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
            {(Object.values(errors).some(Boolean) || fileValidationErrors.length > 0) && (
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
                      {fileValidationErrors.map((error, index) => (
                        <li key={index}>
                          <a href="#file-upload" onClick={(e) => handleErrorClick(e, 'file')}>
                            {error}
                          </a>
                        </li>
                      ))}
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
                            if (errors.responseDate) {
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              const { responseDate: _, ...restErrors } = errors;
                              setErrors(restErrors);
                            }
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
                            if (errors.responseDate) {
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              const { responseDate: _, ...restErrors } = errors;
                              setErrors(restErrors);
                            }
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
                            if (errors.responseDate) {
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              const { responseDate: _, ...restErrors } = errors;
                              setErrors(restErrors);
                            }
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>
              
              <div className={`govuk-form-group govuk-!-margin-bottom-6 ${errors.fileUpload || fileValidationErrors.length > 0 ? 'govuk-form-group--error' : ''}`} id="file-upload">
                <h2 className="govuk-heading-m">Upload evidence of the consultation request</h2>
                {errors.fileUpload && (
                  <p id="fileUpload-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.fileUpload}
                  </p>
                )}
                {fileValidationErrors.length > 0 && fileValidationErrors.map((error, index) => (
                  <p key={index} id={`fileValidation-error-${index}`} className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {error}
                  </p>
                ))}
                <FileUpload
                  ref={fileUploadRef}
                  title=""
                  prefix={`${applicationId}/${FILE_CATEGORIES.CONSULTATION_REQUEST}/${consultationId}`}
                  applicationId={applicationId}
                  category={FILE_CATEGORIES.CONSULTATION_REQUEST}
                  addedBy={user?.user_id || ''}
                  uploadedFiles={uploadedFileObjs}
                  applicationDocuments={applicationDocuments}
                  uploadImmediately={true}
                  onRemoveFile={idx => {
                    setUploadedFileObjs(objs => objs.filter((_, i) => i !== idx));
                    setApplicationDocuments(docs => docs.filter((_, i) => i !== idx));
                  }}
                  onValidationErrors={handleFileValidationErrors}
                  consultationId={consultationId}
                  onPendingFilesChange={(files) => setPendingFiles(files)}
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
