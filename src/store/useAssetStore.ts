import { create } from 'zustand';
import { fetchAssetDetails, updateAsset as updateAssetService } from '../services/asset-service';
import { AssetRequest } from '../types/asset';

export interface AssetDetails {
  [x: string]: any;
  excavationWorks: any;
  assetId: string;
  assetReference: string;
  tori_noi?: string;
  standardSpecificationReferenceNumber: string;
  lineLength: number;
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
