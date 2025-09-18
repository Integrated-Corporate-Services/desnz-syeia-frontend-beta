import { create } from 'zustand';
import { fetchAssetDetails } from '../services/asset-service';

export interface AssetDetails {
  assetId: string;
  assetReference: string;
  description: string;
  standardSpecificationReferenceNumber: string;
  lineLength: number;
  poles: {
    hasAddOrReplace: boolean;
    add: number;
    replace: number;
    description: string;
  };
  overheadLines: {
    hasAddOrReplace: boolean;
    description: string;
  };
  equipmentRemoval: {
    isRemoving: boolean;
    description: string;
  };
  isExistingAsset: boolean;
  generalComments: string;
  lineVoltage: string;
  lineType: string;
}

interface AssetStoreState {
  assets: AssetDetails[];
  loading: boolean;
  error: string | null;
  fetchAssets: (applicationId: string) => Promise<void>;
}

export const useAssetStore = create<AssetStoreState>((set) => ({
  assets: [],
  loading: false,
  error: null,
  fetchAssets: async (applicationId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchAssetDetails(applicationId);
      set({ assets: data.assets || [], loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
}));
