/**
 * Types for NWL Assets feature
 */

export interface Asset {
  assetId: string;
  applicationId: string;
  assetType: string;
  typeOfLine: string;
  lineVoltage: string | string[] | { code: string };
  lineLength: number;
  description: string;
  standardSpecificationReferenceNumber: string;
  assetReference: string;
  poles?: {
    hasAddOrReplace: boolean;
    add: number;
    replace: number;
    description: string;
  };
  overheadLines?: {
    hasAddOrReplace: boolean;
    description: string;
  };
  equipmentRemoval?: {
    isRemoving: boolean;
    description: string;
  };
  isExistingAsset: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LineTypeOption {
  value: string;
  label: string;
}

export interface LineTypeState {
  checked: boolean;
  description: string;
}

export interface AssetFormData {
  voltage: string;
  lineTypes: Record<string, LineTypeState>;
}

export interface AssetFormErrors {
  voltage?: string;
  lineTypes?: string;
  [key: string]: string | undefined;
}

export interface ParsedLineType {
  label: string;
  description: string;
}

export interface AssetPayload {
  applicationId: string;
  assets: Partial<Asset>[];
}
