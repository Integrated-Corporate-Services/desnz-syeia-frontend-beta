export type LandDetails = {
  site_address_line1?: string;
  site_address_line2?: string;
  site_town?: string;
  site_county?: string;
  site_postcode?: string;
  site_country?: 'England' | 'Wales' | '';
  
  land_registry_title_number?: string;
  has_land_registry?: boolean;
  
  os_grid_reference_letter?: string;
  os_grid_reference_easting?: string;
  os_grid_reference_northing?: string;
  what3words_address?: string;
  
  identifying_information?: string;
  additional_land_description?: string;
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
