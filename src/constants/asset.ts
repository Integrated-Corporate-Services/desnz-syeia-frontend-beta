
export const LINE_TYPE_LABELS: Record<string, string> = {
  distribution: 'Distribution',
  transmission: 'Transmission'
};

export const TYPE_OF_LINE_ENUM = ['distribution', 'transmission'] as const;

export const VOLTAGE_CLASS_OPTIONS = [
  { code: '240/415V', label: '240/415V' },
  { code: '6.6kV', label: '6.6kV' },
  { code: '11kV', label: '11kV' },
  { code: '20kV', label: '20kV' },
  { code: '25kV', label: '25kV' },
  { code: '33kV', label: '33kV' },
  { code: '66kV', label: '66kV' },
  { code: '132kV', label: '132kV' },
  { code: '275kV', label: '275kV' },
  { code: '400kV', label: '400kV' }
];

