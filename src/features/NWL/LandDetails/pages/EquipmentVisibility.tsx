import React, { useState, useEffect } from 'react';
import { useGetApplicationId } from '../../../../hooks/useGetApplicationId';
import { useNWLProgress } from '../../hooks/useNWLProgress';
import SkipLink from '../../../../components/SkipLink';
import {
  LandDetailsBreadcrumbs,
  FormActions,
  ErrorSummary,
} from '../components';
import {
  useLandDetailsData,
  useFormValidation,
  useLandNavigation,
} from '../hooks';
import { LAND_DETAILS_LABELS } from '../constants';

const EquipmentVisibility: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { landDetails, updateLandDetails } = useLandDetailsData(applicationId);
  const { errors, validateEquipmentVisibility } = useFormValidation();
  const { goToTaskList } = useLandNavigation(applicationId);
  const { updateProgress } = useNWLProgress(applicationId || undefined);

  const [isVisible, setIsVisible] = useState<'yes' | 'no' | ''>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Only set state if the value has been explicitly saved (not null/undefined)
    if (landDetails.equipment_visible_from_public_road === true) {
      setIsVisible('yes');
    } else if (landDetails.equipment_visible_from_public_road === false) {
      setIsVisible('no');
    }
    // If null or undefined, leave as empty string (no selection)
  }, [landDetails.equipment_visible_from_public_road]);

  const handleRadioChange = (value: 'yes' | 'no') => {
    setIsVisible(value);
  };

  const handleSaveAndContinue = async () => {
    const hasSelection = isVisible !== '';
    const isValid = validateEquipmentVisibility(hasSelection);

    if (!isValid) {
      window.scrollTo(0, 0);
      return;
    }

    setIsSaving(true);

    try {
      const visibleFromRoad = isVisible === 'yes';
      await updateLandDetails({
        equipment_visible_from_public_road: visibleFromRoad,
      });


      try {
        await updateProgress('Identifying information', 'Completed');
      } catch (_err) {
        // Non-blocking: progress update failure shouldn't prevent navigation
      }

      goToTaskList();
    } catch (_error) {
      // Error is handled by updateLandDetails
    } finally {
      setIsSaving(false);
    }
  };

  const errorFields = {
    equipmentVisibility: 'equipment-visibility-yes',
  };

  const labels = LAND_DETAILS_LABELS.EQUIPMENT_VISIBILITY;

  return (
    <>
      <SkipLink />
      <div className="govuk-width-container">
      <LandDetailsBreadcrumbs 
        applicationId={applicationId} 
        currentPage={labels.PAGE_TITLE}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <ErrorSummary errors={errors} errorFields={errorFields} />

            <form>
              <div className={`govuk-form-group${errors.equipmentVisibility ? ' govuk-form-group--error' : ''}`}>
                <fieldset className="govuk-fieldset">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <h1 className="govuk-fieldset__heading">
                      {labels.PAGE_TITLE}
                    </h1>
                  </legend>

                  {errors.equipmentVisibility && (
                    <p id="equipment-visibility-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span> {errors.equipmentVisibility}
                    </p>
                  )}

                  <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="equipment-visibility-yes"
                        name="equipmentVisibility"
                        type="radio"
                        value="yes"
                        checked={isVisible === 'yes'}
                        onChange={() => handleRadioChange('yes')}
                        aria-describedby={errors.equipmentVisibility ? 'equipment-visibility-error' : undefined}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="equipment-visibility-yes">
                        {labels.YES}
                      </label>
                    </div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="equipment-visibility-no"
                        name="equipmentVisibility"
                        type="radio"
                        value="no"
                        checked={isVisible === 'no'}
                        onChange={() => handleRadioChange('no')}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="equipment-visibility-no">
                        {labels.NO}
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>

              <FormActions
                onSaveAndContinue={handleSaveAndContinue}
                isSaving={isSaving}
              />
            </form>
          </div>
        </div>
      </main>
      </div>
    </>
  );
};

export default EquipmentVisibility;
