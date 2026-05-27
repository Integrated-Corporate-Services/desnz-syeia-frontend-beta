/**
 * Land Details Mapper
 * Transforms between backend API response and frontend form structure
 */

import { LandDetails } from '../types';
import { LAND_DETAILS_SUBCATEGORIES } from '../constants';

export interface BackendLandDetailsResponse {
  land_details_id: string;
  application_id: string;
  is_site_at_objector_address: boolean;
  site_address?: {
    line1: string;
    line2?: string;
    town_city: string;
    county?: string;
    postcode: string;
  } | null;
  country: 'England' | 'Wales';
  is_land_registered: boolean;
  land_registry?: {
    reference_number: string;
  } | null;
  land_ownership_unknown_reason?: string | null;
  os_grid_reference?: {
    grid_letter: string;
    easting: string;
    northing: string;
  } | null;
  land_description: string;
  is_equipment_visible_from_public_road: boolean;
  land_registry_documents?: any[];
  site_information_documents?: any[];
  unregistered_land_documents?: any[];
  // Accept echo/patch shapes that use the *_application_documents naming
  land_registry_application_documents?: any[];
  site_information_application_documents?: any[];
  unregistered_land_application_documents?: any[];
  created_at: string;
  updated_at: string;
}

/**
 * Map backend response to frontend form structure
 */
export const mapBackendToFrontend = (backendData: BackendLandDetailsResponse): LandDetails => {
  // Capitalize country for frontend display
  const capitalizeCountry = (country: string | null): 'England' | 'Wales' | '' => {
    if (!country) return '';
    const normalized = country.toLowerCase();
    if (normalized === 'england') return 'England';
    if (normalized === 'wales') return 'Wales';
    return '';
  };

  const fileMap: Record<string, any> = {};
  const allDocuments: any[] = [];
  
  const processCategory = (docs: any[], subCategory: string) => {
    (docs || []).forEach((doc: any) => {
      const fileId = doc.file_id || doc.fileId || doc.id;
      const documentId = doc.document_id || doc.documentId || doc.id;
      const fileUrlOrS3Key = doc.fileUrl || doc.file_url || doc.s3_key || doc.s3Key || '';
      if (!fileId) return;

      if (!fileMap[fileId]) {
        fileMap[fileId] = {
          id: fileId,
          storageProvider: 'AWS_S3',
          s3Key: fileUrlOrS3Key, 
          bucketName: '',
          virtualFolder: fileUrlOrS3Key.split('/').slice(0, -1).join('/'),
          filename: doc.filename || doc.title || '',
          fileContentType: doc.file_content_type || doc.fileContentType || '',
          fileSizeBytes: parseInt(doc.file_size || doc.file_size_bytes || '0', 10),
          uploadedAtTimestamp: doc.uploaded_at || doc.added_at || doc.uploadedAtTimestamp || '',
        };
      }
      
      allDocuments.push({
        documentId: documentId,
        applicationId: backendData.application_id,
        fileId: fileId,
        category: subCategory,
        subCategory: subCategory,
        title: doc.filename || doc.title || '',
        virtualFolder: fileUrlOrS3Key.split('/').slice(0, -1).join('/'),
        addedBy: doc.added_by || doc.addedBy || '',
        addedAt: doc.uploaded_at || doc.added_at || doc.addedAt || '',
        description: doc.description || '',
      });
    });
  };

  processCategory(backendData.land_registry_documents || [], LAND_DETAILS_SUBCATEGORIES.LAND_REGISTRY);
  processCategory(backendData.unregistered_land_documents || [], LAND_DETAILS_SUBCATEGORIES.UNREGISTERED_LAND);
  processCategory(backendData.site_information_documents || [], LAND_DETAILS_SUBCATEGORIES.SITE_INFORMATION);
  
  const alternativeFormatDocuments = [
    ...(backendData.land_registry_application_documents || []),
    ...(backendData.site_information_application_documents || []),
    ...(backendData.unregistered_land_application_documents || []),
  ];
  
  alternativeFormatDocuments.forEach((d: any) => {
    const fileId = d.file_id || d.fileId || d.document_id || d.documentId;
    if (!fileId) return;
    const rawSub = d.subcategory || d.subCategory || d.sub_category || '';
    const normalizedSub = (rawSub || '').toString().toUpperCase();
    
    if (!fileMap[fileId]) {
      const s3Key = d.s3_key || d.s3Key || '';
      fileMap[fileId] = {
        id: fileId,
        storageProvider: 'AWS_S3',
        s3Key: s3Key,
        bucketName: '',
        virtualFolder: s3Key.split('/').slice(0, -1).join('/'),
        filename: d.filename || d.title || '',
        fileContentType: d.file_content_type || d.fileContentType || '',
        fileSizeBytes: parseInt(d.file_size_bytes || d.file_size || '0', 10),
        uploadedAtTimestamp: d.added_at || d.uploaded_at || '',
      };
    }
    
    allDocuments.push({
      documentId: d.document_id || d.documentId || fileId,
      applicationId: d.application_id || d.applicationId || backendData.application_id,
      fileId: fileId,
      category: d.category || '',
      subCategory: normalizedSub,
      title: d.filename || d.title || '',
      virtualFolder: (d.s3_key || d.s3Key || '').split('/').slice(0, -1).join('/'),
      addedBy: d.added_by || d.addedBy || '',
      addedAt: d.added_at || d.addedAt || '',
      description: d.description || '',
    });
  });

  const uploadedFilesArr = Object.values(fileMap);

  return {
    // Site address fields
    site_address_line1: backendData.site_address?.line1 || '',
    site_address_line2: backendData.site_address?.line2 || '',
    site_town: backendData.site_address?.town_city || '',
    site_county: backendData.site_address?.county || '',
    site_postcode: backendData.site_address?.postcode || '',
    site_country: capitalizeCountry(backendData.country),
    
    // Land registry fields
    land_registry_title_number: backendData.land_registry?.reference_number || '',
    has_land_registry: backendData.is_land_registered,
    unregistered_land_explanation: backendData.land_ownership_unknown_reason || '',
    
    // OS Grid Reference fields
    os_grid_reference_letter: backendData.os_grid_reference?.grid_letter || '',
    os_grid_reference_easting: backendData.os_grid_reference?.easting || '',
    os_grid_reference_northing: backendData.os_grid_reference?.northing || '',
    
    // Other fields
    identifying_information: backendData.land_description || '',
    equipment_visible_from_public_road: backendData.is_equipment_visible_from_public_road,
    
    uploadedFiles: uploadedFilesArr,
    applicationDocuments: allDocuments,
  };
};

