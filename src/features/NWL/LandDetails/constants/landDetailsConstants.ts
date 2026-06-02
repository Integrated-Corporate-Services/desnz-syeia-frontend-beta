export const LAND_DETAILS_LABELS = {
  IS_SITE_ADDRESS_SAME_AS_OBJECTOR: {
    PAGE_TITLE: 'Is the site address the same as the objector\'s address?',
    YES: 'Yes',
    NO: 'No',
    OBJECTOR_ADDRESS_HEADING: 'Objector address',
  },
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
    QUESTION_PAGE_TITLE: 'Is the land registered with the Land Registry?',
    INFO_PAGE_TITLE: 'Land registry information',
    HAS_TITLE_NUMBER: 'Is the land registered with the Land Registry?',
    TITLE_NUMBER: 'Reference number',
    TITLE_NUMBER_HINT: 'Usually found on the land title or deeds',
    YES: 'Yes',
    NO: 'No',
    DOCUMENTS_UPLOADED: 'Documents uploaded',
    UPLOAD_SECTION_TITLE: 'Upload the Land Registry document',
    UPLOAD_HINT: 'You can upload .pdf, .jpg, .jpeg, .png, .msg, .doc, .docx, .xls, and .xlsx files of up to 25MB each. Files cannot be password protected.',
  },
  UNREGISTERED_LAND: {
    PAGE_TITLE: 'Unregistered land details',
    DESCRIPTION: 'Explain why the land is not registered and describe the status of the land',
    CHARACTER_LIMIT: 'You can enter up to 4,000 characters',
    DOCUMENTS_UPLOADED: 'Documents uploaded',
    UPLOAD_SECTION_TITLE: 'Upload any relevant documents',
    UPLOAD_HINT: 'You can upload .pdf, .jpg, .jpeg, .png, .msg, .doc, .docx, .xls, and .xlsx files of up to 25MB each. Files cannot be password protected.',
  },
  OS_GRID_REFERENCE: {
    PAGE_TITLE: 'Enter the OS Grid Reference',
    DESCRIPTION: 'Enter the site’s grid reference, which you can find on Ordnance Survey (OS) maps or at',
    LINK_TEXT: 'gridreferencefinder.com (opens in a new tab).',
    GRID_LETTER: 'Grid letter (optional)',
    EASTING: 'Easting (optional)',
    NORTHING: 'Northing (optional)',
  },
  IDENTIFYING_INFORMATION: {
    PAGE_TITLE: 'Identify the land',
    DESCRIPTION: 'Describe any features on or near the land that can help identify it such as roads, paths and geographical features. You can upload supporting documents on the next page',
    CHARACTER_LIMIT: 'You can enter up to 4,000 characters',
  },
  UPLOAD_SITE_INFORMATION: {
    PAGE_TITLE: 'Provide site information',
    DESCRIPTION: 'Please upload any site plans, images and photos to help identify the site and the assets.',
    SITE_VISIT_INFO: 'We encourage you to conduct site visits before submitting any application to confirm the assets are correctly listed and described.',
    DOCUMENTS_UPLOADED: 'Documents uploaded',
    UPLOAD_SECTION_TITLE: 'Upload site information documents (optional)',
    UPLOAD_HINT: 'You can upload .pdf, .jpg, .jpeg, .png, .msg, .doc, .docx, .xls, and .xlsx files of up to 25MB each. Files cannot be password protected.',
  },
  EQUIPMENT_VISIBILITY: {
    PAGE_TITLE: 'Can the equipment be seen from a public road?',
    YES: 'Yes',
    NO: 'No',
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
  HAS_LAND_REGISTRY_REQUIRED: 'Select whether the land is registered with the Land Registry',
  TITLE_NUMBER_REQUIRED: 'Enter the reference number',
  UNREGISTERED_LAND_REQUIRED: 'Enter details about why the land is not registered',
  IDENTIFYING_INFO_REQUIRED: 'Enter identifying information about the land',
  EQUIPMENT_VISIBILITY_REQUIRED: 'Select whether the equipment can be seen from a public road',
};

export const LAND_DETAILS_ROUTES = {
  IS_SITE_ADDRESS_SAME_AS_OBJECTOR: '/nwl/:applicationId/is-site-address-same-as-objector',
  SITE_ADDRESS: '/nwl/:applicationId/site-address',
  COUNTRY_SELECTION: '/nwl/:applicationId/land-country',
  LAND_REGISTRY: '/nwl/:applicationId/land-registry',
  UNREGISTERED_LAND: '/nwl/:applicationId/unregistered-land-details',
  OS_GRID_REFERENCE: '/nwl/:applicationId/os-grid-reference',
  IDENTIFYING_INFORMATION: '/nwl/:applicationId/identifying-information',
  UPLOAD_SITE_INFORMATION: '/nwl/:applicationId/upload-site-information',
  EQUIPMENT_VISIBILITY: '/nwl/:applicationId/equipment-visibility',
  TASK_LIST: '/nwl/:applicationId/task-list',
};

export const LAND_DETAILS_SUBCATEGORIES = {
  LAND_REGISTRY: 'LAND_REGISTRY',
  UNREGISTERED_LAND: 'UNREGISTERED_LAND',
  SITE_INFORMATION: 'SITE_INFORMATION',
};

export const buildLandDetailsRoute = (routeTemplate: string, applicationId: string | undefined): string => {
  if (!applicationId) {
    return routeTemplate;
  }
  return routeTemplate.replace(':applicationId', applicationId);
};

export const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
