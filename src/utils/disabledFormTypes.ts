import { getRuntimeEnv } from '../config/runtimeEnv';

// Default: empty string means no form types are disabled (all enabled)
const DEFAULT_DISABLED_FORM_TYPES = '';

const YOUR_DETAILS_DISABLED_KEYS = ['your-details', 'your_details', 'yourdetails'];

export const getDisabledFormTypes = (): string[] => {
  const disabledTypes = getRuntimeEnv('VITE_DISABLED_FORM_TYPES', DEFAULT_DISABLED_FORM_TYPES);
  if (!disabledTypes || disabledTypes.trim() === '') {
    return [];
  }
  return disabledTypes
    .split(',')
    .map((type: string) => type.trim().toLowerCase())
    .filter(Boolean);
};

export const isYourDetailsFeatureDisabled = (): boolean => {
  const disabledTypes = getDisabledFormTypes();
  return YOUR_DETAILS_DISABLED_KEYS.some((key) => disabledTypes.includes(key));
};
