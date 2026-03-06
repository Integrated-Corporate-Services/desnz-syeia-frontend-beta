import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { getConsultationPack } from '../../../services/consultationPackService';
import { saveConsultationRequest, getConsultationRequest } from '../../../services/consultationRequestService';
import FileUpload from '../../../components/FileUpload';
import { UploadedFile, ApplicationDocument } from '../../../types/fileUpload';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';
import { createLogger } from '../../../utils/logger';

const log = createLogger('ProvideEvidencePage');

interface FormErrors {
  consultationDate?: string;
  fileUpload?: string;
}

const ProvideEvidencePage: React.FC = () => {
  const navigate = useNavigate();
  const applicationId = useGetApplicationId();
  const { consultationId } = useParams();
  const [searchParams] = useSearchParams();
  const consultationName = searchParams.get('consultationName') || '';

  const [lpaName, setLpaName] = useState('');
  const [dateDay, setDateDay] = useState('');
  const [dateMonth, setDateMonth] = useState('');
  const [dateYear, setDateYear] = useState('');
  const [uploadedFileObjs, setUploadedFileObjs] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchConsultationDetails = async () => {
      try {
        if (!consultationId || !applicationId) return;
        
        const data = await getConsultationPack(consultationId, applicationId);
        const name = data?.consultation?.org_name || consultationName || '';
        setLpaName(name);
        
        // Fetch existing consultation request data if available
        try {
          const requestData = await getConsultationRequest(applicationId, consultationId);
          if (requestData) {
            // Parse date if available
            if (requestData.sentDate) {
              const date = new Date(requestData.sentDate);
              setDateDay(String(date.getDate()));
              setDateMonth(String(date.getMonth() + 1));
              setDateYear(String(date.getFullYear()));
            }
            setUploadedFileObjs(requestData.uploadedFiles || []);
            setApplicationDocuments(requestData.applicationDocuments || []);
          }
        } catch (requestError: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars
          // If no existing data, that's fine - user is creating new data
          log.debug('No existing request data found, starting fresh');
        }
        
        log.debug('=== PROVIDE EVIDENCE PAGE ===');
        log.debug('LPA Name:', name);
        log.debug('============================');
      } catch (error) {
        log.error('Error fetching consultation details:', error);
      }
    };

    if (applicationId && consultationId) {
      fetchConsultationDetails();
    }
  }, [applicationId, consultationId, consultationName]);

  const handleUploadedFiles = (
    uploadedFiles: UploadedFile[],
    applicationDocs: ApplicationDocument[]
  ) => {
    log.debug('Files uploaded:', uploadedFiles);
    setUploadedFileObjs((prev) => [...prev, ...uploadedFiles]);
    setApplicationDocuments((prev) => [...prev, ...applicationDocs]);
    
    // Clear file upload error if files are uploaded
    if (uploadedFiles.length > 0 && errors.fileUpload) {
      setErrors((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { fileUpload: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate date
    if (!dateDay || !dateMonth || !dateYear) {
      newErrors.consultationDate = 'Enter the date you sent the consultation request';
    } else {
      const day = parseInt(dateDay);
      const month = parseInt(dateMonth);
      const year = parseInt(dateYear);
      
      if (day < 1 || day > 31 || isNaN(day)) {
        newErrors.consultationDate = 'Enter a valid day';
      } else if (month < 1 || month > 12 || isNaN(month)) {
        newErrors.consultationDate = 'Enter a valid month';
      } else if (year < 1900 || year > 2100 || isNaN(year)) {
        newErrors.consultationDate = 'Enter a valid year';
      } else {
        // Check if valid date
        const date = new Date(year, month - 1, day);
        if (
          date.getFullYear() !== year ||
          date.getMonth() !== month - 1 ||
          date.getDate() !== day
        ) {
          newErrors.consultationDate = 'Enter a valid date';
        }
      }
    }

    // Validate file upload
    if (uploadedFileObjs.length === 0 && applicationDocuments.length === 0) {
      newErrors.fileUpload = 'You must upload at least one evidence document';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!validateForm()) {
      // Scroll to error summary
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    try {
      // Save evidence data to backend
      const consultationDate = `${dateYear}-${dateMonth.padStart(2, '0')}-${dateDay.padStart(2, '0')}`;
      
      await saveConsultationRequest({
        applicationId: applicationId!,
        consultationId: consultationId!,
        sentDate: consultationDate,
        uploadedFiles: uploadedFileObjs,
        applicationDocuments,
      });

      log.debug('Evidence saved successfully');

      // Navigate to consultation details page
      navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
    } catch (error) {
      log.error('Error saving evidence:', error);
      setErrors((prev) => ({
        ...prev,
        submit: 'Failed to save evidence. Please try again.',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveForLater = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      // Save partial data if available
      if (dateDay && dateMonth && dateYear) {
        const consultationDate = `${dateYear}-${dateMonth.padStart(2, '0')}-${dateDay.padStart(2, '0')}`;
        await saveConsultationRequest({
          applicationId: applicationId!,
          consultationId: consultationId!,
          sentDate: consultationDate,
          uploadedFiles: uploadedFileObjs,
          applicationDocuments,
        });
      }
      
      navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
    } catch (error) {
      log.error('Error saving for later:', error);
    } finally {
      setLoading(false);
    }
  };

//   const handleDeleteFile = async (fileId: string) => {
//     // Remove from state
//     setApplicationDocuments((prev) =>
//       prev.filter((doc) => doc.documentId !== fileId)
//     );
//     setUploadedFileObjs((prev) =>
//       prev.filter((file) => file.id !== fileId)
//     );
//   };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        {/* Breadcrumbs */}
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
          <ol className="govuk-breadcrumbs__list">
            <li className="govuk-breadcrumbs__list-item">
              <Link 
                className="govuk-breadcrumbs__link" 
                to={`${S37_BASE_URL}/${applicationId}/task-list`}
              >
                Task list
              </Link>
            </li>
            <li className="govuk-breadcrumbs__list-item">
              <Link 
                className="govuk-breadcrumbs__link" 
                to={`${S37_BASE_URL}/${applicationId}/consultation-details`}
              >
                Manage consultation
              </Link>
            </li>
            <li className="govuk-breadcrumbs__list-item" aria-current="page">
              Provide evidence of consultation request
            </li>
          </ol>
        </nav>

        {/* Error Summary */}
        {submitted && Object.keys(errors).length > 0 && (
          <div
            className="govuk-error-summary"
            role="alert"
            aria-labelledby="error-summary-title"
            tabIndex={-1}
          >
            <h2 className="govuk-error-summary__title" id="error-summary-title">
              There is a problem
            </h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                {Object.entries(errors).map(([key, message]) => (
                  <li key={key}>
                    <a href={`#${key}`}>{message}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-caption-xl">
              <strong>{lpaName}</strong>
            </h2>

            <h1 className="govuk-heading-l">
              Provide evidence of consultation request
            </h1>

            <p className="govuk-body">
              You need to record the date you sent the request and attach copies of 
              everything you sent to the consultee, such as email correspondence, an 
              application summary and any supporting documents and images.
            </p>

            <form onSubmit={handleSaveAndContinue}>
              {/* Date of consultation request */}
              <div
                className={`govuk-form-group ${
                  errors.consultationDate ? 'govuk-form-group--error' : ''
                }`}
                id="consultationDate"
              >
                <fieldset className="govuk-fieldset" role="group">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h2 className="govuk-fieldset__heading">
                      Date of consultation request
                    </h2>
                  </legend>
                  {errors.consultationDate && (
                    <p id="consultationDate-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span>{' '}
                      {errors.consultationDate}
                    </p>
                  )}
                  <div className="govuk-date-input">
                    <div className="govuk-date-input__item">
                      <div className="govuk-form-group">
                        <label
                          className="govuk-label govuk-date-input__label"
                          htmlFor="date-day"
                        >
                          Day
                        </label>
                        <input
                          className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
                            errors.consultationDate ? 'govuk-input--error' : ''
                          }`}
                          id="date-day"
                          name="date-day"
                          type="text"
                          inputMode="numeric"
                          value={dateDay}
                          onChange={(e) => {
                            setDateDay(e.target.value);
                            if (errors.consultationDate) {
                              setErrors((prev) => {
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                const { consultationDate: _, ...rest } = prev;
                                return rest;
                              });
                            }
                            setSubmitted(false);
                          }}
                        />
                      </div>
                    </div>
                    <div className="govuk-date-input__item">
                      <div className="govuk-form-group">
                        <label
                          className="govuk-label govuk-date-input__label"
                          htmlFor="date-month"
                        >
                          Month
                        </label>
                        <input
                          className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
                            errors.consultationDate ? 'govuk-input--error' : ''
                          }`}
                          id="date-month"
                          name="date-month"
                          type="text"
                          inputMode="numeric"
                          value={dateMonth}
                          onChange={(e) => {
                            setDateMonth(e.target.value);
                            if (errors.consultationDate) {
                              setErrors((prev) => {
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                const { consultationDate: _, ...rest } = prev;
                                return rest;
                              });
                            }
                            setSubmitted(false);
                          }}
                        />
                      </div>
                    </div>
                    <div className="govuk-date-input__item">
                      <div className="govuk-form-group">
                        <label
                          className="govuk-label govuk-date-input__label"
                          htmlFor="date-year"
                        >
                          Year
                        </label>
                        <input
                          className={`govuk-input govuk-date-input__input govuk-input--width-4 ${
                            errors.consultationDate ? 'govuk-input--error' : ''
                          }`}
                          id="date-year"
                          name="date-year"
                          type="text"
                          inputMode="numeric"
                          value={dateYear}
                          onChange={(e) => {
                            setDateYear(e.target.value);
                            if (errors.consultationDate) {
                              setErrors((prev) => {
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                const { consultationDate: _, ...rest } = prev;
                                return rest;
                              });
                            }
                            setSubmitted(false);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>

              {/* Documents uploaded section */}
              {applicationDocuments.length > 0 && (
                <div className="govuk-form-group">
                  <h2 className="govuk-heading-m">Documents uploaded</h2>
                  <ul className="govuk-list">
                    {applicationDocuments.map((doc) => (
                      <li key={doc.documentId} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="govuk-link">
                            {uploadedFileObjs.find(f => f.id === doc.fileId)?.filename || 'Document'}
                          </span>
                          {/* <button
                            type="button"
                            className="govuk-link"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#1d70b8',
                              textDecoration: 'underline',
                            }}
                            onClick={() => handleDeleteFile(doc.documentId)}
                          >
                            Delete
                          </button> */}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* File upload section */}
              <div
                className={`govuk-form-group ${
                  errors.fileUpload ? 'govuk-form-group--error' : ''
                }`}
                id="fileUpload"
              >
                <h2 className="govuk-heading-m">
                  Upload evidence of the consultation request
                </h2>
                {errors.fileUpload && (
                  <p id="fileUpload-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.fileUpload}
                  </p>
                )}
                <FileUpload
                  title=""
                  showTitle={false}
                  showDocumentsHeading={false}
                  applicationId={applicationId}
                  consultationId={consultationId}
                  category={FILE_CATEGORIES.CONSULTATION_REQUEST}
                  subCategory="consultation-evidence"
                  uploadedFiles={uploadedFileObjs}
                  onUploaded={handleUploadedFiles}
                //   onDeleteFile={handleDeleteFile}
                />
              </div>

              <div className="govuk-button-group">
                <button
                  type="submit"
                  className="govuk-button"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save and continue'}
                </button>
                <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  onClick={handleSaveForLater}
                  disabled={loading}
                >
                  Save for later
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProvideEvidencePage;
