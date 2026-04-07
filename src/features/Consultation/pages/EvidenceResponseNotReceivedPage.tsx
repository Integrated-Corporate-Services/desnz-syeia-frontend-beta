import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import FileUpload from '../../../components/FileUpload';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';
import { fetchConsultationDetails } from '../../../services/consultationService';
import { getConsultationResponse } from '../../../services/consultationResponseService';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { ConsultationResponse } from '../../../types/ConsultationResponse';
import { saveConsultationResponse } from '../../../services/consultationResponseService';
import { UploadedFile, ApplicationDocument } from '../../../types/fileUpload';
import { createLogger } from '../../../utils/logger';

const logger = createLogger('EvidenceResponseNotReceivedPage');

interface EvidenceData {
    declarationAccepted: boolean;
}

const EvidenceResponseNotReceivedPage: React.FC = () => {
    const navigate = useNavigate();
    const applicationId = useGetApplicationId();
    const { consultationId } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const consultationNameParam = searchParams.get('consultationName') || 'Consultee';
    const { user } = useAuthUser();

    const [uploadedFileObjs, setUploadedFileObjs] = useState<UploadedFile[]>([]);
    const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);

    const [formData, setFormData] = useState<EvidenceData>({
        declarationAccepted: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);
    const [submitError, setSubmitError] = useState<string>('');
    const [submitted, setSubmitted] = useState(false);    
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState<string>('');
    const [responseId, setResponseId] = useState<string>('');
    const [consultationName, setConsultationName] = useState<string>(consultationNameParam);
    const fileUploadRef = useRef<{ focus: () => void } | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        // Fetch existing evidence if available
        const fetchEvidenceData = async () => {
            try {
                if (consultationId) {
                    const data = await getConsultationResponse(consultationId, applicationId);
                    setComments(data.response_comments || '');
                    setResponseId(data.response_id || '');
                    setUploadedFileObjs(data.uploaded_files || []);
                    setApplicationDocuments(data.application_documents || []);
                    
                    // Fetch all consultations to get the organization name
                    const consultations = await fetchConsultationDetails(applicationId!, user?.user_id!);

                    // Check if consultations is an array or single object
                    const consultationsList = Array.isArray(consultations) ? consultations : [consultations];
                    const currentConsultation = consultationsList.find((c: any) => c.id === consultationId);

                    if (currentConsultation) {
                        const orgName = currentConsultation.consulteeOrganisationName || currentConsultation.otherConsultee || 'Consultation';
                        setConsultationName(orgName);
                    }
                }
            } catch (error) {
                logger.error('Error fetching evidence data:', error);
            }
        };

        if (applicationId && consultationId) {
            fetchEvidenceData();
        }
    }, [applicationId, consultationId, user?.user_id]);

    // Debug effect to track uploadedFileObjs changes
    useEffect(() => {
        // Track uploaded file objects for state management
    }, [uploadedFileObjs]);

    useEffect(() => {
        setErrors({});
        setSubmitted(false);
    }, []);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (uploadedFileObjs.length === 0) {
            newErrors.files = 'You must upload at least one document showing follow-up emails';
        }

        if (!formData.declarationAccepted) {
            newErrors.declaration = 'You must confirm you have provided all relevant information';
        }

        setErrors(newErrors);
        setSubmitError('');
        return Object.keys(newErrors).length === 0 && fileValidationErrors.length === 0;
    };

    // Handle file validation errors from FileUpload component
    const handleFileValidationErrors = (errors: string[]) => {
        // Handle validation errors
        setFileValidationErrors(errors);
        // Clear form-level errors when file validation errors are cleared
        if (errors.length === 0) {
            setErrors(prev => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { files: _files, ...rest } = prev;
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

    const handleDeclarationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            declarationAccepted: e.target.checked,
        }));

        // Clear declaration error
        if (errors.declaration) {
            setErrors((prev) => ({
                ...prev,
                declaration: '',
            }));
        }
        setSubmitted(false);
    };


    const handleCloseConsultation = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        if (!validateForm()) {
            const errorSummary = document.getElementById('error-summary');
            if (errorSummary) {
                errorSummary.focus();
                errorSummary.scrollIntoView({ block: 'start' });
            }
            return;
        }

        setLoading(true);
        try {
            // Fetch existing data to preserve all fields
            const existingData = await getConsultationResponse(consultationId!, applicationId);

            const payload: Partial<ConsultationResponse> = {
                ...existingData,
                consultation_id: consultationId,
                response_id: responseId || undefined,
                response_comments: comments,
                last_updated_by: user?.user_id,
                has_all_documents_uploaded: formData.declarationAccepted,
                // Store evidence of response not received files
                uploaded_files: uploadedFileObjs,
                application_documents: applicationDocuments.length > 0 ? applicationDocuments : existingData.application_documents,
                // CRITICAL: Explicitly set these to undefined to clear any previous response data
                response_full_name: undefined,
                response_email_address: undefined,
                has_objection: undefined,
                // Clear received_at date as well
                received_at: undefined,
                isSave: false,
            };

            // Save the consultation response
            await saveConsultationResponse(payload, applicationId);

            // Success handling
            setErrors({});
            setSubmitted(false);
            navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
        } catch (err) {
            logger.error('Error closing consultation:', err);
        } finally {
            setLoading(false);
        }
    };

    // const handleSaveForLater = async (e: React.FormEvent) => {
    //     e.preventDefault();

    //     setLoading(true);
    //     try {
    //         // TODO: Implement API call to save evidence for later
    //         // Navigate back to consultation details
    //         navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
    //     } catch (error) {
    //         console.error('Error saving evidence:', error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    return (
        <div className="govuk-width-container">
            <main className="govuk-main-wrapper" id="main-content" role="main">
                {/* Breadcrumbs */}
                <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
                    <ol className="govuk-breadcrumbs__list">
                        <li className="govuk-breadcrumbs__list-item">
                            <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/task-list`}>
                                Task list
                            </Link>
                        </li>
                        <li className="govuk-breadcrumbs__list-item">
                            <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/consultation-details`}>
                                Manage consultation
                            </Link>
                        </li>
                        <li className="govuk-breadcrumbs__list-item" aria-current="page">
                            Provide evidence of response not received
                        </li>
                    </ol>
                </nav>

                {/* Error Summary */}
                {submitted && (Object.keys(errors).length > 0 || fileValidationErrors.length > 0) && (
                    <div className="govuk-error-summary" role="alert" aria-labelledby="error-summary-title" tabIndex={-1} id="error-summary">
                        <h2 className="govuk-error-summary__title" id="error-summary-title">
                            There is a problem
                        </h2>
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
                                {/* Business logic errors shown inline, file validation errors only in summary */}
                                {Object.entries(errors).map(([key, message]) => (
                                    <li key={key}>
                                        {key === 'files' ? (
                                            <a href="#" onClick={(e) => {
                                                e.preventDefault();
                                                handleErrorClick('fileUpload');
                                            }}>
                                                {message}
                                            </a>
                                        ) : (
                                            <a href={`#${key}`}>{message}</a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        <h2 className="govuk-caption-xl">{consultationName}</h2>
                        <h1 className="govuk-heading-l">Provide evidence of response not received</h1>

                        <p className="govuk-body">If the consultee has not responded within 2 months after you sent the request, you may be able to complete your application without uploading their response.</p>
                        <p className="govuk-body">You must provide copies of any follow-up or emails you sent to the consultee. You will be able to complete your application after you have uploaded this evidence.</p>

                        <form onSubmit={handleCloseConsultation}>
                            {/* File Upload */}
                            <div className={`govuk-form-group ${errors.files || fileValidationErrors.length > 0 ? 'govuk-form-group--error' : ''}`} id="file-upload">
                                <label htmlFor="fileUpload" className="govuk-label govuk-label--m">
                                    Upload a document that shows follow-up emails
                                </label>
                                {errors.files && (
                                    <p id="fileUpload-error" className="govuk-error-message">
                                        <span className="govuk-visually-hidden">Error:</span> {errors.files}
                                    </p>
                                )}

                                <FileUpload
                                    title=""
                                    prefix={`${applicationId}/${FILE_CATEGORIES.CONSULTATION_RESPONSE_NOT_RECEIVED}/${consultationId}`}
                                    applicationId={applicationId}
                                    category={FILE_CATEGORIES.CONSULTATION_RESPONSE_NOT_RECEIVED}  // CHANGED THIS LINE
                                    addedBy={user?.user_id || ''}
                                    uploadedFiles={uploadedFileObjs}
                                    onValidationErrors={handleFileValidationErrors}
                                    onUploaded={(files, docs) => {
                                        // Handle file upload completion
                                        
                                        setUploadedFileObjs((prev) => {
                                            const updated = [...prev, ...files];
                                            return updated;
                                        });
                                        
                                        setApplicationDocuments((prev) => {
                                            const updated = [...prev, ...docs];
                                            return updated;
                                        });
                                        
                                        // Clear file error - remove the key from errors object
                                        if (errors.files) {
                                            setErrors((prev) => {
                                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                const { files: _files, ...rest } = prev;
                                                return rest;
                                            });
                                        }
                                        setSubmitted(false);
                                        
                                        // File upload completion
                                    }}
                                    onRemoveFile={(idx) => {
                                        setUploadedFileObjs((objs) => {
                                            const newObjs = objs.filter((_, i) => i !== idx);
                                            // Clear file error and reset submitted if no files left
                                            if (newObjs.length === 0 && errors.files) {
                                                setErrors((prev) => {
                                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                    const { files: _files, ...rest } = prev;
                                                    return rest;
                                                });
                                            }
                                            setSubmitted(false);
                                            return newObjs;
                                        });
                                        setApplicationDocuments((docs) => docs.filter((_, i) => i !== idx));
                                    }}
                                    consultationId={consultationId}
                                />
                            </div>

                            {/* Declaration */}
                            <div className={`govuk-form-group ${errors.declaration ? 'govuk-form-group--error' : ''}`}>
                                <fieldset className="govuk-fieldset">
                                    {errors.declaration && (
                                        <p id="declaration-error" className="govuk-error-message">
                                            <span className="govuk-visually-hidden">Error:</span> {errors.declaration}
                                        </p>
                                    )}
                                    <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                                        <div className="govuk-checkboxes__item">
                                            <input
                                                className="govuk-checkboxes__input"
                                                id="declaration"
                                                name="declaration"
                                                type="checkbox"
                                                checked={formData.declarationAccepted}
                                                onChange={handleDeclarationChange}
                                                aria-describedby={errors.declaration ? 'declaration-error' : undefined}
                                            />
                                            <label className="govuk-label govuk-checkboxes__label" htmlFor="declaration">
                                                Confirm you have provided all relevant information, uploaded all supporting documents and want to close this consultation. You cannot undo this action.
                                            </label>
                                        </div>
                                    </div>
                                </fieldset>
                            </div>

                            {/* Buttons */}
                            <div className="govuk-button-group">
                                {/* <button type="button" className="govuk-button" data-module="govuk-button" onClick={handleCloseConsultation}>
                                    Close consultation
                                </button> */}

                                <button type="submit" className="govuk-button" data-module="govuk-button" disabled={loading}>
                                    {loading ? 'Closing...' : 'Close consultation'}
                                </button>
                                {/* <button type="button" className="govuk-button govuk-button--secondary" onClick={handleSaveForLater} disabled={loading}>
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

export default EvidenceResponseNotReceivedPage;