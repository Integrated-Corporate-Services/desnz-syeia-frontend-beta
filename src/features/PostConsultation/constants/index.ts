export const POST_CONSULTATION_CONSTANTS = {
    PAGE_TITLE: 'Post consultation actions',
    BREADCRUMB_LABEL: 'Post consultation actions',
    LOADING_MESSAGE: 'Loading...',
    SAVE_SUCCESS_MESSAGE: 'Saved successfully!',
    ERROR_MISSING_APP_ID: 'Application ID is missing',
    ERROR_LOAD_FAILED: 'Failed to load existing data',
    ERROR_SAVE_FAILED: 'Failed to save consultation outcome',
    ERROR_LPA_SELECTION_REQUIRED: "Select 'Yes' or 'No'",
    ERROR_ACCEPT_CONDITIONS_REQUIRED: "Select 'Yes' or 'No'",
    ERROR_LPA_EXPLANATION_REQUIRED: 'Explain why you do not accept the LPA’s conditions',
    ERROR_CONSULTEES_RECOMMENDATIONS_SELECTION_REQUIRED: "Select 'Yes' or 'No'",
    ERROR_CONSULTEES_RECOMMENDATIONS_DETAILS_REQUIRED: 'Enter details of the recommendations or conditions requested by the consultees',
    ERROR_ACCEPT_CONSULTEES_RECOMMENDATIONS_REQUIRED: "Select 'Yes' or 'No'",
    ERROR_CONSULTEES_RECOMMENDATIONS_REASON_REQUIRED: 'Explain why you do not accept the consultees’ recommendations',    ERROR_EXPLANATION_MAX_LENGTH: 'You cannot enter more than 4,000 characters',
    EXPLANATION_MAX_LENGTH: 4000,} as const;

export const POST_CONSULTATION_QUESTIONS = {
    LPA_AGREEMENT: {
        LINE1: "Was the Local Planning Authority's",
        LINE2: '(LPA) agreement to the proposal',
        LINE3: 'subject to modifications or conditions being',
        LINE4: 'applied to the consent?',
    },
    LPA_CONDITIONS: {
        LINE1: 'Do you accept all the conditions',
        LINE2: 'imposed by the LPA?',
    },
    LPA_REASON: "Explain why you do not accept all the LPA's conditions",
    CONSULTEES_RECOMMENDATIONS: 'Were any recommendations made or conditions requested by the consultees? (Not including the LPA)',
    CONSULTEES_ACCEPTANCE: {
        LINE1: 'Do you accept the recommendations',
        LINE2: 'made by the consultees?',
    },
    CONSULTEES_REASON: "Explain why you do not accept the consultees' recommendations",
} as const;
