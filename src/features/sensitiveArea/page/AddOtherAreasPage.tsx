import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AxiosError } from 'axios';
import {
  getAllSensitiveAreas,
  addManualArea,
  removeManualArea,
  PreIdentifiedArea,
  ManuallyAddedArea,
} from '../../../services/sensitiveAreaReviewService';
import { S37_BASE_URL } from '../../../constants/s37';

/**
 * AddOtherAreasPage Component (Wireframe D)
 * 
 * Allows applicants to manually add free-text sensitive area names that are not
 * part of the automated check. Displays both pre-identified (cannot remove) and
 * manually added (can remove) sensitive areas.
 * 
 * Business Rules:
 * - Pre-identified areas cannot be removed (from automated check + manual review)
 * - Manually added areas can be removed by the user
 * - No screening fee applies to manually added areas (per Calum Haig 05/02/2026)
 * - User can add unlimited areas (1-200 characters each)
 * 
 * Features:
 * - Free-text input with "Add" button
 * - Validation (required, max length, no duplicates)
 * - Two sections: Pre-identified vs. Manually added
 * - GDS-compliant styling with dividers
 * - Save and continue / Save for later functionality
 */
const AddOtherAreasPage: React.FC = () => {
  // ===========================
  // HOOKS & STATE MANAGEMENT
  // ===========================
  const { applicationId } = useParams<{ applicationId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const queryId = queryParams.get('id');
  const effectiveApplicationId = applicationId || queryId || '';

  // API Data State
  const [preIdentifiedAreas, setPreIdentifiedAreas] = useState<PreIdentifiedArea[]>([]);
  const [manualAreas, setManualAreas] = useState<ManuallyAddedArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [addingArea, setAddingArea] = useState(false);
  const [removingAreaId, setRemovingAreaId] = useState<string | null>(null);

  // ===========================
  // DATA FETCHING
  // ===========================
  
  /**
   * Fetch all sensitive areas on component mount
   */
  useEffect(() => {
    if (!effectiveApplicationId) return;

    const fetchAllAreas = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAllSensitiveAreas(effectiveApplicationId);
        setPreIdentifiedAreas(data.preIdentifiedAreas || []);
        setManualAreas(data.manuallyAddedAreas || []);
        setLoading(false);
      } catch (err: unknown) {
        console.error('Failed to fetch areas:', err);
        const axiosError = err as AxiosError<{ details?: string }>;
        setError(axiosError.response?.data?.details || 'Failed to fetch sensitive areas');
        setLoading(false);
      }
    };

    fetchAllAreas();
  }, [effectiveApplicationId]);

  // ===========================
  // VALIDATION LOGIC
  // ===========================

  /**
   * Validates the manual area name input
   */
  const validateInput = (value: string): boolean => {
    const trimmed = value.trim();

    // Required
    if (trimmed.length === 0) {
      setInputError('Area name is required');
      return false;
    }

    // Max length
    if (trimmed.length > 200) {
      setInputError('Area name cannot exceed 200 characters');
      return false;
    }

    // Valid characters (alphanumeric + spaces, hyphens, apostrophes, parentheses, commas, periods)
    const validPattern = /^[a-zA-Z0-9\s\-'(),.]+$/;
    if (!validPattern.test(trimmed)) {
      setInputError('Area name can only contain letters, numbers, spaces, hyphens, apostrophes, parentheses, commas, and periods');
      return false;
    }

    // Case-insensitive duplicate check
    const isDuplicate = manualAreas.some(
      area => area.manualAreaName.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      setInputError('An area with this name already exists');
      return false;
    }

    setInputError(null);
    return true;
  };

  // ===========================
  // EVENT HANDLERS
  // ===========================

  /**
   * Handles input field change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (inputError) {
      setInputError(null); // Clear error on typing
    }
  };

  /**
   * Handles "Add" button click
   */
  const handleAddArea = async () => {
    if (!effectiveApplicationId) return;

    const trimmed = inputValue.trim();

    // Validate input
    if (!validateInput(trimmed)) return;

    setAddingArea(true);
    setError(null);

    try {
      const result = await addManualArea(effectiveApplicationId, trimmed);
      
      // Add the new area to state
      setManualAreas(prev => [...prev, result.area]);
      
      // Clear input field
      setInputValue('');
      setInputError(null);
      setAddingArea(false);
    } catch (err: unknown) {
      console.error('Failed to add area:', err);
      const axiosError = err as AxiosError<{ details?: string; error?: string }>;
      const errorMsg = axiosError.response?.data?.details || axiosError.response?.data?.error || 'Failed to add area';
      setInputError(errorMsg);
      setAddingArea(false);
    }
  };

  /**
   * Handles "Remove" button click for manually added areas
   */
  const handleRemoveArea = async (areaId: string) => {
    if (!effectiveApplicationId) return;

    setRemovingAreaId(areaId);
    setError(null);

    try {
      await removeManualArea(effectiveApplicationId, areaId);
      
      // Remove from state
      setManualAreas(prev => prev.filter(area => area.id !== areaId));
      setRemovingAreaId(null);
    } catch (err: unknown) {
      console.error('Failed to remove area:', err);
      const axiosError = err as AxiosError<{ details?: string }>;
      setError(axiosError.response?.data?.details || 'Failed to remove area');
      setRemovingAreaId(null);
    }
  };

  /**
   * Handles "Save and continue" - navigates to next step
   */
  const handleSaveAndContinue = () => {
    if (!effectiveApplicationId) return;

    // Navigate to the next step in the workflow (task list for now)
    navigate(`${S37_BASE_URL}/${effectiveApplicationId}/task-list`);
  };

  /**
   * Handles "Save for later" - returns to task list
   */
  const handleSaveForLater = () => {
    if (!effectiveApplicationId) return;

    navigate(`${S37_BASE_URL}/${effectiveApplicationId}/task-list`);
  };

  // ===========================
  // HELPER FUNCTIONS
  // ===========================

  /**
   * Gets the display count for pre-identified areas
   */
  const getPreIdentifiedCount = (): number => {
    return preIdentifiedAreas.filter(area => area.manuallySelected).length;
  };

  // ===========================
  // RENDER
  // ===========================

  if (loading) {
    return (
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-body">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        {/* Main Heading */}
        <h1 className="govuk-heading-xl">Add other sensitive areas</h1>

        {/* Global Error Message */}
        {error && (
          <div className="govuk-error-summary" role="alert" aria-labelledby="error-summary-title">
            <h2 className="govuk-error-summary__title" id="error-summary-title">
              There is a problem
            </h2>
            <div className="govuk-error-summary__body">
              <p className="govuk-body">{error}</p>
            </div>
          </div>
        )}

        {/* ============================================================================ */}
        {/* SECTION 1: Add New Area Input */}
        {/* ============================================================================ */}
        <h2 className="govuk-heading-m">Enter the name of a sensitive area</h2>
        <p className="govuk-body">Once you add the area it will appear in the table below.</p>

        {/* Input Field with Add Button */}
        <div className={`govuk-form-group ${inputError ? 'govuk-form-group--error' : ''}`}>
          <label className="govuk-label govuk-visually-hidden" htmlFor="manual-area-input">
            Sensitive area name
          </label>
          
          {inputError && (
            <p id="manual-area-input-error" className="govuk-error-message">
              <span className="govuk-visually-hidden">Error:</span> {inputError}
            </p>
          )}

          <div className="govuk-input__wrapper" style={{ display: 'flex', gap: '10px' }}>
            <input
              className={`govuk-input ${inputError ? 'govuk-input--error' : ''}`}
              id="manual-area-input"
              name="manualAreaName"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              maxLength={200}
              aria-describedby={inputError ? 'manual-area-input-error' : undefined}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="govuk-button"
              data-module="govuk-button"
              onClick={handleAddArea}
              disabled={addingArea || inputValue.trim().length === 0}
            >
              {addingArea ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>

        {/* Divider */}
        <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />

        {/* ============================================================================ */}
        {/* SECTION 2: Selected Areas */}
        {/* ============================================================================ */}
        <h2 className="govuk-heading-l">Selected areas</h2>
        <p className="govuk-body">
          You can only remove areas you have added manually. All areas identified during our automated
          sensitive areas check cannot be removed.
        </p>

        {/* Divider */}
        <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />

        {/* ============================================================================ */}
        {/* SUBSECTION 2A: Pre-identified areas (cannot be removed) */}
        {/* ============================================================================ */}
        <h3 className="govuk-heading-m">Pre-identified areas (cannot be removed)</h3>

        {preIdentifiedAreas.length === 0 ? (
          <p className="govuk-body">No pre-identified areas found.</p>
        ) : (
          <ul className="govuk-list">
            {preIdentifiedAreas
              .filter(area => area.manuallySelected)
              .map(area => (
                <li key={area.id}>{area.layerName}</li>
              ))}
          </ul>
        )}

        {getPreIdentifiedCount() === 0 && preIdentifiedAreas.length > 0 && (
          <p className="govuk-body govuk-hint">
            No areas have been selected during manual review.
          </p>
        )}

        {/* Divider */}
        <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />

        {/* ============================================================================ */}
        {/* SUBSECTION 2B: Manually added areas (can be removed) */}
        {/* ============================================================================ */}
        <h3 className="govuk-heading-m">Manually added areas (can be removed)</h3>

        {manualAreas.length === 0 ? (
          <p className="govuk-body govuk-hint">
            No manually added areas yet. Use the form above to add areas.
          </p>
        ) : (
          <ul className="govuk-list">
            {manualAreas.map(area => (
              <li
                key={area.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid #b1b4b6',
                }}
              >
                <span>{area.manualAreaName}</span>
                <button
                  type="button"
                  className="govuk-button govuk-button--warning"
                  data-module="govuk-button"
                  onClick={() => handleRemoveArea(area.id)}
                  disabled={removingAreaId === area.id}
                  style={{ marginLeft: '20px' }}
                >
                  {removingAreaId === area.id ? 'Removing...' : 'Remove'}
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* ============================================================================ */}
        {/* SECTION 3: Action Buttons */}
        {/* ============================================================================ */}
        <div className="govuk-button-group" style={{ marginTop: '30px' }}>
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
      </div>
    </div>
  );
};

export default AddOtherAreasPage;
