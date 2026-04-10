import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { getConsultationPack } from '../../../services/consultationPackService';
import { getLpaDetails, saveLpaDetails } from '../../../services/consultationLpaDetailsService'; 
import { CONSULTATION_VALIDATION_MESSAGES } from '../../../constants/consultationValidationMessages';
import { isValidTextFormat, isWithinCharacterLimit } from '../../../utils/validation';
import { createLogger } from '../../../utils/logger';

const log = createLogger('LPADetailsPage');

interface LPADetails {
    lpaContactName: string;
    lpaContactEmail: string;
    lpaContactPhone: string;
}

const LPADetailsPage: React.FC = () => {
    const navigate = useNavigate();
    const applicationId = useGetApplicationId();
    const { consultationId } = useParams();
    const [searchParams] = useSearchParams();
    const consultationName = searchParams.get('consultationName') || '';

    const [formData, setFormData] = useState<LPADetails>({
        lpaContactName: '',
        lpaContactEmail: '',
        lpaContactPhone: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [lpaName, setLpaName] = useState('');
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const fetchLPADetails = async () => {
            try {
                if (!consultationId || !applicationId) return;
                
                // Fetch consultation pack for LPA name
                const data = await getConsultationPack(consultationId, applicationId);
                const name = data?.consultation?.org_name || consultationName || 'LPA';
                setLpaName(name);
                
                // NEW: Fetch existing LPA details if any
                const existingDetails = await getLpaDetails(applicationId, consultationId);
                if (existingDetails) {
                    setFormData({
                        lpaContactName: existingDetails.lpaContactName || '',
                        lpaContactEmail: existingDetails.lpaContactEmail || '',
                        lpaContactPhone: existingDetails.lpaContactPhone || '',
                    });
                }
                
                log.debug('=== LPA DETAILS PAGE ===');
                log.debug('LPA Name:', name);
                log.debug('Existing Details:', existingDetails);
                log.debug('========================');
            } catch (error) {
                log.error('Error fetching LPA details:', error);
            }
        };

        if (applicationId && consultationId) {
            fetchLPADetails();
        }
    }, [applicationId, consultationId, consultationName]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.lpaContactName.trim()) {
            newErrors.lpaContactName = CONSULTATION_VALIDATION_MESSAGES.lpaContactName.empty;
        } else if (!isWithinCharacterLimit(formData.lpaContactName, 4000)) {
            newErrors.lpaContactName = CONSULTATION_VALIDATION_MESSAGES.lpaContactName.characterLimit;
        } else if (!isValidTextFormat(formData.lpaContactName)) {
            newErrors.lpaContactName = CONSULTATION_VALIDATION_MESSAGES.lpaContactName.invalidFormat;
        }

        if (!formData.lpaContactEmail.trim()) {
            newErrors.lpaContactEmail = CONSULTATION_VALIDATION_MESSAGES.lpaContactEmail.empty;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.lpaContactEmail)) {
            newErrors.lpaContactEmail = CONSULTATION_VALIDATION_MESSAGES.lpaContactEmail.invalid;
        }

        if (formData.lpaContactPhone && !/^[\d\s\-+()]+$/.test(formData.lpaContactPhone)) {
            newErrors.lpaContactPhone = CONSULTATION_VALIDATION_MESSAGES.lpaContactPhone.invalid;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
        setSubmitted(false);
    };

    const handleSaveAndContinue = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await saveLpaDetails(applicationId!, consultationId!, formData);
            setErrors({});
            setSubmitted(false); // Reset after successful submit
            navigate(`${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/proposed-development?consultationName=${encodeURIComponent(lpaName)}`);
        } catch (error) {
            log.error('Error saving LPA details:', error);
            setErrors((prev) => ({
                ...prev,
                submit: 'Failed to save LPA details. Please try again.',
            }));
        } finally {
            setLoading(false);
        }
    };

    // const handleSaveForLater = async (e: React.FormEvent) => {
    //     e.preventDefault();

    //     setLoading(true);
    //     try {
    //         // NEW: Save LPA details to database
    //         if (formData.lpaContactName || formData.lpaContactEmail) {
    //             await saveLpaDetails(applicationId!, consultationId!, formData);
    //         }
            
    //         navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
    //     } catch (error) {
    //         log.error('Error saving LPA details:', error);
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
                            LPA details
                        </li>
                    </ol>
                </nav>

                {/* Error Summary */}
                {submitted && Object.values(errors).some(Boolean) && (
                    <div className="govuk-error-summary" role="alert" aria-labelledby="error-summary-title" tabIndex={-1}>
                        <h2 className="govuk-error-summary__title" id="error-summary-title">
                            There is a problem
                        </h2>
                        <div className="govuk-error-summary__body">
                            <ul className="govuk-list govuk-error-summary__list">
                                {Object.entries(errors).map(([key, message]) => (
                                    <li key={key}>
                                        <a href={`#${key}`}>{message}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        {/* Organization Name */}
                        <h2 className="govuk-caption-xl">
                            <strong>{lpaName}</strong>
                        </h2>

                        {/* Page Heading */}
                        <h1 className="govuk-heading-l">Local Planning Authority (LPA) details</h1>

                        {/* Form */}
                        <form onSubmit={handleSaveAndContinue}>
                            {/* LPA Contact Name */}
                            <div className={`govuk-form-group ${errors.lpaContactName ? 'govuk-form-group--error' : ''}`}>
                                <label htmlFor="lpaContactName" className="govuk-label govuk-label--m">
                                    LPA contact name
                                </label>
                                {errors.lpaContactName && (
                                    <p id="lpaContactName-error" className="govuk-error-message">
                                        <span className="govuk-visually-hidden">Error:</span> {errors.lpaContactName}
                                    </p>
                                )}
                                <input
                                    className={`govuk-input ${errors.lpaContactName ? 'govuk-input--error' : ''}`}
                                    id="lpaContactName"
                                    name="lpaContactName"
                                    type="text"
                                    value={formData.lpaContactName}
                                    onChange={handleInputChange}
                                    aria-describedby={errors.lpaContactName ? 'lpaContactName-error' : undefined}
                                />
                            </div>

                            {/* LPA Contact Email */}
                            <div className={`govuk-form-group ${errors.lpaContactEmail ? 'govuk-form-group--error' : ''}`}>
                                <label htmlFor="lpaContactEmail" className="govuk-label govuk-label--m">
                                    LPA contact email
                                </label>
                                {errors.lpaContactEmail && (
                                    <p id="lpaContactEmail-error" className="govuk-error-message">
                                        <span className="govuk-visually-hidden">Error:</span> {errors.lpaContactEmail}
                                    </p>
                                )}
                                <input
                                    className={`govuk-input ${errors.lpaContactEmail ? 'govuk-input--error' : ''}`}
                                    id="lpaContactEmail"
                                    name="lpaContactEmail"
                                    type="email"
                                    value={formData.lpaContactEmail}
                                    onChange={handleInputChange}
                                    aria-describedby={errors.lpaContactEmail ? 'lpaContactEmail-error' : undefined}
                                />
                            </div>

                            {/* LPA Contact Phone (Optional) */}
                            <div className={`govuk-form-group ${errors.lpaContactPhone ? 'govuk-form-group--error' : ''}`}>
                                <label htmlFor="lpaContactPhone" className="govuk-label govuk-label--m">
                                    LPA contact phone number (optional)
                                </label>
                                {errors.lpaContactPhone && (
                                    <p id="lpaContactPhone-error" className="govuk-error-message">
                                        <span className="govuk-visually-hidden">Error:</span> {errors.lpaContactPhone}
                                    </p>
                                )}
                                <input
                                    className={`govuk-input ${errors.lpaContactPhone ? 'govuk-input--error' : ''}`}
                                    id="lpaContactPhone"
                                    name="lpaContactPhone"
                                    type="tel"
                                    value={formData.lpaContactPhone}
                                    onChange={handleInputChange}
                                    aria-describedby={errors.lpaContactPhone ? 'lpaContactPhone-error' : undefined}
                                />
                            </div>

                            {/* Buttons */}
                            <div className="govuk-button-group">
                                <button type="submit" className="govuk-button" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save and continue'}
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

export default LPADetailsPage;
