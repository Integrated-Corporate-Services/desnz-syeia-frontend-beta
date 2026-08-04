import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { getConsultationResponse, saveConsultationResponse } from '../../../services/consultationResponseService';
import type { ConsultationResponse } from '../../../types/ConsultationResponse';
import { fetchConsultationDetails } from '../../../services/consultationService';
import { ConsultationType } from '../../../constants/consultationType';
import { CONSULTATION_VALIDATION_MESSAGES } from '../../../constants/consultationValidationMessages';
import SkipLink from '../../../components/SkipLink';
import { createLogger } from '../../../utils/logger';

const logger = createLogger('ConsultationResponse');

const ConsultationResponse: React.FC = () => {
    const { consultationId, applicationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthUser();
    const userId = user?.user_id;

    const [contactName, setContactName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [hasObjection, setHasObjection] = useState<string>('');
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
                    setContactName(data.response_full_name || '');
                    setEmail(data.response_email_address || '');
                    setHasObjection(data.has_objection ? 'yes' : (data.has_objection === false ? 'no' : ''));
                    setResponseId(data.response_id || '');
                    // Fetch all consultations to get the organization name
                    const consultations = await fetchConsultationDetails(applicationId!, user?.user_id!);
                    
                    // Check if consultations is an array or single object
                    const consultationsList = Array.isArray(consultations) ? consultations : [consultations];
                    const currentConsultation = consultationsList.find((c: any) => c.id === consultationId);
                    
                    if (currentConsultation) {
                        const orgName = currentConsultation.consulteeOrganisationName 
                            || currentConsultation.otherConsultee 
                            || 'Consultation';
                        setConsultationName(orgName);
                        setConsultationType(currentConsultation.consultationType || '');
                    }
                } catch (err) {
                    logger.error('Error fetching consultation response:', err);
                } finally {
                    setIsLoading(false);
                }
            }
        }
        fetchData();
    }, [consultationId, applicationId, user?.user_id]);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        // For PUBLIC consultations, only validate objection field
        if (consultationType === ConsultationType.PUBLIC) {
            if (!hasObjection) {
                newErrors.hasObjection = CONSULTATION_VALIDATION_MESSAGES.hasObjection.empty;
            }
        } else {
            // For non-PUBLIC consultations, validate all fields
            if (!contactName.trim()) {
                newErrors.contactName = CONSULTATION_VALIDATION_MESSAGES.consulteeContactName.empty;
            }

            if (!email.trim()) {
                newErrors.email = CONSULTATION_VALIDATION_MESSAGES.consulteeEmail.empty;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                newErrors.email = CONSULTATION_VALIDATION_MESSAGES.consulteeEmail.invalidFormat;
            }

            if (!hasObjection) {
                newErrors.hasObjection = CONSULTATION_VALIDATION_MESSAGES.hasObjection.empty;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveAndContinue = async () => {
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
                response_full_name: contactName,
                response_email_address: email,
                has_objection: hasObjection === 'yes',
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
            
            // For PUBLIC consultations with NO objections, skip document upload and go directly to comments page
            if (consultationType === ConsultationType.PUBLIC && hasObjection === 'no') {
                navigate(`${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/response3`);
            } else {
                // For all other cases (PUBLIC with objections OR non-PUBLIC), go to document upload page
                navigate(`${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/response2`);
            }
        } catch (err) {
            logger.error('Error saving consultation response:', err);
        }
    };

    return (
        <>
            <SkipLink />
            <div className="govuk-width-container">
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
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

                    <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
                        {isLoading ? (
                            <p className="govuk-body">Loading...</p>
                        ) : (
                            <>
                        {Object.values(errors).some(Boolean) && (
                            <div className="govuk-error-summary govuk-!-width-two-thirds" data-module="govuk-error-summary" id="error-summary" tabIndex={-1}>
                                <div role="alert">
                                    <h2 className="govuk-error-summary__title">There is a problem</h2>
                                    <div className="govuk-error-summary__body">
                                        <ul className="govuk-list govuk-error-summary__list">
                                            {errors.contactName && (
                                                <li><a href="#contactName">{errors.contactName}</a></li>
                                            )}
                                            {errors.email && (
                                                <li><a href="#email">{errors.email}</a></li>
                                            )}
                                            {errors.hasObjection && (
                                                <li><a href="#hasObjection">{errors.hasObjection}</a></li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {consultationType === ConsultationType.PUBLIC && <h2 className="govuk-caption-xl govuk-!-margin-top-0">Public notices</h2>}
                        {consultationType !== ConsultationType.PUBLIC && <h2 className="govuk-caption-xl govuk-!-margin-top-0">{consultationName}</h2>}
                        <h1 className="govuk-heading-l">{consultationType === ConsultationType.PUBLIC ? 'Are there any objections to the application?' : 'Provide consultation response'}</h1>

                        <form noValidate>
                            {consultationType !== ConsultationType.PUBLIC && (
                            <div className={`govuk-form-group ${errors.contactName ? 'govuk-form-group--error' : ''}`}>
                                <label className="govuk-label" htmlFor="contactName">
                                    <strong>Consultee contact name</strong>
                                </label>
                                <div id="contactName-hint" className="govuk-hint">
                                    For example: John Smith
                                </div>
                                {errors.contactName && (
                                    <p id="contactName-error" className="govuk-error-message">
                                        <span className="govuk-visually-hidden">Error:</span> {errors.contactName}
                                    </p>
                                )}
                                <input
                                    className={`govuk-input ${errors.contactName ? 'govuk-input--error' : ''}`}
                                    id="contactName"
                                    name="contactName"
                                    type="text"
                                    aria-describedby={`contactName-hint ${errors.contactName ? 'contactName-error' : ''}`}
                                    value={contactName}
                                    onChange={e => {
                                        setContactName(e.target.value);
                                        if (errors.contactName) {
                                            const { contactName: _contactName, ...restErrors } = errors;
                                            setErrors(restErrors);
                                        }
                                    }}
                                />
                            </div>
                            )}

                            {consultationType !== ConsultationType.PUBLIC && (
                            <div className={`govuk-form-group ${errors.email ? 'govuk-form-group--error' : ''}`}>
                                <label className="govuk-label" htmlFor="email">
                                    <strong>Consultee contact email address</strong>
                                </label>
                                <div id="email-hint" className="govuk-hint">
                                    For example: johnsmith@example.com
                                </div>
                                {errors.email && (
                                    <p id="email-error" className="govuk-error-message">
                                        <span className="govuk-visually-hidden">Error:</span> {errors.email}
                                    </p>
                                )}
                                <input
                                    className={`govuk-input ${errors.email ? 'govuk-input--error' : ''}`}
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    aria-describedby={`email-hint ${errors.email ? 'email-error' : ''}`}
                                    value={email}
                                    onChange={e => {
                                        setEmail(e.target.value);
                                        if (errors.email) {
                                            const { email: _email, ...restErrors } = errors;
                                            setErrors(restErrors);
                                        }
                                    }}
                                />
                            </div>
                            )}

                            <div className={`govuk-form-group ${errors.hasObjection ? 'govuk-form-group--error' : ''}`}>
                                <fieldset className="govuk-fieldset" aria-describedby={errors.hasObjection ? 'hasObjection-error' : undefined}>
                                    {consultationType !== ConsultationType.PUBLIC && (
                                    <legend className="govuk-fieldset__legend">
                                        <strong>Does the consultee have any objections to the application?</strong>
                                    </legend>
                                    )}
                                    {errors.hasObjection && (
                                        <p id="hasObjection-error" className="govuk-error-message">
                                            <span className="govuk-visually-hidden">Error:</span> {errors.hasObjection}
                                        </p>
                                    )}
                                    <div className="govuk-radios" data-module="govuk-radios">
                                        <div className="govuk-radios__item">
                                            <input
                                                className="govuk-radios__input"
                                                id="hasObjection"
                                                name="hasObjection"
                                                type="radio"
                                                value="yes"
                                                checked={hasObjection === 'yes'}
                                                onChange={e => {
                                                    setHasObjection(e.target.value);
                                                    if (errors.hasObjection) {
                                                        const { hasObjection: _hasObjection2, ...restErrors } = errors;
                                                        setErrors(restErrors);
                                                    }
                                                }}
                                            />
                                            <label className="govuk-label govuk-radios__label" htmlFor="hasObjection">
                                                Yes
                                            </label>
                                        </div>
                                        <div className="govuk-radios__item">
                                            <input
                                                className="govuk-radios__input"
                                                id="hasObjection-2"
                                                name="hasObjection"
                                                type="radio"
                                                value="no"
                                                checked={hasObjection === 'no'}
                                                onChange={e => {
                                                    setHasObjection(e.target.value);
                                                    if (errors.hasObjection) {
                                                        const { hasObjection: _hasObjection3, ...restErrors } = errors;
                                                        setErrors(restErrors);
                                                    }
                                                }}
                                            />
                                            <label className="govuk-label govuk-radios__label" htmlFor="hasObjection-2">
                                                No
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
                                    onClick={handleSaveAndContinue}
                                >
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
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
        </>
    );
};

export default ConsultationResponse;
