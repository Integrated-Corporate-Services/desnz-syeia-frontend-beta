export interface AssetPoles {
  workItemId?: string | null;
  hasAddOrReplace: boolean;
  add: number;
  replace: number;
  description: string;
}
 
export interface AssetOverheadLines {
  workItemId?: string | null;
  hasAddOrReplace: boolean;
  description: string;
}
 
export interface AssetEquipmentRemoval {
  workItemId?: string | null;
  isRemoving: boolean;
  description: string;
}
 
export interface Asset {
  assetId: string;
  assetType: string;
  assetReference: string;
  description: string;
  standardSpecificationReferenceNumber: string;
  lineLength: number;
  typeOfLine: string;
  poles: AssetPoles;
  overheadLines: AssetOverheadLines;
  equipmentRemoval: AssetEquipmentRemoval;
  isExistingAsset: boolean;
  generalComments: string;
  lineVoltage: string;
}
 
export interface AssetRequest {
  applicationId: string;
  assets: Asset[];
}
 
 