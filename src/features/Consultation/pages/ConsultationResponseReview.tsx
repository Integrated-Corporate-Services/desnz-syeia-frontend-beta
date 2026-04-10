import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { getConsultationResponse, saveConsultationResponse } from '../../../services/consultationResponseService';
import { ConsultationResponse } from '../../../types/ConsultationResponse';
import { fetchConsultationDetails } from '../../../services/consultationService';
import { CONSULTATION_VALIDATION_MESSAGES } from '../../../constants/consultationValidationMessages';
import { isValidTextFormat } from '../../../utils/validation';

const ConsultationResponse3: React.FC = () => {
    const { consultationId, applicationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthUser();
    const userId = user?.user_id;

    const [comments, setComments] = useState<string>('');
    const [declarationAccepted, setDeclarationAccepted] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [responseId, setResponseId] = useState<string>('');
    const [consultationName, setConsultationName] = useState<string>('');
    const [consultationType, setConsultationType] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
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
                    setComments(data.response_comments || '');
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

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        // Validate comments character limit (4,000 characters)
        if (comments && comments.length > 4000) {
            newErrors.comments = CONSULTATION_VALIDATION_MESSAGES.additionalComments.tooLong;
        } else if (comments && !isValidTextFormat(comments)) {
            newErrors.comments = CONSULTATION_VALIDATION_MESSAGES.additionalComments.invalidFormat;
        }

        if (!declarationAccepted) {
            const errorMessage = consultationType === 'PUBLIC'
                ? CONSULTATION_VALIDATION_MESSAGES.responseReviewDeclaration.emptyPublic
                : CONSULTATION_VALIDATION_MESSAGES.responseReviewDeclaration.emptyNonPublic;
            newErrors.declaration = errorMessage;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCloseConsultation = async () => {
        if (!validateForm()) {
            const errorSummary = document.getElementById('error-summary');
            if (errorSummary) {
                errorSummary.focus();
                errorSummary.scrollIntoView({  block: 'start' });
            }
            return;
        }

        try {
            // Fetch existing data to preserve all fields
            const existingData = await getConsultationResponse(consultationId!, applicationId);
            
            const payload: Partial<ConsultationResponse> = {
                ...existingData,
                response_comments: comments,
                last_updated_by: userId,
                has_all_documents_uploaded: declarationAccepted,
                isSave: false,
            };

            await saveConsultationResponse(payload, applicationId);
            navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
        } catch (err) {
            console.error('Error closing consultation:', err);
        }
    };

    const handleSaveForLater = async () => {
        try {
            // Fetch existing data to preserve all fields
            const existingData = await getConsultationResponse(consultationId!, applicationId);
            
            const payload: Partial<ConsultationResponse> = {
                ...existingData,
                response_comments: comments,
                created_by: userId,
                last_updated_by: userId,
                has_all_documents_uploaded: declarationAccepted,
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
            navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
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
                        {Object.values(errors).some(Boolean) && (
                            <div className="govuk-error-summary" data-module="govuk-error-summary" id="error-summary" tabIndex={-1}>
                                <div role="alert">
                                    <h2 className="govuk-error-summary__title">There is a problem</h2>
                                    <div className="govuk-error-summary__body">
                                        <ul className="govuk-list govuk-error-summary__list">
                                            {errors.comments && (
                                                <li><a href="#comments">{errors.comments}</a></li>
                                            )}
                                            {errors.declaration && (
                                                <li><a href="#declaration">{errors.declaration}</a></li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {consultationType === 'PUBLIC' && <h2 className="govuk-caption-xl">Public notices</h2>}
                        {consultationType !== 'PUBLIC' && <h2 className="govuk-caption-xl">{consultationName}</h2>}
                        <h1 className="govuk-heading-l">{consultationType === 'PUBLIC' ? 'Add additional comments about public responses (optional)' : 'Provide consultation response'}</h1>

                        <form noValidate>
                            <div className={`govuk-form-group ${errors.comments ? 'govuk-form-group--error' : ''}`}>
                                {consultationType !== 'PUBLIC' && (
                                <h2 className="govuk-label-wrapper">
                                    <label className="govuk-label govuk-label--m" htmlFor="comments">
                                        Add any additional comments (optional)
                                    </label>
                                </h2>
                                )}
                                <div id="comments-hint" className="govuk-hint">
                                    You can add any additional information or comments here.
                                </div>
                                {errors.comments && (
                                    <p id="comments-error" className="govuk-error-message">
                                        <span className="govuk-visually-hidden">Error:</span> {errors.comments}
                                    </p>
                                )}
                                <textarea
                                    className={`govuk-textarea ${errors.comments ? 'govuk-textarea--error' : ''}`}
                                    id="comments"
                                    name="comments"
                                    rows={8}
                                    aria-describedby={errors.comments ? "comments-hint comments-error" : "comments-hint"}
                                    value={comments}
                                    onChange={e => {
                                        setComments(e.target.value);
                                        // Clear error when user starts typing
                                        if (errors.comments && e.target.value.length <= 4000) {
                                            const { comments: _comments, ...restErrors } = errors;
                                            setErrors(restErrors);
                                        }
                                    }}
                                />
                            </div>

                            <div className={`govuk-form-group ${errors.declaration ? 'govuk-form-group--error' : ''}`}>
                                <fieldset className="govuk-fieldset">
                                    {consultationType !== 'PUBLIC' && (
                                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                                        <h2 className="govuk-fieldset__heading">Declaration</h2>
                                    </legend>
                                    )}
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
                                                checked={declarationAccepted}
                                                onChange={e => {
                                                    setDeclarationAccepted(e.target.checked);
                                                    if (errors.declaration) {
                                                        const { declaration, ...restErrors } = errors;
                                                        setErrors(restErrors);
                                                    }
                                                }}
                                                aria-describedby={errors.declaration ? 'declaration-error' : undefined}
                                            />
                                            <label className="govuk-label govuk-checkboxes__label" htmlFor="declaration">
                                                {consultationType === 'PUBLIC' 
                                                    ? 'Confirm you have provided all relevant information, uploaded all supporting documents and want to close this public consultation. You cannot undo this action.'
                                                    : 'Confirm you have provided all relevant information, uploaded all supporting documents and want to close this consultation. You cannot undo this action.'}
                                            </label>
                                        </div>
                                    </div>
                                </fieldset>
                            </div>

                           <div className="govuk-button-group">
                                <button
                                    type="button"
                                    className="govuk-button"
                                    data-module="govuk-button"
                                    onClick={handleCloseConsultation}
                                >
                                    Close consultation
                                </button>
                              {/*    <button
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

export default ConsultationResponse3;
