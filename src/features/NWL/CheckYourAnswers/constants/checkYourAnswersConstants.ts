/**
 * Check Your Answers Constants
 * All text, labels, and routes for NWL Check Your Answers page
 */

export const CHECK_YOUR_ANSWERS_CONSTANTS = {
    PAGE_TITLE: 'Check your answers before sending your application',
    HEADING: 'Check your answers before sending your application',
    LOADING: 'Loading...',

    // Breadcrumbs
    BREADCRUMBS: {
        TASK_LIST: 'Task list',
        CHECK_YOUR_ANSWERS: 'Check your answers',
    },

    // Section headings
    SECTION_HEADINGS: {
        APPLICANT_DETAILS: 'Applicant details',
        APPLICATION_DETAILS: 'Application details',
        OWNER_OCCUPIER_DETAILS: 'Objector details',
        LAND_DETAILS: 'Land details',
        ASSETS: 'Assets',
        NEGOTIATIONS: 'Negotiations',
        ADDITIONAL_INFORMATION: 'Additional information',
        DECLARATION: 'Declaration',
        PAY_AND_SUBMIT: 'Pay and submit this application',
    },

    // Card titles
    CARD_TITLES: {
        APPLICANT_DETAILS: 'Applicant details',
        APPLICATION_DETAILS: 'Application details',
        NOTICE_COMPLIANCE: 'Notice and compliance',
        OCCUPIER_DETAILS: 'Objector details',
        LANDOWNER_DETAILS: 'Landowner details',
        REPRESENTATIVE_DETAILS: 'Representative details',
        SITE_ADDRESS: 'Site address',
        LAND_LOCATION: 'Land location',
        ASSET: 'Asset',
        NEGOTIATIONS: 'Existing negotiations',
        ADDITIONAL_INFORMATION: 'Additional information',
        TREES_AND_VEGETATION: 'Trees and vegetation',
    },

    // Field labels - Applicant Details
    APPLICANT_FIELDS: {
        APPLICANT_NAME: 'Applicant name',
        CONTACT_NAME: 'Applicant contact name',
        ADDRESS: 'Address',
        EMAIL: 'Email address',
        PHONE: 'Phone number',
        ADDITIONAL_CONTACTS: 'Additional contacts',
    },

    // Field labels - Application Details
    APPLICATION_FIELDS: {
        APPLICATION_TYPE: 'Application type',
        PARAGRAPH: 'Paragraph',
        OFFER_DATE: 'Date of your offer or letter to the owner or occupier',
        OFFER_DOCUMENT: 'Upload a copy of the offer or letter',
        NOTICE_DATE: 'Date of the Notice to Remove',
        NOTICE_DOCUMENTS: 'Documents relating to the Notice to Remove',
    },

    // Field labels - Notice and Compliance
    NOTICE_FIELDS: {
        CLEARLY_REFERS: 'Notice to Remove clearly refer to the removal of the electric line',
        UNCLEAR_EXPLANATION: 'Explain why you consider the Notice to Remove to be unclear',
        WITHIN_THREE_MONTHS: 'Is your application being submitted within three months of the Notice to Remove?',
        LATE_REASON: 'Why is your application being submitted more than 3 months after the Notice to Remove?',
        DIFFERENT_TERM: 'Do you want a different term granted for this necessary wayleave?',
        DIFFERENT_TERM_EXPLANATION: 'Tell us what term you would like granted and explain why 15 years are not suitable.',
    },

    // Field labels - Occupier (Objector) Details
    OCCUPIER_FIELDS: {
        TITLE: 'Title',
        NAME: 'Full name',
        ORGANISATION: 'Organisation',
        ADDRESS: 'Address',
        EMAIL: 'Email address',
        PHONE: 'Phone number',
    },

    // Field labels - Landowner Details
    LANDOWNER_FIELDS: {
        IS_ALSO_LANDOWNER: 'Is the objector also the landowner?',
        TITLE: 'Title',
        NAME: 'Full name',
        ORGANISATION: 'Organisation',
        ADDRESS: 'Address',
        EMAIL: 'Email address',
        PHONE: 'Phone number',
    },

    // Field labels - Representative Details
    REPRESENTATIVE_FIELDS: {
        HAS_REPRESENTATIVE: 'Is there an objector representative?',
        TITLE: 'Title',
        NAME: 'Full name',
        ORGANISATION: 'Organisation',
        ADDRESS: 'Address',
        EMAIL: 'Email address',
        PHONE: 'Phone number',
    },

    // Field labels - Site Address
    SITE_ADDRESS_FIELDS: {
        SAME_AS_OCCUPIER: "Site address same as occupier's?",
        SITE_ADDRESS: 'Site address',
    },

    // Field labels - Land Location
    LAND_LOCATION_FIELDS: {
        COUNTRY: 'Land location',
        IS_REGISTERED: 'Registered with Land Registry?',
        REGISTRY_REF: 'Land Registry reference',
        REGISTRY_DOC: 'Land Registry document',
        OS_GRID_REF: 'OS Grid Reference',
        LAND_IDENTIFICATION: 'Land identification',
        VISIBLE_FROM_ROAD: 'Visible from public road?',
        SITE_PHOTOS: 'Site Information Documents',
    },

    // Field labels - Assets
    ASSET_FIELDS: {
        LINE_VOLTAGE: 'Line voltage',
        LINE_TYPES: 'Line type(s)',
        COMMENTS: 'Comments',
    },

    // Field labels - Additional Information
    ADDITIONAL_INFO_FIELDS: {
        RELATED_APPLICATIONS: 'Related applications?',
        RELATED_DETAILS: 'Related application details',
        OTHER_INFORMATION: 'Other important information?',
        OTHER_DETAILS: 'Other information details',
        OTHER_DOCUMENTS: 'Other information documents',
    },

    // Routes for "Change" links
    ROUTES: {
        APPLICANT_DETAILS: (applicationId: string) => `/frontend/nwl/${applicationId}/applicant-details`,
        APPLICATION_DETAILS: (applicationId: string) => `/frontend/nwl/${applicationId}/type-of-use`,
        NOTICE_COMPLIANCE: (applicationId: string) => `/frontend/nwl/${applicationId}/notice-to-remove`,
        OCCUPIER_DETAILS: (applicationId: string) => `/frontend/nwl/${applicationId}/objector-details`,
        LANDOWNER_DETAILS: (applicationId: string) => `/frontend/nwl/${applicationId}/landowner-details`,
        REPRESENTATIVE_DETAILS: (applicationId: string) => `/frontend/nwl/${applicationId}/representative-details`,
        SITE_ADDRESS: (applicationId: string) => `/frontend/nwl/${applicationId}/site-address`,
        LAND_LOCATION: (applicationId: string) => `/frontend/nwl/${applicationId}/land-country`,
        ASSET: (applicationId: string) => `/frontend/nwl/${applicationId}/assets`,
        ADDITIONAL_INFO: (applicationId: string) => `/frontend/nwl/${applicationId}/related-applications`,
        NEGOTIATIONS: (applicationId: string) => `/frontend/nwl/${applicationId}/existing-negotiations`,
    },

    // Action text
    ACTIONS: {
        ADD: 'Add',
        CHANGE: 'Change',
    },

    // Default values
    DEFAULTS: {
        EMPTY: '',
    },

    // Declaration
    DECLARATION: {
        HEADING: 'Declaration',
        TEXT: "I confirm I've read and understood the information I've provided, and that it's accurate to the best of my knowledge.",
    },

    // Submit section
    SUBMIT: {
        HEADING: 'Pay and submit this application',
        DESCRIPTION: 'You need to make a payment to submit this application. You can review the payment details on the next page.',
        BUTTON_TEXT: 'Continue to payment',
        BUTTON_PROCESSING: 'Processing...',
        ALERT_CONFIRM: 'Please confirm the declaration',
    },

    // Error messages
    ERROR_MESSAGES: {
        FETCH_FAILED: 'Failed to load application data. Please try again.',
        SUBMIT_FAILED: 'Failed to submit application. Please try again.',
    },
};