import { getRuntimeEnv } from '../config/runtimeEnv';

// Default: empty string means no form types are disabled (all enabled)
const DEFAULT_DISABLED_FORM_TYPES = '';

const YOUR_DETAILS_DISABLED_KEYS = ['your-details', 'your_details', 'yourdetails'];
const FIR_DISABLED_KEYS = ['fir', 'further-information-requests', 'further-information-request'];

const NOTIFICATIONS_DISABLED_KEYS = ['notifications', 'notification', 'in-app-notifications'];

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

export const isFirFeatureDisabled = (): boolean => {
  const disabledTypes = getDisabledFormTypes();
  return FIR_DISABLED_KEYS.some((key) => disabledTypes.includes(key));
};

export const isNotificationsFeatureDisabled = (): boolean => {
  const disabledTypes = getDisabledFormTypes();
  return NOTIFICATIONS_DISABLED_KEYS.some((key) => disabledTypes.includes(key));
};
