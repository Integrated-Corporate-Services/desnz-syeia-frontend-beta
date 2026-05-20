/**
 * NWL Asset Service
 * Handles all API calls for NWL Assets feature
 */

import axios from 'axios';
import { createLogger } from '../../../../utils/logger';
import { UploadedFile, ApplicationDocument } from '../../../../types/fileUpload';

const logger = createLogger('nwlAssetService');
const API_BASE = '/backend/api/nwl';

// Types
export interface CreateAssetsPayload {
  application_id: string;
  assets: AssetInput[];
  assets_match_plan: boolean;
  assets_match_plan_explanation?: string;
  application_plan_document_ids?: string[];
  plan_verification_document_ids?: string[];
}

export interface AssetInput {
  line_voltage: string;
  line_types: string[];
  component_descriptions: Record<string, string>;
}

export interface AssetOutput {
  asset_id: string;
  line_voltage: string;
  line_types: string[];
  component_descriptions: Record<string, string>;
  created_at: string;
}

export interface AssetsResponse {
  assets_metadata_id: string;
  application_id: string;
  assets: AssetOutput[];
  assets_match_plan: boolean;
  assets_match_plan_explanation?: string | null;
  application_plan_documents?: any[];
  plan_verification_documents?: any[];
  uploadedFiles?: UploadedFile[];
  applicationDocuments?: ApplicationDocument[];
  created_at: string;
  updated_at: string;
  metadata_id?: string;
}

/**
 * NWL Asset Service
 */
