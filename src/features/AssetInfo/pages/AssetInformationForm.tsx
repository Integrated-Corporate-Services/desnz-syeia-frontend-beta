import { S37_BASE_URL } from '../../../constants/s37';
import React, { useState, useEffect, useRef } from 'react';
import { useAssetStore } from '../../../store/useAssetStore';
import { useApplicationStore } from '../../../store/useApplicationStore';
import { useAuthUserContext } from '../../../context/AuthUserContext';
import type { AuthUser } from '../../../types/auth';
import { useApplicationReadOnly } from '../../../hooks/usePreventEditSubmitted';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import TextInput from '../component/TextInput';
import RadioGroup from '../component/RadioGroup';
import TextArea from '../component/TextArea';
import MultiSelectDropdown from '../component/MultiSelect';
import { ASSET_ERROR_MESSAGES } from '../../../constants/assetError';
import { VOLTAGE_CLASS_OPTIONS } from '../../../constants/asset';
import { createAsset } from '../../../services/asset-service';
import { managePublicConsultationByVoltage } from '../../../services/consultationService';
import log from '../../../logger';
import '../component/AssetInformationForm.css';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { getNextPageUrl, TASK_NAMES } from '../../../utils/taskListUtils';
import { useConsultationsStarted } from '../../../hooks/useConsultationsStarted';
import AssetSummary from './AssetSummary';

interface AssetFormState {
    assetId: string;
    referenceNumber: string;
    lineType: string;
    tori_noi: string;
    lineVoltage: string[];
    lineLength: string;
}

const initialState: AssetFormState = {
    assetId: '',
    referenceNumber: '',
    lineType: '',
    tori_noi: '',
    lineVoltage: [],
    lineLength: '',
};

type FormErrors = Partial<Record<keyof typeof initialState, string>>;

