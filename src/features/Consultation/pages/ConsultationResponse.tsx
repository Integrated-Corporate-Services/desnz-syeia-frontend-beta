import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { getConsultationResponse, saveConsultationResponse } from '../../../services/consultationResponseService';
import type { ConsultationResponse } from '../../../types/ConsultationResponse';

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
                    setContactName(data.response_full_name || '');
                    setEmail(data.response_email_address || '');
                    setHasObjection(data.has_objection ? 'yes' : (data.has_objection === false ? 'no' : ''));
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

        if (!contactName.trim()) {
            newErrors.contactName = 'Enter the consultee contact name';
        }

        if (!email.trim()) {
            newErrors.email = 'Enter the consultee contact email address';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Enter an email address in the correct format, like name@example.com';
        }

        if (!hasObjection) {
            newErrors.hasObjection = 'Select yes if the consultee has any objections to the application';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateFormatOnly = () => {
        const newErrors: { [key: string]: string } = {};

        if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Enter an email address in the correct format, like name@example.com';
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
            navigate(`${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/response2`);
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

        try {
            // Fetch existing data to preserve all fields
            const existingData = await getConsultationResponse(consultationId!, applicationId);
            
            const payload: Partial<ConsultationResponse> = {
                ...existingData,
                response_full_name: contactName || undefined,
                response_email_address: email || undefined,
                has_objection: hasObjection ? hasObjection === 'yes' : undefined,
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
                        {Object.keys(errors).length > 0 && (
                            <div className="govuk-error-summary" data-module="govuk-error-summary" id="error-summary" tabIndex={-1}>
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

                        <h2 className="govuk-caption-xl">Natural England</h2>
                        <h1 className="govuk-heading-l">Provide consultation response</h1>

                        <form noValidate>
                            <div className={`govuk-form-group ${errors.contactName ? 'govuk-form-group--error' : ''}`}>
                                <label className="govuk-label" htmlFor="contactName">
                                    Consultee contact name
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
                                            const { contactName, ...restErrors } = errors;
                                            setErrors(restErrors);
                                        }
                                    }}
                                />
                            </div>

                            <div className={`govuk-form-group ${errors.email ? 'govuk-form-group--error' : ''}`}>
                                <label className="govuk-label" htmlFor="email">
                                    Consultee contact email address
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
                                            const { email, ...restErrors } = errors;
                                            setErrors(restErrors);
                                        }
                                    }}
                                />
                            </div>

                            <div className={`govuk-form-group ${errors.hasObjection ? 'govuk-form-group--error' : ''}`}>
                                <fieldset className="govuk-fieldset" aria-describedby={errors.hasObjection ? 'hasObjection-error' : undefined}>
                                    <legend className="govuk-fieldset__legend">
                                        Does the consultee have any objections to the application?
                                    </legend>
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
                                                        const { hasObjection, ...restErrors } = errors;
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
                                                        const { hasObjection, ...restErrors } = errors;
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
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ConsultationResponse;