export const nwlAssetService = {
  /**
   * Create assets (bulk operation)
   */
  createAssets: async (payload: CreateAssetsPayload): Promise<AssetsResponse> => {
    try {
      logger.debug('[createAssets] Creating assets', { 
        application_id: payload.application_id,
        asset_count: payload.assets.length 
      });
      
      const response = await axios.post(`${API_BASE}/assets`, payload);
      
      logger.info('[createAssets] Assets created successfully', {
        metadata_id: response.data.assets_metadata_id,
        asset_count: response.data.assets.length
      });
      
      return response.data;
    } catch (error: any) {
      logger.error('[createAssets] Error creating assets', {
        error: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  /**
   * Get all assets for an application
   */
  getAssetsByApplicationId: async (applicationId: string): Promise<AssetsResponse> => {
    try {
      logger.debug('[getAssetsByApplicationId] Fetching assets', { applicationId });
      
      const response = await axios.get(`${API_BASE}/${applicationId}/assets`);
      
      logger.info('[getAssetsByApplicationId] Assets fetched successfully', {
        asset_count: response.data.assets?.length || 0,
        document_count: response.data.application_plan_documents?.length || 0,
      });
      
      // Transform documents to match frontend format
      const uploadedFiles = (response.data.application_plan_documents || []).map((doc: any) => ({
        id: doc.file_id,
        storageProvider: doc.storage_provider || 'aws_s3',
        s3Key: doc.s3_key,
        bucketName: doc.bucket_name,
        virtualFolder: doc.s3_key?.split('/').slice(0, -1).join('/') || '',
        filename: doc.filename,
        fileContentType: doc.file_content_type,
        fileSizeBytes: doc.file_size_bytes,
        uploadedAtTimestamp: doc.uploaded_at_timestamp || doc.added_at,
      }));

      const applicationDocuments = (response.data.application_plan_documents || []).map((doc: any) => ({
        documentId: doc.document_id,
        applicationId: applicationId,
        fileId: doc.file_id,
        category: 'NWL_PLAN_INFO',
        title: doc.title || doc.filename,
        virtualFolder: doc.s3_key?.split('/').slice(0, -1).join('/') || '',
        addedBy: response.data.created_by || '',
        addedAt: doc.added_at,
      }));

      return {
        ...response.data,
        metadata_id: response.data.metadata_id || response.data.assets_metadata_id,
        uploadedFiles,
        applicationDocuments,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        logger.debug('[getAssetsByApplicationId] No assets found', { applicationId });
        return {
          assets_metadata_id: '',
          application_id: applicationId,
          assets: [],
          assets_match_plan: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          uploadedFiles: [],
          applicationDocuments: [],
        };
      }
      
      logger.error('[getAssetsByApplicationId] Error fetching assets', {
        error: error instanceof Error ? error.message : 'Unknown error',
        applicationId
      });
      throw error;
    }
  },

  /**
   * Get single asset by ID
   */
  getAssetById: async (assetId: string): Promise<AssetOutput> => {
    try {
      logger.debug('[getAssetById] Fetching asset', { assetId });
      
      const response = await axios.get(`${API_BASE}/assets/${assetId}`);
      
      logger.info('[getAssetById] Asset fetched successfully', { assetId });
      
      return response.data;
    } catch (error: any) {
      logger.error('[getAssetById] Error fetching asset', {
        error: error.message,
        assetId
      });
      throw error;
    }
  },

  /**
   * Update single asset
   */
  updateAsset: async (
    assetId: string,
    payload: Partial<AssetInput>
  ): Promise<AssetOutput> => {
    try {
      logger.debug('[updateAsset] Updating asset', { assetId, payload });
      
      const response = await axios.put(`${API_BASE}/assets/${assetId}`, payload);
      
      logger.info('[updateAsset] Asset updated successfully', { assetId });
      
      return response.data;
    } catch (error: any) {
      logger.error('[updateAsset] Error updating asset', {
        error: error.message,
        assetId
      });
      throw error;
    }
  },

  /**
   * Delete single asset
   */
  deleteAsset: async (assetId: string): Promise<void> => {
    try {
      logger.debug('[deleteAsset] Deleting asset', { assetId });
      
      await axios.delete(`${API_BASE}/assets/${assetId}`);
      
      logger.info('[deleteAsset] Asset deleted successfully', { assetId });
    } catch (error: any) {
      logger.error('[deleteAsset] Error deleting asset', {
        error: error.message,
        assetId
      });
      throw error;
    }
  },

  /**
   * Update metadata only (assets match plan)
   */
  updateMetadata: async (
    applicationId: string,
    assetsMatchPlan: boolean,
    explanation?: string
  ): Promise<void> => {
    try {
      logger.debug('[updateMetadata] Updating metadata', {
        applicationId,
        assetsMatchPlan
      });
      
      await axios.patch(`${API_BASE}/${applicationId}/assets/metadata`, {
        assets_match_plan: assetsMatchPlan,
        assets_match_plan_explanation: explanation,
      });
      
      logger.info('[updateMetadata] Metadata updated successfully');
    } catch (error: any) {
      logger.error('[updateMetadata] Error updating metadata', {
        error: error.message,
        applicationId
      });
      throw error;
    }
  },

  /**
   * Save application plan documents (file metadata)
   * This saves the uploaded files metadata to the database
   */
  saveApplicationPlanDocuments: async (
    applicationId: string,
    uploadedFiles: UploadedFile[],
    applicationDocuments: ApplicationDocument[]
  ): Promise<void> => {
    try {
      logger.debug('[saveApplicationPlanDocuments] Saving documents', {
        applicationId,
        uploadedFilesCount: uploadedFiles.length,
        documentsCount: applicationDocuments.length,
      });

      // Create empty assets to trigger file processing
      // The backend will only process files, not create actual assets
      await axios.post(`${API_BASE}/assets`, {
        application_id: applicationId,
        assets: [], // Empty array - no assets to create yet
        assets_match_plan: false, // Default value
        uploaded_files: uploadedFiles,
        application_documents: applicationDocuments,
      });

      logger.info('[saveApplicationPlanDocuments] Documents saved successfully');
    } catch (error) {
      logger.error('[saveApplicationPlanDocuments] Error saving documents', {
        error: error instanceof Error ? error.message : 'Unknown error',
        applicationId,
      });
      throw error;
    }
  },
};

export default nwlAssetService;
