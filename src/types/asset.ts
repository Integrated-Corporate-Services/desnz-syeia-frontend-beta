export interface AssetPoles {
  hasAddOrReplace: boolean;
  add: number;
  replace: number;
  description: string;
}
 
export interface AssetOverheadLines {
  hasAddOrReplace: boolean;
  description: string;
}
 
export interface AssetEquipmentRemoval {
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
 
 