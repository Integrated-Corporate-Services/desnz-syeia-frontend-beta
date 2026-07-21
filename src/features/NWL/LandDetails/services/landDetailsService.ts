import { LandDetails } from '../types';
import { mapBackendToFrontend, mapFrontendToBackend } from '../utils/landDetailsMapper';
import logger from '../../../../logger';
import { getCsrfHeaders } from '../../../../utils/csrf';

import { buildBackendUrl } from '../../../../utils/apiConfig';

const API_BASE_URL = buildBackendUrl('/api/nwl');

export const landDetailsService = {
  async getLandDetails(applicationId: string): Promise<LandDetails | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/${applicationId}/land-details`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const backendData = await response.json();
      logger.debug('Raw land-details response', backendData);
      // Transform backend response to frontend structure
      const mapped = mapBackendToFrontend(backendData);
      logger.debug('Mapped land-details (frontend)', mapped);
      return mapped;
    } catch (error) {
      logger.error('Error fetching land details:', error);
      return null;
    }
  },

  async saveLandDetails(applicationId: string, landDetails: Partial<LandDetails>): Promise<LandDetails | null> {
    try {
      // For POST, ensure ALL required fields are present with defaults
      const backendData = mapFrontendToBackend(landDetails, true);
      
      // Add application_id for POST
      backendData.application_id = applicationId;
      
      // Default is_site_at_objector_address to false if not provided
      if (backendData.is_site_at_objector_address === undefined) {
        backendData.is_site_at_objector_address = false;
      }
      
      // Do NOT set defaults for user-facing boolean fields
      // Leave them as undefined/null until user explicitly selects an option
      // This prevents pre-selecting radio buttons on form pages
      
      const response = await fetch(`${API_BASE_URL}/land-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getCsrfHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        logger.error('Error creating land details:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      return mapBackendToFrontend(responseData);
    } catch (error) {
      logger.error('Error saving land details:', error);
      throw error;
    }
  },

  async updateLandDetails(applicationId: string, landDetails: Partial<LandDetails>): Promise<LandDetails | null> {
    try {
      // Check if record exists first to determine POST vs PATCH
      const existingRecord = await this.getLandDetails(applicationId);
      
      if (!existingRecord) {
        // No record exists - use POST to create
        logger.info('No existing land details found, creating new record');
        return this.saveLandDetails(applicationId, landDetails);
      }
      
      // Record exists - use PATCH to update
      // Don't filter out empty values for updates - allow clearing fields
      const backendData = mapFrontendToBackend(landDetails, false);

      // If no valid fields after mapping, return current state
      if (Object.keys(backendData).length === 0) {
        logger.warn('No valid fields to update');
        return this.getLandDetails(applicationId);
      }

      // Use PATCH for updates - backend has dedicated update endpoint
      const response = await fetch(`${API_BASE_URL}/${applicationId}/land-details`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getCsrfHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        logger.error('Error updating land details:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      return mapBackendToFrontend(responseData);
    } catch (error) {
      logger.error('Error updating land details:', error);
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
