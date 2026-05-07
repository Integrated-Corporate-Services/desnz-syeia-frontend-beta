import { useState } from 'react';
import type { LineTypeState, AssetFormErrors } from '../types';
import { LINE_TYPE_OPTIONS, FORM_ERRORS, CHARACTER_LIMITS } from '../constants';

export const useAssetForm = () => {
  const [voltage, setVoltage] = useState<string>("select");
  const [lineTypes, setLineTypes] = useState<Record<string, LineTypeState>>(() => {
    const initial: Record<string, LineTypeState> = {};
    LINE_TYPE_OPTIONS.forEach(opt => {
      initial[opt.value] = { checked: false, description: "" };
    });
    return initial;
  });
  const [errors, setErrors] = useState<AssetFormErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const handleCheckboxChange = (value: string) => {
    setLineTypes(prev => ({
      ...prev,
      [value]: {
        ...prev[value],
        checked: !prev[value].checked
      }
    }));
    
    // Clear error for this specific checkbox if it exists
    if (errors[`lineType-${value}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`lineType-${value}`];
        return newErrors;
      });
    }
  };

  const handleDescriptionChange = (value: string, description: string) => {
    // Enforce character limit
    const trimmedDescription = description.slice(0, CHARACTER_LIMITS.MAX_DESCRIPTION);
    
    setLineTypes(prev => ({
      ...prev,
      [value]: {
        ...prev[value],
        description: trimmedDescription
      }
    }));
    
    // Clear error when user starts typing
    if (errors[`lineType-${value}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`lineType-${value}`];
        return newErrors;
      });
    }
  };

  const handleVoltageChange = (newVoltage: string) => {
    setVoltage(newVoltage);
    if (errors.voltage) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.voltage;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: AssetFormErrors = {};
    
    // Validate voltage
    if (voltage === "select") {
      newErrors.voltage = FORM_ERRORS.MISSING_VOLTAGE;
    }

    // Validate at least one line type is checked
    const anyChecked = Object.values(lineTypes).some(lt => lt.checked);
    if (!anyChecked) {
      newErrors.lineTypes = FORM_ERRORS.MISSING_LINE_TYPE;
    }

    // Validate each checked item has a description
    Object.entries(lineTypes).forEach(([key, value]) => {
      if (value.checked && !value.description.trim()) {
        newErrors[`lineType-${key}`] = FORM_ERRORS.MISSING_DESCRIPTION;
      }
    });

    setErrors(newErrors);
    setShowErrorSummary(Object.keys(newErrors).length > 0);

    return Object.keys(newErrors).length === 0;
  };

  const buildAssetPayload = (applicationId: string) => {
    const selectedLineTypes = Object.entries(lineTypes)
      .filter(([, value]) => value.checked)
      .map(([key, value]) => {
        const option = LINE_TYPE_OPTIONS.find(opt => opt.value === key);
        return `${option?.label}: ${value.description}`;
      })
      .join('\n\n');

    const newAssetId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '';
    
    return {
      applicationId,
      assets: [
        {
          assetId: newAssetId,
          assetType: 'nwl',
          typeOfLine: selectedLineTypes,
          lineVoltage: voltage,
          lineLength: 0,
          description: selectedLineTypes,
          standardSpecificationReferenceNumber: selectedLineTypes,
          assetReference: selectedLineTypes,
          poles: { hasAddOrReplace: false, add: 0, replace: 0, description: '' },
          overheadLines: { hasAddOrReplace: false, description: '' },
          equipmentRemoval: { isRemoving: false, description: '' },
          isExistingAsset: false,
        }
      ]
    };
  };

  const resetForm = () => {
    setVoltage("select");
    setLineTypes(() => {
      const reset: Record<string, LineTypeState> = {};
      LINE_TYPE_OPTIONS.forEach(opt => {
        reset[opt.value] = { checked: false, description: "" };
      });
      return reset;
    });
    setErrors({});
    setShowErrorSummary(false);
  };

  return {
    voltage,
    lineTypes,
    errors,
    showErrorSummary,
    handleVoltageChange,
    handleCheckboxChange,
    handleDescriptionChange,
    validateForm,
    buildAssetPayload,
    resetForm,
    setErrors,
    setShowErrorSummary,
  };
};
