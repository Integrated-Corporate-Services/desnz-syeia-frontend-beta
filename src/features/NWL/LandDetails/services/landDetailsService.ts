import { LandDetails } from '../types';
import { mapBackendToFrontend, mapFrontendToBackend } from '../utils/landDetailsMapper';

const API_BASE_URL = '/backend/api/nwl';

export const landDetailsService = {
  async getLandDetails(applicationId: string): Promise<LandDetails | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/${applicationId}/land-details`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const backendData = await response.json();
      // Transform backend response to frontend structure
      return mapBackendToFrontend(backendData);
    } catch (error) {
      console.error('Error fetching land details:', error);
      return null;
    }
  },

  async saveLandDetails(applicationId: string, landDetails: Partial<LandDetails>): Promise<LandDetails | null> {
    try {
      // For POST, ensure ALL required fields are present with defaults
      const backendData = mapFrontendToBackend(landDetails, true);
      
      // Add application_id for POST
      backendData.application_id = applicationId;
      
      // Set defaults only for boolean fields that are required by database
      if (backendData.is_land_registered === undefined) {
        backendData.is_land_registered = false;
      }
      if (backendData.is_equipment_visible_from_public_road === undefined) {
        backendData.is_equipment_visible_from_public_road = false;
      }
      if (backendData.is_site_at_objector_address === undefined) {
        backendData.is_site_at_objector_address = false;
      }
      
      // Remove country and land_description if not provided by user
      // These should only be sent when user explicitly fills them
      if (!backendData.country) {
        delete backendData.country;
      }
      if (!backendData.land_description) {
        delete backendData.land_description;
      }
      
      const response = await fetch(`${API_BASE_URL}/land-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error creating land details:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      return mapBackendToFrontend(responseData);
    } catch (error) {
      console.error('Error saving land details:', error);
      throw error;
    }
  },

  async updateLandDetails(applicationId: string, landDetails: Partial<LandDetails>): Promise<LandDetails | null> {
    try {
      // Filter out empty values
      const filteredData = Object.entries(landDetails).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          (acc as any)[key] = value;
        }
        return acc;
      }, {} as Partial<LandDetails>);

      // If no valid fields after filtering, return current state
      if (Object.keys(filteredData).length === 0) {
        console.warn('No valid fields to update');
        return this.getLandDetails(applicationId);
      }

      // Use POST instead of PATCH - backend handles create-or-update
      // Backend's createLandDetails checks for existing record and updates if found
      return this.saveLandDetails(applicationId, filteredData);
    } catch (error) {
      console.error('Error updating land details:', error);
      throw error;
    }
  },

  async saveSiteAddress(
    applicationId: string,
    siteAddress: {
      site_address_line1: string;
      site_address_line2?: string;
      site_town: string;
      site_county?: string;
      site_postcode: string;
    }
  ): Promise<LandDetails | null> {
    return this.saveLandDetails(applicationId, siteAddress);
  },

  async saveCountry(
    applicationId: string,
    country: 'England' | 'Wales'
  ): Promise<LandDetails | null> {
    return this.saveLandDetails(applicationId, { site_country: country });
  },

  async saveLandRegistry(
    applicationId: string,
    landRegistry: {
      has_land_registry: boolean;
      land_registry_title_number?: string;
    }
  ): Promise<LandDetails | null> {
    return this.saveLandDetails(applicationId, landRegistry);
  },

  async saveOSGridReference(
    applicationId: string,
    osGridRef: {
      os_grid_reference_letter: string;
      os_grid_reference_easting: string;
      os_grid_reference_northing: string;
      what3words_address?: string;
    }
  ): Promise<LandDetails | null> {
    return this.saveLandDetails(applicationId, osGridRef);
  },

  async saveIdentifyingInformation(
    applicationId: string,
    identifyingInfo: {
      identifying_information: string;
      additional_land_description?: string;
    }
  ): Promise<LandDetails | null> {
    return this.saveLandDetails(applicationId, identifyingInfo);
  },
};
