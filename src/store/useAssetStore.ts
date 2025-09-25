import { create } from 'zustand';
import { fetchAssetDetails, updateAsset as updateAssetService } from '../services/asset-service';
import { AssetRequest } from '../types/asset';

export interface AssetDetails {
  assetId: string;
  assetReference: string;
  description: string;
  standardSpecificationReferenceNumber: string;
  lineLength: number;
  poles: {
    workItemId: string;
    hasAddOrReplace: boolean;
    add: number;
    replace: number;
    description: string;
  };
  overheadLines: {
    workItemId: string;
    hasAddOrReplace: boolean;
    description: string;
  };
  equipmentRemoval: {
    workItemId: string;
    isRemoving: boolean;
    description: string;
  };
  isExistingAsset: boolean;
  generalComments: string;
  lineVoltage: string;
  typeOfLine: string;
}

interface AssetStoreState {
  assets: AssetDetails[];
  loading: boolean;
  error: string | null;
  fetchAssets: (applicationId: string) => Promise<void>;
  updateAsset: (payload: any) => Promise<void>;
}

export const useAssetStore = create<AssetStoreState>((set) => {
  return {
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
    updateAsset: async (payload: AssetRequest) => {
      set({ loading: true, error: null });
      try {
        await updateAssetService(payload);
        // Optionally re-fetch assets after update
        if (payload.applicationId) {
          const data = await fetchAssetDetails(payload.applicationId);
          set({ assets: data.assets || [], loading: false });
        } else {
          set({ loading: false });
        }
      } catch (err: any) {
        set({ error: err.message || 'Unknown error', loading: false });
      }
    },
  };
});
