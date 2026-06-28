export interface WorksOverview {
  addingOrReplacingPoles?: boolean;
  poleMaterial?: string;
  chemicalTreatments?: string;
  polesAdded?: number;
  polesReplaced?: number;
  tallestNewPoleHeight?: number;
  poleComments?: string;
  addingOrReplacingLines?: boolean;
  overheadLineDescription?: string;
  estimatedDuration?: string;
  vehiclesRequired?: string;
  roadClosuresRequired?: boolean;
  roadClosuresDetails?: string;
  excavationRequired?: boolean;
  excavationDetails?: string;
  vegetationClearanceRequired?: boolean;
  vegetationClearanceDetails?: string;
  removingExistingEquipment?: boolean;
  removalDescription?: string;
  generalComments?: string;
}

export const isYes = (value: boolean | string | null | undefined): boolean => {
  if (value === true || value === 'yes' || value === 'true') {
    return true;
  }
  return false;
};

export const formatYesNo = (value: boolean | null | undefined): string => {
  if (typeof value !== 'boolean') {
    return '-';
  }
  return value ? 'Yes' : 'No';
};

export const formatSummaryValue = (value: string | null | undefined): string => {
  if (value === null || value === undefined || value.trim() === '') {
    return '-';
  }
  return value;
};

export const formatSummaryNumber = (value: number | null | undefined): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '-';
  }
  return String(value);
};

export const formatHeightMetres = (value: number | null | undefined): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '-';
  }
  return `${value} metres`;
};
