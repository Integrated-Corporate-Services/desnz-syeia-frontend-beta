import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import FileUpload, { FileUploadHandle } from '../../../components/FileUpload';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { UploadedFile, ApplicationDocument } from '../../../types/fileUpload';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';
import { saveConsultationRequest, getConsultationRequest } from '../../../services/consultationRequestService';
import { ConsultationStatus } from '../../../constants/consultationStatus';
import { CONSULTATION_VALIDATION_MESSAGES } from '../../../constants/consultationValidationMessages';
import log from '../../../logger';

interface FormErrors {
  firstDate?: string;
  secondDate?: string;
  fileUpload?: string;
}

const PublicNoticesEvidence: React.FC = () => {
  const { applicationId, consultationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthUser();

  const [firstDateDay, setFirstDateDay] = useState('');
  const [firstDateMonth, setFirstDateMonth] = useState('');
  const [firstDateYear, setFirstDateYear] = useState('');
  
  const [secondDateDay, setSecondDateDay] = useState('');
  const [secondDateMonth, setSecondDateMonth] = useState('');
  const [secondDateYear, setSecondDateYear] = useState('');

  const [uploadedFileObjs, setUploadedFileObjs] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileUploadRef = useRef<FileUploadHandle>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle file deletion
  const handleDeleteFile = (fileId: string) => {
    setUploadedFileObjs(prev => prev.filter(file => file.id !== fileId));
    setApplicationDocuments(prev => prev.filter(doc => doc.fileId !== fileId));
  };

  // Fetch and bind consultation request data on load
  useEffect(() => {
    async function fetchData() {
      if (applicationId && consultationId) {
        try {
          log.debug('[PublicNoticesEvidence] Fetching public notices data', { applicationId, consultationId });
          const data = await getConsultationRequest(applicationId, consultationId);
          if (data) {
            // Parse first date (sentDate) if available
            if (data.sentDate) {
              const date = new Date(data.sentDate);
              setFirstDateDay(String(date.getDate()));
              setFirstDateMonth(String(date.getMonth() + 1));
              setFirstDateYear(String(date.getFullYear()));
            }
            // Parse second date if available
            if (data.secondDate) {
              const date = new Date(data.secondDate);
              setSecondDateDay(String(date.getDate()));
              setSecondDateMonth(String(date.getMonth() + 1));
              setSecondDateYear(String(date.getFullYear()));
            }
            setUploadedFileObjs(data.uploadedFiles || []);
            setApplicationDocuments(data.applicationDocuments || []);
            log.debug('[PublicNoticesEvidence] Data loaded successfully');
          }
        } catch (error) {
          log.error('[PublicNoticesEvidence] Error fetching public notices data:', error);
        }
      }
    }
    fetchData();
  }, [applicationId, consultationId]);

  const handleUploadedFiles = (uploadedFiles: UploadedFile[], applicationDocuments: ApplicationDocument[]) => {
    setUploadedFileObjs(prev => [...prev, ...uploadedFiles]);
    setApplicationDocuments(prev => [...prev, ...applicationDocuments]);
    // Clear file upload error when files are uploaded
    if (errors.fileUpload) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.fileUpload;
        return newErrors;
      });
    }
    setFileValidationErrors([]);
  };

  // Handle file validation errors from FileUpload component
  const handleFileValidationErrors = (errors: string[]) => {
    // Handle validation errors
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
  const handleErrorClick = (errorType: string) => {
    if (errorType === 'fileUpload') {
      const fileUploadSection = document.querySelector('#file-upload');
      if (fileUploadSection) {
        // First scroll to the section smoothly
        fileUploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Wait for scroll to complete, then focus the upload container
        setTimeout(() => {
          const uploadContainer = fileUploadSection.querySelector('.gds-upload-container');
          if (uploadContainer) {
            (uploadContainer as HTMLElement).focus();
            // Successfully focused file upload container
        } else {
            // Could not find file upload elements to focus
          }
        }, 300);
      } else {
        // Could not find file upload section
      }
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Validate first date
    if (!firstDateDay && !firstDateMonth && !firstDateYear) {
      newErrors.firstDate = CONSULTATION_VALIDATION_MESSAGES.firstDatePublished.empty;
    } else if (!firstDateDay || !firstDateMonth || !firstDateYear) {
      // Check for incomplete date (some fields filled, some not)
      newErrors.firstDate = CONSULTATION_VALIDATION_MESSAGES.firstDatePublished.incomplete;
    } else {
      const day = parseInt(firstDateDay);
      const month = parseInt(firstDateMonth);
      const year = parseInt(firstDateYear);
      
      // Validate that it's a real date
      if (isNaN(day) || isNaN(month) || isNaN(year) ||
          day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
        newErrors.firstDate = CONSULTATION_VALIDATION_MESSAGES.firstDatePublished.incomplete;
      }
    }

    // Validate second date
    if (!secondDateDay && !secondDateMonth && !secondDateYear) {
      newErrors.secondDate = CONSULTATION_VALIDATION_MESSAGES.secondDatePublished.empty;
    } else if (!secondDateDay || !secondDateMonth || !secondDateYear) {
      // Check for incomplete date (some fields filled, some not)
      newErrors.secondDate = CONSULTATION_VALIDATION_MESSAGES.secondDatePublished.incomplete;
    } else {
      const day = parseInt(secondDateDay);
      const month = parseInt(secondDateMonth);
      const year = parseInt(secondDateYear);
      
      // Validate that it's a real date
      if (isNaN(day) || isNaN(month) || isNaN(year) ||
          day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
        newErrors.secondDate = CONSULTATION_VALIDATION_MESSAGES.secondDatePublished.incomplete;
      }
    }

    // File validation - check both uploaded files AND pending files
    if ((!uploadedFileObjs || uploadedFileObjs.length === 0) && pendingFiles.length === 0) {
      newErrors.fileUpload = CONSULTATION_VALIDATION_MESSAGES.publicNoticeUpload.empty;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && fileValidationErrors.length === 0;
  };

  const handleSaveAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to error summary
      const errorSummary = document.getElementById('error-summary');
      if (errorSummary) {
        errorSummary.focus();
        errorSummary.scrollIntoView({ block: 'start' });
      }
      return;
    }

    try {
      let newlyUploadedFiles: UploadedFile[] = [];
      let newlyUploadedDocuments: ApplicationDocument[] = [];
      
      if (fileUploadRef.current && pendingFiles.length > 0) {
        log.debug('[PublicNoticesEvidence] Uploading pending files to S3', { pendingFilesCount: pendingFiles.length });
        const result = await fileUploadRef.current.triggerUpload();
        newlyUploadedFiles = result.uploadedFiles;
        newlyUploadedDocuments = result.applicationDocuments;
        log.info('[PublicNoticesEvidence] Pending files uploaded successfully');
      }

      const firstDate = `${firstDateYear}-${firstDateMonth.padStart(2, '0')}-${firstDateDay.padStart(2, '0')}`;
      const secondDate = `${secondDateYear}-${secondDateMonth.padStart(2, '0')}-${secondDateDay.padStart(2, '0')}`;

      const payload = {
        applicationId: applicationId || '',
        consultationId: consultationId || '',
        sentDate: firstDate,
        secondDate: secondDate,
        uploadedFiles: [...uploadedFileObjs, ...newlyUploadedFiles],
        applicationDocuments: [...applicationDocuments, ...newlyUploadedDocuments],
        createdBy: user?.user_id || '',
        lastUpdatedBy: user?.user_id || '',
        status: ConsultationStatus.REQUEST_SENT,
      };

      log.debug('[PublicNoticesEvidence] Saving public notices evidence', { status: ConsultationStatus.REQUEST_SENT });
      await saveConsultationRequest(payload);
      log.info('[PublicNoticesEvidence] Public notices evidence saved successfully');
      navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
    } catch (error) {
      log.error('[PublicNoticesEvidence] Error saving public notices evidence:', error);
    }
  };

  const handleSaveForLater = async () => {
    // Format validation only for save for later
    const formatErrors: FormErrors = {};
    
    // Validate first date format if any field is filled
    if (firstDateDay || firstDateMonth || firstDateYear) {
      if (!firstDateDay || !firstDateMonth || !firstDateYear) {
        formatErrors.firstDate = 'Enter a complete first date or leave all fields empty';
      } else {
        const day = parseInt(firstDateDay);
        const month = parseInt(firstDateMonth);
        const year = parseInt(firstDateYear);
        
        if (day < 1 || day > 31 || isNaN(day)) {
          formatErrors.firstDate = 'Enter a valid day';
        }
        if (month < 1 || month > 12 || isNaN(month)) {
          formatErrors.firstDate = 'Enter a valid month';
        }
        if (year < 1900 || year > 2100 || isNaN(year)) {
          formatErrors.firstDate = 'Enter a valid year';
        }
      }
    }
    
    // Validate second date format if any field is filled
    if (secondDateDay || secondDateMonth || secondDateYear) {
      if (!secondDateDay || !secondDateMonth || !secondDateYear) {
        formatErrors.secondDate = 'Enter a complete second date or leave all fields empty';
      } else {
        const day = parseInt(secondDateDay);
        const month = parseInt(secondDateMonth);
        const year = parseInt(secondDateYear);
        
        if (day < 1 || day > 31 || isNaN(day)) {
          formatErrors.secondDate = 'Enter a valid day';
        }
        if (month < 1 || month > 12 || isNaN(month)) {
          formatErrors.secondDate = 'Enter a valid month';
        }
        if (year < 1900 || year > 2100 || isNaN(year)) {
          formatErrors.secondDate = 'Enter a valid year';
        }
      }
    }
    
    if (Object.keys(formatErrors).length > 0) {
      setErrors(formatErrors);
      const errorSummary = document.getElementById('error-summary');
      if (errorSummary) {
        errorSummary.focus();
        errorSummary.scrollIntoView({ block: 'start' });
      }
      return;
    }

    const firstDate = (firstDateYear && firstDateMonth && firstDateDay) 
      ? `${firstDateYear}-${firstDateMonth.padStart(2, '0')}-${firstDateDay.padStart(2, '0')}` 
      : '';
    const secondDate = (secondDateYear && secondDateMonth && secondDateDay)
      ? `${secondDateYear}-${secondDateMonth.padStart(2, '0')}-${secondDateDay.padStart(2, '0')}`
      : '';

    const payload = {
      applicationId: applicationId || '',
      consultationId: consultationId || '',
      sentDate: firstDate || undefined,
      secondDate: secondDate || undefined,
      uploadedFiles: uploadedFileObjs,
      applicationDocuments: applicationDocuments,
      createdBy: user?.user_id || '',
      lastUpdatedBy: user?.user_id || '',
      status: ConsultationStatus.DRAFT,
    };

    try {
      log.debug('[PublicNoticesEvidence] Saving public notices draft', { status: ConsultationStatus.DRAFT });
      await saveConsultationRequest(payload);
      log.info('[PublicNoticesEvidence] Public notices draft saved successfully');
      navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
    } catch (error) {
      log.error('[PublicNoticesEvidence] Error saving public notices for later:', error);
    }
  };

  return (
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link
              to={`${S37_BASE_URL}/${applicationId}/task-list`}
              className="govuk-breadcrumbs__link"
            >
              Task list
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item">
            <Link
              to={`${S37_BASE_URL}/${applicationId}/consultation-details`}
              className="govuk-breadcrumbs__link"
            >
              Manage consultation
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">
            Consultation request
          </li>
        </ol>
      </nav>

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {(Object.values(errors).some(Boolean) || fileValidationErrors.length > 0) && (
              <div className="govuk-error-summary govuk-!-width-two-thirds" data-module="govuk-error-summary" id="error-summary" tabIndex={-1}>
                <div role="alert">
                  <h2 className="govuk-error-summary__title">There is a problem</h2>
                  <div className="govuk-error-summary__body">
                    <ul className="govuk-list govuk-error-summary__list">
                      {fileValidationErrors.map((error, index) => (
                        <li key={`file-${index}`}>
                          <a href="#" onClick={(e) => {
                            e.preventDefault();
                            handleErrorClick('fileUpload');
                          }}>
                            {error}
                          </a>
                        </li>
                      ))}
                      {errors.firstDate && (
                        <li>
                          <a href="#first-date-day">{errors.firstDate}</a>
                        </li>
                      )}
                      {errors.secondDate && (
                        <li>
                          <a href="#second-date-day">{errors.secondDate}</a>
                        </li>
                      )}
                      {errors.fileUpload && (
                        <li>
                          <a href="#" onClick={(e) => {
                            e.preventDefault();
                            handleErrorClick('fileUpload');
                          }}>
                            {errors.fileUpload}
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            <span className="govuk-caption-l">Public notices</span>
            <h1 className="govuk-heading-l">Provide evidence of published public notices</h1>

            <p className="govuk-body">
              For overhead lines with a line voltage of 132kV or higher, you must publish at least 2 public notices in one or more local newspapers for two consecutive weeks as per{' '}
              <a 
                href="https://www.legislation.gov.uk/uksi/1990/455/regulation/5/made" 
                className="govuk-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Regulation 5 of the Electricity (Applications for Consent) Regulations 1990 (Statutory Instruments 1990 No. 455)
              </a>.
            </p>

            <p className="govuk-body">
              You must allow 4 weeks after the publication of the second notice for responses to this consultation. You can submit your Section 37 application without waiting for the 4 week consultation period to end, but you must give details of the end date of the consultation in the "Provide public response" section.
            </p>

            <p className="govuk-body">The public notices must include these DESNZ contact details:</p>
            
            <ul className="govuk-list govuk-list--bullet">
              <li>email: s37consents@energysecurity.gov.uk</li>
              <li>postal address: Energy Infrastructure Planning, 3-8 Whitehall Place, London, SW1A 2JP</li>
            </ul>

            <form onSubmit={handleSaveAndContinue} noValidate>
              {/* First date published */}
              <div className={`govuk-form-group${errors.firstDate ? ' govuk-form-group--error' : ''}`}>
                <fieldset className="govuk-fieldset" role="group" aria-describedby={errors.firstDate ? 'firstDate-error' : undefined}>
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h2 className="govuk-fieldset__heading">First date published</h2>
                  </legend>
                  {errors.firstDate && (
                    <p id="firstDate-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span> {errors.firstDate}
                    </p>
                  )}
                  <div className="govuk-date-input">
                    <div className="govuk-date-input__item">
                      <div className="govuk-form-group">
                        <label className="govuk-label govuk-date-input__label" htmlFor="first-date-day">
                          Day
                        </label>
                        <input
                          className={`govuk-input govuk-date-input__input govuk-input--width-2${errors.firstDate ? ' govuk-input--error' : ''}`}
                          id="first-date-day"
                          name="first-date-day"
                          type="text"
                          inputMode="numeric"
                          value={firstDateDay}
                          onChange={(e) => {
                            setFirstDateDay(e.target.value);
                            if (errors.firstDate) {
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              const { firstDate: _, ...restErrors } = errors;
                              setErrors(restErrors);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="govuk-date-input__item">
                      <div className="govuk-form-group">
                        <label className="govuk-label govuk-date-input__label" htmlFor="first-date-month">
                          Month
                        </label>
                        <input
                          className={`govuk-input govuk-date-input__input govuk-input--width-2${errors.firstDate ? ' govuk-input--error' : ''}`}
                          id="first-date-month"
                          name="first-date-month"
                          type="text"
                          inputMode="numeric"
                          value={firstDateMonth}
                          onChange={(e) => {
                            setFirstDateMonth(e.target.value);
                            if (errors.firstDate) {
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              const { firstDate: _, ...restErrors } = errors;
                              setErrors(restErrors);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="govuk-date-input__item">
                      <div className="govuk-form-group">
                        <label className="govuk-label govuk-date-input__label" htmlFor="first-date-year">
                          Year
                        </label>
                        <input
                          className={`govuk-input govuk-date-input__input govuk-input--width-4${errors.firstDate ? ' govuk-input--error' : ''}`}
                          id="first-date-year"
                          name="first-date-year"
                          type="text"
                          inputMode="numeric"
                          value={firstDateYear}
                          onChange={(e) => {
                            setFirstDateYear(e.target.value);
                            if (errors.firstDate) {
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              const { firstDate: _, ...restErrors } = errors;
                              setErrors(restErrors);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>

              {/* Second date published */}
              <div className={`govuk-form-group${errors.secondDate ? ' govuk-form-group--error' : ''}`}>
                <fieldset className="govuk-fieldset" role="group" aria-describedby={errors.secondDate ? 'secondDate-error' : undefined}>
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h2 className="govuk-fieldset__heading">Second date published</h2>
                  </legend>
                  {errors.secondDate && (
                    <p id="secondDate-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span> {errors.secondDate}
                    </p>
                  )}
                  <div className="govuk-date-input">
                    <div className="govuk-date-input__item">
                      <div className="govuk-form-group">
                        <label className="govuk-label govuk-date-input__label" htmlFor="second-date-day">
                          Day
                        </label>
                        <input
                          className={`govuk-input govuk-date-input__input govuk-input--width-2${errors.secondDate ? ' govuk-input--error' : ''}`}
                          id="second-date-day"
                          name="second-date-day"
                          type="text"
                          inputMode="numeric"
                          value={secondDateDay}
                          onChange={(e) => {
                            setSecondDateDay(e.target.value);
                            if (errors.secondDate) {
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              const { secondDate: _, ...restErrors } = errors;
                              setErrors(restErrors);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="govuk-date-input__item">
                      <div className="govuk-form-group">
                        <label className="govuk-label govuk-date-input__label" htmlFor="second-date-month">
                          Month
                        </label>
                        <input
                          className={`govuk-input govuk-date-input__input govuk-input--width-2${errors.secondDate ? ' govuk-input--error' : ''}`}
                          id="second-date-month"
                          name="second-date-month"
                          type="text"
                          inputMode="numeric"
                          value={secondDateMonth}
                          onChange={(e) => {
                            setSecondDateMonth(e.target.value);
                            if (errors.secondDate) {
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              const { secondDate: _, ...restErrors } = errors;
                              setErrors(restErrors);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="govuk-date-input__item">
                      <div className="govuk-form-group">
                        <label className="govuk-label govuk-date-input__label" htmlFor="second-date-year">
                          Year
                        </label>
                        <input
                          className={`govuk-input govuk-date-input__input govuk-input--width-4${errors.secondDate ? ' govuk-input--error' : ''}`}
                          id="second-date-year"
                          name="second-date-year"
                          type="text"
                          inputMode="numeric"
                          value={secondDateYear}
                          onChange={(e) => {
                            setSecondDateYear(e.target.value);
                            if (errors.secondDate) {
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              const { secondDate: _, ...restErrors } = errors;
                              setErrors(restErrors);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>

              {/* Evidence examples */}
              <div className="govuk-form-group">
                <p className="govuk-body">You must provide evidence of public notices and here are some examples of suitable forms of evidence:</p>
                <ul className="govuk-list govuk-list--bullet">
                  <li>Images of the front cover and public notice within the published newspaper (including dates).</li>
                  <li>Invoices from the local newspaper showing the dates the notice was published and an image of the advert.</li>
                </ul>
              </div>

              {/* File upload section */}
              <div className={`govuk-form-group govuk-!-margin-bottom-6 ${errors.fileUpload || fileValidationErrors.length > 0 ? 'govuk-form-group--error' : ''}`} id="file-upload">
                <label htmlFor="fileUpload" className="govuk-label govuk-label--m">
                  Upload evidence of the published public notices
                </label>
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
                
                {applicationDocuments && applicationDocuments.length > 0 && (
                  <div className="govuk-!-margin-top-2">
                    <h3 className="govuk-heading-s">Documents uploaded</h3>
                  </div>
                )}
                
                <FileUpload
                  ref={fileUploadRef}
                  title="Upload evidence of the published public notices"
                  prefix={`${applicationId}/${FILE_CATEGORIES.CONSULTATION_REQUEST}/${consultationId}`}
                  applicationId={applicationId}
                  category={FILE_CATEGORIES.CONSULTATION_REQUEST}
                  addedBy={user?.user_id || ''}
                  uploadedFiles={uploadedFileObjs}
                  applicationDocuments={applicationDocuments}
                  uploadImmediately={false}
                  onUploaded={(files, docs) => {
                    handleUploadedFiles(files, docs);
                  }}
                  onDeleteFile={handleDeleteFile}
                  onValidationErrors={handleFileValidationErrors}
                  consultationId={consultationId}
                  onPendingFilesChange={setPendingFiles}
                />
              </div>

              {/* Action buttons */}
              <div className="govuk-button-group">
                <button type="submit" className="govuk-button" data-module="govuk-button">
                  Save and continue
                </button>
                {/* <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  data-module="govuk-button"
                  onClick={handleSaveForLater}
                >
                  Save for later
                </button> */}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicNoticesEvidence;
