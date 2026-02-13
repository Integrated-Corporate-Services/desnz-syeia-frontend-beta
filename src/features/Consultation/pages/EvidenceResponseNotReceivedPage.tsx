import React, { useState, useEffect } from 'react';
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
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState<string>('');
    const [responseId, setResponseId] = useState<string>('');
    const [consultationName, setConsultationName] = useState<string>(consultationNameParam);

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
                console.error('Error fetching evidence data:', error);
            }
        };

        if (applicationId && consultationId) {
            fetchEvidenceData();
        }
    }, [applicationId, consultationId, user?.user_id]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (uploadedFileObjs.length === 0) {
            newErrors.files = 'You must upload at least one document showing follow-up emails';
        }

        if (!formData.declarationAccepted) {
            newErrors.declaration = 'You must confirm you have provided all relevant information';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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
    };

    const handleCloseConsultation = async () => {
        if (!validateForm()) {
            const errorSummary = document.getElementById('error-summary');
            if (errorSummary) {
                errorSummary.focus();
                errorSummary.scrollIntoView({ block: 'start' });
            }
            return;
        }

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
                uploaded_files: uploadedFileObjs.length > 0 ? uploadedFileObjs : existingData.uploaded_files,
                application_documents: applicationDocuments.length > 0 ? applicationDocuments : existingData.application_documents,
                isSave: false,
            };

            console.log('Payload being sent:', JSON.stringify(payload, null, 2));

            await saveConsultationResponse(payload, applicationId);
            navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
        } catch (err) {
            console.error('Error closing consultation:', err);
        }
    };

    const handleSaveForLater = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        try {
            // TODO: Implement API call to save evidence for later
            // Navigate back to consultation details
            navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
        } catch (error) {
            console.error('Error saving evidence:', error);
        } finally {
            setLoading(false);
        }
    };

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
                {Object.keys(errors).length > 0 && (
                    <div className="govuk-error-summary" role="alert" aria-labelledby="error-summary-title" tabIndex={-1} id="error-summary">
                        <h2 className="govuk-error-summary__title" id="error-summary-title">
                            There is a problem
                        </h2>
                        <div className="govuk-error-summary__body">
                            <ul className="govuk-list govuk-error-summary__list">
                                {errors.files && (
                                    <li>
                                        <a href="#file-upload">{errors.files}</a>
                                    </li>
                                )}
                                {errors.declaration && (
                                    <li>
                                        <a href="#declaration">{errors.declaration}</a>
                                    </li>
                                )}
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
                            <div className={`govuk-form-group ${errors.files ? 'govuk-form-group--error' : ''}`} id="file-upload">
                                <label htmlFor="fileUpload" className="govuk-label govuk-label--m">
                                    Upload a document that shows follow-up emails
                                </label>
                                <p className="govuk-body govuk-!-margin-bottom-4">You can upload .pdf, .jpg, .jpeg, .png, .msg, .doc, .docx, .xls, and .xlsx files of up to 25MB each. Files cannot be password protected.</p>

                                {errors.files && (
                                    <p id="fileUpload-error" className="govuk-error-message">
                                        <span className="govuk-visually-hidden">Error:</span> {errors.files}
                                    </p>
                                )}

                                <FileUpload
                                    title=""
                                    prefix={`${applicationId}/${FILE_CATEGORIES.CONSULTATION_RESPONSE}/${consultationId}`}
                                    applicationId={applicationId}
                                    category={FILE_CATEGORIES.CONSULTATION_RESPONSE}
                                    addedBy={user?.user_id || ''}
                                    uploadedFiles={uploadedFileObjs}
                                    onUploaded={(files, docs) => {
                                        console.log('Files from FileUpload:', files);
                                        console.log('Docs from FileUpload:', docs);
                                        setUploadedFileObjs((prev) => [...prev, ...files]);
                                        setApplicationDocuments((prev) => [...prev, ...docs]);
                                        // Clear file error
                                        if (errors.files) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                files: '',
                                            }));
                                        }
                                    }}
                                    onRemoveFile={(idx) => {
                                        setUploadedFileObjs((objs) => objs.filter((_, i) => i !== idx));
                                        setApplicationDocuments((docs) => docs.filter((_, i) => i !== idx));
                                    }}
                                    consultationId={consultationId}
                                />
                            </div>

                            {/* Declaration */}
                            <div className={`govuk-form-group ${errors.declaration ? 'govuk-form-group--error' : ''}`}>
                                <fieldset className="govuk-fieldset">
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
                                    {errors.declaration && (
                                        <p id="declaration-error" className="govuk-error-message">
                                            <span className="govuk-visually-hidden">Error:</span> {errors.declaration}
                                        </p>
                                    )}
                                </fieldset>
                            </div>

                            {/* Buttons */}
                            <div className="govuk-button-group">
                                <button type="button" className="govuk-button" data-module="govuk-button" onClick={handleCloseConsultation}>
                                    Close consultation
                                </button>
                                <button type="button" className="govuk-button govuk-button--secondary" onClick={handleSaveForLater} disabled={loading}>
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

export default EvidenceResponseNotReceivedPage;