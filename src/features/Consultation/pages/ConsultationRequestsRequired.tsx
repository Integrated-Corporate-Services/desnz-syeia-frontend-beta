import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { useConsultationDetails } from '../../../hooks/useConsultationDetails';
import { useDerivedLpas } from '../../../hooks/useDerivedLpas';
import { updateAllConsultations, createLpaConsultations } from '../../../services/consultationService';
import { progressApiService } from '../../../services/progressApiService';
import { CONSULTATION_VALIDATION_MESSAGES } from '../../../constants/consultationValidationMessages';
import log from '../../../logger';
import SkipLink from '../../../components/SkipLink';
import { createLogger } from '../../../utils/logger';

const logger = createLogger('ConsultationRequestsRequired');

const ConsultationRequestsRequired: React.FC = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthUser();
    const [addOtherConsultations, setAddOtherConsultations] = useState<string>('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Fetch consultation details from backend
    const { consultations, loading } = useConsultationDetails(applicationId, user?.user_id);

    // Fetch derived LPAs from parishes
    const { derivedLpas, loading: lpasLoading } = useDerivedLpas(applicationId);

    // Check if any consultation has lastUpdatedBy and redirect to consultation details
    useEffect(() => {
        if (!loading && consultations && consultations.length > 0) {
            // Check if any consultation has been updated (has lastUpdatedBy or has status other than initial)
            const hasUpdatedConsultations = consultations.some((c) => c.lastUpdatedBy);

            if (hasUpdatedConsultations) {
                navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`, {
                    replace: true,
                });
            }
        }
    }, [consultations, loading, navigate, applicationId]);

    // Extract required consultees from fetched consultations
    const requiredConsultees = consultations.map((c) => c.otherConsultee || c.consulteeOrganisationName).filter(Boolean);

    const existingConsulteeNames = new Set(requiredConsultees.map((n) => (n || '').toString().toLowerCase()));
    const dedupedDerivedLpas = Array.isArray(derivedLpas)
        ? derivedLpas.filter((l) => !existingConsulteeNames.has((l.lpa_name || '').toLowerCase()))
        : [];


    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!addOtherConsultations) {
            newErrors.addOtherConsultations = CONSULTATION_VALIDATION_MESSAGES.addOtherConsultations.empty;
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
            // Update consultation status to "In progress" in task list
            if (applicationId) {
                await progressApiService.updateApplicationProgress(
                    applicationId,
                    'Consultations',
                    'In progress'
                );
                log.debug('[ConsultationRequestsRequired] Updated consultation status to "In progress"');
            }

            // Create LPA consultations from derived parishes before proceeding
            if (user?.user_id && applicationId && derivedLpas.length > 0) {
                log.debug('[ConsultationRequestsRequired] Creating LPA consultations from derived parishes', { count: derivedLpas.length });
                await createLpaConsultations(applicationId, derivedLpas, user.user_id);
                log.debug('[ConsultationRequestsRequired] LPA consultations created successfully');
            }

            if (addOtherConsultations === 'yes') {
                navigate(`${S37_BASE_URL}/${applicationId}/consultation/select-other-consultations`);
            } else {
                // Update all consultations with lastUpdatedBy when user doesn't want to add other consultations
                if (user?.user_id && applicationId) {
                    const updateResult = await updateAllConsultations(applicationId, user.user_id);
                    log.debug('Consultations updated:', updateResult);
                }

                // Navigate to consultation details
                navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
            }
        } catch (err) {
            logger.error('Error saving consultation requests:', err);
        }
    };

    const handleAddOtherConsultationsChange = (value: string) => {
        setAddOtherConsultations(value);
        if (value && errors.addOtherConsultations) {
            setErrors((prev) => {
                const { addOtherConsultations: _, ...rest } = prev;
                return rest;
            });
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
                                <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/task-list`}>
                                    Task list
                                </Link>
                            </li>
                            <li className="govuk-breadcrumbs__list-item" aria-current="page">
                                Consultation requests required
                            </li>
                        </ol>
                    </nav>

                    <main id="main-content" className="govuk-main-wrapper govuk-!-padding-top-2">
                        {Object.values(errors).some(Boolean) && (
                            <div className="govuk-error-summary govuk-!-width-two-thirds" data-module="govuk-error-summary" id="error-summary" tabIndex={-1}>
                                <div role="alert" aria-live="assertive" aria-atomic="true">
                                    <h2 className="govuk-error-summary__title">There is a problem</h2>
                                    <div className="govuk-error-summary__body">
                                        <ul className="govuk-list govuk-error-summary__list">
                                            {errors.addOtherConsultations && (
                                                <li>
                                                    <a href="#addOtherConsultations">{errors.addOtherConsultations}</a>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        <h1 className="govuk-heading-l">Consultation requests required</h1>

                        {loading || lpasLoading ? (
                            <p className="govuk-body">Loading consultations...</p>
                        ) : requiredConsultees.length > 0 || dedupedDerivedLpas.length > 0 ? (
                            <div className="govuk-inset-text">
                                <p className="govuk-body">You must send requests to the following consultees, based on the sensitive areas check review and your previous answers:</p>
                                <ul className="govuk-list govuk-list--bullet">
                                    {requiredConsultees.map((consultee, index) => (
                                        <li key={index}>{consultee}</li>
                                    ))}
                                    {dedupedDerivedLpas.map((lpa) => (
                                        <li key={lpa.lpa_code}>{lpa.lpa_name}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="govuk-inset-text">
                                <p className="govuk-body">No required consultations found. Please complete the previous steps first.</p>
                            </div>
                        )}

                        <form noValidate>
                            <div className={`govuk-form-group ${errors.addOtherConsultations ? 'govuk-form-group--error' : ''}`}>
                                <fieldset className="govuk-fieldset" aria-describedby={errors.addOtherConsultations ? 'addOtherConsultations-error' : undefined}>
                                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                                        <h2 className="govuk-fieldset__heading">Do you want to add any other consultations that are relevant to your application? (Optional)</h2>
                                    </legend>
                                    <p className="govuk-hint">You can select these on the next page.</p>
                                    {errors.addOtherConsultations && (
                                        <p id="addOtherConsultations-error" className="govuk-error-message">
                                            <span className="govuk-visually-hidden">Error:</span> {errors.addOtherConsultations}
                                        </p>
                                    )}
                                    <div className="govuk-radios" data-module="govuk-radios">
                                        <div className="govuk-radios__item">
                                            <input
                                                className="govuk-radios__input"
                                                id="addOtherConsultations"
                                                name="addOtherConsultations"
                                                type="radio"
                                                value="yes"
                                                checked={addOtherConsultations === 'yes'}
                                                onChange={(e) => handleAddOtherConsultationsChange(e.target.value)}
                                            />
                                            <label className="govuk-label govuk-radios__label" htmlFor="addOtherConsultations">
                                                Yes
                                            </label>
                                        </div>
                                        <div className="govuk-radios__item">
                                            <input
                                                className="govuk-radios__input"
                                                id="addOtherConsultations-2"
                                                name="addOtherConsultations"
                                                type="radio"
                                                value="no"
                                                checked={addOtherConsultations === 'no'}
                                                onChange={(e) => handleAddOtherConsultationsChange(e.target.value)}
                                            />
                                            <label className="govuk-label govuk-radios__label" htmlFor="addOtherConsultations-2">
                                                No, I don't want to add other consultations
                                            </label>
                                        </div>
                                    </div>
                                </fieldset>
                            </div>

                            <div className="govuk-button-group">
                                <button type="button" className="govuk-button govuk-!-margin-top-6" data-module="govuk-button" onClick={handleSaveAndContinue}>
                                    Save and continue
                                </button>
                                {/*   <button
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
        </>
    );
};

export default ConsultationRequestsRequired;
