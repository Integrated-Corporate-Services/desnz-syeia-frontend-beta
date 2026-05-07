export const LAND_DETAILS_LABELS = {
  SITE_ADDRESS: {
    PAGE_TITLE: 'Enter the site address',
    ADDRESS_LINE1: 'Address line 1',
    ADDRESS_LINE2: 'Address line 2 (optional)',
    TOWN: 'Town or city',
    COUNTY: 'County (optional)',
    POSTCODE: 'Postcode',
  },
  COUNTRY_SELECTION: {
    PAGE_TITLE: 'Which country is the land in?',
    ENGLAND: 'England',
    WALES: 'Wales',
  },
  LAND_REGISTRY: {
    PAGE_TITLE: 'Land registry',
    HAS_TITLE_NUMBER: 'Do you have a land registry title number?',
    TITLE_NUMBER: 'Title number',
    YES: 'Yes',
    NO: 'No',
  },
  OS_GRID_REFERENCE: {
    PAGE_TITLE: 'OS Grid reference',
    GRID_LETTER: 'Grid letter',
    EASTING: 'Easting',
    NORTHING: 'Northing',
    WHAT3WORDS: 'what3words address (optional)',
  },
  IDENTIFYING_INFORMATION: {
    PAGE_TITLE: 'Identifying information',
    MAIN_QUESTION: 'Provide any identifying information about the land',
    ADDITIONAL_DESCRIPTION: 'Additional description (optional)',
  },
  BUTTONS: {
    SAVE_CONTINUE: 'Save and continue',
    BACK: 'Back',
  },
};

export const LAND_DETAILS_VALIDATION = {
  ADDRESS_LINE1_REQUIRED: 'Enter address line 1',
  TOWN_REQUIRED: 'Enter town or city',
  POSTCODE_REQUIRED: 'Enter postcode',
  POSTCODE_INVALID: 'Enter a valid UK postcode',
  COUNTRY_REQUIRED: 'Select which country the land is in',
  TITLE_NUMBER_REQUIRED: 'Enter the land registry title number',
  GRID_LETTER_REQUIRED: 'Enter the grid letter',
  EASTING_REQUIRED: 'Enter the easting',
  NORTHING_REQUIRED: 'Enter the northing',
  EASTING_INVALID: 'Easting must be a 5 or 6 digit number',
  NORTHING_INVALID: 'Northing must be a 5 or 6 digit number',
  IDENTIFYING_INFO_REQUIRED: 'Enter identifying information about the land',
};

export const LAND_DETAILS_ROUTES = {
  SITE_ADDRESS: '/nwl/:applicationId/site-address',
  COUNTRY_SELECTION: '/nwl/:applicationId/land-country',
  LAND_REGISTRY: '/nwl/:applicationId/land-registry',
  OS_GRID_REFERENCE: '/nwl/:applicationId/os-grid-reference',
  IDENTIFYING_INFORMATION: '/nwl/:applicationId/identifying-information',
  TASK_LIST: '/nwl/:applicationId/task-list',
};

export const buildLandDetailsRoute = (routeTemplate: string, applicationId: string | undefined): string => {
  if (!applicationId) {
    return routeTemplate;
  }
  return routeTemplate.replace(':applicationId', applicationId);
};

export const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
