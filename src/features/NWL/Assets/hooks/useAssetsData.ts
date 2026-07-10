import { useState, useEffect, useCallback } from 'react';
import { nwlAssetService } from '../services/nwlAssetService';
import { createLogger } from '../../../../utils/logger';
import { UploadedFile, ApplicationDocument } from '../../../../types/fileUpload';
import { AssetOutput } from '../services/nwlAssetService';

const logger = createLogger('useAssetsData');

export interface AssetsData {
  metadata_id?: string;
  assets_match_plan: boolean;
  assets_match_plan_explanation?: string | null;
  uploadedFiles: UploadedFile[];
  applicationDocuments: ApplicationDocument[];
  assets: AssetOutput[];
  metadata_version?: number;
}

/**
 * Hook to fetch and manage NWL assets data
 */
export const useAssetsData = (applicationId: string | undefined) => {
  const [assetsData, setAssetsData] = useState<AssetsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!applicationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      logger.debug('[useAssetsData] Fetching assets data', { applicationId });

      const data = await nwlAssetService.getAssetsByApplicationId(applicationId);

      logger.info('[useAssetsData] Assets data fetched successfully', {
        hasMetadata: !!data.metadata_id || !!data.assets_metadata_id,
        assetCount: data.assets?.length || 0,
        documentCount: data.application_plan_documents?.length || 0,
        uploadedFilesCount: data.uploadedFiles?.length || 0,
        applicationDocumentsCount: data.applicationDocuments?.length || 0,
      });

      logger.debug('[useAssetsData] Raw API response', {
        application_plan_documents: data.application_plan_documents,
        uploadedFiles: data.uploadedFiles,
        applicationDocuments: data.applicationDocuments,
      });

      // Normalize the response
      const normalizedData: AssetsData = {
        metadata_id: data.metadata_id || data.assets_metadata_id,
        assets_match_plan: data.assets_match_plan,
        assets_match_plan_explanation: data.assets_match_plan_explanation,
        uploadedFiles: data.uploadedFiles || [],
        applicationDocuments: data.applicationDocuments || [],
        assets: data.assets || [],
        metadata_version: data.metadata_version || 1,
      };

      setAssetsData(normalizedData);
    } catch (err) {
      logger.error('[useAssetsData] Error fetching assets data', { error: err });
      setError(err instanceof Error ? err.message : 'Failed to fetch assets data');
      // Set empty data structure on error
      setAssetsData({
        assets_match_plan: false,
        uploadedFiles: [],
        applicationDocuments: [],
        assets: [],
      });
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    assetsData,
    loading,
    error,
    refetch: fetchData,
  };
};
