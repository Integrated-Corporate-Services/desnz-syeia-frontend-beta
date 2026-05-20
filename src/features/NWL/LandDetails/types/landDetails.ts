import { UploadedFile, ApplicationDocument } from '../../../../types/fileUpload';

export type LandDetails = {
  // Flat structure matching backend FlatLandDetailsResponse
  land_details_id?: string;
  application_id?: string;
  
  // Site Address
  is_site_at_objector_address?: boolean;
  site_address_line1?: string;
  site_address_line2?: string;
  site_town?: string;
  site_county?: string;
  site_postcode?: string;
  
  // Country
  country?: string;
  site_country?: string; // Legacy field for frontend compatibility
  
  // Land Registry
  is_land_registered?: boolean;
  land_registry_title_number?: string;
  land_ownership_unknown_reason?: string;
  has_land_registry?: boolean; // Legacy field for frontend compatibility
  unregistered_land_explanation?: string; // Legacy field
  
  // OS Grid Reference
  os_grid_letter?: string;
  os_grid_easting?: string;
  os_grid_northing?: string;
  os_grid_reference_letter?: string; // Legacy field for frontend compatibility
  os_grid_reference_easting?: string; // Legacy field
  os_grid_reference_northing?: string; // Legacy field
  what3words_address?: string;
  
  // Identifying Information
  land_description?: string;
  is_equipment_visible_from_public_road?: boolean;
  identifying_information?: string; // Legacy field for frontend compatibility
  additional_land_description?: string; // Legacy field
  equipment_visible_from_public_road?: boolean; // Legacy field
  
  // Documents
  uploadedFiles?: UploadedFile[];
  applicationDocuments?: ApplicationDocument[];
  
  // Metadata
  created_at?: string;
  updated_at?: string;
};

export type SiteAddressFormData = {
  addressLine1: string;
  addressLine2: string;
  town: string;
  county: string;
  postcode: string;
};

export type CountrySelectionData = {
  country: 'England' | 'Wales' | '';
};

export type LandRegistryData = {
  hasLandRegistry: boolean;
  titleNumber?: string;
};

export type UnregisteredLandData = {
  explanation: string;
};

export type OSGridReferenceData = {
  gridLetter: string;
  easting: string;
  northing: string;
  what3words?: string;
};

export type IdentifyingInformationData = {
  identifyingInfo: string;
  additionalDescription?: string;
};

export type EquipmentVisibilityData = {
  isVisibleFromPublicRoad: boolean;
};
