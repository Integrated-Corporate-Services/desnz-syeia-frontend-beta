import React, { useState, useEffect } from 'react';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import FileUpload from '../../../components/FileUpload';
import { ConsultationResponse } from '../../../types/ConsultationResponse';
import { getConsultationResponse, saveConsultationResponse } from '../../../services/consultationResponseService';
import { S37_BASE_URL } from '../../../constants/s37';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';

const ConsultationResponsePage: React.FC = () => {
    const { consultationId, applicationId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthUser();
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<ConsultationResponse | null>(null);
    const [responseDate, setResponseDate] = useState({ day: '', month: '', year: '' });
    const [email, setEmail] = useState('');
    const [hasObjection, setHasObjection] = useState<string>('');
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [uploadedFileObjs, setUploadedFileObjs] = useState<any[]>([]);
    const [applicationDocuments, setApplicationDocuments] = useState<any[]>([]);
    const [comments, setComments] = useState('');
    const [allDocsUploaded, setAllDocsUploaded] = useState<string>('');
    const [dateError, setDateError] = useState('');
    const [responseId, setResponseId] = useState<string>('');
    const userId = user?.user_id;
    useEffect(() => {
        async function fetchData() {
            if (consultationId) {
                setLoading(true);
                try {
                    const data = await getConsultationResponse(consultationId);
                    setResponse(data);
                    // Bind to fields
                    if (data.received_at) {
                        const date = new Date(data.received_at);
                        setResponseDate({
                            day: String(date.getDate()),
                            month: String(date.getMonth() + 1),
                            year: String(date.getFullYear())
                        });
                    }
                    setEmail(data.response_email_address || '');
                    setHasObjection(data.has_objection ? 'yes' : (data.has_objection === false ? 'no' : ''));
                    setComments(data.response_comments || '');
                    setAllDocsUploaded(data.has_all_documents_uploaded ? 'yes' : (data.has_all_documents_uploaded === false ? 'no' : ''));
                    setUploadedFileObjs(data.uploaded_files || []);
                    setResponseId(data.response_id || '');
                } catch (err) {
                    // handle error
                }
                setLoading(false);
            }
        }
        fetchData();
    }, [consultationId]);

    // Handler for FileUpload onUploaded
    const handleUploadedFiles = (uploadedFiles: any[], applicationDocumentsArr: any[]) => {
        setUploadedFileObjs(prev => [...prev, ...uploadedFiles]);
        setApplicationDocuments(prev => [...prev, ...applicationDocumentsArr]);
    };

        // Save for later handler (no validation)
        const handleSaveForLater = async (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            const payload: Partial<ConsultationResponse> = {
                consultation_id: consultationId,
                response_id: responseId,
                received_at: responseDate.year && responseDate.month && responseDate.day ? `${responseDate.year}-${responseDate.month.padStart(2, '0')}-${responseDate.day.padStart(2, '0')}` : undefined,
                response_email_address: email,
                has_objection: hasObjection === 'yes' ? true : hasObjection === 'no' ? false : undefined,
                response_comments: comments,
                has_all_documents_uploaded: allDocsUploaded === 'yes' ? true : allDocsUploaded === 'no' ? false : undefined,
                uploaded_files: uploadedFileObjs,
                application_documents: applicationDocuments,
                created_by: userId,
                last_updated_by: userId,
                isSave: true
            };
            try {
                await saveConsultationResponse(payload);
                // Redirect to ConsultationDetailsPage after save
                const pathParts = location.pathname.split('/');
                console.log(applicationId);
                console.log(consultationId);
                navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
            } catch (err) {
                // handle error
            }
        };

        // Error state for required fields
        const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

        // Save and Continue handler (with validation)
        const handleSaveAndContinue = async (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            const errors: {[key: string]: string} = {};
            // Validate date
            if (!isValidDate(responseDate.day, responseDate.month, responseDate.year)) {
                errors.date = 'Enter a valid date';
            }
            // Validate email
            if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
                errors.email = 'Enter a valid email address';
            }
            // Validate objection radio
            if (hasObjection !== 'yes' && hasObjection !== 'no') {
                errors.hasObjection = 'Select yes if the organisation has objections';
            }
            // Validate allDocsUploaded radio
            if (allDocsUploaded !== 'yes' && allDocsUploaded !== 'no') {
                errors.allDocsUploaded = 'Select yes if you have uploaded all documents';
            }
            // Validate file upload (mandatory)
            if (!uploadedFileObjs || uploadedFileObjs.length === 0) {
                errors.uploadedFiles = 'You must upload at least one document.';
            }
            setFieldErrors(errors);
            if (Object.keys(errors).length > 0) return;
            const payload: Partial<ConsultationResponse> = {
                consultation_id: consultationId,
                response_id: responseId,
                received_at: `${responseDate.year}-${responseDate.month.padStart(2, '0')}-${responseDate.day.padStart(2, '0')}`,
                response_email_address: email,
                has_objection: hasObjection === 'yes' ? true : hasObjection === 'no' ? false : undefined,
                response_comments: comments,
                has_all_documents_uploaded: allDocsUploaded === 'yes' ? true : allDocsUploaded === 'no' ? false : undefined,
                uploaded_files: uploadedFileObjs,
                application_documents: applicationDocuments,
                isSave: false,
                created_by: userId,
                last_updated_by: userId,
            };
            try {
                await saveConsultationResponse(payload);
           
                navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
            } catch (err) {
                // handle error
            }
        };
    
    // Validate date fields
    function isValidDate(day: string, month: string, year: string) {
        if (!day || !month || !year) return false;
        if (!/^\d+$/.test(day) || !/^\d+$/.test(month) || !/^\d+$/.test(year)) return false;
        const d = parseInt(day, 10), m = parseInt(month, 10), y = parseInt(year, 10);
        if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2100) return false;
        // Check for valid date
        const dateObj = new Date(y, m - 1, d);
        return dateObj.getFullYear() === y && dateObj.getMonth() === m - 1 && dateObj.getDate() === d;
    }

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
                        <h1 className="govuk-heading-xl govuk-!-margin-bottom-6">Provide your consultation response</h1>
                        <form className="govuk-form-group govuk-!-margin-bottom-6" noValidate>

                                <div className={`govuk-form-group govuk-!-margin-bottom-6${fieldErrors.date ? ' govuk-form-group--error' : ''}`}> 
									{fieldErrors.date && <span className="govuk-error-message">{fieldErrors.date}</span>}
									<fieldset className="govuk-fieldset" role="group" aria-describedby="responseDate-hint">
										<legend className="govuk-fieldset__legend govuk-fieldset__legend--m">Date of consultation response received</legend>
										<div className="govuk-date-input govuk-!-margin-top-2" id="responseDate">
											<div className="govuk-date-input__item">
												<label className="govuk-label govuk-date-input__label" htmlFor="responseDateDay">Day</label>
												<input className={`govuk-input govuk-date-input__input govuk-input--width-2${fieldErrors.date ? ' govuk-input--error' : ''}`} id="responseDateDay" name="responseDateDay" type="text" inputMode="numeric" autoComplete="off" value={responseDate.day} onChange={e => setResponseDate({ ...responseDate, day: e.target.value })} />
											</div>
											<div className="govuk-date-input__item">
												<label className="govuk-label govuk-date-input__label" htmlFor="responseDateMonth">Month</label>
												<input className={`govuk-input govuk-date-input__input govuk-input--width-2${fieldErrors.date ? ' govuk-input--error' : ''}`} id="responseDateMonth" name="responseDateMonth" type="text" inputMode="numeric" autoComplete="off" value={responseDate.month} onChange={e => setResponseDate({ ...responseDate, month: e.target.value })} />
											</div>
											<div className="govuk-date-input__item">
												<label className="govuk-label govuk-date-input__label" htmlFor="responseDateYear">Year</label>
												<input className={`govuk-input govuk-date-input__input govuk-input--width-4${fieldErrors.date ? ' govuk-input--error' : ''}`} id="responseDateYear" name="responseDateYear" type="text" inputMode="numeric" autoComplete="off" value={responseDate.year} onChange={e => setResponseDate({ ...responseDate, year: e.target.value })} />
											</div>
										</div>
									</fieldset>
								</div>
											<div className={`govuk-form-group govuk-!-margin-bottom-6${fieldErrors.email ? ' govuk-form-group--error' : ''}`} style={fieldErrors.email ? { borderLeft: '4px solid #d4351c', paddingLeft: '12px' } : {}}>
												<fieldset className="govuk-fieldset">
													<label className="govuk-label govuk-label--m" htmlFor="email">Consultee’s email address</label>
													{fieldErrors.email && <span className="govuk-error-message">{fieldErrors.email}</span>}
													<div className="govuk-hint">For example: johnsmith@example.com</div>
													<input className={`govuk-input${fieldErrors.email ? ' govuk-input--error' : ''}`} id="email" name="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
												</fieldset>
											</div>
					  <div className="govuk-form-group govuk-!-margin-bottom-6">

						<fieldset className="govuk-fieldset">
							<legend className="govuk-fieldset__legend govuk-fieldset__legend--m">Does the organisation have any objections to the application?</legend>
																						{fieldErrors.hasObjection && <span className="govuk-error-message">{fieldErrors.hasObjection}</span>}

														<div className="govuk-radios">
															<div className={`govuk-form-group${fieldErrors.hasObjection ? ' govuk-form-group--error' : ''}`} style={fieldErrors.hasObjection ? { borderLeft: '4px solid #d4351c', paddingLeft: '12px' } : {}}>
																<div className="govuk-radios__item">
																	<input className="govuk-radios__input" id="hasObjectionYes" name="hasObjection" type="radio" value="yes" checked={hasObjection === 'yes'} onChange={() => setHasObjection('yes')} />
																	<label className="govuk-label govuk-radios__label" htmlFor="hasObjectionYes">Yes</label>
																</div>
																<div className="govuk-radios__item">
																	<input className="govuk-radios__input" id="hasObjectionNo" name="hasObjection" type="radio" value="no" checked={hasObjection === 'no'} onChange={() => setHasObjection('no')} />
																	<label className="govuk-label govuk-radios__label" htmlFor="hasObjectionNo">No</label>
																</div>
															</div>
														</div>
						</fieldset>
					</div>
											<div className={`govuk-form-group govuk-!-margin-bottom-6${fieldErrors.uploadedFiles ? ' govuk-form-group--error' : ''}`}> 
																								{fieldErrors.uploadedFiles && <span className="govuk-error-message">{fieldErrors.uploadedFiles}</span>}

												<FileUpload
													title="Upload a document that confirms the response from a consultee"
																					prefix={`${applicationId}/${FILE_CATEGORIES.CONSULTATION_RESPONSE}/${consultationId}`}
																					applicationId={applicationId}
																					category={FILE_CATEGORIES.CONSULTATION_RESPONSE}
																					addedBy={userId}
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
					  <div className="govuk-form-group govuk-!-margin-bottom-6">
						<label className="govuk-label govuk-label--m" htmlFor="comments">Add any additional comments <span className="govuk-hint">(optional)</span></label>
						<textarea className="govuk-textarea" id="comments" name="comments" rows={4} maxLength={4000} value={comments} onChange={e => setComments(e.target.value)} />
						<span className="govuk-hint">You have 4,000 characters remaining</span>
					</div>
					  <div className="govuk-form-group govuk-!-margin-bottom-6">
						<fieldset className="govuk-fieldset">
							<legend className="govuk-fieldset__legend govuk-fieldset__legend--m">Have you uploaded all documents related to this consultation?</legend>
							<span className="govuk-hint">You can continue to add documents to this consultation up to the point it is submitted. You cannot submit your application until consultations are complete.</span>
							  <div className={`govuk-form-group${fieldErrors.allDocsUploaded ? ' govuk-form-group--error' : ''} govuk-radios govuk-!-margin-top-2`} style={fieldErrors.allDocsUploaded ? { borderLeft: '4px solid #d4351c', paddingLeft: '12px' } : {}}>
								<div className="govuk-radios__item">
									<input className="govuk-radios__input" id="allDocsUploadedYes" name="allDocsUploaded" type="radio" value="yes" checked={allDocsUploaded === 'yes'} onChange={() => setAllDocsUploaded('yes')} />
									<label className="govuk-label govuk-radios__label" htmlFor="allDocsUploadedYes">Yes, I have uploaded all relevant documents</label>
								</div>
								<div className="govuk-radios__item">
									<input className="govuk-radios__input" id="allDocsUploadedNo" name="allDocsUploaded" type="radio" value="no" checked={allDocsUploaded === 'no'} onChange={() => setAllDocsUploaded('no')} />
									<label className="govuk-label govuk-radios__label" htmlFor="allDocsUploadedNo">No, I want to upload one later</label>
								</div>
								{fieldErrors.allDocsUploaded && <span className="govuk-error-message">{fieldErrors.allDocsUploaded}</span>}
							</div>
						</fieldset>
					</div>
											<div className="govuk-button-group govuk-!-margin-top-6">
												<button type="button" className="govuk-button govuk-button--secondary" data-module="govuk-button" onClick={handleSaveForLater}>Save for later</button>
												<button type="button" className="govuk-button govuk-button--primary" data-module="govuk-button" disabled={allDocsUploaded !== 'yes'} onClick={handleSaveAndContinue}>Save and Continue</button>
										</div>
				</form>
			</main>
       </div>
      </div>
		</div>
	);
};

export default ConsultationResponsePage;