const AssetInformationForm: React.FC = () => {
    const [form, setForm] = useState<AssetFormState>(initialState);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitted, setSubmitted] = useState(false);
    const [originalVoltage, setOriginalVoltage] = useState<string[]>([]);
    const [currentFetchedAppId, setCurrentFetchedAppId] = useState<string>('');
    const { assets, loading, fetchAssets, updateAsset } = useAssetStore();
    const { application, fetchAndSetApplication } = useApplicationStore();
    const { user } = useAuthUserContext();
    const navigate = useNavigate();
    // Ref for first error field
    const firstErrorRef = useRef<HTMLInputElement | null>(null);

    // Determine if form should be read-only
    const isReadOnly = useApplicationReadOnly(application, user as AuthUser);

    const applicationId = useGetApplicationId();
    const effectiveApplicationId = useGetApplicationId();

    // Check if consultations have started - if so, show read-only summary instead
    const { consultationsStarted, loading: consultationsLoading } = useConsultationsStarted(effectiveApplicationId);

    // Focus the first error field when errors change
    useEffect(() => {
        if (submitted && Object.keys(errors).length > 0 && firstErrorRef.current) {
            firstErrorRef.current.focus();
        }
    }, [errors, submitted]);

    // Clear form state when applicationId changes
    useEffect(() => {
        setForm(initialState);
        setOriginalVoltage([]);
        setErrors({});
        setSubmitted(false);
        setCurrentFetchedAppId(''); // Clear tracked app ID
    }, [effectiveApplicationId]);

    // Fetch asset details on mount
    useEffect(() => {
        if (effectiveApplicationId) {
            fetchAssets(effectiveApplicationId).then(() => {
                setCurrentFetchedAppId(effectiveApplicationId);
            });
            fetchAndSetApplication(effectiveApplicationId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effectiveApplicationId]);

    // Bind asset details to form if available
    useEffect(() => {
        // Only bind data if assets were fetched for the current application
        if (assets && assets.length > 0 && effectiveApplicationId && currentFetchedAppId === effectiveApplicationId && !loading) {
            const asset = assets[0];

            let voltageArr: string[] = [];
            if (Array.isArray(asset.lineVoltage)) {
                voltageArr = asset.lineVoltage;
            } else if (typeof asset.lineVoltage === 'string') {
                voltageArr = asset.lineVoltage
                    .split(',')
                    .map((v) => v.trim())
                    .filter(Boolean);
            } else if (typeof asset.lineVoltage === 'object' && asset.lineVoltage !== null) {
                voltageArr = [(asset.lineVoltage as { code?: string }).code || ''];
            }

            setForm({
                assetId: asset.assetId || '',
                referenceNumber: asset.standardSpecificationReferenceNumber || '',
                tori_noi: asset.tori_noi || '',
                lineType: typeof asset.typeOfLine === 'object' && asset.typeOfLine !== null ? (asset.typeOfLine as { code?: string }).code || '' : asset.typeOfLine || '',
                lineVoltage: voltageArr,
                lineLength: asset.lineLength?.toString() || '',
            });
            // Store original voltage for comparison on submit
            setOriginalVoltage(voltageArr);
        }
        // Note: Form stays in initialState (empty) if no assets or assets from wrong application
    }, [assets, effectiveApplicationId, currentFetchedAppId, loading]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const validate = (data: AssetFormState): FormErrors => {
        const newErrors: FormErrors = {};
        if (!data.referenceNumber.trim()) {
            newErrors.referenceNumber = ASSET_ERROR_MESSAGES.referenceNumber;
        } else if (!/^[a-zA-Z0-9]+$/.test(data.referenceNumber.trim())) {
            newErrors.referenceNumber = ASSET_ERROR_MESSAGES.referenceNumberAlphanumeric;
        }
        if (!data.lineType) newErrors.lineType = ASSET_ERROR_MESSAGES.lineType;
        if (!data.lineLength.trim()) {
            newErrors.lineLength = ASSET_ERROR_MESSAGES.lineLength;
        } else {
            const numVal = parseFloat(data.lineLength);
            if (isNaN(numVal)) {
                newErrors.lineLength = 'Line length must be a valid number';
            } else if (numVal < 0) {
                newErrors.lineLength = 'Line length cannot be negative';
            } else {
                const decimalPart = data.lineLength.includes('.') ? data.lineLength.split('.')[1] : '';
                if (decimalPart.length > 2) {
                    newErrors.lineLength = 'Enter at most 2 decimal places for the line length';
                }
            }
        }
        if (!data.lineVoltage || !Array.isArray(data.lineVoltage) || data.lineVoltage.length === 0) newErrors.lineVoltage = ASSET_ERROR_MESSAGES.lineVoltage;
        return newErrors;
    };

    // Helper function to check if voltage is >= 132kV
    const hasHighVoltage = (voltages: string[]): boolean => {
        const highVoltageThresholds = ['132kV', '275kV', '400kV'];
        return voltages.some((voltage) => highVoltageThresholds.includes(voltage));
    };

    // Helper function to manage PUBLIC consultation based on voltage changes
    const handlePublicConsultation = async () => {
        if (!user?.user_id) {
            log.error('[AssetInformationForm] User ID not available for managing PUBLIC consultation');
            return;
        }

        const hadHighVoltage = hasHighVoltage(originalVoltage);
        const hasHighVoltageNow = hasHighVoltage(form.lineVoltage);

        log.debug('[AssetInformationForm] Managing PUBLIC consultation', {
            applicationId: effectiveApplicationId,
            hadHighVoltage,
            hasHighVoltageNow,
            originalVoltage,
            currentVoltage: form.lineVoltage,
        });

        try {
            // Call backend to manage PUBLIC consultation based on voltage
            await managePublicConsultationByVoltage(effectiveApplicationId, user.user_id, hasHighVoltageNow);

            if (hasHighVoltageNow && !hadHighVoltage) {
                log.info('[AssetInformationForm] PUBLIC consultation created - voltage upgraded to >= 132kV');
            } else if (!hasHighVoltageNow && hadHighVoltage) {
                log.info('[AssetInformationForm] PUBLIC consultation marked as INACTIVE - voltage downgraded to < 132kV');
            } else if (hasHighVoltageNow) {
                log.debug('[AssetInformationForm] PUBLIC consultation ensured for voltage >= 132kV');
            }
        } catch (error) {
            log.error('[AssetInformationForm] Failed to manage PUBLIC consultation:', error);
            // Non-blocking error - don't prevent navigation
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isReadOnly) {
            return; // Prevent submission if read-only
        }
        setSubmitted(true);
        const validationErrors = validate(form);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            return;
        }
        // Map form data to AssetRequest
        // Backend requires assetReference, poles, overheadLines, equipmentRemoval, isExistingAsset
        const assetPayload = {
            applicationId: effectiveApplicationId,
            assets: [
                {
                    assetId: form.assetId,
                    assetType: 's37',
                    standardSpecificationReferenceNumber: form.referenceNumber,
                    typeOfLine: form.lineType,
                    tori_noi: form.tori_noi,
                    lineVoltage: Array.isArray(form.lineVoltage) ? form.lineVoltage.filter(Boolean).join(',') : typeof form.lineVoltage === 'string' ? form.lineVoltage : '',
                    lineLength: parseFloat(form.lineLength),
                    assetReference: form.referenceNumber,
                    poles: { hasAddOrReplace: false, add: 0, replace: 0, description: '' },
                    overheadLines: { hasAddOrReplace: false, description: '' },
                    equipmentRemoval: { isRemoving: false, description: '' },
                    isExistingAsset: false,
                },
            ],
        };
        if (assets && assets[0]?.assetId) {
            // Update existing asset
            log.debug('[AssetInformationForm] Updating existing asset', { assetId: assets[0].assetId });
            updateAsset(assetPayload)
                .then(async () => {
                    log.info('[AssetInformationForm] Asset updated successfully');
                    await handlePublicConsultation();
                    fetchAssets(effectiveApplicationId);
                    // Navigate to the next page in the task list sequence
                    const nextPageUrl = getNextPageUrl(TASK_NAMES.ASSETS, effectiveApplicationId);
                    navigate(nextPageUrl);
                })
                .catch((error) => {
                    log.error('[AssetInformationForm] Failed to update asset:', error);
                    setErrors({ assetId: '', referenceNumber: ASSET_ERROR_MESSAGES.referenceNumber, lineType: ASSET_ERROR_MESSAGES.lineType, tori_noi: '', lineVoltage: ASSET_ERROR_MESSAGES.lineVoltage, lineLength: ASSET_ERROR_MESSAGES.lineLength });
                });
        } else {
            // Create new asset
            log.debug('[AssetInformationForm] Creating new asset');
            createAsset(assetPayload)
                .then(async () => {
                    log.info('[AssetInformationForm] Asset created successfully');
                    await handlePublicConsultation();
                    fetchAssets(effectiveApplicationId);
                    // Navigate to the next page in the task list sequence
                    const nextPageUrl = getNextPageUrl(TASK_NAMES.ASSETS, effectiveApplicationId);
                    navigate(nextPageUrl);
                })
                .catch((error) => {
                    log.error('[AssetInformationForm] Failed to create asset:', error);
                    setErrors({ assetId: '', referenceNumber: ASSET_ERROR_MESSAGES.referenceNumber, lineType: ASSET_ERROR_MESSAGES.lineType, tori_noi: '', lineVoltage: ASSET_ERROR_MESSAGES.lineVoltage, lineLength: ASSET_ERROR_MESSAGES.lineLength });
                });
        }
    };

    // While checking consultation status, show loading to prevent flash
    if (consultationsLoading) {
        return (
            <div className="govuk-width-container">
                <div className="govuk-main-wrapper">
                    <p className="govuk-body">Loading...</p>
                </div>
            </div>
        );
    }

    // If consultations started, show read-only AssetSummary page
    if (consultationsStarted) {
        return <AssetSummary />;
    }

    return (
        <div className="govuk-width-container">
            <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
                <ol className="govuk-breadcrumbs__list">
                    <li className="govuk-breadcrumbs__list-item">
                        <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/task-list`}>
                            Task list
                        </Link>
                    </li>
                    <li className="govuk-breadcrumbs__list-item" aria-current="page">
                        Assets
                    </li>
                </ol>
            </nav>
            {isReadOnly && (
                <div className="govuk-notification-banner" role="region" aria-labelledby="govuk-notification-banner-title" data-module="govuk-notification-banner">
                    <div className="govuk-notification-banner__header">
                        <h2 className="govuk-notification-banner__title" id="govuk-notification-banner-title">
                            Read-only view
                        </h2>
                    </div>
                    <div className="govuk-notification-banner__content">
                        <p className="govuk-notification-banner__heading">This application has been submitted. You can view the information but cannot make changes.</p>
                    </div>
                </div>
            )}
            <form className="govuk-!-margin-bottom-6" onSubmit={handleSubmit} noValidate>
                {submitted && Object.keys(errors).length > 0 && (
                    <div className="govuk-error-summary govuk-!-margin-bottom-6 govuk-!-width-two-thirds" aria-labelledby="error-summary-title" role="alert" tabIndex={-1} data-module="govuk-error-summary">
                        <h2 className="govuk-error-summary__title" id="error-summary-title">
                            There is a problem
                        </h2>
                        <div className="govuk-error-summary__body">
                            <ul className="govuk-list govuk-error-summary__list">
                                {Object.entries(errors).map(([field, message]) =>
                                    typeof message === 'string' && message ? (
                                        <li key={field}>
                                            <a href={`#${field}`}>{message}</a>
                                        </li>
                                    ) : null
                                )}
                            </ul>
                        </div>
                    </div>
                )}
                <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content">
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-two-thirds">
                            <h1 className="govuk-heading-l">Assets</h1>

                            {/* Standard specification reference number */}
                            <h2 className="govuk-heading-s govuk-!-margin-bottom-2">Standard specification reference number</h2>
                            <div className="govuk-form-group">
                                <TextInput
                                    id="referenceNumber"
                                    name="referenceNumber"
                                    label=""
                                    value={form.referenceNumber}
                                    error={errors.referenceNumber}
                                    onChange={handleChange}
                                    //widthClass="govuk-input--width-20"
                                    ref={errors.referenceNumber ? firstErrorRef : undefined}
                                    disabled={isReadOnly}
                                />
                            </div>

                            {/* Type of Line */}
                            <h2 className="govuk-heading-s govuk-!-margin-bottom-2">Type of line</h2>
                            <div className="govuk-form-group">
                                <RadioGroup
                                    id="lineType"
                                    label=""
                                    name="lineType"
                                    value={form.lineType}
                                    error={errors.lineType}
                                    onChange={handleChange}
                                    options={[
                                        { value: 'distribution', label: 'Distribution' },
                                        { value: 'transmission', label: 'Transmission' },
                                    ]}
                                    disabled={isReadOnly}
                                />
                            </div>

                            {form.lineType === 'transmission' && (
                                <div className="govuk-!-margin-top-2 govuk-!-width-two-thirds">
                                    <TextArea id="tori_noi" name="tori_noi" label="TORI/NOI code for this project (optional)" value={form.tori_noi} onChange={handleChange} maxLength={4000} showCount disabled={isReadOnly} />
                                </div>
                            )}

                            {/* Line voltage */}
                            <h2 className="govuk-heading-s govuk-!-margin-bottom-2">Line voltage</h2>
                            <MultiSelectDropdown
                                id="lineVoltage"
                                name="lineVoltage"
                                label=""
                                options={VOLTAGE_CLASS_OPTIONS.map((opt) => ({ value: opt.code, label: opt.label }))}
                                selected={form.lineVoltage}
                                onChange={(selected: string[]) => setForm((prev) => ({ ...prev, lineVoltage: selected }))}
                                error={errors.lineVoltage}
                                disabled={isReadOnly}
                            />

                            {/* Line Length */}
                            <h2 className="govuk-heading-s govuk-!-margin-bottom-2">Line length</h2>
                            <div className={`govuk-form-group govuk-!-width-one-third${errors.lineLength ? ' govuk-form-group--error' : ''}`}>
                                <label className="govuk-label govuk-visually-hidden" htmlFor="lineLength">
                                    Line length
                                </label>
                                {errors.lineLength && (
                                    <span className="govuk-error-message">
                                        <span className="govuk-visually-hidden">Error:</span> {errors.lineLength}
                                    </span>
                                )}
                                <div className="govuk-input__wrapper">
                                    <input
                                        className={`govuk-input govuk-input--width-5${errors.lineLength ? ' govuk-input--error' : ''}`}
                                        id="lineLength"
                                        name="lineLength"
                                        type="number"
                                        value={form.lineLength}
                                        onChange={handleChange}
                                        aria-describedby="lineLength-suffix"
                                        ref={!errors.referenceNumber && errors.lineLength ? firstErrorRef : undefined}
                                        disabled={isReadOnly}
                                    />
                                    <span className="govuk-input__suffix" id="lineLength-suffix">
                                        metres
                                    </span>
                                </div>
                            </div>

                            {!isReadOnly && (
                                <button type="submit" className="govuk-button govuk-!-margin-top-4">
                                    Save and continue
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            </form>
        </div>
    );
};

export default AssetInformationForm;
