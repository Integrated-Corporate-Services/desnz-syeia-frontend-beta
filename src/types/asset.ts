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
  standardSpecificationReferenceNumber: string;
  typeOfLine: string;
  tori_noi?: string;
  lineVoltage: string;
  lineLength: number;
  assetReference?: string;
  description?: string;
  poles?: AssetPoles;
  overheadLines?: AssetOverheadLines;
  equipmentRemoval?: AssetEquipmentRemoval;
  isExistingAsset?: boolean;
  generalComments?: string;
}
 
export interface AssetRequest {
  applicationId: string;
  assets: Asset[];
}
 
 