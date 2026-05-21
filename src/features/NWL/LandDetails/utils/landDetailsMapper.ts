/**
 * Land Details Mapper
 * Transforms between backend API response and frontend form structure
 */

import { LandDetails } from '../types';

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
    
    // Documents
    uploadedFiles: [],
    applicationDocuments: [
      ...(backendData.land_registry_documents || []),
      ...(backendData.site_information_documents || [])
    ],
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
  }

  return backendData;
};
