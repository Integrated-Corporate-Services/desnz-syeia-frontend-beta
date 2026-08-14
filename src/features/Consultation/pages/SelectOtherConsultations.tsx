import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { ConsultationType } from '../../../constants/consultationType';
import LpaSelector, { Lpa } from '../../../components/LpaSelector';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { updateAllConsultations, createLpaConsultations, getOtherConsulteeOrganisations, createOtherConsultations } from '../../../services/consultationService';
import { progressApiService } from '../../../services/progressApiService';
import log from '../../../logger';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { isWithinCharacterLimit } from '../../../utils/validation';

const OTHER_NAME_MAX_LENGTH = 4000;

interface OtherConsulteeEntry {
    id: string;
    name: string;
}

interface ConsulteeOrganisation {
    id: string;
    org_name: string;
    consultation_type: string;
    is_offline: boolean;
    default_email: string | null;
}

const SelectOtherConsultations: React.FC = () => {
    const  applicationId  = useGetApplicationId();
    const navigate = useNavigate();
    const { user } = useAuthUser();

    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
    const [otherEntries, setOtherEntries] = useState<OtherConsulteeEntry[]>([]);
    const [otherSearchTerm, setOtherSearchTerm] = useState<string>('');
    const [selectedLpas, setSelectedLpas] = useState<Lpa[]>([]);
    const [otherConsultees, setOtherConsultees] = useState<ConsulteeOrganisation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOtherSelected, setIsOtherSelected] = useState(false);
    const [otherNameError, setOtherNameError] = useState<string>('');

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Fetch OTHER consultee organisations from the database
    useEffect(() => {
        const fetchOtherConsultees = async () => {
            try {
                if (!applicationId) {
                    log.warn('[SelectOtherConsultations] No applicationId available');
                    setLoading(false);
                    return;
                }
                
                setLoading(true);
                const response = await getOtherConsulteeOrganisations(applicationId);
                if (response.success && response.data) {
                    setOtherConsultees(response.data);
                    log.debug('[SelectOtherConsultations] Fetched OTHER consultees:', response.data);
                }
            } catch (error) {
                log.error('[SelectOtherConsultations] Error fetching OTHER consultees:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOtherConsultees();
    }, [applicationId]);

    const handleLpaSelect = (lpa: Lpa | null) => {
        // Add to array if not already present
        if (lpa && !selectedLpas.some((s) => s.lpa_code === lpa.lpa_code)) {
            setSelectedLpas((prev) => [...prev, lpa]);
            log.debug('LPA added:', lpa.lpa_name, lpa.lpa_code);
            // TODO: Later integrate with consultation creation
            // This could trigger creation of a new consultation with this LPA
        }
    };

    const handleLpaRemove = (lpaCode: string) => {
        setSelectedLpas((prev) => prev.filter((lpa) => lpa.lpa_code !== lpaCode));
        log.debug('LPA removed:', lpaCode);
    };

    // TODO: Load existing selections from backend
    useEffect(() => {
        // Example pre-filled data
        setOtherEntries([]);
        setSelectedCategories(new Set([]));
    }, []);

    const handleCategoryChange = (category: string) => {
        const newCategories = new Set(selectedCategories);
        if (newCategories.has(category)) {
            newCategories.delete(category);
        } else {
            newCategories.add(category);
        }
        setSelectedCategories(newCategories);
    };

    const handleAddOther = () => {
        if (!otherSearchTerm.trim()) {
            setOtherNameError('Enter a consultee\'s name');
            return;
        }
        if (!isWithinCharacterLimit(otherSearchTerm, OTHER_NAME_MAX_LENGTH)) {
            setOtherNameError(`Consultee name must be ${OTHER_NAME_MAX_LENGTH} characters or fewer`);
            return;
        }
        const newEntry: OtherConsulteeEntry = {
            id: `other-${Date.now()}`,
            name: otherSearchTerm.trim(),
        };
        log.debug('[SelectOtherConsultations] Adding manual OTHER consultee', { name: newEntry.name });
        setOtherEntries([...otherEntries, newEntry]);
        setOtherSearchTerm('');
        setOtherNameError('');
    };

    const handleOtherNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setOtherSearchTerm(value);
        if (value.length > OTHER_NAME_MAX_LENGTH) {
            setOtherNameError(`Consultee name must be ${OTHER_NAME_MAX_LENGTH} characters or fewer`);
        } else {
            setOtherNameError('');
        }
    };

    const isOverLimit = otherSearchTerm.length > OTHER_NAME_MAX_LENGTH;

    const handleRemoveOther = (id: string) => {
        log.debug('[SelectOtherConsultations] Removing manual OTHER consultee', { id });
        setOtherEntries(otherEntries.filter((entry) => entry.id !== id));
    };

    const handleSaveAndContinue = async () => {
        try {
            if (!applicationId || !user?.user_id) {
                return;
            }

            // Create LPA consultations if any LPAs were selected
            if (selectedLpas.length > 0) {
                log.debug('[SelectOtherConsultations] Creating manually selected LPA consultations', {
                    count: selectedLpas.length,
                });
                await createLpaConsultations(applicationId, selectedLpas, user.user_id, ConsultationType.OTHER_LPA);
                log.debug('[SelectOtherConsultations] Manually selected LPA consultations created successfully as OTHER-LPA type');
            }

            // Create OTHER consultations if any OTHER consultees were selected
            const otherConsulteesData: Array<{ consulteeOrganisationId?: string; otherConsulteeName?: string }> = [];

            // Add selected consultees from database (those with consulteeOrganisationId)
            selectedCategories.forEach((consulteeId) => {
                otherConsulteesData.push({
                    consulteeOrganisationId: consulteeId,
                });
            });

            // Add manually entered consultees (those with otherConsulteeName)
            otherEntries.forEach((entry) => {
                otherConsulteesData.push({
                    otherConsulteeName: entry.name,
                });
            });

            if (otherConsulteesData.length > 0) {
                log.debug('[SelectOtherConsultations] Creating OTHER consultations', {
                    count: otherConsulteesData.length,
                });
                await createOtherConsultations(applicationId, otherConsulteesData, user.user_id);
                log.debug('[SelectOtherConsultations] OTHER consultations created successfully');
            }

            await updateAllConsultations(applicationId, user.user_id);

            // Update consultation task progress as in progress
            try {
                await progressApiService.updateApplicationProgress(applicationId, 'CONSULTATION', 'IN_PROGRESS');
                log.debug('[SelectOtherConsultations] Consultation task progress updated to IN_PROGRESS');
            } catch (progressError) {
                log.error('[SelectOtherConsultations] Error updating consultation progress:', progressError);
                // Continue with navigation even if progress update fails
            }

            // Navigate to next step
            navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
        } catch (err) {
            log.error('[SelectOtherConsultations] Error saving consultations:', err);
        }
    };

    return (
        <>
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
                                Select other consultations
                            </li>
                        </ol>
                    </nav>

                                            <h1 className="govuk-heading-l">Select other consultations</h1>

                        <p className="govuk-body">You can add other consultations that are relevant to your application.</p>

                        <form noValidate>
                            {/* Other consultation categories */}
                            <div className="govuk-form-group">
                                        <LpaSelector
                                            selectedLpaCodes={selectedLpas.map((lpa) => lpa.lpa_code)}
                                            onLpaSelect={handleLpaSelect}
                                            onRemove={handleLpaRemove}
                                            showCheckbox={true}
                                        />
                                <div className="govuk-checkboxes" data-module="govuk-checkboxes">

                                    {/* Dynamic OTHER consultees from database */}
                                    {loading ? (
                                        <p className="govuk-body">Loading consultees...</p>
                                    ) : (
                                        otherConsultees.map((consultee) => (
                                            <div key={consultee.id} className="govuk-checkboxes__item">
                                                <input
                                                    className="govuk-checkboxes__input"
                                                    id={consultee.id}
                                                    name="consultationType"
                                                    type="checkbox"
                                                    checked={selectedCategories.has(consultee.id)}
                                                    onChange={() => handleCategoryChange(consultee.id)}
                                                />
                                                <label className="govuk-label govuk-checkboxes__label" htmlFor={consultee.id}>
                                                    {consultee.org_name}
                                                </label>
                                            </div>
                                        ))
                                    )}

                                    {/* Static "Other" checkbox */}
                                    <div className="govuk-checkboxes__item">
                                        <input
                                            className="govuk-checkboxes__input"
                                            id="other-checkbox"
                                            name="consultationType"
                                            type="checkbox"
                                            checked={isOtherSelected}
                                            onChange={() => setIsOtherSelected(!isOtherSelected)}
                                        />
                                        <label className="govuk-label govuk-checkboxes__label" htmlFor="other-checkbox">
                                            Other
                                        </label>
                                    </div>
                                </div>

                                {/* Show text input if "Other" checkbox is selected */}
                                {isOtherSelected && (
                                    <div className="govuk-checkboxes__conditional">
                                        {otherEntries.length > 0 && (
                                            <div className="govuk-!-margin-bottom-4" style={{ width: '100%' }}>
                                                {otherEntries.map((entry) => (
                                                    <div key={entry.id} className="govuk-!-padding-bottom-2 govuk-!-padding-top-2" style={{ borderBottom: '1px solid #b1b4b6', width: '100%' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '1rem' }}>
                                                            <span className="govuk-body" style={{ margin: 0, flex: '1 1 auto', minWidth: 0, wordBreak: 'break-word' }}>{entry.name}</span>
                                                            <a
                                                                href="#"
                                                                className="govuk-link"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleRemoveOther(entry.id);
                                                                }}
                                                                style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}
                                                            >
                                                                Remove
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className={`govuk-form-group${otherNameError ? ' govuk-form-group--error' : ''}`}>
                                            <label className="govuk-label" htmlFor="other-search">
                                                Enter a consultee's name
                                            </label>
                                            {otherNameError && (
                                                <p id="other-search-error" className="govuk-error-message">
                                                    <span className="govuk-visually-hidden">Error:</span> {otherNameError}
                                                </p>
                                            )}
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                                <input
                                                    className={`govuk-input${otherNameError ? ' govuk-input--error' : ''}`}
                                                    id="other-search"
                                                    name="other-search"
                                                    type="text"
                                                    value={otherSearchTerm}
                                                    aria-describedby={otherNameError ? 'other-search-error' : undefined}
                                                    onChange={handleOtherNameChange}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddOther();
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    className="govuk-button"
                                                    data-module="govuk-button"
                                                    onClick={handleAddOther}
                                                    disabled={isOverLimit}
                                                    style={{ margin: 0 }}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="govuk-button-group">
                                <button type="button" className="govuk-button" data-module="govuk-button" onClick={handleSaveAndContinue}>
                                    Save and continue
                                </button>
                                {/*  <button
                                    type="button"
                                    className="govuk-button govuk-button--secondary"
                                    data-module="govuk-button"
                                    onClick={handleSaveForLater}
                                >
                                    Save for later
                                </button> */}
                            </div>
                        </form>
                                    </div>
            </div>
        </div>
        </>
    );
};

export default SelectOtherConsultations;
