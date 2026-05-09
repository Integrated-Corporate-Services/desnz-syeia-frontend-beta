import { LandDetails } from '../types';

const API_BASE_URL = '/backend/api/nwl';

export const landDetailsService = {
  async getLandDetails(applicationId: string): Promise<LandDetails | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/${applicationId}/land-details`);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return null;
    }
  },

  async saveLandDetails(applicationId: string, landDetails: Partial<LandDetails>): Promise<LandDetails | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/${applicationId}/land-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(landDetails),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return null;
    }
  },

  async updateLandDetails(applicationId: string, landDetails: Partial<LandDetails>): Promise<LandDetails | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/${applicationId}/land-details`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(landDetails),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return null;
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
