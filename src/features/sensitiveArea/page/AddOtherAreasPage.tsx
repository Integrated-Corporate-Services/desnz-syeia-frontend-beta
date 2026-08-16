import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import {
  getAllSensitiveAreas,
  addManualArea,
  removeManualArea,
  PreIdentifiedArea,
  ManuallyAddedArea,
} from '../../../services/sensitiveAreaReviewService';
import { S37_BASE_URL } from '../../../constants/s37';
import { createLogger } from '../../../utils/logger';
import PageTitle from '../../../components/PageTitle';

const logger = createLogger('AddOtherAreasPage');

/**
 * AddOtherAreasPage Component (Wireframe D)
 * 
 * Allows applicants to manually add free-text sensitive area names that are not
 * part of the automated check. Displays both pre-identified (cannot remove) and
 * manually added (can remove) sensitive areas.
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
        logger.error('Failed to fetch areas:', err);
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
      logger.error('Failed to add area:', err);
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
      logger.error('Failed to remove area:', err);
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

    navigate(`${S37_BASE_URL}/${effectiveApplicationId}/sensitive-area-review/poles`);
  };

  /**
   * Handles "Save for later" - returns to task list
   */
  // const handleSaveForLater = () => {
  //   if (!effectiveApplicationId) return;

  //   navigate(`${S37_BASE_URL}/${effectiveApplicationId}/task-list`);
  // };

  // ===========================
  // HELPER FUNCTIONS
  // ===========================

  /**
   * Gets the display count for pre-identified areas
   */
  // const getPreIdentifiedCount = (): number => {
  //   return preIdentifiedAreas.filter(area => area.manuallySelected).length;
  // };

  /**
   * Gets filtered pre-identified areas to display:
   * - All INTERSECT areas (screening required or not)
   * - Areas selected by user in ReviewManualPage (manuallySelected = true)
   */
  const getFilteredPreIdentifiedAreas = (): PreIdentifiedArea[] => {
    return preIdentifiedAreas.filter(area => 
      area.checkStatus === 'INTERSECT' || area.manuallySelected === true
    );
  };

  // ===========================
  // RENDER
  // ===========================

  if (loading) {
    return (
      <div className="govuk-width-container">
        <PageTitle title="Add other sensitive areas" />
        <Link
          to={`${S37_BASE_URL}/${effectiveApplicationId}/sensitive-area-add-question`}
          className="govuk-back-link"
        >
          Back
        </Link>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">Add other sensitive areas</h1>
            <p className="govuk-body">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
            <PageTitle title="Add other sensitive areas" />
            <div className="govuk-width-container">
      {/* Back Link - Always visible */}
      <Link
        to={`${S37_BASE_URL}/${effectiveApplicationId}/sensitive-area-add-question`}
        className="govuk-back-link"
      >
        Back
      </Link>

      {/* Page Heading - Two-thirds width */}
      <div className='govuk-grid-row'>
        <div className="govuk-grid-column-two-thirds ">
          <h1 className="govuk-heading-l govuk-!-margin-top-4">Add other sensitive areas</h1>
        </div>
      </div>

      {/* Main Content Area - Two-thirds width */}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
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
          <h2 className="govuk-heading-s govuk-!-margin-bottom-1">Enter the name of a sensitive area</h2>
          <div className="govuk-hint">Once you add the area it will appear in the table below</div>

          {/* Input Field with Add Button */}
          <div className={`govuk-form-group govuk-!-margin-bottom-5 ${inputError ? 'govuk-form-group--error' : ''}`}>
            <label className="govuk-label govuk-visually-hidden" htmlFor="manual-area-input">
              Sensitive area name
            </label>
            
            {inputError && (
              <p id="manual-area-input-error" className="govuk-error-message">
                <span className="govuk-visually-hidden">Error:</span> {inputError}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <input
                className={`govuk-input govuk-input--width-10 ${inputError ? 'govuk-input--error' : ''}`}
                id="manual-area-input"
                name="manualAreaName"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                maxLength={200}
                aria-describedby={inputError ? 'manual-area-input-error' : undefined}
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
        <div className="govuk-!-margin-top-7">
          <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Selected areas</h2>
          <p className="govuk-body govuk-hint govuk-!-margin-top-4">
            You can only remove areas you have added manually. All areas identified during our automated
            sensitive areas check cannot be removed.
          </p>

          {/* GOV.UK Table with single column */}
          <table className="govuk-table govuk-!-margin-top-4">
            <tbody className="govuk-table__body">

              {/* Pre-identified areas rows */}
              {getFilteredPreIdentifiedAreas().length === 0 ? (
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell govuk-hint" style={{ paddingTop: '10px' }}>
                    No pre-identified areas found.
                  </td>
                </tr>
              ) : (
                getFilteredPreIdentifiedAreas().map((area) => (
                  <tr key={area.id} className="govuk-table__row">
                    <td className="govuk-table__cell">{area.layerName}</td>
                  </tr>
                ))
              )}


              {/* Manually added areas rows */}
              {manualAreas.length === 0 ? (
                <tr className="govuk-table__row">
                  {/* <td className="govuk-table__cell govuk-hint" style={{ paddingTop: '10px', borderBottom: 'none' }}>
                    No manually added areas yet. Use the form above to add areas.
                  </td> */}
                </tr>
              ) : (
                manualAreas.map((area) => (
                  <tr key={area.id} className="govuk-table__row">
                    <td className="govuk-table__cell" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{area.manualAreaName}</span>
                      <a
                        href="#"
                        className="govuk-link govuk-link--destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveArea(area.id);
                        }}
                        aria-label={`Remove ${area.manualAreaName}`}
                      >
                        {removingAreaId === area.id ? 'Removing...' : 'Remove'}
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ============================================================================ */}
        {/* SECTION 3: Action Buttons */}
        {/* ============================================================================ */}
        <button
          type="button"
          className="govuk-button"
          data-module="govuk-button"
          onClick={handleSaveAndContinue}
          style={{ marginTop: '30px' }}
        >
          Save and continue
        </button>
        {/* <button
          type="button"
          className="govuk-button govuk-button--secondary govuk-!-margin-left-3"
          data-module="govuk-button"
          onClick={handleSaveForLater}
        >
          Save for later
        </button> */}
        </div>
      </div>
      </div>
    </>
  );
};

export default AddOtherAreasPage;
