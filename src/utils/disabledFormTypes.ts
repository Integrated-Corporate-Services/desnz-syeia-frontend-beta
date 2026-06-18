const DEFAULT_DISABLED_FORM_TYPES = '';

const YOUR_DETAILS_DISABLED_KEYS = ['your-details', 'your_details', 'yourdetails'];

export const getDisabledFormTypes = (): string[] => {
  return (import.meta.env.VITE_DISABLED_FORM_TYPES || DEFAULT_DISABLED_FORM_TYPES)
    .split(',')
    .map((type: string) => type.trim().toLowerCase())
    .filter(Boolean);
};

export const isYourDetailsFeatureDisabled = (): boolean => {
  const disabledTypes = getDisabledFormTypes();
  return YOUR_DETAILS_DISABLED_KEYS.some((key) => disabledTypes.includes(key));
};