/**
 * Map frontend form data to backend request structure
 * Supports both POST (nested) and PATCH (flat) formats
 */
export const mapFrontendToBackend = (frontendData: Partial<LandDetails>, isCreate: boolean = false): any => {
  const backendData: any = {};

  // For POST (create), use nested structure
  if (isCreate) {
    // Country (required for POST)
    if (frontendData.site_country !== undefined) {
      backendData.country = frontendData.site_country;
    }

    // Site address (nested object for POST)
    if (
      frontendData.site_address_line1 ||
      frontendData.site_town ||
      frontendData.site_postcode
    ) {
      backendData.site_address = {
        line1: frontendData.site_address_line1 || '',
        line2: frontendData.site_address_line2 || '',
        town_city: frontendData.site_town || '',
        county: frontendData.site_county || '',
        postcode: frontendData.site_postcode || '',
      };
    }

    // Land registry (nested object for POST)
    if (frontendData.has_land_registry !== undefined) {
      backendData.is_land_registered = frontendData.has_land_registry;
      
      if (frontendData.has_land_registry && frontendData.land_registry_title_number) {
        backendData.land_registry = {
          reference_number: frontendData.land_registry_title_number,
        };
      }
    }

    // OS Grid Reference (nested object for POST)
    if (
      frontendData.os_grid_reference_letter ||
      frontendData.os_grid_reference_easting ||
      frontendData.os_grid_reference_northing
    ) {
      backendData.os_grid_reference = {
        grid_letter: frontendData.os_grid_reference_letter || '',
        easting: frontendData.os_grid_reference_easting || '',
        northing: frontendData.os_grid_reference_northing || '',
      };
    }

    // Required fields for POST
    if (frontendData.identifying_information !== undefined) {
      backendData.land_description = frontendData.identifying_information;
    }
    if (frontendData.equipment_visible_from_public_road !== undefined) {
      backendData.is_equipment_visible_from_public_road = frontendData.equipment_visible_from_public_road;
    }

    // Default is_site_at_objector_address to false if not provided
    backendData.is_site_at_objector_address = false;

  } else {
    // For PATCH (update), use flat structure with correct field names
    
    // Site address (flat fields for PATCH)
    if (frontendData.site_address_line1 !== undefined) {
      backendData.site_address_line1 = frontendData.site_address_line1;
    }
    if (frontendData.site_address_line2 !== undefined) {
      backendData.site_address_line2 = frontendData.site_address_line2;
    }
    if (frontendData.site_town !== undefined) {
      backendData.site_town = frontendData.site_town;
    }
    if (frontendData.site_county !== undefined) {
      backendData.site_county = frontendData.site_county;
    }
    if (frontendData.site_postcode !== undefined) {
      backendData.site_postcode = frontendData.site_postcode;
    }

    // Country
    if (frontendData.site_country !== undefined) {
      backendData.country = frontendData.site_country;
    }

    // Land registry (flat fields for PATCH)
    if (frontendData.has_land_registry !== undefined) {
      backendData.is_land_registered = frontendData.has_land_registry;
    }
    if (frontendData.land_registry_title_number !== undefined) {
      backendData.land_registry_title_number = frontendData.land_registry_title_number;
    }
    if (frontendData.unregistered_land_explanation !== undefined) {
      backendData.land_ownership_unknown_reason = frontendData.unregistered_land_explanation;
    }

    // OS Grid Reference (flat fields with CORRECT names for PATCH)
    if (frontendData.os_grid_reference_letter !== undefined) {
      backendData.os_grid_letter = frontendData.os_grid_reference_letter;
    }
    if (frontendData.os_grid_reference_easting !== undefined) {
      backendData.os_grid_easting = frontendData.os_grid_reference_easting;
    }
    if (frontendData.os_grid_reference_northing !== undefined) {
      backendData.os_grid_northing = frontendData.os_grid_reference_northing;
    }

    // Other fields
    if (frontendData.identifying_information !== undefined) {
      backendData.land_description = frontendData.identifying_information;
    }
    if (frontendData.equipment_visible_from_public_road !== undefined) {
      backendData.is_equipment_visible_from_public_road = frontendData.equipment_visible_from_public_road;
    }
    // Map uploadedFiles and applicationDocuments into category-specific backend fields
    const uploadedFiles = (frontendData as any).uploadedFiles as any[] | undefined;
    const applicationDocuments = (frontendData as any).applicationDocuments as any[] | undefined;
    if (Array.isArray(applicationDocuments) && applicationDocuments.length > 0) {
      const landRegistryDocs = applicationDocuments.filter(d => (d.subCategory || d.sub_category || '').toString().toUpperCase() === LAND_DETAILS_SUBCATEGORIES.LAND_REGISTRY);
      const siteInfoDocs = applicationDocuments.filter(d => (d.subCategory || d.sub_category || '').toString().toUpperCase() === LAND_DETAILS_SUBCATEGORIES.SITE_INFORMATION);
      const unregisteredDocs = applicationDocuments.filter(d => (d.subCategory || d.sub_category || '').toString().toUpperCase() === LAND_DETAILS_SUBCATEGORIES.UNREGISTERED_LAND);

      if (landRegistryDocs.length > 0) {
        backendData.land_registry_application_documents = landRegistryDocs;
        if (Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
          backendData.land_registry_uploaded_files = uploadedFiles.filter(f => landRegistryDocs.some(d => (d.fileId || d.file_id) === f.id));
        }
      }

      if (siteInfoDocs.length > 0) {
        backendData.site_information_application_documents = siteInfoDocs;
        if (Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
          backendData.site_information_uploaded_files = uploadedFiles.filter(f => siteInfoDocs.some(d => (d.fileId || d.file_id) === f.id));
        }
      }

      if (unregisteredDocs.length > 0) {
        backendData.unregistered_land_application_documents = unregisteredDocs;
        if (Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
          backendData.unregistered_land_uploaded_files = uploadedFiles.filter(f => unregisteredDocs.some(d => (d.fileId || d.file_id) === f.id));
        }
      }
    } else if (Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
      // Fallback: if only uploadedFiles provided (no documents), assume they belong to land registry
      backendData.land_registry_uploaded_files = uploadedFiles;
    }
  }

  return backendData;
};