
export const LINE_TYPE_LABELS: Record<string, string> = {
  distribution: 'Distribution',
  transmission: 'Transmission'
};

// IMPORTANT: This enum must match all frontend dropdown values for line type
export const TYPE_OF_LINE_ENUM = [
  "distribution",
  "transmission",
  "High voltage overhead line",
  "Low voltage overhead line",
  "High voltage overhead line and wooden pole(s)",
  "Low voltage overhead line and wooden pole(s)",
  "High voltage overhead line, wooden pole(s) and stay(s)",
  "Low voltage overhead line, wooden pole(s) and stay(s)",
  "High voltage overhead line and steel tower(s)",
  "Low voltage overhead line and steel tower(s)",
  "High voltage underground cable",
  "Low voltage underground cable",
  "High voltage underground cable and wooden pole(s)",
  "Low voltage underground cable and wooden pole(s)",
  "High voltage underground cable, wooden pole(s) and stay(s)",
  "Low voltage underground cable, wooden pole(s) and stay(s)",
  "Wooden pole(s)",
  "Steel tower(s)",
  "Stay(s)"
] as const;

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

