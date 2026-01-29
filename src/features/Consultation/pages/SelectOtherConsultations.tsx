import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import LpaSelector, { Lpa } from "../../../components/LpaSelector";
import { useDerivedLpas } from "../../../hooks/useDerivedLpas";
import { useAuthUser } from "../../../hooks/useAuthUser";
import { updateAllConsultations } from '../../../services/consultationService';
import log from '../../../logger';
interface LPAEntry {
    id: string;
    name: string;
}

interface OtherConsulteeEntry {
    id: string;
    name: string;
}

const SelectOtherConsultations: React.FC = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
  const { user } = useAuthUser();

    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
    const [lpaEntries, setLpaEntries] = useState<LPAEntry[]>([]);
    const [lpaSearchTerm, setLpaSearchTerm] = useState<string>('');
    const [otherEntries, setOtherEntries] = useState<OtherConsulteeEntry[]>([]);
    const [otherSearchTerm, setOtherSearchTerm] = useState<string>('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
const [selectedLpas, setSelectedLpas] = useState<Lpa[]>([]);

  const { derivedLpas } = useDerivedLpas(applicationId);


  const handleLpaSelect = (lpa: Lpa | null) => {
    // Add to array if not already present
    if (lpa && !selectedLpas.some((s) => s.lpa_code === lpa.lpa_code)) {
      setSelectedLpas((prev) => [...prev, lpa]);
      log.debug("LPA added:", lpa.lpa_name, lpa.lpa_code);
      // TODO: Later integrate with consultation creation
      // This could trigger creation of a new consultation with this LPA
    }
  };

  const handleLpaRemove = (lpaCode: string) => {
    setSelectedLpas((prev) => prev.filter((lpa) => lpa.lpa_code !== lpaCode));
    log.debug("LPA removed:", lpaCode);
  };

    // TODO: Load existing selections from backend
    useEffect(() => {
        // Example pre-filled data
        setLpaEntries([
            { id: 'lpa-1', name: 'Suffolk Council' },
            { id: 'lpa-2', name: 'Norfolk Council' }
        ]);
        setOtherEntries([
         
        ]);
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

    const handleAddLPA = () => {
        if (lpaSearchTerm.trim()) {
            const newEntry: LPAEntry = {
                id: `lpa-${Date.now()}`,
                name: lpaSearchTerm.trim()
            };
            setLpaEntries([...lpaEntries, newEntry]);
            setLpaSearchTerm('');
        }
    };

    const handleRemoveLPA = (id: string) => {
        setLpaEntries(lpaEntries.filter(entry => entry.id !== id));
    };

    const handleAddOther = () => {
        if (otherSearchTerm.trim()) {
            const newEntry: OtherConsulteeEntry = {
                id: `other-${Date.now()}`,
                name: otherSearchTerm.trim()
            };
            setOtherEntries([...otherEntries, newEntry]);
            setOtherSearchTerm('');
        }
    };

    const handleRemoveOther = (id: string) => {
        setOtherEntries(otherEntries.filter(entry => entry.id !== id));
    };

    const handleSaveAndContinue = async () => {
        try {
            // Update all consultations with lastUpdatedBy
            console.log('[SelectOtherConsultations] Current user object:', user);
            console.log('[SelectOtherConsultations] Application ID:', applicationId);
            
            if (!applicationId) {
                console.error('Application ID is missing');
                return;
            }
            
            if (!user?.user_id) {
                console.error('User ID is missing. User object:', user);
                return;
            }

            console.log('[SelectOtherConsultations] Calling updateAllConsultations with:', {
                applicationId,
                userId: user.user_id
            });

            const updateResult = await updateAllConsultations(applicationId, user.user_id);
            console.log('[SelectOtherConsultations] Consultations updated:', updateResult);

            // TODO: Save selections to backend
            const payload = {
                selectedCategories: Array.from(selectedCategories),
                lpaEntries,
                otherEntries,
                lastUpdatedBy: user?.user_id
            };
            console.log('[SelectOtherConsultations] Saving payload:', payload);
            
            // Navigate to next step
            navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
        } catch (err) {
            console.error('[SelectOtherConsultations] Error saving consultations:', err);
        }
    };

    const handleSaveForLater = async () => {
        try {
            // TODO: Save current state to backend
            navigate(`${S37_BASE_URL}/${applicationId}/task-list`);
        } catch (err) {
            console.error('Error saving for later:', err);
        }
    };

    return (
        <div className="govuk-width-container govuk-!-margin-top-6 govuk-!-margin-bottom-6">
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <nav className="govuk-breadcrumbs govuk-!-margin-bottom-6" aria-label="Breadcrumb">
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

                    <main id="main-content">
                        <h1 className="govuk-heading-l">Select other consultations</h1>

                        <p className="govuk-body">
                            You can add other consultations that are relevant to your application.
                        </p>

                        <form noValidate>
                        {/* Other consultation categories */}
                            <div className="govuk-form-group">
                                <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                                      <div className="govuk-checkboxes__item">
                                       <LpaSelector
                                                selectedLpaCodes={selectedLpas.map((lpa) => lpa.lpa_code)}
                                                onLpaSelect={handleLpaSelect}
                                                onRemove={handleLpaRemove}
                                                showRemoveButton={true}
                                                showCheckbox={true}
                                            />
                                    </div>
                                    <div className="govuk-checkboxes__item">
                                        <input
                                            className="govuk-checkboxes__input"
                                            id="fire-rescue"
                                            name="consultationType"
                                            type="checkbox"
                                            checked={selectedCategories.has('fire-rescue')}
                                            onChange={() => handleCategoryChange('fire-rescue')}
                                        />
                                        <label className="govuk-label govuk-checkboxes__label" htmlFor="fire-rescue">
                                            County Fire and Rescue Service
                                        </label>
                                    </div>

                                    <div className="govuk-checkboxes__item">
                                        <input
                                            className="govuk-checkboxes__input"
                                            id="environment-agency"
                                            name="consultationType"
                                            type="checkbox"
                                            checked={selectedCategories.has('environment-agency')}
                                            onChange={() => handleCategoryChange('environment-agency')}
                                        />
                                        <label className="govuk-label govuk-checkboxes__label" htmlFor="environment-agency">
                                            Environment Agency
                                        </label>
                                    </div>

                                    <div className="govuk-checkboxes__item">
                                        <input
                                            className="govuk-checkboxes__input"
                                            id="highways-england"
                                            name="consultationType"
                                            type="checkbox"
                                            checked={selectedCategories.has('highways-england')}
                                            onChange={() => handleCategoryChange('highways-england')}
                                        />
                                        <label className="govuk-label govuk-checkboxes__label" htmlFor="highways-england">
                                            Highways England
                                        </label>
                                    </div>

                                    <div className="govuk-checkboxes__item">
                                        <input
                                            className="govuk-checkboxes__input"
                                            id="wildfire-trust"
                                            name="consultationType"
                                            type="checkbox"
                                            checked={selectedCategories.has('wildfire-trust')}
                                            onChange={() => handleCategoryChange('wildfire-trust')}
                                        />
                                        <label className="govuk-label govuk-checkboxes__label" htmlFor="wildfire-trust">
                                            Local Wildfire Trust
                                        </label>
                                    </div>

                                    <div className="govuk-checkboxes__item">
                                        <input
                                            className="govuk-checkboxes__input"
                                            id="rspb"
                                            name="consultationType"
                                            type="checkbox"
                                            checked={selectedCategories.has('rspb')}
                                            onChange={() => handleCategoryChange('rspb')}
                                        />
                                        <label className="govuk-label govuk-checkboxes__label" htmlFor="rspb">
                                            RSPB
                                        </label>
                                    </div>

                                    <div className="govuk-checkboxes__item">
                                        <input
                                            className="govuk-checkboxes__input"
                                            id="other"
                                            name="consultationType"
                                            type="checkbox"
                                            checked={selectedCategories.has('other')}
                                            onChange={() => handleCategoryChange('other')}
                                        />
                                        <label className="govuk-label govuk-checkboxes__label" htmlFor="other">
                                            Other
                                        </label>
                                    </div>
                                </div>

                                {selectedCategories.has('other') && (
                                    <div className="govuk-!-margin-top-4 govuk-!-margin-left-4">
                                        {otherEntries.map((entry) => (
                                            <div key={entry.id} className="govuk-!-margin-bottom-2">
                                                <span className="govuk-body">{entry.name}</span>
                                                <button
                                                    type="button"
                                                    className="govuk-link govuk-!-margin-left-2"
                                                    onClick={() => handleRemoveOther(entry.id)}
                                                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                        <div className="govuk-!-margin-top-3">
                                            <label className="govuk-label" htmlFor="other-search">
                                                Enter a consultee's name
                                            </label>
                                            <div className="govuk-input__wrapper govuk-!-display-flex">
                                                <input
                                                    className="govuk-input govuk-!-width-two-thirds"
                                                    id="other-search"
                                                    name="other-search"
                                                    type="text"
                                                    value={otherSearchTerm}
                                                    onChange={(e) => setOtherSearchTerm(e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddOther();
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    className="govuk-button govuk-!-margin-left-2"
                                                    data-module="govuk-button"
                                                    onClick={handleAddOther}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                                <button
                                    type="button"
                                    className="govuk-button govuk-button--secondary"
                                    data-module="govuk-button"
                                    onClick={handleSaveForLater}
                                >
                                    Save for later
                                </button>
                            </div>
                        </form>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default SelectOtherConsultations;
