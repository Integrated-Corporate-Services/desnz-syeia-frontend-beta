import { useState, useCallback } from 'react';
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

export function useAssets() {
  const [assets, setAssets] = useState<AssetDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async (applicationId: string) => {
    setLoading(true);
    setError(null);
    setAssets([]);
    try {
      const data = await fetchAssetDetails(applicationId);
      setAssets(data.assets || []);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAsset = useCallback(async (payload: AssetRequest) => {
    setLoading(true);
    setError(null);
    try {
      await updateAssetService(payload);
      // Optionally re-fetch assets after update
      if (payload.applicationId) {
        const data = await fetchAssetDetails(payload.applicationId);
        setAssets(data.assets || []);
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    assets,
    loading,
    error,
    fetchAssets,
    updateAsset,
  };
}
