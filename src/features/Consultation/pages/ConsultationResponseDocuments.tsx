import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { getConsultationResponse, saveConsultationResponse } from '../../../services/consultationResponseService';
import { ConsultationResponse } from '../../../types/ConsultationResponse';
import { UploadedFile, ApplicationDocument } from '../../../types/fileUpload';
import FileUpload from '../../../components/FileUpload';
import { validateDateComponents } from '../../../utils/validation';
import { fetchConsultationDetails } from '../../../services/consultationService';
import { CONSULTATION_VALIDATION_MESSAGES } from '../../../constants/consultationValidationMessages';

const ConsultationResponse2: React.FC = () => {
    const { consultationId, applicationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthUser();
    const userId = user?.user_id;

    const [responseDate, setResponseDate] = useState({ day: '', month: '', year: '' });
    const [uploadedFileObjs, setUploadedFileObjs] = useState<UploadedFile[]>([]);
    const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);
    const [responseId, setResponseId] = useState<string>('');
    const [consultationName, setConsultationName] = useState<string>('');
    const [consultationType, setConsultationType] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const fileUploadRef = useRef<HTMLDivElement>(null);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Load existing data
    useEffect(() => {
        async function fetchData() {
            if (consultationId) {
                try {
                    setIsLoading(true);
                    const data = await getConsultationResponse(consultationId, applicationId);
                    if (data.received_at) {
                        const date = new Date(data.received_at);
                        setResponseDate({
                            day: String(date.getDate()),
                            month: String(date.getMonth() + 1),
                            year: String(date.getFullYear()),
                        });
                    }
                    setUploadedFileObjs(data.uploaded_files || []);
                    setApplicationDocuments(data.application_documents || []);
                    setResponseId(data.response_id || '');
                    // Fetch all consultations to get the organization name
                    const consultations = await fetchConsultationDetails(applicationId!, user?.user_id!);

                    // Check if consultations is an array or single object
                    const consultationsList = Array.isArray(consultations) ? consultations : [consultations];
                    const currentConsultation = consultationsList.find((c: any) => c.id === consultationId);

                    if (currentConsultation) {
                        const orgName = currentConsultation.consulteeOrganisationName || currentConsultation.otherConsultee || 'Consultation';
                        setConsultationName(orgName);
                        setConsultationType(currentConsultation.consultationType || '');
                    }
                } catch (err) {
                    console.error('Error fetching consultation response:', err);
                } finally {
                    setIsLoading(false);
                }
            }
        }
        fetchData();
    }, [consultationId, applicationId, user?.user_id]);

    const handleUploadedFiles = (files: UploadedFile[], docs: ApplicationDocument[]) => {
        setUploadedFileObjs(prev => [...prev, ...files]);
        setApplicationDocuments(prev => [...prev, ...docs]);
        // Clear validation errors when files are uploaded - remove the key from errors object
        setErrors(prev => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { uploadedFiles: _uploadedFiles, ...rest } = prev;
            return rest;
        });
        setFileValidationErrors([]);
    };

    // Handle file validation errors from FileUpload component
    const handleFileValidationErrors = (errors: string[]) => {
        setFileValidationErrors(errors);
        // Clear form-level errors when file validation errors are cleared
        if (errors.length === 0) {
            setErrors(prev => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { uploadedFiles: _uploadedFiles, ...rest } = prev;
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

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        // For PUBLIC consultations, skip date validation
        if (consultationType !== 'PUBLIC') {
            // Date validation using shared utility
            const dateValidation = validateDateComponents(responseDate, 'consultation response was received', { required: true });
            if (!dateValidation.isValid) {
                newErrors.responseDate = dateValidation.error!;
            }
        }

        if (!uploadedFileObjs || uploadedFileObjs.length === 0) {
            const errorMessage = consultationType === 'PUBLIC' 
                ? CONSULTATION_VALIDATION_MESSAGES.responseDocumentsUpload.emptyPublic
                : CONSULTATION_VALIDATION_MESSAGES.responseDocumentsUpload.emptyNonPublic;
            newErrors.uploadedFiles = errorMessage;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0 && fileValidationErrors.length === 0;
    };

    const validateFormatOnly = () => {
        const newErrors: { [key: string]: string } = {};

        // For PUBLIC consultations, skip date validation
        if (consultationType !== 'PUBLIC') {
            // Date format validation using shared utility (not required)
            const dateValidation = validateDateComponents(responseDate, 'consultation response was received', { required: false });
            if (!dateValidation.isValid) {
                newErrors.responseDate = dateValidation.error!;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0 && fileValidationErrors.length === 0;
    };

    const handleSaveAndContinue = async () => {
        if (!validateForm()) {
            const errorSummary = document.getElementById('error-summary');
            if (errorSummary) {
                errorSummary.focus();
                errorSummary.scrollIntoView({  block: 'start' });
            }
            return;
        }

        // For PUBLIC consultations, don't set received_at date
        let receivedAt;
        if (consultationType !== 'PUBLIC' && responseDate.year && responseDate.month && responseDate.day) {
            receivedAt = `${responseDate.year}-${responseDate.month.padStart(2, '0')}-${responseDate.day.padStart(2, '0')}`;
        }
        
        try {
            // Fetch existing data to preserve all fields
            const existingData = await getConsultationResponse(consultationId!, applicationId);
            
            const payload: Partial<ConsultationResponse> = {
                ...existingData,
                received_at: receivedAt,
                uploaded_files: uploadedFileObjs,
                application_documents: applicationDocuments,
                last_updated_by: userId,
                isSave: true
            };
            
            // Only include IDs if they have valid values
            if (consultationId) {
                payload.consultation_id = consultationId;
            }
            if (responseId) {
                payload.response_id = responseId;
            }

            await saveConsultationResponse(payload, applicationId);
            navigate(`${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/response3`);
        } catch (err) {
            console.error('Error saving consultation response:', err);
        }
    };

    const handleSaveForLater = async () => {
        if (!validateFormatOnly()) {
            const errorSummary = document.getElementById('error-summary');
            if (errorSummary) {
                errorSummary.focus();
                errorSummary.scrollIntoView({  block: 'start' });
            }
            return;
        }

        let receivedAt;
        if (responseDate.year && responseDate.month && responseDate.day) {
            receivedAt = `${responseDate.year}-${responseDate.month.padStart(2, '0')}-${responseDate.day.padStart(2, '0')}`;
        }

        try {
            // Fetch existing data to preserve all fields
            const existingData = await getConsultationResponse(consultationId!, applicationId);
            
            const payload: Partial<ConsultationResponse> = {
                ...existingData,
                received_at: receivedAt,
                uploaded_files: uploadedFileObjs.length > 0 ? uploadedFileObjs : existingData.uploaded_files,
                application_documents: applicationDocuments.length > 0 ? applicationDocuments : existingData.application_documents,
                created_by: userId,
                last_updated_by: userId,
                isSave: true
            };
            
            // Only include IDs if they have valid values
            if (consultationId) {
                payload.consultation_id = consultationId;
            }
            if (responseId) {
                payload.response_id = responseId;
            }

            await saveConsultationResponse(payload, applicationId);
            navigate(`${S37_BASE_URL}/${applicationId}/task-list`);
        } catch (err) {
            console.error('Error saving consultation response:', err);
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
                            <li className="govuk-breadcrumbs__list-item" aria-current="page">Provide consultation response</li>
                        </ol>
                    </nav>

                    <main id="main-content">
                        {isLoading ? (
                            <p className="govuk-body">Loading...</p>
                        ) : (
                            <>
                        {(Object.keys(errors).some(key => errors[key]) || fileValidationErrors.length > 0) && (
                            <div className="govuk-error-summary" data-module="govuk-error-summary" id="error-summary" tabIndex={-1}>
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
                                            {errors.responseDate && (
                                                <li><a href="#responseDateDay">{errors.responseDate}</a></li>
                                            )}
                                            {errors.uploadedFiles && (
                                                <li>
                                                    <a href="#" onClick={(e) => {
                                                        e.preventDefault();
                                                        handleErrorClick('fileUpload');
                                                    }}>
                                                        {errors.uploadedFiles}
                                                    </a>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {consultationType === 'PUBLIC' && <h2 className="govuk-caption-xl">Public notices</h2>}
                        {consultationType !== 'PUBLIC' && <h2 className="govuk-caption-xl">{consultationName}</h2>}
                        <h1 className="govuk-heading-l">{consultationType === 'PUBLIC' ? 'Upload public responses' : 'Provide consultation response'}</h1>

                        <form noValidate>
                            {consultationType !== 'PUBLIC' && (
                            <div className={`govuk-form-group ${errors.responseDate ? 'govuk-form-group--error' : ''}`}>
                                <fieldset className="govuk-fieldset" role="group" aria-describedby={errors.responseDate ? 'responseDate-error' : undefined}>
                                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                                        <h2 className="govuk-fieldset__heading">Date the consultation response was received</h2>
                                    </legend>
                                    {errors.responseDate && (
                                        <p id="responseDate-error" className="govuk-error-message">
                                            <span className="govuk-visually-hidden">Error:</span> {errors.responseDate}
                                        </p>
                                    )}
                                    <div className="govuk-date-input" id="responseDate">
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
                                                            const { responseDate, ...restErrors } = errors;
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
                                                            const { responseDate, ...restErrors } = errors;
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
                                                            const { responseDate, ...restErrors } = errors;
                                                            setErrors(restErrors);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                            )}

                            <div className={`govuk-form-group ${errors.uploadedFiles || fileValidationErrors.length > 0 ? 'govuk-form-group--error' : ''}`}
                                ref={fileUploadRef}
                                style={(errors.uploadedFiles || fileValidationErrors.length > 0) ? {
                                    borderLeft: '4px solid #d4351c',
                                    paddingLeft: 12
                                } : {}}>
                                <h2 className="govuk-heading-m">Documents uploaded</h2>
                                {errors.uploadedFiles && (
                                    <p id="uploadedFiles-error" className="govuk-error-message">
                                        <span className="govuk-visually-hidden">Error:</span> {errors.uploadedFiles}
                                    </p>
                                )}
                                <div id="file-upload">
                                    <p className="govuk-body">{consultationType === 'PUBLIC' ? 'Upload documents that show public responses' : "Upload documents that show the consultee's response"}</p>
                                    {/* <p className="govuk-hint">
                                        You can upload .pdf, .jpg, .jpeg, .png, .msg, .doc, .docx, .xls, and .xlsx files of up to 25MB each. Files cannot be password protected.
                                    </p> */}
                                    <FileUpload
                                        title=""
                                        prefix={`${applicationId}/${FILE_CATEGORIES.CONSULTATION_RESPONSE}/${consultationId}`}
                                        applicationId={applicationId}
                                        category={FILE_CATEGORIES.CONSULTATION_RESPONSE}
                                        addedBy={userId}
                                        uploadedFiles={uploadedFileObjs}
                                        onFilesChange={() => {}}
                                        onRemoveFile={idx => {
                                            setUploadedFileObjs(objs => objs.filter((_, i) => i !== idx));
                                            setApplicationDocuments(docs => docs.filter((_, i) => i !== idx));
                                        }}
                                        onUploaded={(files, docs) => {
                                            handleUploadedFiles(files, docs);
                                        }}
                                        onValidationErrors={handleFileValidationErrors}
                                        consultationId={consultationId}
                                    />
                                </div>
                            </div>

                           <div className="govuk-button-group">
                                <button
                                    type="button"
                                    className="govuk-button"
                                    data-module="govuk-button"
                                    onClick={handleSaveAndContinue}
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
                                </button>*/}
                            </div> 
                        </form>
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ConsultationResponse2;
