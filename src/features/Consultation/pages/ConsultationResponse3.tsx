import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { getConsultationResponse, saveConsultationResponse } from '../../../services/consultationResponseService';
import { ConsultationResponse } from '../../../types/ConsultationResponse';

const ConsultationResponse3: React.FC = () => {
    const { consultationId, applicationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthUser();
    const userId = user?.user_id;

    const [comments, setComments] = useState<string>('');
    const [declarationAccepted, setDeclarationAccepted] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [responseId, setResponseId] = useState<string>('');

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Load existing data
    useEffect(() => {
        async function fetchData() {
            if (consultationId) {
                try {
                    const data = await getConsultationResponse(consultationId, applicationId);
                    setComments(data.response_comments || '');
                    setResponseId(data.response_id || '');
                } catch (err) {
                    console.error('Error fetching consultation response:', err);
                }
            }
        }
        fetchData();
    }, [consultationId, applicationId]);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!declarationAccepted) {
            newErrors.declaration = 'Confirm you have provided all relevant information, uploaded all supporting documents and want to close this consultation';
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
                        {Object.keys(errors).length > 0 && (
                            <div className="govuk-error-summary" data-module="govuk-error-summary" id="error-summary" tabIndex={-1}>
                                <div role="alert">
                                    <h2 className="govuk-error-summary__title">There is a problem</h2>
                                    <div className="govuk-error-summary__body">
                                        <ul className="govuk-list govuk-error-summary__list">
                                            {errors.declaration && (
                                                <li><a href="#declaration">{errors.declaration}</a></li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        <h2 className="govuk-caption-xl">Natural England</h2>
                        <h1 className="govuk-heading-l">Provide consultation response</h1>

                        <form noValidate>
                            <div className="govuk-form-group">
                                <h2 className="govuk-label-wrapper">
                                    <label className="govuk-label govuk-label--m" htmlFor="comments">
                                        Add any additional comments (optional)
                                    </label>
                                </h2>
                                <div id="comments-hint" className="govuk-hint">
                                    You can add any additional information or comments here.
                                </div>
                                <textarea
                                    className="govuk-textarea"
                                    id="comments"
                                    name="comments"
                                    rows={8}
                                    aria-describedby="comments-hint"
                                    value={comments}
                                    onChange={e => setComments(e.target.value)}
                                />
                            </div>

                            <div className={`govuk-form-group ${errors.declaration ? 'govuk-form-group--error' : ''}`}>
                                <fieldset className="govuk-fieldset">
                                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                                        <h2 className="govuk-fieldset__heading">Declaration</h2>
                                    </legend>
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
                                                Confirm you have provided all relevant information, uploaded all supporting documents and want to close this consultation. You cannot undo this action.
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
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ConsultationResponse3;
