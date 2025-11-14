import React, { use, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import FileUpload from '../../../components/FileUpload';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { saveConsultationResponse } from '../../../services/consultationResponseService';

import { S37_BASE_URL } from '../../../constants/s37';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';

const ConsultationRequestPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [responseId, setResponseId] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  // Add this state for hasObjection
  const [hasObjection, setHasObjection] = useState<boolean | null>(null);
  // Get params from route and query string
  const { applicationId, consultationId } = useParams();
  // Fetch and bind consultation response on load
  React.useEffect(() => {
    async function fetchData() {
      if (consultationId) {
        setLoading(true);
        try {
          const data = await import('../../../services/consultationResponseService').then(m => m.getConsultationResponse(consultationId));
          if (data) {
            setResponseId(data.response_id || '');
            // Use correct field name from backend response
            let radioValue = '';
            if ('consultation_request_sent' in data) {
              if (data.consultation_request_sent === true) radioValue = 'yes';
              else if (data.consultation_request_sent === false) radioValue = 'no';
              else radioValue = '';
            } else if ('status' in data) radioValue = String(data.status);
            // If date or files exist, force radio to 'yes'
            const hasDate = !!data.received_at;
            const hasFiles = Array.isArray(data.uploaded_files) && data.uploaded_files.length > 0;
            if (hasDate || hasFiles) radioValue = 'yes';
            setHasSentRequest(radioValue);
            if (hasDate) {
              const date = new Date(data.received_at);
              setResponseDate({
                day: String(date.getDate()),
                month: String(date.getMonth() + 1),
                year: String(date.getFullYear())
              });
            }
            setUploadedFileObjs(data.uploaded_files || []);
            setApplicationDocuments(data.application_documents || []);
          }
        } catch (err) {
          // handle error
        }
        setLoading(false);
      }
    }
    fetchData();
  }, [consultationId]);
  const [hasSentRequest, setHasSentRequest] = useState<string>('');

  // Clear date and files when no radio selected
  React.useEffect(() => {
    if (hasSentRequest === '' || hasSentRequest === 'no') {
      setResponseDate({ day: '', month: '', year: '' });
      setUploadedFiles([]);
      setUploadedFileObjs([]);
      setApplicationDocuments([]);
    }
  }, [hasSentRequest]);
  const [responseDate, setResponseDate] = useState({ day: '', month: '', year: '' });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedFileObjs, setUploadedFileObjs] = useState<any[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<any[]>([]);
  const { user } = useAuthUser();
  
  // Handler for FileUpload onUploaded
  const handleUploadedFiles = (uploadedFiles: any[], applicationDocuments: any[]) => {
  setUploadedFileObjs(prev => [...prev, ...uploadedFiles]);
  setApplicationDocuments(prev => [...prev, ...applicationDocuments]);
  };
  const navigate = useNavigate();

  // Get params from route and query string
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const consultationName = searchParams.get('consultationName') || '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const handleSendConsultationRequest = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const requestUrlWithParams = `${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/consultee-application-details${
      consultationName ? `?consultationName=${encodeURIComponent(consultationName)}` : ""
    }`;
    navigate(requestUrlWithParams);
  };

  // Save and Continue handler (with validation)
  const handleSaveAndContinue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (hasSentRequest === 'yes') {
      // Date validation
      if (!responseDate.day || !responseDate.month || !responseDate.year) {
        alert('Please enter the date of consultation request.');
        return;
      }
      // File validation
      if (!uploadedFileObjs || uploadedFileObjs.length === 0) {
        alert('Please upload at least one file as evidence.');
        return;
      }
    }
    let receivedAt = '';
    if (responseDate.year && responseDate.month && responseDate.day) {
      receivedAt = `${responseDate.year}-${responseDate.month.padStart(2, '0')}-${responseDate.day.padStart(2, '0')}`;
    }
    const payload = {
  consultation_id: consultationId,
  consultation_request_sent: hasSentRequest,
  uploaded_files: uploadedFileObjs,
  created_by: user?.user_id || '',
  last_updated_by: user?.user_id || '',
  response_id: responseId,
  received_at: receivedAt || '',
  response_email_address: '',
  has_objection: hasObjection !== null ? hasObjection : undefined,
  response_comments: '',
  has_all_documents_uploaded: true,
  application_documents: applicationDocuments,
  // Add this state for hasObjection
    };
    try {
      await saveConsultationResponse(payload);
      navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
    } catch (err) {
      // handle error
    }
  };

  // Save for later handler (no validation)
  const handleSaveForLater = async () => {
    let receivedAt = '';
    if (responseDate.year && responseDate.month && responseDate.day) {
      receivedAt = `${responseDate.year}-${responseDate.month.padStart(2, '0')}-${responseDate.day.padStart(2, '0')}`;
    }
    const payload = {
      isSave: true,
      consultation_id: consultationId,
      consultation_request_sent: hasSentRequest,
      uploaded_files: uploadedFileObjs,
      created_by: user?.user_id || '',
      last_updated_by: user?.user_id || '',
      response_id: responseId,
      received_at: receivedAt ||'',
      response_email_address: '',
  has_objection: hasObjection !== null ? hasObjection : undefined,
      response_comments: '',
      has_all_documents_uploaded: true,
      application_documents: applicationDocuments,
    };
    try {
      await saveConsultationResponse(payload);
      navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
    } catch (err) {
      // handle error
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
                                             <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/consultation-details`}>Consultations</Link>
                                         </li>
              <li className="govuk-breadcrumbs__list-item" aria-current="page">Upload response</li>
            </ol>
          </nav>
          <main className="govuk-main-wrapper govuk-!-margin-bottom-6" id="main-content">
            <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Natural England</h2>
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-6">Consultation request</h1>
            <form className="govuk-form-group govuk-!-margin-bottom-6" noValidate onSubmit={handleSaveAndContinue}>
              <div className="govuk-form-group govuk-!-margin-bottom-6">
                <fieldset className="govuk-fieldset">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">Have you already sent a consultation request to this organisation?</legend>
                  <div className="govuk-radios govuk-!-margin-top-2">
                    <div className="govuk-radios__item">
                      <input className="govuk-radios__input" id="hasSentRequestYes" name="hasSentRequest" type="radio" value="yes" checked={hasSentRequest === 'yes'} onChange={() => setHasSentRequest('yes')} />
                      <label className="govuk-label govuk-radios__label" htmlFor="hasSentRequestYes">Yes</label>
                        {hasSentRequest === 'yes' && (
                          <div className="govuk-radios__conditional govuk-!-margin-bottom-6" id="conditional-hasSentRequestYes">
                            <h2 className="govuk-heading-m govuk-!-margin-bottom-4">Date of consultation request</h2>
                            <div className="govuk-form-group govuk-!-margin-bottom-6">
                              <div className="govuk-date-input govuk-!-margin-top-2" id="responseDate">
                                <div className="govuk-date-input__item">
                                  <label className="govuk-label govuk-date-input__label" htmlFor="responseDateDay">Day</label>
                                  <input className="govuk-input govuk-date-input__input govuk-input--width-2" id="responseDateDay" name="responseDateDay" type="text" inputMode="numeric" autoComplete="off" value={responseDate.day} onChange={e => setResponseDate({ ...responseDate, day: e.target.value })} />
                                </div>
                                <div className="govuk-date-input__item">
                                  <label className="govuk-label govuk-date-input__label" htmlFor="responseDateMonth">Month</label>
                                  <input className="govuk-input govuk-date-input__input govuk-input--width-2" id="responseDateMonth" name="responseDateMonth" type="text" inputMode="numeric" autoComplete="off" value={responseDate.month} onChange={e => setResponseDate({ ...responseDate, month: e.target.value })} />
                                </div>
                                <div className="govuk-date-input__item">
                                  <label className="govuk-label govuk-date-input__label" htmlFor="responseDateYear">Year</label>
                                  <input className="govuk-input govuk-date-input__input govuk-input--width-4" id="responseDateYear" name="responseDateYear" type="text" inputMode="numeric" autoComplete="off" value={responseDate.year} onChange={e => setResponseDate({ ...responseDate, year: e.target.value })} />
                                </div>
                              </div>
                            </div>
                            <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Upload evidence of the consultation request</h2>
                            <div className="govuk-form-group govuk-!-margin-bottom-6">
                             <FileUpload
													title=""
																					prefix={`${applicationId}/${FILE_CATEGORIES.CONSULTATION_RESPONSE}/${consultationId}`}
																					applicationId={applicationId}
																					category={FILE_CATEGORIES.CONSULTATION_RESPONSE}
																					addedBy={user?.user_id || ''}
																					uploadedFiles={uploadedFileObjs}
																					onFilesChange={setUploadedFiles}
																					onRemoveFile={idx => {
																							setUploadedFiles(files => files.filter((_, i) => i !== idx));
																							setUploadedFileObjs(objs => objs.filter((_, i) => i !== idx));
																							setApplicationDocuments(docs => docs.filter((_, i) => i !== idx));
																						}}
																					onUploaded={handleUploadedFiles}
                                          consultationId={consultationId}
												/>
                            </div>
                          </div>
                        )}
                    </div>
                    <div className="govuk-radios__item">
                      <input className="govuk-radios__input" id="hasSentRequestNo" name="hasSentRequest" type="radio" value="no" checked={hasSentRequest === 'no'} onChange={() => setHasSentRequest('no')} />
                      <label className="govuk-label govuk-radios__label" htmlFor="hasSentRequestNo">No</label>
                    </div>
                    {hasSentRequest === 'no' && (
                      <div className="govuk-radios__conditional govuk-!-margin-bottom-6" id="conditional-hasSentRequestNo">
                        <div className="govuk-hint ">
                          You must send a consultation request.</div>
                          <a href="#" className="govuk-link govuk-!-font-weight-bold" onClick={handleSendConsultationRequest}>Send a consultation request</a>
                      </div>
                    )}
                  </div>
                </fieldset>
              </div>
              
             
              <div className="govuk-button-group govuk-!-margin-top-6">
                <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  data-module="govuk-button"
                  onClick={handleSaveForLater}
                >
                  Save for later
                </button>
                <button
                  type="submit"
                  className="govuk-button govuk-button--primary"
                  data-module="govuk-button"
                  disabled={hasSentRequest !== 'yes'}
                >
                  Save and Continue
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ConsultationRequestPage;
